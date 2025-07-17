import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import { CalendarIcon, UserGroupIcon, ClipboardDocumentListIcon, PhotoIcon } from '@heroicons/react/24/outline';
import NumericalInfo from '@/components/Dashboard/NumericalInfo';
import Credentials from '@/components/Dashboard/Credentials';
import RecentSchedules from '@/components/Dashboard/RecentSchedules';
import Head from 'next/head';

export default function Dashboard() {
  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => dataService.getContacts(),
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => dataService.getGoals(),
  });

  const { data: schedules } = useQuery({
    queryKey: ['todaySchedules'],
    queryFn: () => {
      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0));
      const end = new Date(today.setHours(23, 59, 59, 999));
      return dataService.getSchedules({ start: start.toISOString(), end: end.toISOString() });
    },
  });

  const { data: albums } = useQuery({
    queryKey: ['albums'],
    queryFn: () => dataService.getAlbums(),
  });

  const stats = [
    {
      name: '연락처',
      icon: UserGroupIcon,
      value: contacts?.data?.length || 0,
      bgColor: 'bg-blue-500',
      href: '/notes'
    },
    {
      name: '오늘 일정',
      icon: CalendarIcon,
      value: schedules?.data?.length || 0,
      bgColor: 'bg-green-500',
      href: '/schedule'
    },
    {
      name: '진행중인 목표',
      icon: ClipboardDocumentListIcon,
      value: goals?.data?.filter(g => g.status !== 'completed').length || 0,
      bgColor: 'bg-yellow-500',
      href: '/notes'
    },
    {
      name: '저장된 사진',
      icon: PhotoIcon,
      value: albums?.data?.length || 0,
      bgColor: 'bg-purple-500',
      href: '/album'
    },
  ];

  return (
    <>
      <Head>
        <title>대시보드 - Personal Assistant</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">대시보드</h1>
          
          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = stat.href}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main content grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Numerical Info */}
            <div className="lg:col-span-1">
              <NumericalInfo />
            </div>

            {/* Credentials */}
            <div className="lg:col-span-1">
              <Credentials />
            </div>
          </div>

          {/* Recent Schedules */}
          <div className="mt-6">
            <RecentSchedules />
          </div>

          {/* Quick Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">💡 사용 팁</h3>
            <p className="mt-1 text-sm text-blue-700">
              채팅을 통해 일정, 연락처, 목표 등을 자연스럽게 입력할 수 있습니다. 
              예: "내일 오후 2시에 김철수와 미팅", "엄마 전화번호 010-1234-5678"
            </p>
          </div>
        </div>
      </div>
    </>
  );
}