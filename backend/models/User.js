const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: String, // hashed token
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  userAgent: String,
  ip: String,
  jti: String
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'editor', 'teacher', 'admin'],
    default: 'student',
  },
  status: {
    type: Boolean,
    default: false
  },
  profilePic: {
    type: String,
    default: '',
  },
  refreshTokens: [refreshTokenSchema]
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);