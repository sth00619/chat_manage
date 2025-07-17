import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import { EyeIcon, EyeSlashIcon, KeyIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const Credentials = () => {
  const [showPassword, setShowPassword] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  
  const { data: credentials, isLoading } = useQuery({
    queryKey: ['credentials'],
    queryFn: () => dataService.getCredentials(),
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const togglePassword = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, credId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(credId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">ID & 비밀번호</h2>
        <KeyIcon className="h-5 w-5 text-gray-400" />
      </div>
      
      {credentials?.data?.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          아직 저장된 계정 정보가 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          {credentials?.data?.map((cred) => (
            <div key={cred.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="font-medium text-sm text-gray-900 mb-2">{cred.website}</div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">아이디:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{cred.username}</span>
                    <button
                      onClick={() => copyToClipboard(cred.username, `${cred.id}-username`)}
                      className="text-gray-400 hover:text-gray-600"
                      title="복사"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                    {copiedId === `${cred.id}-username` && (
                      <span className="text-xs text-green-600">복사됨!</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">비밀번호:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {showPassword[cred.id] ? cred.password : '••••••••'}
                    </span>
                    <button
                      onClick={() => togglePassword(cred.id)}
                      className="text-gray-400 hover:text-gray-600"
                      title={showPassword[cred.id] ? '숨기기' : '보기'}
                    >
                      {showPassword[cred.id] ? 
                        <EyeSlashIcon className="h-4 w-4" /> : 
                        <EyeIcon className="h-4 w-4" />
                      }
                    </button>
                    <button
                      onClick={() => copyToClipboard(cred.password, `${cred.id}-password`)}
                      className="text-gray-400 hover:text-gray-600"
                      title="복사"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                    {copiedId === `${cred.id}-password` && (
                      <span className="text-xs text-green-600">복사됨!</span>
                    )}
                  </div>
                </div>
              </div>
              
              {cred.notes && (
                <div className="mt-2 text-xs text-gray-500 italic">{cred.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Credentials;