const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course: {
    type: String,
    enum: ['MCA', 'MBA', 'BCA', 'BBA'],
    required: true,
    uppercase: true
  },
  batchYear: {
    type: Number,
    required: true,
    min: 1900, 
    max: new Date().getFullYear() 
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active'
  }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  rollNo: {
    type: String,
    required: true,
    unique: true
  },
  enrollmentNo: {
    type: String,
    unique: true,
    sparse: true
  },
  courses: [courseSchema], // multiple courses for same student
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male', required: true },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  guardianName: { type: String },
  guardianContact: { type: String },
  photos: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
