import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import NumericalInfoModal from './NumericalInfoModal';

const NumericalInfoList = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  const { data: numericalInfo, isLoading } = useQuery({
    queryKey: ['numericalInfo'],
    queryFn: () => dataService.getNumericalInfo(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataService.deleteNumericalInfo(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['numericalInfo']);
    },
  });

  const handleEdit = (info) => {
    setEditingInfo(info);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('이 정보를 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const categories = [
    { value: 'all', label: '전체', icon: '📊' },
    { value: 'banking', label: '금융', icon: '💰' },
    { value: 'health', label: '건강', icon: '🏥' },
    { value: 'finance', label: '재정', icon: '💸' },
    { value: 'education', label: '교육', icon: '📚' },
    { value: 'general', label: '일반', icon: '📌' },
  ];

  const filteredInfo = numericalInfo?.data?.filter(info => 
    selectedCategory === 'all' || info.category === selectedCategory
  ) || [];

  const categoryColors = {
    banking: 'bg-green-100 border-green-300',
    health: 'bg-red-100 border-red-300',
    finance: 'bg-blue-100 border-blue-300',
    education: 'bg-purple-100 border-purple-300',
    general: 'bg-gray-100 border-gray-300',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap ${
                selectedCategory === cat.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditingInfo(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          정보 추가
        </button>
      </div>

      {filteredInfo.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {selectedCategory === 'all' ? '저장된 수치 정보가 없습니다.' : '해당 카테고리의 정보가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInfo.map((info) => (
            <div
              key={info.id}
              className={`border rounded-lg p-4 ${categoryColors[info.category] || categoryColors.general}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    {categories.find(c => c.value === info.category)?.icon} {info.category}
                  </p>
                  <h3 className="font-medium text-gray-900">{info.label}</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(info)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(info.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {info.value}
                {info.unit && <span className="text-sm font-normal ml-1">{info.unit}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(info.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NumericalInfoModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingInfo(null);
          }}
          info={editingInfo}
        />
      )}
    </div>
  );
};

export default NumericalInfoList;