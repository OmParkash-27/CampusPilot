const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const {
  parseDate,
  parseCourses,
  parseAddress
} = require('../utils/studentHelper');

const { uploadProfilePic, uploadPhotos, deleteFromCloudinary } = require('../utils/cloudinaryHelper');
const logger = require("../utils/logger");

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

// Add student details
exports.addStudentDetails = async (req, res) => {
  let profilePic = null;
  let photos = [];
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
      guardianContact,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "student") {
      return res
        .status(400)
        .json({ message: "Only student users can be linked" });
    }

    let student = await Student.findOne({ user: userId });
    if (student)
      return res
        .status(400)
        .json({ message: "Student details already exist" });

    // Upload profile pic
    if (req.files?.profilePic && req.files.profilePic[0]) {
      profilePic = await uploadProfilePic(req.files.profilePic[0]);
    }

    // Upload photos
    if (req.files?.photos && req.files.photos.length) {
      photos = await uploadPhotos(req.files.photos);
    }

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
      profilePic,
      photos,
      createdBy: req.user.email,
      updatedBy: req.user.email,
    });

    await student.save();
    res
      .status(201)
      .json({ message: "Student details added successfully", student });
  } catch (error) {
    if (photos.length) {
      await deleteFromCloudinary(photos);
    }
    res.status(500).json({
      message: "Error adding student details",
      error: error.message,
    });
  }
};

// Create new student
exports.createNewStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let profilePic = null;
  let photos = [];
  try {
    const {
      name, email, rollNo, enrollmentNo, courses, dob, gender,
      phone, address, guardianName, guardianContact
    } = req.body;

    const hashedPassword = await bcrypt.hash(name.length >= 6 ? name : '123456', 10);

    const profilePicFile = req.files?.profilePic?.[0];
    const photosFiles = req.files?.photos;

    profilePic = profilePicFile ? await uploadProfilePic(profilePicFile) : null;
    photos = photosFiles ? await uploadPhotos(photosFiles) : [];

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "student",
      profilePic
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
      photos,
      createdBy: req.user.email,
      updatedBy: req.user.email
    });

    await student.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Student created successfully", user, student });
  } catch (err) {
    if(profilePic) await deleteFromCloudinary([profilePic]);
    if(photos) await deleteFromCloudinary(photos);

    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error creating student", error: err.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let uploadedProfilePic = null;
  let uploadedNewPhotos = [];
  let oldProfilePic = null;
  let deletePhotosUrls = [];

  try {
    const { id } = req.params;
    const student = await Student.findById(id).populate("user");
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.user.name = req.body.name;
    student.user.email = req.body.email;

    // Profile pic update
    if (req.files?.profilePic?.[0]) {
      uploadedProfilePic = await uploadProfilePic(req.files.profilePic[0]);
      oldProfilePic = student.user.profilePic; // keep old for later safe delete
      student.user.profilePic = uploadedProfilePic;
    }

    // Photos upload
    if (req.files?.photos) {
      uploadedNewPhotos = await uploadPhotos(req.files.photos);
      if (uploadedNewPhotos.length) {
        student.photos.push(...uploadedNewPhotos);
      }
    }

    // Photos delete (request-based)
    deletePhotosUrls = req.body.deletePhotosUrls ? JSON.parse(req.body.deletePhotosUrls) : [];
    if (deletePhotosUrls.length) {
      // just remove from DB, actual Cloudinary delete after commit
      student.photos = student.photos.filter(url => !deletePhotosUrls.includes(url));
    }

    student.rollNo = req.body.rollNo;
    student.enrollmentNo = req.body.enrollmentNo;
    student.courses = parseCourses(req.body.courses);
    student.dob = parseDate(req.body.dob);
    student.gender = req.body.gender;
    student.phone = req.body.phone;
    student.address = parseAddress(req.body.address);
    student.guardianName = req.body.guardianName;
    student.guardianContact = req.body.guardianContact;
    student.updatedBy = req.user.email;

    await student.user.save({ session });
    const updatedStudent = await student.save({ session });

    await session.commitTransaction();
    session.endSession();

    if (oldProfilePic) {
      await deleteFromCloudinary([oldProfilePic]);
    }
    if (deletePhotosUrls.length) {
      await deleteFromCloudinary(deletePhotosUrls);
    }

    res.json({ message: "Student updated successfully", student: updatedStudent });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Rollback newly uploaded files only
    if (uploadedProfilePic) {
      await deleteFromCloudinary([uploadedProfilePic]);
    }
    if (uploadedNewPhotos.length) {
      await deleteFromCloudinary(uploadedNewPhotos);
    }

    res.status(500).json({ message: "Error updating student", error: err.message });
  }
};

// Upload documents
exports.uploadDocuments = async (req, res) => {
  const { id } = req.user;
  let uploaded = [];
  try {
    const student = await Student.findOne({ user: id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // multer with fields returns req.files as an object
    const files = req.files?.photos || [];

    // upload new photos to cloudinary
    if (files.length) {
      uploaded = await uploadPhotos(files); // your helper function
      student.photos.push(...uploaded);
    }

    const updatedStudent = await student.save();
    res.json({
      message: "Documents uploaded successfully",
      student: updatedStudent,
    });
  } catch (err) {
    if(uploaded.length) await deleteFromCloudinary(uploaded);
    res.status(500).json({ message: "Error uploading documents", error: err.message });
  }
};

// Delete Student 
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const photosToDelete = Array.isArray(student.photos) && student.photos.length ? student.photos : [];

    if (photosToDelete.length) {
      try {
        await deleteFromCloudinary(photosToDelete);
      } catch (err) {
        logger.warn('Some Cloudinary photo deletions failed', {
                error: err.message,
                stack: err.stack
            });      }
    }

    await Student.deleteOne({ _id: student._id });

    return res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


