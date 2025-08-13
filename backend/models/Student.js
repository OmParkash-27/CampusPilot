const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number,
    required: true,
  },
  class: {
    type: String,
    enum: ['mca', 'mba', 'bca', 'bba'],
    default: 'bca',
    required: true,
    uppercase: true
  },
  rollNo: {
    type: Number,
    required: true
  },
  photos: [{
    type: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);