const { admin } = require("../firebase/firebase-admin");

const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Xác thực token với Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Lấy thông tin user từ token
    const user = await admin.auth().getUser(decodedToken.uid);
    
    // Thêm thông tin user vào request
    req.user = {
      id: user.uid,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware; 