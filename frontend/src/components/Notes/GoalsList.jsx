import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import { PlusIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import GoalModal from './GoalModal';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const GoalsList = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => dataService.getGoals(),
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => dataService.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
    },
  });

  const handleStatusChange = (goal, newStatus) => {
    updateGoalMutation.mutate({
      id: goal.id,
      data: { ...goal, status: newStatus }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('이 목표를 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredGoals = goals?.data?.filter(goal => {
    if (filter === 'all') return true;
    return goal.status === filter;
  }) || [];

  const statusConfig = {
    pending: { icon: ClockIcon, color: 'text-yellow-600 bg-yellow-50', label: '대기중' },
    in_progress: { icon: ClockIcon, color: 'text-blue-600 bg-blue-50', label: '진행중' },
    completed: { icon: CheckCircleIcon, color: 'text-green-600 bg-green-50', label: '완료' },
  };

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
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'all' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            전체 ({goals?.data?.length || 0})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            대기중 ({goals?.data?.filter(g => g.status === 'pending').length || 0})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'in_progress' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            진행중 ({goals?.data?.filter(g => g.status === 'in_progress').length || 0})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            완료 ({goals?.data?.filter(g => g.status === 'completed').length || 0})
          </button>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          목표 추가
        </button>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {filter === 'all' ? '저장된 목표가 없습니다.' : '해당 상태의 목표가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal) => {
            const config = statusConfig[goal.status];
            const StatusIcon = config.icon;
            
            return (
              <div key={goal.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                      <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </span>
                    </div>
                    {goal.description && (
                      <p className="mt-2 text-sm text-gray-600">{goal.description}</p>
                    )}
                    {goal.target_date && (
                      <p className="mt-2 text-sm text-gray-500">
                        목표일: {format(parseISO(goal.target_date), 'yyyy년 MM월 dd일', { locale: ko })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <select
                      value={goal.status}
                      onChange={(e) => handleStatusChange(goal, e.target.value)}
                      className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">대기중</option>
                      <option value="in_progress">진행중</option>
                      <option value="completed">완료</option>
                    </select>
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setShowModal(true);
                      }}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <GoalModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingGoal(null);
          }}
          goal={editingGoal}
        />
      )}
    </div>
  );
};

export default GoalsList;