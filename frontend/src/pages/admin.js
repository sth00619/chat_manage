import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/api';
import Head from 'next/head';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from 'recharts';
import {
  UsersIcon,
  ChartBarIcon,
  CircleStackIcon,
  CpuChipIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import UserManagement from '@/components/Admin/UserManagement';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function Admin() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: health } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => adminService.getSystemHealth(),
    refetchInterval: 60000, // Refetch every minute
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const pieData = stats?.data?.storageStats ? [
    { name: '연락처', value: stats.data.storageStats.total_contacts },
    { name: '계정정보', value: stats.data.storageStats.total_credentials },
    { name: '목표', value: stats.data.storageStats.total_goals },
    { name: '일정', value: stats.data.storageStats.total_schedules },
    { name: '수치정보', value: stats.data.storageStats.total_numerical_info },
  ].filter(item => item.value > 0) : [];

  const tabs = [
    { id: 'overview', name: '개요' },
    { id: 'analytics', name: '분석' },
    { id: 'users', name: '사용자 관리' },
  ];

  return (
    <>
      <Head>
        <title>관리자 대시보드 - Personal Assistant</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">관리자 대시보드</h1>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                    whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                    ${selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {selectedTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UsersIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            전체 사용자
                          </dt>
                          <dd className="text-2xl font-semibold text-gray-900">
                            {stats?.data?.totalUsers || 0}
                          </dd>
                          <dd className="text-sm text-gray-500">
                            신규: {stats?.data?.newUsers || 0} (30일)
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ChartBarIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            활성 사용자 (24h)
                          </dt>
                          <dd className="text-2xl font-semibold text-gray-900">
                            {stats?.data?.activeUsers || 0}
                          </dd>
                          <dd className="text-sm text-gray-500">
                            {stats?.data?.totalUsers > 0 
                              ? `${Math.round((stats.data.activeUsers / stats.data.totalUsers) * 100)}%` 
                              : '0%'} 활성률
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CircleStackIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            총 데이터 수
                          </dt>
                          <dd className="text-2xl font-semibold text-gray-900">
                            {stats?.data?.storageStats ? 
                              Object.values(stats.data.storageStats)
                                .filter(v => typeof v === 'number' && v !== stats.data.storageStats.total_storage_bytes)
                                .reduce((a, b) => a + b, 0).toLocaleString() : 0}
                          </dd>
                          <dd className="text-sm text-gray-500">
                            저장 용량: {stats?.data?.storageStats?.total_storage_bytes ? 
                              `${(stats.data.storageStats.total_storage_bytes / 1024 / 1024).toFixed(2)} MB` : '0 MB'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CpuChipIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            시스템 상태
                          </dt>
                          <dd className="text-2xl font-semibold text-green-600">
                            {health?.data?.status === 'healthy' ? '정상' : '점검필요'}
                          </dd>
                          <dd className="text-sm text-gray-500">
                            메모리: {health?.data?.memory?.heapUsed || 'N/A'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Usage Trend Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-4">사용량 추이 (최근 30일)</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats?.data?.usageStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString('ko-KR')}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total_actions" 
                        stroke="#3B82F6" 
                        name="총 액션" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="unique_users" 
                        stroke="#10B981" 
                        name="고유 사용자" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Data Distribution Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-4">데이터 분포</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity by Type */}
              {stats?.data?.activityByType && stats.data.activityByType.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                  <h2 className="text-lg font-medium mb-4">활동 유형별 통계 (최근 7일)</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.data.activityByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="action_type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {selectedTab === 'analytics' && (
            <>
              {/* Advanced Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Usage Pattern */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-4">시간대별 사용 패턴</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats?.data?.hourlyPattern || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}시`} />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="action_count" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Active Users */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-4">가장 활발한 사용자 TOP 10</h2>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {stats?.data?.topActiveUsers?.map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 w-8">{index + 1}</span>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{user.action_count} 활동</p>
                          <p className="text-xs text-gray-500">
                            {new Date(user.last_activity).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Usage */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-4">기능별 사용 통계</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={stats?.data?.featureUsage || []}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="feature" />
                      <PolarRadiusAxis />
                      <Radar name="사용 횟수" dataKey="usage_count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Storage Top Users */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-4">저장 용량 상위 사용자</h2>
                  <div className="space-y-2">
                    {stats?.data?.topStorageUsers?.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                          <p className="text-xs text-gray-500">{user.file_count} 파일</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{user.total_size_mb} MB</p>
                          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((user.total_size_mb / 100) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedTab === 'users' && (
            <UserManagement />
          )}
        </div>
      </div>
    </>
  );
}