import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import { CalendarIcon, UserGroupIcon, ClipboardDocumentListIcon, PhotoIcon, CreditCardIcon, ChatBubbleLeftRightIcon, ChartBarIcon, BellIcon } from '@heroicons/react/24/outline';
import NumericalInfo from '@/components/Dashboard/NumericalInfo';
import Credentials from '@/components/Dashboard/Credentials';
import RecentSchedules from '@/components/Dashboard/RecentSchedules';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('좋은 아침이에요');
    else if (hour < 18) setGreeting('좋은 오후에요');
    else setGreeting('좋은 저녁이에요');
  }, []);
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
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-blue-600/20',
      href: '/notes',
      description: '저장된 연락처'
    },
    {
      name: '오늘 일정',
      icon: CalendarIcon,
      value: schedules?.data?.length || 0,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      iconBg: 'bg-green-600/20',
      href: '/schedule',
      description: '오늘의 일정'
    },
    {
      name: '진행중인 목표',
      icon: ClipboardDocumentListIcon,
      value: goals?.data?.filter(g => g.status !== 'completed').length || 0,
      bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-600/20',
      href: '/notes',
      description: '활성 목표'
    },
    {
      name: '저장된 사진',
      icon: PhotoIcon,
      value: albums?.data?.length || 0,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconBg: 'bg-purple-600/20',
      href: '/album',
      description: '앨범 사진'
    },
  ];

  const quickActions = [
    { name: 'AI 채팅', icon: ChatBubbleLeftRightIcon, href: '/chat', color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: '일정 추가', icon: CalendarIcon, href: '/schedule', color: 'text-green-600', bg: 'bg-green-100' },
    { name: '결제 관리', icon: CreditCardIcon, href: '/payment', color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: '통계 보기', icon: ChartBarIcon, href: '/admin', color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <>
      <Head>
        <title>대시보드 - Personal Assistant</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {greeting}, {user?.name || '사용자'}님! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              오늘도 생산적인 하루 보내세요. AI 비서가 도와드리겠습니다.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 실행</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    <div className={`${action.bg} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                      <ActionIcon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">{action.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">현황 요약</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const StatIcon = stat.icon;
                return (
                  <Link
                    key={stat.name}
                    href={stat.href}
                    className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5" />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${stat.iconBg} p-3 rounded-xl`}>
                          <StatIcon className="h-6 w-6 text-gray-700" />
                        </div>
                        <BellIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm font-medium text-gray-600 mt-1">{stat.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                      </div>
                    </div>
                    <div className={`h-1 ${stat.bgColor}`} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Numerical Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 주요 정보</h3>
              <NumericalInfo />
            </div>

            {/* Credentials */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 계정 정보</h3>
              <Credentials />
            </div>
          </div>

          {/* Recent Schedules */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 최근 일정</h3>
            <RecentSchedules />
          </div>

          {/* AI Assistant Tips */}
          <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-white/90" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">AI 비서 활용 팁</h3>
                <p className="mt-2 text-white/90">
                  자연스러운 대화로 일정과 정보를 관리하세요:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-white/80">
                  <li>• "내일 오후 2시에 김철수와 미팅 있어"</li>
                  <li>• "엄마 전화번호 010-1234-5678로 저장해줘"</li>
                  <li>• "이번 달 목표는 운동 주 3회 하기야"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}