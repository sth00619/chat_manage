import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import { CalculatorIcon } from '@heroicons/react/24/outline';

const NumericalInfo = () => {
  const { data: numericalInfo, isLoading } = useQuery({
    queryKey: ['numericalInfo'],
    queryFn: () => dataService.getNumericalInfo(),
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

  const groupedInfo = numericalInfo?.data?.reduce((acc, info) => {
    if (!acc[info.category]) {
      acc[info.category] = [];
    }
    acc[info.category].push(info);
    return acc;
  }, {}) || {};

  const categoryIcons = {
    banking: '💰',
    health: '🏥',
    finance: '💸',
    education: '📚',
    general: '📊',
  };

  const categoryColors = {
    banking: 'bg-green-50 text-green-700 border-green-200',
    health: 'bg-red-50 text-red-700 border-red-200',
    finance: 'bg-blue-50 text-blue-700 border-blue-200',
    education: 'bg-purple-50 text-purple-700 border-purple-200',
    general: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">수치 정보</h2>
        <CalculatorIcon className="h-5 w-5 text-gray-400" />
      </div>
      
      {Object.keys(groupedInfo).length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          아직 저장된 수치 정보가 없습니다.
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedInfo).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                <span className="mr-2">{categoryIcons[category] || '📌'}</span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center p-3 rounded-lg border ${
                      categoryColors[category] || categoryColors.general
                    }`}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-bold">
                      {item.value} {item.unit && <span className="font-normal">{item.unit}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NumericalInfo;