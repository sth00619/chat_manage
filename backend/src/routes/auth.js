const router = require('express').Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middlewares/auth');

// Local authentication
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route
router.get('/profile', authenticateJWT, authController.getProfile);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  authController.oauthCallback
);

// Naver OAuth routes
router.get('/naver', passport.authenticate('naver', {
  scope: ['profile', 'email']
}));

router.get('/naver/callback',
  passport.authenticate('naver', { session: false }),
  authController.oauthCallback
);

module.exports = router;