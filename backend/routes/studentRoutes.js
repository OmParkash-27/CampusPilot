const express = require('express');
const router = express.Router();
const { addStudent, getAllStudents, getStudent, updateStudent, addNewCourse, graduateCourse, deleteStudent} = require('../controllers/studentController');
const verifyToken = require('../middleware/authMiddleware');
const { isAdmin, isTeacher, isEditor, isTeacherORisEditor } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');


// Allow only admin or editor to create
router.post('/', verifyToken, isEditor, upload.array('photos', 5), addStudent);

// Allow all logged-in users to read
router.get('/', verifyToken, getAllStudents);
router.get('/:id', verifyToken, getStudent);

router.put('/:id', verifyToken, isTeacherORisEditor, upload.array('photos', 5), updateStudent);

// Only admin can delete
router.delete('/:id', verifyToken, isAdmin, deleteStudent);


module.exports = router;
