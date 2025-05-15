const express = require("express");
const verifyCode = require("../mailer/verifyCode");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ message: "Email và mã xác thực là bắt buộc." });
  }

  try {
    const result = await verifyCode(email, code);
    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (err) {
    console.error("Lỗi khi xác thực mã:", err);
    return res.status(500).json({ message: "Lỗi khi xác thực mã" });
  }
});

module.exports = router;
