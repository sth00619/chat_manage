import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ClipboardDocumentIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import CredentialModal from './CredentialModal';

const CredentialsList = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const queryClient = useQueryClient();

  const { data: credentials, isLoading } = useQuery({
    queryKey: ['credentials'],
    queryFn: () => dataService.getCredentials(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataService.deleteCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['credentials']);
    },
  });

  const handleEdit = (credential) => {
    setEditingCredential(credential);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('이 계정 정보를 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const togglePassword = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, credId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(credId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filteredCredentials = credentials?.data?.filter(cred =>
    cred.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.username?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
        <input
          type="text"
          placeholder="계정 정보 검색..."
          className="flex-1 mr-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => {
            setEditingCredential(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          계정 추가
        </button>
      </div>

      {filteredCredentials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? '검색 결과가 없습니다.' : '저장된 계정 정보가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCredentials.map((cred) => (
            <div key={cred.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="font-medium text-gray-900">{cred.website}</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(cred)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cred.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">아이디:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">{cred.username}</span>
                    <button
                      onClick={() => copyToClipboard(cred.username, `${cred.id}-username`)}
                      className="text-gray-400 hover:text-gray-600"
                      title="복사"
                    >
                      <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                    </button>
                    {copiedId === `${cred.id}-username` && (
                      <span className="text-xs text-green-600">복사됨!</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">비밀번호:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">
                      {showPasswords[cred.id] ? cred.password : '••••••••'}
                    </span>
                    <button
                      onClick={() => togglePassword(cred.id)}
                      className="text-gray-400 hover:text-gray-600"
                      title={showPasswords[cred.id] ? '숨기기' : '보기'}
                    >
                      {showPasswords[cred.id] ? 
                        <EyeSlashIcon className="h-3.5 w-3.5" /> : 
                        <EyeIcon className="h-3.5 w-3.5" />
                      }
                    </button>
                    <button
                      onClick={() => copyToClipboard(cred.password, `${cred.id}-password`)}
                      className="text-gray-400 hover:text-gray-600"
                      title="복사"
                    >
                      <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                    </button>
                    {copiedId === `${cred.id}-password` && (
                      <span className="text-xs text-green-600">복사됨!</span>
                    )}
                  </div>
                </div>
              </div>

              {cred.notes && (
                <p className="mt-3 text-xs text-gray-500 italic line-clamp-2">{cred.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CredentialModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingCredential(null);
          }}
          credential={editingCredential}
        />
      )}
    </div>
  );
};

export default CredentialsList;