import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import { PlusIcon, PencilIcon, TrashIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import ContactModal from './ContactModal';

const ContactsList = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => dataService.getContacts(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
    },
  });

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('이 연락처를 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingContact(null);
  };

  const filteredContacts = contacts?.data?.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm)
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
          placeholder="연락처 검색..."
          className="flex-1 mr-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => {
            setEditingContact(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          연락처 추가
        </button>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? '검색 결과가 없습니다.' : '저장된 연락처가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                {contact.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    <a href={`mailto:${contact.email}`} className="hover:text-blue-600 truncate">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.address && (
                  <div className="flex items-start">
                    <MapPinIcon className="h-4 w-4 mr-2 mt-0.5" />
                    <span className="line-clamp-2">{contact.address}</span>
                  </div>
                )}
              </div>
              
              {contact.notes && (
                <p className="mt-2 text-xs text-gray-500 italic line-clamp-2">{contact.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ContactModal
          isOpen={showModal}
          onClose={handleModalClose}
          contact={editingContact}
        />
      )}
    </div>
  );
};

export default ContactsList;