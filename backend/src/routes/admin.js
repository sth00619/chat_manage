const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/admin');

// All admin routes require authentication and admin role
router.use(authenticateJWT);
router.use(isAdmin);

// Dashboard statistics (기존 + 새로운 통합)
router.get('/dashboard', adminController.getDashboardStats);

// 상세 통계 API들 (새로 추가된 기능들)
router.get('/usage-trend', adminController.getUsageTrend);
router.get('/activity-by-type', adminController.getActivityByType);
router.get('/hourly-pattern', adminController.getHourlyPattern);
router.get('/top-active-users', adminController.getTopActiveUsers);
router.get('/data-growth-trend', adminController.getDataGrowthTrend);
router.get('/top-storage-users', adminController.getTopStorageUsers);
router.get('/feature-usage-stats', adminController.getFeatureUsageStats);

// User management (기존 유지 + 메서드명 통일)
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail); // getUserDetails -> getUserDetail로 통일
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// System health check (기존 유지 + 새로운 경로 추가)
router.get('/health', adminController.getSystemHealth);
router.get('/system-health', adminController.getSystemHealth); // 새로운 경로도 지원

module.exports = router;