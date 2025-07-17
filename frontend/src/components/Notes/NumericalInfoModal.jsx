import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/api';

const NumericalInfoModal = ({ isOpen, onClose, info }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    category: 'general',
    label: '',
    value: '',
    unit: '',
  });

  useEffect(() => {
    if (info) {
      setFormData({
        category: info.category || 'general',
        label: info.label || '',
        value: info.value || '',
        unit: info.unit || '',
      });
    } else {
      setFormData({
        category: 'general',
        label: '',
        value: '',
        unit: '',
      });
    }
  }, [info]);

  const createMutation = useMutation({
    mutationFn: (data) => dataService.createNumericalInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['numericalInfo']);
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => dataService.updateNumericalInfo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['numericalInfo']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (info) {
      updateMutation.mutate({ id: info.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  const categories = [
    { value: 'banking', label: '금융', icon: '💰' },
    { value: 'health', label: '건강', icon: '🏥' },
    { value: 'finance', label: '재정', icon: '💸' },
    { value: 'education', label: '교육', icon: '📚' },
    { value: 'general', label: '일반', icon: '📊' },
  ];

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        {info ? '수치 정보 수정' : '새 수치 정보 추가'}
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          카테고리
                        </label>
                        <select
                          name="category"
                          id="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.icon} {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                          항목명 *
                        </label>
                        <input
                          type="text"
                          name="label"
                          id="label"
                          required
                          value={formData.label}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="예: 계좌 잔액, 체중, 혈압"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                            값 *
                          </label>
                          <input
                            type="text"
                            name="value"
                            id="value"
                            required
                            value={formData.value}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="예: 1000000"
                          />
                        </div>
                        <div>
                          <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                            단위
                          </label>
                          <input
                            type="text"
                            name="unit"
                            id="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="예: 원, kg, mmHg"
                          />
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          <strong>미리보기:</strong> {formData.label || '항목명'} - {formData.value || '값'} {formData.unit || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                    >
                      {isLoading ? '처리 중...' : info ? '수정' : '추가'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={onClose}
                    >
                      취소
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default NumericalInfoModal;