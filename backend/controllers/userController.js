const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require("../models/Student");

const deleteFiles = require('../utils/deleteUploadedFiles');
const bcrypt = require('bcryptjs');


//add user by admin
exports.addUser = async (req, res) => {
  const { name, email, role, status } = req.body;
    const profilePic = req.file ? req.file.filename : null;
    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
            await deleteFiles(profilePic); // cleanup uploaded pic
            return res.status(400).json({ message: 'Email already exists' });
          }
      const pass = Array.from(name).length > 6 ? name : '123456';
      const hashedPassword = await bcrypt.hash(pass, 10);
      const newUser = await User.create({ name, email, password: hashedPassword, profilePic, status, role });

      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (err) {
      await deleteFiles(profilePic);
      res.status(500).json({ message: 'Add user failed', error: err.message });
    }
}

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

//update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, status } = req.body;
  const newProfilePic = req.file?.filename;

  const allowedRoles = ['admin', 'editor', 'teacher', 'student'];
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove old profile pic if new one is uploaded
    
    // old profilePic
    var old_Profile_Pic = user.profilePic;

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.status = status || user.status;
    if (newProfilePic) user.profilePic = newProfilePic;

    await user.save();
    if (newProfilePic && old_Profile_Pic && (newProfilePic !== old_Profile_Pic)) {
      await deleteFiles(old_Profile_Pic);       
    }
    res.status(200).json({ message: 'User updated successfully', user });

  } catch (err) {
    await deleteFiles(newProfilePic);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

//delete user
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

    await User.deleteOne({ _id: id }, { session });

    if (user.role === "student") {
      await Student.deleteOne({ user: id }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }
};
