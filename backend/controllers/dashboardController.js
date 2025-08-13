// controllers/dashboardController.js
const User = require('../models/User');
const Student = require('../models/Student');

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalEditors = await User.countDocuments({ role: 'editor' });
    const totalStudentUsers = await User.countDocuments({ role: 'student' });

    const latestStudents = await Student.find().sort({ createdAt: -1 }).limit(5);
    const latestUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalStudents,
      totalUsers,
      totalAdmins,
      totalTeachers,
      totalEditors,
      totalStudentUsers,
      latestStudents,
      latestUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardStats };
