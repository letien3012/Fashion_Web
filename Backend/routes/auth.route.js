// /routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
require("../config/passport");
const router = express.Router();
const { loginSuccess, logout } = require("../controllers/auth.controller");
const Customer = require("../models/customer.model");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const verifyToken = require('../mailer/verifyToken');
const mongoose = require("mongoose");
//Kiểm tra email có tồn tại trước khi đăng ký
router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  const user = await Customer.findOne({ email });
  if (user) {
    return res.json({ exists: true });
  }
  return res.json({ exists: false });
});
//Đăng ký với email và password
router.post("/signup", async (req, res) => {
  const { fullname, email, password, phone } = req.body;
  if (!fullname || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc." });
  }

  try {
    // Kiểm tra tồn tại
    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email đã được sử dụng." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = await Customer.create({
      fullname,
      email,
      password: hashedPassword,
      phone: phone || "",
      providers: ["local"],
      image: "https://www.svgrepo.com/show/452030/avatar-default.svg",
    });

    // Tạo JWT
    const token = jwt.sign(
      {
        id: newCustomer._id,
        email: newCustomer.email,
        name: newCustomer.fullname,
        picture: newCustomer.image,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      token,
      user: {
        id: newCustomer._id,
        name: newCustomer.fullname,
        email: newCustomer.email,
        image: newCustomer.image,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi đăng ký." });
  }
});
//Đăng nhập với email và password
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu email hoặc mật khẩu." });
  }

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res
        .status(401)
        .json({ success: false, message: "Tài khoản không tồn tại." });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Mật khẩu không đúng." });
    }

    // Tạo token
    const token = jwt.sign(
      {
        id: customer._id,
        email: customer.email,
        name: customer.fullname,
        picture: customer.image,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: customer._id,
        name: customer.fullname,
        email: customer.email,
        image: customer.image,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi đăng nhập." });
  }
});

// Route: Bắt đầu đăng nhập Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Callback route sau khi xác thực Google
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  async (req, res) => {
    try {
      const { emails, displayName, photos } = req.user;
      const email = emails[0].value;

      let customer = await Customer.findOne({ email });

      if (customer) {
        // Đảm bảo providers là mảng
        if (!Array.isArray(customer.providers)) {
          customer.providers = [];
        }
        // Thêm "google" nếu chưa tồn tại
        if (!customer.providers.includes("google")) {
          customer.providers.push("google");
          await customer.save();
        }
      } else {
        // Tạo password ngẫu nhiên và hash
        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        customer = await Customer.create({
          fullname: displayName,
          email,
          image: photos?.[0]?.value || "",
          phone: "",
          providers: ["google"], // providers là mảng, thêm "google"
          password: hashedPassword,
        });
      }

      // Tạo JWT token
      const token = jwt.sign(
        {
          id: customer._id,
          email: customer.email,
          name: customer.fullname,
          picture: customer.image,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.send(`
        <script>
          window.opener.postMessage(${JSON.stringify({
            token,
            user: {
              id: customer._id,
              name: customer.fullname,
              email: customer.email,
              image: customer.image,
            },
          })}, "*");
          window.close();
        </script>
      `);
    } catch (err) {
      console.error("Xác thực Google thất bại:", err);
      res.status(500).json({ success: false, message: "Lỗi xác thực Google" });
    }
  }
);
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/" }),
  async (req, res) => {
    try {
      const { emails, displayName, photos } = req.user;
      const email = emails?.[0]?.value;
      const providerName = "facebook";

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email không tồn tại trong tài khoản Facebook.",
        });
      }

      let customer = await Customer.findOne({ email });

      if (customer) {
        // Nếu đã có user, thêm provider nếu chưa có
        if (!Array.isArray(customer.providers)) {
          customer.providers = [];
        }

        if (!customer.providers.includes(providerName)) {
          customer.providers.push(providerName);
          await customer.save();
        }
      } else {
        // Tạo mật khẩu ngẫu nhiên và hash
        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        customer = await Customer.create({
          fullname: displayName,
          email,
          image: photos?.[0]?.value || "",
          phone: "",
          providers: [providerName],
          password: hashedPassword,
        });
      }

      // Tạo JWT token
      const token = jwt.sign(
        {
          id: customer._id,
          email: customer.email,
          name: customer.fullname,
          picture: customer.image,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Gửi token về frontend qua postMessage
      res.send(`
        <script>
          window.opener.postMessage(${JSON.stringify({
            token,
            user: {
              id: customer._id,
              name: customer.fullname,
              email: customer.email,
              image: customer.image,
            },
          })}, "*");
          window.close();
        </script>
      `);
    } catch (err) {
      console.error("Xác thực Facebook thất bại:", err);
      res
        .status(500)
        .json({ success: false, message: "Lỗi xác thực Facebook" });
    }
  }
);
//Route: VerifyToken
router.post("/verifyToken", async (req, res) => {
  const { idToken } = req.body; // thực chất là JWT bạn tạo

  try {
    const decoded = jwt.verify(
      idToken,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const email = decoded.email;
    let customer = await Customer.findOne({ email }); // dùng mongoose model

    // Nếu chưa có, tạo mới
    if (!customer) {
      customer = await Customer.create({
        fullname: decoded.name,
        email: decoded.email,
        image: decoded.picture || "",
        phone: "",
      });
    }

    return res.status(200).json({
      message: "Xác thực thành công",
      user: customer,
    });
  } catch (error) {
    console.error("Token không hợp lệ:", error);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// module.exports = router;
// Route: Lấy thông tin user sau đăng nhập
router.get("/login/success", loginSuccess);

// Route: Logout
router.get("/logout", logout);

// Endpoint xác thực token đặt lại mật khẩu
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    const result = await verifyToken(token);
    return res.json(result);
  } catch (error) {
    console.error('Lỗi xác thực token:', error);
    return res.status(500).json({ valid: false, message: 'Lỗi server' });
  }
});

// Endpoint đặt lại mật khẩu
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Xác thực token
    const verifyResult = await verifyToken(token);
    if (!verifyResult.valid) {
      return res.status(400).json({ success: false, message: verifyResult.message });
    }

    // Tìm user theo email
    const user = await Customer.findOne({ email: verifyResult.email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy tài khoản' });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cập nhật mật khẩu mới
    await Customer.findByIdAndUpdate(user._id, { password: hashedPassword });

    // Xóa token sau khi đặt lại mật khẩu thành công
    const ResetPassword = mongoose.model("ResetPassword");
    await ResetPassword.deleteOne({ token });

    return res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi đặt lại mật khẩu:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Middleware xác thực JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token không được cung cấp' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token không hợp lệ' });
    }
    req.user = user;
    next();
  });
};

// Endpoint xác minh mật khẩu hiện tại
router.post('/verify-current-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập mật khẩu hiện tại' 
      });
    }

    // Tìm user theo ID
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tài khoản' 
      });
    }

    // So sánh mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Mật khẩu hiện tại không đúng' 
      });
    }

    return res.json({ 
      success: true, 
      message: 'Xác minh mật khẩu thành công' 
    });
  } catch (error) {
    console.error('Lỗi xác minh mật khẩu:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Endpoint đổi mật khẩu
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập mật khẩu mới' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      });
    }

    // Tìm user theo ID
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tài khoản' 
      });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới
    await Customer.findByIdAndUpdate(userId, { password: hashedPassword });

    return res.json({ 
      success: true, 
      message: 'Đổi mật khẩu thành công' 
    });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Endpoint kiểm tra thông tin tài khoản
router.get('/account-info', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm user theo ID
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tài khoản' 
      });
    }

    return res.json({ 
      success: true, 
      data: {
        email: user.email,
        fullname: user.fullname,
        providers: user.providers || [],
        hasLocalProvider: user.providers && user.providers.includes('local')
      }
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin tài khoản:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Endpoint gửi mã xác minh qua email
router.post('/send-verification-code', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm user theo ID
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tài khoản' 
      });
    }

    // Kiểm tra xem tài khoản có provider local không
    if (user.providers && user.providers.includes('local')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tài khoản này có thể sử dụng mật khẩu hiện tại' 
      });
    }

    // Gửi email sử dụng service có sẵn
    const sendVerificationCode = require('../mailer/sendVerificationCode');
    await sendVerificationCode(user.email, user.fullname, "đổi mật khẩu");

    return res.json({ 
      success: true, 
      message: 'Mã xác minh đã được gửi đến email của bạn' 
    });
  } catch (error) {
    console.error('Lỗi gửi mã xác minh:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi gửi mã xác minh' 
    });
  }
});

// Endpoint xác minh mã
router.post('/verify-code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập mã xác minh' 
      });
    }

    // Tìm user theo ID
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tài khoản' 
      });
    }

    // Sử dụng verifyCode service
    const verifyCode = require('../mailer/verifyCode');
    const result = await verifyCode(user.email, code);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }

    return res.json({ 
      success: true, 
      message: 'Xác minh mã thành công' 
    });
  } catch (error) {
    console.error('Lỗi xác minh mã:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

module.exports = router;
