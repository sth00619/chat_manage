const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/admin');

// All admin routes require authentication and admin role
router.use(authenticateJWT);
router.use(isAdmin);

// Dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// System health check
router.get('/health', adminController.getSystemHealth);

module.exports = router;