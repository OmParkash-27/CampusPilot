const express = require('express');
const router = express.Router();
const { addStudentDetails, createNewStudent, getAllStudents, getStudent, updateStudent, addNewCourse, graduateCourse, deleteStudent} = require('../controllers/studentController');
const verifyToken = require('../middleware/authMiddleware');
const { isAdmin, isTeacher, isEditor, isTeacherORisEditor } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');


// Allow only admin or editor to create
router.post('/', verifyToken, isTeacherORisEditor, upload.fields([ { name: 'photos', maxCount: 10 }, { name: 'profilePic', maxCount: 1 }]), async (req, res) => {
  try {
    if (req.body.userId && req.body.userId !== "null" && req.body.userId !== "undefined") {
      // existing student (registered by self)
      await addStudentDetails(req, res);
    } else {
      // new student (created by admin/teacher/editor)
      await createNewStudent(req, res);
    }
  } catch (error) {
    res.status(500).json({ message: "Error handling student", error: error.message });
  }
});

// Allow all logged-in users to read
router.get('/', verifyToken, getAllStudents);

router.get('/:id', verifyToken, getStudent);

router.put('/:id', verifyToken, isEditor, upload.fields([ { name: 'photos', maxCount: 10 }, { name: 'profilePic', maxCount: 1 }]), updateStudent);

// Only admin can delete
router.delete('/:id', verifyToken, isAdmin, deleteStudent);


module.exports = router;
