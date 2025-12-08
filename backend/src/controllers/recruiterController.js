const Recruiter = require('../models/Recruiter');
const Job = require('../models/Job');
const generateToken = require('../utils/generateToken');

// Recruiter Registration
exports.registerRecruiter = async (req, res) => {
  try {
    const { name, email, password, contactno, address } = req.body;

    if (!name || !email || !password || !contactno) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const existingRecruiter = await Recruiter.findOne({ email });

    if (existingRecruiter) {
      return res.status(400).json({
        success: false,
        message: 'Recruiter with this email already exists'
      });
    }

    const recruiter = await Recruiter.create({
      name,
      email,
      password,
      contactno,
      address
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      recruiter: {
        _id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        contactno: recruiter.contactno,
        address: recruiter.address
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Recruiter Login
exports.loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const recruiter = await Recruiter.findOne({ email }).select('+password');

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found'
      });
    }

    const isPasswordValid = await recruiter.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    const token = generateToken(recruiter._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      recruiter: {
        _id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        contactno: recruiter.contactno,
        address: recruiter.address
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ postedBy: req.recruiterId });
    const pendingJobs = await Job.countDocuments({ postedBy: req.recruiterId, status: 'pending' });
    const approvedJobs = await Job.countDocuments({ postedBy: req.recruiterId, status: 'approved' });
    const rejectedJobs = await Job.countDocuments({ postedBy: req.recruiterId, status: 'rejected' });

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        pendingJobs,
        approvedJobs,
        rejectedJobs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get My Jobs
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.recruiterId })
      .sort({ jobposteddate: -1 });

    res.status(200).json({
      success: true,
      jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, contactno, address } = req.body;

    const recruiter = await Recruiter.findByIdAndUpdate(
      req.recruiterId,
      { name, contactno, address },
      { new: true, runValidators: true }
    );

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      recruiter: {
        _id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        contactno: recruiter.contactno,
        address: recruiter.address
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const recruiter = await Recruiter.findById(req.recruiterId).select('+password');

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found'
      });
    }

    const isPasswordValid = await recruiter.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    recruiter.password = newPassword;
    await recruiter.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
