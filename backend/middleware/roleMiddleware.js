// backend/middleware/roleMiddleware.js

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Teachers only.' });
  }
  next();
};

const isEditor = (req, res, next) => {
  if (req.user.role !== 'editor' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Editors only.' });
  }
  next();
};

module.exports = { isAdmin, isTeacher, isEditor };
