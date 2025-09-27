const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require("../models/Student");
const bcrypt = require('bcryptjs');
const { uploadProfilePic, deleteFromCloudinary } = require('../utils/cloudinaryHelper');

//get a user
exports.getUser = async (req, res) => {
  
  const id = req.params.id;
  try {
    const user = await User.findById(id).select('-password'); // Exclude passwords
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

//update role
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;  

  const allowedRoles = ['admin', 'editor', 'teacher', 'student'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided.' });
  }

  try {
    const student = await Student.findOne({ user: id });
    if (student) return res.status(400).json({ message: "You can't change role of existing student" });

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }); // If you don’t use new: true, will give without updated user
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // if (typeof status !== 'boolean') {
    //   return res.status(400).json({ message: 'Status must be a boolean' });
    // }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Status updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

//add user
exports.addUser = async (req, res) => {
  const { name, email, role, status } = req.body;
  let profilePicUrl = null;

  try {
    if (req.file) {
      profilePicUrl = await uploadProfilePic(req.file);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      if (profilePicUrl) await deleteFromCloudinary(profilePicUrl);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const pass = Array.from(name).length > 6 ? name : '123456';
    const hashedPassword = await bcrypt.hash(pass, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePic: profilePicUrl,
      status,
      role
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    if (profilePicUrl) await deleteFromCloudinary(profilePicUrl);
    res.status(500).json({ message: 'Add user failed', error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, status } = req.body;
  let newProfilePicUrl = null;

  const allowedRoles = ['admin', 'editor', 'teacher', 'student'];
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.file) {
      newProfilePicUrl = await uploadProfilePic(req.file);
    }

    const oldProfilePic = user.profilePic;

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.status = status || user.status;
    if (newProfilePicUrl) user.profilePic = newProfilePicUrl;

    await user.save();

    if (newProfilePicUrl && oldProfilePic && oldProfilePic !== newProfilePicUrl) {
      await deleteFromCloudinary(oldProfilePic);
    }

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    if (newProfilePicUrl) await deleteFromCloudinary(newProfilePicUrl);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    const profilePic = user.profilePic;

    await User.deleteOne({ _id: id }, { session });

    if (user.role === "student") {
      await Student.deleteOne({ user: id }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    if (profilePic) await deleteFromCloudinary(profilePic);

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }
};
