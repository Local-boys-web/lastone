const express = require('express');
const router = express.Router();
const { verifyRecruiter } = require('../middlewares/auth');
const {
  registerRecruiter,
  loginRecruiter,
  getDashboardStats,
  getMyJobs,
  updateProfile,
  changePassword
} = require('../controllers/recruiterController');

// Public routes
router.post('/register', registerRecruiter);
router.post('/login', loginRecruiter);

// Protected routes (require recruiter authentication)
router.get('/dashboard', verifyRecruiter, getDashboardStats);
router.get('/my-jobs', verifyRecruiter, getMyJobs);
router.put('/profile', verifyRecruiter, updateProfile);
router.put('/change-password', verifyRecruiter, changePassword);

module.exports = router;
