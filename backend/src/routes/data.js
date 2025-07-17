const router = require('express').Router();
const { DataController, upload } = require('../controllers/dataController');
const { authenticateJWT } = require('../middlewares/auth');

// All data routes require authentication
router.use(authenticateJWT);

// Contact routes
router.get('/contacts', DataController.getContacts);
router.post('/contacts', DataController.createContact);
router.put('/contacts/:id', DataController.updateContact);
router.delete('/contacts/:id', DataController.deleteContact);

// Credential routes
router.get('/credentials', DataController.getCredentials);
router.post('/credentials', DataController.createCredential);
router.put('/credentials/:id', DataController.updateCredential);
router.delete('/credentials/:id', DataController.deleteCredential);

// Goal routes
router.get('/goals', DataController.getGoals);
router.post('/goals', DataController.createGoal);
router.put('/goals/:id', DataController.updateGoal);
router.delete('/goals/:id', DataController.deleteGoal);

// Schedule routes
router.get('/schedules', DataController.getSchedules);
router.post('/schedules', DataController.createSchedule);
router.put('/schedules/:id', DataController.updateSchedule);
router.delete('/schedules/:id', DataController.deleteSchedule);

// Numerical info routes
router.get('/numerical-info', DataController.getNumericalInfo);
router.post('/numerical-info', DataController.createNumericalInfo);
router.put('/numerical-info/:id', DataController.updateNumericalInfo);
router.delete('/numerical-info/:id', DataController.deleteNumericalInfo);

// Album routes
router.get('/albums', DataController.getAlbums);
router.post('/albums/upload', upload.single('image'), DataController.uploadImage);
router.delete('/albums/:id', DataController.deleteAlbum);

module.exports = router;