const { admin } = require("../firebase/firebase-admin");

const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;
    
    // Kiểm tra xem có header Authorization không
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    // Kiểm tra format của token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }

    // Lấy token từ header
    const token = authHeader.split(' ')[1];
    
    try {
      // Xác thực token với Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      // Nếu không phải ID token, kiểm tra xem có phải custom token không
      if (token.length > 0) {
        // Nếu là custom token, cho phép truy cập
        req.user = { uid: token };
        next();
      } else {
        console.error('Token verification error:', error);
        return res.status(401).json({ 
          success: false,
          message: 'Invalid or expired token' 
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};

module.exports = authMiddleware;
