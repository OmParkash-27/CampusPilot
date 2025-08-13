const express = require('express');
const router = express.Router();
const { createStudent, getStudents, getStudentById, updateStudent, deleteStudent} = require('../controllers/studentController');
const verifyToken = require('../middleware/authMiddleware');
const { isAdmin, isTeacher, isEditor } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');


// Allow only admin or editor to create
router.post('/', verifyToken, isEditor, upload.array('photos', 5), createStudent);

// Allow all logged-in users to read
router.get('/', verifyToken, getStudents);
router.get('/:id', verifyToken, getStudentById);

router.put('/:id', verifyToken, isTeacher, isEditor, upload.array('photos', 5), updateStudent);

// Only admin can delete
router.delete('/:id', verifyToken, isAdmin, deleteStudent);


module.exports = router;
