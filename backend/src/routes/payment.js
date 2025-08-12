const router = require('express').Router();
const paymentController = require('../controllers/paymentController');
const { authenticateJWT } = require('../middlewares/auth');

router.use(authenticateJWT);

router.post('/create', paymentController.createPayment);
router.post('/confirm', paymentController.confirmPayment);
router.get('/subscription', paymentController.getSubscriptionStatus);
router.post('/subscription/cancel', paymentController.cancelSubscription);
router.get('/history', paymentController.getPaymentHistory);

module.exports = router;