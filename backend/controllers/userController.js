const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const deleteFiles = require('../utils/deleteUploadedFiles');
const { log } = require('console');
//update role
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const allowedRoles = ['admin', 'editor', 'teacher', 'user'];
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

//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.status(200).json(users);
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
  const { name, email, role } = req.body;
  const newProfilePic = req.file?.filename;

  const allowedRoles = ['admin', 'editor', 'teacher', 'user'];
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
