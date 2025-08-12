const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

class PaymentController {
  async createPayment(req, res) {
    try {
      const { plan_type, payment_method } = req.body;
      const userId = req.user.id;

      const planPrices = {
        free: 0,
        basic: 9900,
        premium: 19900
      };

      const planLimits = {
        free: { ai_requests: 10, storage: 5 * 1024 * 1024 * 1024 },
        basic: { ai_requests: 100, storage: 50 * 1024 * 1024 * 1024 },
        premium: { ai_requests: -1, storage: -1 }
      };

      const amount = planPrices[plan_type];

      const payment = await Payment.create({
        user_id: userId,
        amount,
        payment_method,
        status: 'pending'
      });

      const paymentData = {
        payment_id: payment.id,
        amount,
        plan_type,
        redirect_url: `${process.env.FRONTEND_URL}/payment/callback`
      };

      if (payment_method === 'kakao_pay') {
        paymentData.gateway_url = 'https://kapi.kakao.com/v1/payment/ready';
      } else if (payment_method === 'naver_pay') {
        paymentData.gateway_url = 'https://dev.apis.naver.com/naverpay/payments/v2.2/reserve';
      } else if (payment_method === 'toss') {
        paymentData.gateway_url = 'https://api.tosspayments.com/v1/payments';
      }

      res.json({
        success: true,
        payment: paymentData,
        message: '결제 준비가 완료되었습니다.'
      });
    } catch (error) {
      console.error('Payment creation error:', error);
      res.status(500).json({ error: '결제 생성 중 오류가 발생했습니다.' });
    }
  }

  async confirmPayment(req, res) {
    try {
      const { payment_id, transaction_id } = req.body;
      const userId = req.user.id;

      const payment = await Payment.findOne({
        where: { id: payment_id, user_id: userId }
      });

      if (!payment) {
        return res.status(404).json({ error: '결제 정보를 찾을 수 없습니다.' });
      }

      payment.status = 'completed';
      payment.transaction_id = transaction_id;
      payment.paid_at = new Date();
      await payment.save();

      const existingSubscription = await Subscription.findOne({
        where: { user_id: userId, status: 'active' }
      });

      if (existingSubscription) {
        existingSubscription.status = 'cancelled';
        existingSubscription.cancelled_at = new Date();
        await existingSubscription.save();
      }

      const planLimits = {
        free: { ai_requests: 10, storage: 5 * 1024 * 1024 * 1024 },
        basic: { ai_requests: 100, storage: 50 * 1024 * 1024 * 1024 },
        premium: { ai_requests: -1, storage: -1 }
      };

      const plan_type = req.body.plan_type || 'basic';
      const limits = planLimits[plan_type];

      const subscription = await Subscription.create({
        user_id: userId,
        plan_type,
        status: 'active',
        ai_requests_limit: limits.ai_requests,
        storage_limit: limits.storage,
        starts_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      payment.subscription_id = subscription.id;
      await payment.save();

      res.json({
        success: true,
        subscription,
        message: '결제가 성공적으로 완료되었습니다.'
      });
    } catch (error) {
      console.error('Payment confirmation error:', error);
      res.status(500).json({ error: '결제 확인 중 오류가 발생했습니다.' });
    }
  }

  async getSubscriptionStatus(req, res) {
    try {
      const userId = req.user.id;

      const subscription = await Subscription.findOne({
        where: { user_id: userId, status: 'active' }
      });

      if (!subscription) {
        return res.json({
          has_subscription: false,
          plan_type: 'free',
          ai_requests_remaining: 10,
          storage_remaining: 5 * 1024 * 1024 * 1024
        });
      }

      const ai_requests_remaining = subscription.ai_requests_limit === -1 
        ? 'unlimited' 
        : subscription.ai_requests_limit - subscription.ai_requests_used;

      const storage_remaining = subscription.storage_limit === -1
        ? 'unlimited'
        : subscription.storage_limit - subscription.storage_used;

      res.json({
        has_subscription: true,
        subscription,
        ai_requests_remaining,
        storage_remaining
      });
    } catch (error) {
      console.error('Subscription status error:', error);
      res.status(500).json({ error: '구독 상태 조회 중 오류가 발생했습니다.' });
    }
  }

  async cancelSubscription(req, res) {
    try {
      const userId = req.user.id;

      const subscription = await Subscription.findOne({
        where: { user_id: userId, status: 'active' }
      });

      if (!subscription) {
        return res.status(404).json({ error: '활성 구독을 찾을 수 없습니다.' });
      }

      subscription.status = 'cancelled';
      subscription.cancelled_at = new Date();
      await subscription.save();

      res.json({
        success: true,
        message: '구독이 취소되었습니다. 만료일까지 서비스를 이용하실 수 있습니다.'
      });
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      res.status(500).json({ error: '구독 취소 중 오류가 발생했습니다.' });
    }
  }

  async getPaymentHistory(req, res) {
    try {
      const userId = req.user.id;

      const payments = await Payment.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 20
      });

      res.json({
        success: true,
        payments
      });
    } catch (error) {
      console.error('Payment history error:', error);
      res.status(500).json({ error: '결제 내역 조회 중 오류가 발생했습니다.' });
    }
  }
}

module.exports = new PaymentController();