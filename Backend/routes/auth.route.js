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
  console.log(fullname, email, password);
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
      image: "",
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
<<<<<<< HEAD
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
=======
// router.post("/verifyToken", async (req, res) => {
//   const { idToken } = req.body;
//   try {
//     const decodedToken = await firebase.admin.auth().verifyIdToken(idToken);
//     const uid = decodedToken.uid;
//     const user = await firebase.auth.getUser(uid);
//     const email = user.email;
//     let customer = await Customer.getByEmail(email);
//     console.log(customer);
//     if (!customer) {
//       axios
//         .post("http:localhost:3005/api/customers/add", {
//           fullname: user.displayName,
//           email: user.email,
//           image: user.photoURL,
//           phone: user.phoneNumber,
//         })
//         .then((response) => {
//           console.log("Response:", response.data);
//         })
//         .catch((error) => {
//           console.error("Error:", error);
//         });
//     }
//     // Tuỳ bạn: lấy thêm email, name...
//     return res.status(200).json({ uid });
//   } catch (error) {
//     console.error("Xác thực token thất bại:", error);
//     return res.status(401).json({ message: "Token không hợp lệ" });
//   }
// });
>>>>>>> 0702b8245506a64947d54814e87c734310bae32c

// module.exports = router;
// Route: Lấy thông tin user sau đăng nhập
router.get("/login/success", loginSuccess);

// Route: Logout
router.get("/logout", logout);

module.exports = router;
