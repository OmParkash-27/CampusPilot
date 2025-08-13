// backend/controllers/studentController.js

const Student = require('../models/Student');
const deleteFiles = require('../utils/deleteUploadedFiles');

//Create Student
exports.createStudent = async (req, res) => {
    const { name, rollNo, age, class: studentClass } = req.body;

    // Extract filenames from uploaded files
    const photos = req.files ? req.files.map(file => file.filename) : [];
try {
    const student = new Student({
      name,
      rollNo,
      email,
      age,
      class: studentClass,
      photos
    });

    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    await deleteFiles(photos);
    res.status(400).json({ error: err.message });
  }
};

//get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get a student by Id
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update student
exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, rollNo, age, class: studentClass, email } = req.body;
  const newPhotos = req.files?.map(file => file.filename); // new uploaded photos

  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Delete previous photos if new ones uploaded
    if (newPhotos && newPhotos.length > 0 && student.photos.length > 0) {
      await deleteFiles(student.photos); // delete old photos
    }

    // Update fields
    student.name = name || student.name;
    student.email = email || student.email;
    student.rollNo = rollNo || student.rollNo;
    student.age = age || student.age;
    student.class = studentClass || student.class;
    student.photos = newPhotos?.length > 0 ? newPhotos : student.photos;

    await student.save();

    res.status(200).json({ message: 'Student updated successfully', student });

  } catch (err) {
    // If error and new files uploaded, delete those too
    if (newPhotos?.length > 0) {
      await deleteFiles(newPhotos);
    }

    console.error('Error updating student:', err);
    res.status(500).json({ message: 'Failed to update student', error: err.message });
  }
};

//delete student
exports.deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
