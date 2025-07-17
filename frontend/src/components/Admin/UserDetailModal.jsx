import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChartBarIcon,
  CircleStackIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const UserDetailModal = ({ user, isOpen, onClose }) => {
  const { data: userDetails, isLoading } = useQuery({
    queryKey: ['adminUserDetails', user?.id],
    queryFn: () => adminService.getUserDetails(user.id),
    enabled: !!user?.id,
  });

  const details = userDetails?.data;

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      사용자 상세 정보
                    </Dialog.Title>
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="spinner"></div>
                    </div>
                  ) : details ? (
                    <div className="space-y-6">
                      {/* User Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">기본 정보</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-500">이름</p>
                              <p className="font-medium">{details.user.name || '설정되지 않음'}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-500">이메일</p>
                              <p className="font-medium">{details.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-500">가입일</p>
                              <p className="font-medium">
                                {format(new Date(details.user.created_at), 'yyyy년 MM월 dd일', { locale: ko })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="h-5 w-5 text-gray-400 mr-2 text-center">
                              {details.user.is_admin ? '👑' : '👤'}
                            </div>
                            <div>
                              <p className="text-gray-500">권한</p>
                              <p className="font-medium">{details.user.is_admin ? '관리자' : '일반 사용자'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Data Stats */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">데이터 통계</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{details.dataStats.contacts}</p>
                            <p className="text-sm text-gray-500">연락처</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{details.dataStats.credentials}</p>
                            <p className="text-sm text-gray-500">계정정보</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{details.dataStats.goals}</p>
                            <p className="text-sm text-gray-500">목표</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{details.dataStats.schedules}</p>
                            <p className="text-sm text-gray-500">일정</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{details.dataStats.numericalInfo}</p>
                            <p className="text-sm text-gray-500">수치정보</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{details.dataStats.albums}</p>
                            <p className="text-sm text-gray-500">사진</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">총 저장 용량</span>
                            <span className="text-sm font-medium">
                              {(details.dataStats.totalStorage / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">최근 활동</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {details.recentActivity.length > 0 ? (
                            details.recentActivity.map((activity) => (
                              <div key={activity.id} className="flex items-center text-sm">
                                <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-600">
                                  {format(new Date(activity.created_at), 'MM/dd HH:mm', { locale: ko })}
                                </span>
                                <span className="ml-2 text-gray-900">{activity.action_type}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">최근 활동이 없습니다.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">데이터를 불러올 수 없습니다.</p>
                  )}
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={onClose}
                  >
                    닫기
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default UserDetailModal;