import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { format, parseISO, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

const RecentSchedules = () => {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['upcomingSchedules'],
    queryFn: () => {
      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0));
      const end = addDays(start, 7); // Next 7 days
      return dataService.getSchedules({ 
        start: start.toISOString(), 
        end: end.toISOString() 
      });
    },
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

  const sortedSchedules = schedules?.data?.sort((a, b) => 
    new Date(a.start_time) - new Date(b.start_time)
  ).slice(0, 5); // Show only first 5

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">다가오는 일정</h2>
        <Link 
          href="/schedule" 
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          전체 보기
        </Link>
      </div>
      
      {sortedSchedules?.length === 0 ? (
        <div className="text-center py-8">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            다음 7일 동안 예정된 일정이 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSchedules.map((schedule) => {
            const startDate = parseISO(schedule.start_time);
            const isToday = format(startDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isTomorrow = format(startDate, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd');
            
            return (
              <div 
                key={schedule.id} 
                className={`border-l-4 pl-4 py-2 ${
                  isToday ? 'border-red-500' : isTomorrow ? 'border-yellow-500' : 'border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-gray-900">{schedule.title}</h3>
                    <div className="mt-1 flex items-center text-xs text-gray-600">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span className={`${isToday ? 'text-red-600 font-medium' : ''}`}>
                        {isToday ? '오늘' : isTomorrow ? '내일' : 
                          format(startDate, 'MM월 dd일 (EEE)', { locale: ko })}
                      </span>
                      <ClockIcon className="h-3 w-3 ml-3 mr-1" />
                      <span>
                        {format(startDate, 'HH:mm')}
                        {schedule.end_time && ` - ${format(parseISO(schedule.end_time), 'HH:mm')}`}
                      </span>
                    </div>
                    {schedule.location && (
                      <div className="mt-1 flex items-center text-xs text-gray-600">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        <span>{schedule.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentSchedules;