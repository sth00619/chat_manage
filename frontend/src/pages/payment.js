import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { useRouter } from 'next/router';
import api from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Payment() {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const router = useRouter();
  const { t, language } = useLanguage();

  const plans = [
    {
      id: 'free',
      name: t('payment.plans.free.name'),
      price: language === 'ko' ? '₩0' : language === 'zh' ? '¥0' : '$0',
      period: t('payment.month'),
      features: t('payment.plans.free.features')
    },
    {
      id: 'basic',
      name: t('payment.plans.basic.name'),
      price: language === 'ko' ? '₩9,900' : language === 'zh' ? '¥69' : '$9.99',
      period: t('payment.month'),
      features: t('payment.plans.basic.features'),
      popular: true
    },
    {
      id: 'premium',
      name: t('payment.plans.premium.name'),
      price: language === 'ko' ? '₩19,900' : language === 'zh' ? '¥139' : '$19.99',
      period: t('payment.month'),
      features: t('payment.plans.premium.features')
    }
  ];

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/payment/subscription', {
        
      });
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handlePayment = async (planId) => {
    if (planId === 'free') {
      alert(t('payment.freePlanAlert'));
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/payment/create',
        {
          plan_type: planId,
          payment_method: paymentMethod
        },
        {
          
        }
      );

      if (response.data.success) {
        alert(`${planId} ${t('payment.paymentReady')}`);
        
        // 실제 구현 시:
        // if (paymentMethod === 'kakao_pay') {
        //   window.location.href = response.data.payment.gateway_url;
        // } else if (paymentMethod === 'naver_pay') {
        //   window.location.href = response.data.payment.gateway_url;
        // }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(t('payment.paymentError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('payment.title')}
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            {t('payment.subtitle')}
          </p>
        </div>

        {subscription && subscription.has_subscription && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900">{t('payment.currentSubscription')}</h3>
            <p className="text-blue-700">
              {t('payment.plan')}: {subscription.subscription?.plan_type?.toUpperCase()}
            </p>
            <p className="text-blue-700">
              {t('payment.aiRequestsRemaining')}: {subscription.ai_requests_remaining === 'unlimited' ? t('payment.unlimited') : subscription.ai_requests_remaining}
            </p>
          </div>
        )}

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('payment.selectPaymentMethod')}
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="card">{t('payment.paymentMethods.card')}</option>
            <option value="kakao_pay">{t('payment.paymentMethods.kakaoPay')}</option>
            <option value="naver_pay">{t('payment.paymentMethods.naverPay')}</option>
            <option value="toss">{t('payment.paymentMethods.toss')}</option>
            <option value="bank_transfer">{t('payment.paymentMethods.bankTransfer')}</option>
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
                    {t('payment.popular')}
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
                  {isLoading ? t('payment.processing') : plan.id === 'free' ? t('payment.startFree') : t('payment.selectPlan')}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-base text-gray-500">
            {t('payment.changeAnytime')}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-500 font-medium"
          >
            ← {t('payment.backToDashboard')}
          </button>
        </div>
      </div>
    </Layout>
  );
}