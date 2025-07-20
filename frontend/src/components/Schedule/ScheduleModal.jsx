import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const ScheduleModal = ({ isOpen, onClose, schedule, selectedDate }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: format(selectedDate, 'yyyy-MM-dd'),
    start_time: '09:00',
    end_date: format(selectedDate, 'yyyy-MM-dd'),
    end_time: '10:00',
    location: '',
  });

  useEffect(() => {
    if (schedule) {
      const startDate = new Date(schedule.start_time);
      const endDate = schedule.end_time ? new Date(schedule.end_time) : startDate;
      
      setFormData({
        title: schedule.title || '',
        description: schedule.description || '',
        start_date: format(startDate, 'yyyy-MM-dd'),
        start_time: format(startDate, 'HH:mm'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        end_time: format(endDate, 'HH:mm'),
        location: schedule.location || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        start_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: '09:00',
        end_date: format(selectedDate, 'yyyy-MM-dd'),
        end_time: '10:00',
        location: '',
      });
    }
  }, [schedule, selectedDate]);

  const createMutation = useMutation({
    mutationFn: (data) => dataService.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      queryClient.invalidateQueries(['monthSchedules']);
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => dataService.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      queryClient.invalidateQueries(['monthSchedules']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 한국 시간을 기준으로 Date 객체 생성
    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}:00`);
    const endDateTime = new Date(`${formData.end_date}T${formData.end_time}:00`);
    
    // 로컬 시간을 그대로 사용 (timezone offset 포함)
    const scheduleData = {
      title: formData.title,
      description: formData.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: formData.location,
    };

    console.log('Sending schedule data:', scheduleData);

    if (schedule) {
      updateMutation.mutate({ id: schedule.id, data: scheduleData });
    } else {
      createMutation.mutate(scheduleData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

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
                        {schedule ? '일정 수정' : '새 일정 추가'}
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
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                          제목 *
                        </label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          required
                          value={formData.title}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          설명
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                            시작 날짜
                          </label>
                          <input
                            type="date"
                            name="start_date"
                            id="start_date"
                            required
                            value={formData.start_date}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                            시작 시간
                          </label>
                          <input
                            type="time"
                            name="start_time"
                            id="start_time"
                            required
                            value={formData.start_time}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                            종료 날짜
                          </label>
                          <input
                            type="date"
                            name="end_date"
                            id="end_date"
                            required
                            value={formData.end_date}
                            onChange={handleChange}
                            min={formData.start_date}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                            종료 시간
                          </label>
                          <input
                            type="time"
                            name="end_time"
                            id="end_time"
                            required
                            value={formData.end_time}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                          장소
                        </label>
                        <input
                          type="text"
                          name="location"
                          id="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                    >
                      {isLoading ? '처리 중...' : schedule ? '수정' : '추가'}
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

export default ScheduleModal;