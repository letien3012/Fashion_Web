const express = require("express");
const verifyCode = require("../mailer/verifyCode");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ success: false, message: "Email và mã xác thực là bắt buộc." });
  }

  try {
    const result = await verifyCode(email, code);
    // luôn trả JSON có key "success"
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Lỗi khi xác thực mã:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi khi xác thực mã" });
  }
});

module.exports = router;
