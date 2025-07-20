import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  MagnifyingGlassIcon,
  UserIcon,
  TrashIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import UserDetailModal from './UserDetailModal';

const UserManagement = ({ searchTerm = '', setSearchTerm = () => {} }) => {
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [inputValue, setInputValue] = useState(searchTerm);
  const queryClient = useQueryClient();
  const limit = 20;

  // 검색어 상태 관리
  const currentSearchTerm = searchTerm !== undefined ? searchTerm : localSearchTerm;
  const currentSetSearchTerm = setSearchTerm !== undefined ? setSearchTerm : setLocalSearchTerm;
  const debouncedSearchTerm = useDebounce(currentSearchTerm, 300);

  // prop 동기화
  useEffect(() => {
    setInputValue(currentSearchTerm);
  }, [currentSearchTerm]);

  // React Query 설정
  const { data: usersData, isLoading, error, isFetching } = useQuery({
    queryKey: ['adminUsers', page, debouncedSearchTerm],
    queryFn: async () => {
      console.log('🔍 Frontend API Call:', { 
        page, 
        limit, 
        search: debouncedSearchTerm 
      });
      
      const result = await adminService.getUsers({ 
        page, 
        limit, 
        search: debouncedSearchTerm 
      });
      
      console.log('📦 Frontend API Response:', result);
      return result;
    },
    keepPreviousData: true,
    staleTime: 5000,
    retry: 1,
    onSuccess: (data) => {
      console.log('✅ Query Success:', data);
    },
    onError: (error) => {
      console.error('❌ Query Error:', error);
    }
  });

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, is_admin }) => adminService.updateUserRole(id, { is_admin }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminStats']);
    },
  });

  // Event handlers
  const handleRoleToggle = (user) => {
    if (window.confirm(`${user.name || user.email}님의 관리자 권한을 ${user.is_admin ? '제거' : '부여'}하시겠습니까?`)) {
      updateRoleMutation.mutate({ id: user.id, is_admin: !user.is_admin });
    }
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`정말로 ${user.name || user.email}님의 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    console.log('🔤 Search Input:', newValue);
    
    setInputValue(newValue);
    currentSetSearchTerm(newValue);
    setPage(1);
  };

  // 데이터 추출 및 디버깅
  console.log('🧪 Frontend State Debug:', {
    inputValue,
    currentSearchTerm,
    debouncedSearchTerm,
    page,
    isLoading,
    isFetching,
    error: error?.message,
    usersData
  });

  // 안전한 데이터 추출
  let users = [];
  let total = 0;
  let totalPages = 1;

  if (usersData) {
    // API 응답 구조에 따른 분기 처리
    if (usersData.success && usersData.data) {
      // { success: true, data: { users: [...], total: 2, ... } }
      users = usersData.data.users || [];
      total = usersData.data.total || 0;
      totalPages = usersData.data.totalPages || Math.ceil(total / limit);
    } else if (usersData.data && Array.isArray(usersData.data.users)) {
      // { data: { users: [...], total: 2, ... } }
      users = usersData.data.users;
      total = usersData.data.total || 0;
      totalPages = usersData.data.totalPages || Math.ceil(total / limit);
    } else if (Array.isArray(usersData.users)) {
      // { users: [...], total: 2, ... }
      users = usersData.users;
      total = usersData.total || 0;
      totalPages = usersData.totalPages || Math.ceil(total / limit);
    } else if (Array.isArray(usersData)) {
      // [...users]
      users = usersData;
      total = usersData.length;
      totalPages = 1;
    }
  }

  console.log('📊 Final Data:', {
    users: users.length > 0 ? users.map(u => ({ id: u.id, name: u.name, email: u.email })) : 'EMPTY',
    usersLength: users.length,
    total,
    totalPages,
    isArray: Array.isArray(users)
  });

  // 로딩 상태
  if (isLoading && !usersData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">사용자 목록을 불러오는 중...</span>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-red-500 text-lg font-medium">
          데이터를 불러오는 중 오류가 발생했습니다
        </div>
        <div className="text-gray-600 text-sm">{error.message}</div>
        <button 
          onClick={() => queryClient.invalidateQueries(['adminUsers'])}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="이름 또는 이메일로 검색..."
            value={inputValue}
            onChange={handleSearchChange}
            autoComplete="off"
          />
          {isFetching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        
        {/* 개발 모드 디버깅 정보 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
            <div>입력: "{inputValue}" | 검색: "{debouncedSearchTerm}" | 결과: {users.length}개</div>
            <div>상태: {isLoading ? 'Loading' : isFetching ? 'Fetching' : 'Idle'} | 총: {total}개</div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                사용자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가입일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                마지막 활동
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                총 활동
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                권한
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <UserIcon className="h-10 w-10 text-gray-400 bg-gray-200 rounded-full p-2" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || '이름 없음'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.provider && (
                          <span className="text-xs text-gray-400">({user.provider})</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd', { locale: ko }) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_activity
                      ? format(new Date(user.last_activity), 'yyyy-MM-dd HH:mm', { locale: ko })
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.total_activities || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleRoleToggle(user)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_admin
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      } hover:opacity-80 transition-opacity`}
                    >
                      {user.is_admin ? (
                        <>
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          관리자
                        </>
                      ) : (
                        <>
                          <ShieldExclamationIcon className="h-3 w-3 mr-1" />
                          일반
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      상세
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    {debouncedSearchTerm ? (
                      <div>
                        <div className="text-lg mb-2">🔍</div>
                        <div>"{debouncedSearchTerm}"에 대한 검색 결과가 없습니다.</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-lg mb-2">👥</div>
                        <div>사용자가 없습니다.</div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;