// /controllers/authController.js
const loginSuccess = (req, res) => {
  if (req.user) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ message: "Chưa đăng nhập" });
  }
};

const logout = (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
};

module.exports = {
  loginSuccess,
  logout,
};
