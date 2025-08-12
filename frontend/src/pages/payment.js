import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Payment() {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const router = useRouter();

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '₩0',
      period: '월',
      features: [
        '월 10회 AI 채팅',
        '기본 일정 관리',
        '5GB 저장공간',
        '기본 지원'
      ]
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '₩9,900',
      period: '월',
      features: [
        '월 100회 AI 채팅',
        '고급 일정 관리',
        '50GB 저장공간',
        '이메일 지원',
        '캘린더 통합'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '₩19,900',
      period: '월',
      features: [
        '무제한 AI 채팅',
        '모든 기능 이용',
        '무제한 저장공간',
        '24/7 지원',
        'API 접근',
        '커스텀 AI 모델'
      ]
    }
  ];

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/payment/subscription', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handlePayment = async (planId) => {
    if (planId === 'free') {
      alert('무료 플랜은 별도의 결제가 필요하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/payment/create',
        {
          plan_type: planId,
          payment_method: paymentMethod
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert(`${planId} 플랜 결제 준비가 완료되었습니다.\n결제 게이트웨이 연동이 필요합니다.`);
        
        // 실제 구현 시:
        // if (paymentMethod === 'kakao_pay') {
        //   window.location.href = response.data.payment.gateway_url;
        // } else if (paymentMethod === 'naver_pay') {
        //   window.location.href = response.data.payment.gateway_url;
        // }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            요금제 선택
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            당신에게 맞는 플랜을 선택하세요
          </p>
        </div>

        {subscription && subscription.has_subscription && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900">현재 구독 상태</h3>
            <p className="text-blue-700">
              플랜: {subscription.subscription?.plan_type?.toUpperCase()}
            </p>
            <p className="text-blue-700">
              AI 요청 남은 횟수: {subscription.ai_requests_remaining === 'unlimited' ? '무제한' : subscription.ai_requests_remaining}
            </p>
          </div>
        )}

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            결제 방법 선택
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="card">신용/체크카드</option>
            <option value="kakao_pay">카카오페이</option>
            <option value="naver_pay">네이버페이</option>
            <option value="toss">토스</option>
            <option value="bank_transfer">계좌이체</option>
          </select>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg shadow-sm divide-y divide-gray-200 ${
                plan.popular
                  ? 'border-2 border-blue-500'
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-blue-500 text-white">
                    인기
                  </span>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {plan.name}
                </h3>
                <p className="mt-4 text-sm text-gray-500">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    /{plan.period}
                  </span>
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex space-x-3">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-6 pb-8 px-6">
                <button
                  onClick={() => handlePayment(plan.id)}
                  disabled={isLoading}
                  className={`w-full rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500'
                  } disabled:opacity-50`}
                >
                  {isLoading ? '처리 중...' : plan.id === 'free' ? '무료 시작' : '선택하기'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-base text-gray-500">
            모든 플랜은 언제든지 변경하거나 취소할 수 있습니다.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-500 font-medium"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>
      </div>
    </Layout>
  );
}
