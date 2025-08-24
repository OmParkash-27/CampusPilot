const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const deleteFiles = require('../utils/deleteUploadedFiles');

// Add existing student details
exports.addStudentDetails = async (req, res) => {
  try {
    const {
      userId,
      rollNo,
      enrollmentNo,
      courses,
      dob,
      gender,
      phone,
      address,
      guardianName,
      guardianContact
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "student") return res.status(400).json({ message: "Only student users can be linked" });

    let student = await Student.findOne({ user: userId });
    if (student) return res.status(400).json({ message: "Student details already exist" });

    const parsedCourses = courses ? JSON.parse(courses) : [];
    const parsedAddress = address ? JSON.parse(address) : {};

    let photos = [];
    if (req.files && req.files.photos) {
      photos = req.files.photos.map(f => f.filename);
    }

    student = new Student({
      user: userId,
      rollNo,
      enrollmentNo,
      courses: parsedCourses,
      dob,
      gender,
      phone,
      address: parsedAddress,
      guardianName,
      guardianContact,
      photos
    });

    await student.save();
    res.status(201).json({ message: "Student details added successfully", student });

  } catch (error) {
    res.status(500).json({ message: "Error adding student details", error: error.message });
  }
};

//create new student and details
exports.createNewStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      email,
      rollNo,
      enrollmentNo,
      courses,
      dob,
      gender,
      phone,
      address,
      guardianName,
      guardianContact
    } = req.body;

    const hashedPassword = await bcrypt.hash(name, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "student"
    });

    await user.save({ session });

    const parsedCourses = courses ? JSON.parse(courses) : [];
    const parsedAddress = address ? JSON.parse(address) : {};

    let photos = [];
    if (req.files && req.files.photos) {
      photos = req.files.photos.map(f => f.filename);
    }

    const student = new Student({
      user: user._id,
      rollNo,
      enrollmentNo,
      courses: parsedCourses,
      dob,
      gender,
      phone,
      address: parsedAddress,
      guardianName,
      guardianContact,
      photos
    });

    await student.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Student created successfully", user, student });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error creating student", error: error.message });
  }
};


//update status or mark student graduate
exports.graduateCourse = async (req, res) => {
  try {
    const { studentId, courseName } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Find course and mark as graduated
    const course = student.courses.find(c => c.course === courseName && c.status === "active");
    if (!course) return res.status(400).json({ message: "Active course not found" });

    course.status = "graduated";

    await student.save();

    res.json({ message: "Course marked as graduated", student });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error: error.message });
  }
};

//add new course
exports.addNewCourse = async (req, res) => {
  try {
    const { studentId, course, batchYear } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Ensure no duplicate active course of same type
    const existing = student.courses.find(c => c.course === course && c.status === "active");
    if (existing) return res.status(400).json({ message: "Student already enrolled in this course" });

    // Push new course
    student.courses.push({ course, batchYear, status: "active" });

    await student.save();

    res.status(201).json({ message: "New course added successfully", student });
  } catch (error) {
    res.status(500).json({ message: "Error adding course", error: error.message });
  }
};

//get student
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("user", "name email role");
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

// Get all students with populated user data
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("user", "name email role profilePic")

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

// update student
exports.updateStudent = async (req, res) => {
  //start session for condition of error then rollback
  const session = await mongoose.startSession();
  session.startTransaction();

  const { id } = req.params; // student id
  const { name, email, rollNo, courseIndex, courseUpdate, addressUpdate, replacePhotoIndex } = req.body;

  const parsedCourses = courses ? JSON.parse(courseUpdate) : [];
  const parsedAddress = address ? JSON.parse(addresaddressUpdates) : {};

  try {
    const student = await Student.findById(id).populate("user"); // get linked user also
    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Student not found" });
    } 

    // ---------------- Basic fields update ----------------
    if (rollNo) student.rollNo = rollNo;

    // User fields (name, email, profilePic)
    if (name) student.user.name = name;
    if (email) student.user.email = email;

    if (req.file && req.file.filename) {
      if (student.user.profilePic) {
        await deleteFiles(student.user.profilePic);
      }
      student.user.profilePic = req.file.filename;
    }

    // ---------------- Update specific course ----------------
    if (
      typeof courseIndex === "number" &&
      student.courses &&
      student.courses[courseIndex]
    ) {
      Object.assign(student.courses[courseIndex], parsedCourses);
    }

    // ---------------- Address object update update ----------------

    Object.assign(student.address, parsedAddress);

    // ---------------- Photos array update ----------------
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map((f) => f.filename);
      if (typeof replacePhotoIndex === "number") {
        const oldPhoto = student.photos[replacePhotoIndex];
        if (oldPhoto) {
          await deleteFiles(oldPhoto);
          student.photos[replacePhotoIndex] = newPhotos[0];
        }
      } else {
        student.photos.push(...newPhotos);
      }
    }

    await student.user.save();
    const updatedStudent = await student.save();

    //session end when transaction completed
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Student updated successfully", student: updatedStudent });
  } catch (error) {
    //abort transaction 
    await session.abortTransaction();
    session.endSession();
    if (req.file) {
      await deleteFiles(req.file.filename);
    }
    if (req.files) {
      await deleteFiles(req.files.map((f) => f.filename));
    }
    res.status(500).json({ message: "Error updating student", error: error.message });
  }
};

//delete student
exports.deleteStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // 1. Student find with user
    const student = await Student.findById(id).populate("user").session(session);
    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. Delete profile pic if exists
    if (student.user.profilePic) {
      await deleteFiles(student.user.profilePic);
    }

    // 3. Delete Student
    await Student.deleteOne({ _id: student._id }, { session });

    // 4. Delete linked User
    await User.deleteOne({ _id: student.user._id }, { session });

    // 5. Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Student and linked User deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Delete student error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
