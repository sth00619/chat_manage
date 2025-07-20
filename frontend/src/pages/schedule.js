import { useState } from 'react';
import Calendar from 'react-calendar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import Head from 'next/head';
import ScheduleModal from '@/components/Schedule/ScheduleModal';
import { 
  PlusIcon, 
  ClockIcon, 
  MapPinIcon, 
  TrashIcon, 
  PencilIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';
import 'react-calendar/dist/Calendar.css';

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all schedules for the current month
  const { data: monthSchedules } = useQuery({
    queryKey: ['monthSchedules', selectedDate.getMonth(), selectedDate.getFullYear()],
    queryFn: () => {
      const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);
      return dataService.getSchedules({ 
        start: start.toISOString(), 
        end: end.toISOString() 
      });
    },
  });

  // Fetch schedules for selected date
  const { data: daySchedules, refetch: refetchDaySchedules } = useQuery({
    queryKey: ['schedules', selectedDate.toDateString()],
    queryFn: () => {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      return dataService.getSchedules({ 
        start: start.toISOString(), 
        end: end.toISOString() 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      queryClient.invalidateQueries(['monthSchedules']);
    },
  });

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setShowModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowModal(true);
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSchedule(null);
    refetchDaySchedules();
    queryClient.invalidateQueries(['monthSchedules']);
  };

  // Mark dates that have schedules
  const tileContent = ({ date, view }) => {
    if (view === 'month' && monthSchedules?.data) {
      const hasSchedule = monthSchedules.data.some(schedule => {
        const scheduleDate = new Date(schedule.start_time);
        return scheduleDate.toDateString() === date.toDateString();
      });
      
      if (hasSchedule) {
        return <div className="text-xs mt-1">•</div>;
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month' && monthSchedules?.data) {
      const hasSchedule = monthSchedules.data.some(schedule => {
        const scheduleDate = new Date(schedule.start_time);
        return scheduleDate.toDateString() === date.toDateString();
      });
      
      if (hasSchedule) {
        return 'react-calendar__tile--hasSchedule';
      }
    }
    return null;
  };

  return (
    <>
      <Head>
        <title>일정 - Personal Assistant</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">일정 관리</h1>
            <button
              onClick={handleAddSchedule}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              일정 추가
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-4 rounded-lg shadow">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  locale="ko-KR"
                  className="w-full border-none"
                  tileContent={tileContent}
                  tileClassName={tileClassName}
                  formatDay={(locale, date) => format(date, 'd')}
                />
              </div>
              
              {/* Calendar Legend */}
              <div className="mt-4 bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-900 mb-2">범례</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>일정이 있는 날</span>
                </div>
              </div>
            </div>
            
            {/* Schedule List */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">
                  {format(selectedDate, 'yyyy년 MM월 dd일 EEEE', { locale: ko })} 일정
                </h2>
                
                <div className="space-y-4">
                  {daySchedules?.data?.length > 0 ? (
                    daySchedules.data.map((schedule) => (
                      <div 
                        key={schedule.id} 
                        className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{schedule.title}</h3>
                            <div className="mt-1 flex items-center text-sm text-gray-600">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              <span>
                                {format(parseISO(schedule.start_time), 'HH:mm')}
                                {schedule.end_time && ` - ${format(parseISO(schedule.end_time), 'HH:mm')}`}
                              </span>
                            </div>
                            {schedule.location && (
                              <div className="mt-1 flex items-center text-sm text-gray-600">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                <span>{schedule.location}</span>
                              </div>
                            )}
                            {schedule.description && (
                              <p className="mt-2 text-sm text-gray-600">{schedule.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEditSchedule(schedule)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">이 날짜에는 일정이 없습니다.</p>
                      <button
                        onClick={handleAddSchedule}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-500"
                      >
                        일정 추가하기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <ScheduleModal
          isOpen={showModal}
          onClose={handleModalClose}
          schedule={editingSchedule}
          selectedDate={selectedDate}
        />
      )}
    </>
  );
}