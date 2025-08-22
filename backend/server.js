
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const verifyToken = require('./middleware/authMiddleware');

// Load environment variables
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigin =
  process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL // e.g. https://myapp.com
    : 'http://localhost:4200'; // dev Angular URL

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true, // allow cookies
  })
);

//public folder
app.use('/api', express.static(path.join(__dirname, './public')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', verifyToken, studentRoutes); // protected
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/admin', verifyToken, dashboardRoutes);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
