const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const deleteFiles = require('../utils/deleteUploadedFiles');
const {
  parseDate,
  parseCourses,
  parseAddress,
  extractPhotos,
  extractProfilePic,
  cleanupUploads
} = require('../utils/studentHelper');

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
    if (user.role !== "student") {
      return res.status(400).json({ message: "Only student users can be linked" });
    }

    let student = await Student.findOne({ user: userId });
    if (student) return res.status(400).json({ message: "Student details already exist" });

    student = new Student({
      user: userId,
      rollNo,
      enrollmentNo,
      courses: parseCourses(courses),
      dob: parseDate(dob),
      gender,
      phone,
      address: parseAddress(address),
      guardianName,
      guardianContact,
      photos: extractPhotos(req.files),
      createdBy: req.user.email,   
      updatedBy: req.user.email
    });

    await student.save();
    res.status(201).json({ message: "Student details added successfully", student });
  } catch (error) {
    await cleanupUploads(req.files);
    res.status(500).json({ message: "Error adding student details", error: error.message });
  }
};

// Create new student and details
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

    const pass = Array.from(name).length >= 6 ? name : '123456';
    const hashedPassword = await bcrypt.hash(pass, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "student",
      profilePic: extractProfilePic(req.files)
    });

    await user.save({ session });

    const student = new Student({
      user: user._id,
      rollNo,
      enrollmentNo,
      courses: parseCourses(courses),
      dob: parseDate(dob),
      gender,
      phone,
      address: parseAddress(address),
      guardianName,
      guardianContact,
      photos: extractPhotos(req.files),
      createdBy: req.user.email,   // from token
      updatedBy: req.user.email
    });

    await student.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Student created successfully", user, student });
  } catch (error) {
    await cleanupUploads(req.files);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error creating student", error: error.message });
  }
};

// Get student by ID
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("user", "name email role profilePic");
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

// Get all students with populated user data
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("user", "name email role profilePic");
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

//Get new Registered students
exports.getNewRegisteredStudents = async (req, res) => {
    try {
       const ActivstudentIds = await Student.find().distinct("user");
      const students = await User.find({
        role: "student",
        _id: { $nin: ActivstudentIds }
      }).select("-password");;
      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ message: "Error fetching new registered students", error: error.message });
    }
}

// Update student
exports.updateStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { id } = req.params;
  const {
    name,
    email,
    rollNo,
    enrollmentNo,
    dob,
    gender,
    phone,
    guardianName,
    guardianContact,
    courses,
    address,
    deletePhotosUrls
  } = req.body;  

  const parsedDeletePhotos = deletePhotosUrls ? JSON.parse(deletePhotosUrls) : [];
  let deletedPhotos = [];
  let oldProfile = '';

  try {
    const student = await Student.findById(id).populate("user");
    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Student not found" });
    }

    // update user fields
    student.user.name = name;
    student.user.email = email;

    // update student fields
    student.rollNo = rollNo;
    student.enrollmentNo = enrollmentNo;
    student.dob = parseDate(dob);
    student.gender = gender;
    student.phone = phone;
    student.guardianName = guardianName;
    student.guardianContact = guardianContact;
    student.updatedBy = req.user.email;   // from token

    if (req.files && req.files.profilePic) {
      if (student.user.profilePic) oldProfile = student.user.profilePic;
      student.user.profilePic = extractProfilePic(req.files);
    }

    if (courses?.length > 0) student.courses = parseCourses(courses);

    Object.assign(student.address, parseAddress(address));

    // update photos
    const newPhotos = extractPhotos(req.files);
    if (Array.isArray(parsedDeletePhotos) && parsedDeletePhotos.length > 0) {
      deletedPhotos.push(...student.photos.filter(photoUrl => parsedDeletePhotos.includes(photoUrl)));
      student.photos = student.photos.filter(photoUrl => !parsedDeletePhotos.includes(photoUrl));
    }
    if (newPhotos.length > 0) student.photos.push(...newPhotos);

    await student.user.save({ session });
    const updatedStudent = await student.save({ session });

    await session.commitTransaction();
    session.endSession();

    if (deletedPhotos.length > 0) {
      await deleteFiles(deletedPhotos);
    }
    if (oldProfile) {
      await deleteFiles([oldProfile]);
    }

    res.json({ message: "Student updated successfully", student: updatedStudent });
  } catch (error) {
    await cleanupUploads(req.files);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error updating student", error: error.message });
  }
};

//Upload documents
exports.uploadDocuments = async (req, res) => {
  const { id } = req.user;
  const newPhotos = extractPhotos(req.files);
  try {
    const student = await Student.findOne({user: id});
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if(newPhotos.length) student.photos.push(...newPhotos);    
    const updatedStudent = await student.save();
    res.json({ message: "Documents uploaded successfully", updatedStudent });
  } catch(err) {
    console.log("error uploading documents--", err);
  }
}

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.photos && student.photos.length) {
      await deleteFiles(student.photos);
    }

    await Student.deleteOne({ _id: student._id });

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
