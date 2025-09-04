// controllers/dashboardController.js
const User = require('../models/User');
const Student = require('../models/Student');

const getAdminDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const user = req.user.email;
    const totalStudents = await Student.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalEditors = await User.countDocuments({ role: 'editor' });
    // const totalStudentUsers = await User.countDocuments({ role: 'student' });

    const latestUsers = await User.find({ role: { $ne: "student" } }).sort({ createdAt: -1 }).limit(5);
    const latestStudents = await Student.find().sort({ createdAt: -1 }).limit(5).populate('user', "name email role status profilePic");
    const uCreatedStudent = await Student.find({createdBy: user}).populate('user', 'name email role profilePic');
    const currentYearBcaStudents = await Student.countDocuments({ "courses.course": "BCA", "courses.batchYear": currentYear });
    const currentYearMcaStudents = await Student.countDocuments({ "courses.course": "MCA", "courses.batchYear": currentYear });
    const currentYearBbaStudents = await Student.countDocuments({ "courses.course": "BBA", "courses.batchYear": currentYear });
    const currentYearMbaStudents = await Student.countDocuments({ "courses.course": "MBA", "courses.batchYear": currentYear });

    res.json({
      totalStudents,
      totalUsers,
      totalAdmins,
      totalTeachers,
      totalEditors,
      // totalStudentUsers,
      currentYearBcaStudents,
      currentYearMcaStudents,
      currentYearBbaStudents,
      currentYearMbaStudents,
      latestStudents,
      latestUsers,
      uCreatedStudent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCommonDashboardStats = async(req, res) => {
 try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const currentTime = new Date();
    const user = req.user.email;

    const totalStudents = await Student.countDocuments();
    const currentYearTotalStudents = await Student.countDocuments({createdAt: {$gte: startOfYear, $lte: currentTime}});
    const totalBcaStudents = await Student.countDocuments({ "courses.course": "BCA" });
    const currentYearBcaStudents = await Student.countDocuments({ "courses.course": "BCA", "courses.batchYear": currentYear });
    const totalMcaStudents = await Student.countDocuments({ "courses.course": "MCA" });
    const currentYearMcaStudents = await Student.countDocuments({ "courses.course": "MCA", "courses.batchYear": currentYear });
    const totalBbaStudents = await Student.countDocuments({ "courses.course": "BBA" });
    const currentYearBbaStudents = await Student.countDocuments({ "courses.course": "BBA", "courses.batchYear": currentYear });
    const totalMbaStudents = await Student.countDocuments({ "courses.course": "MBA" });
    const currentYearMbaStudents = await Student.countDocuments({ "courses.course": "MBA", "courses.batchYear": currentYear });
    const lastCreated = await Student.find({'createdBy': user}).sort({ createdAt: -1 }).limit(5).populate('user', "name email profilePic");
    const lastUpdated = await Student.find({'updatedBy': user}).sort({ createdAt: -1 }).limit(5).populate('user', "name email profilePic");

    res.json({
      totalStudents,
      currentYearTotalStudents,
      totalBcaStudents,
      currentYearBcaStudents,
      totalMcaStudents,
      currentYearMcaStudents,
      totalBbaStudents,
      currentYearBbaStudents,
      totalMbaStudents,
      currentYearMbaStudents,
      lastCreated,
      lastUpdated
    })
 } catch(error) {
    console.error(error);
    res.status(500).json({message: "server error"});
 }
}

module.exports = { getAdminDashboardStats, getCommonDashboardStats };
