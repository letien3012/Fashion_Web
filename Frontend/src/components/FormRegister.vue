<template>
  <div class="form-container">
    <h2>Đăng ký</h2>

    <div class="social-login">
      <button class="btn social">
        <img
          src="../assets/images/google.png"
          height="16px"
          width="16px"
          style="margin-right: 5px"
        />
        Tiếp tục với Google
      </button>
      <button class="btn social">
        <img
          src="../assets/images/facebook.png"
          height="16px"
          width="16px"
          style="margin-right: 5px"
        />
        Tiếp tục với Facebook
      </button>
    </div>

    <div class="divider">
      <span>OR</span>
    </div>

    <form @submit.prevent="handleSignup">
      <input type="text" placeholder="Email" v-model="email" required />
      <button type="submit" class="btn login" :class="{ active: email }">
        Đăng ký
      </button>
    </form>

    <div class="signup-section">
      <p>Đã có tài khoản?</p>
      <router-link to="/">
        <button class="btn signup">Đăng nhập</button>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      rememberMe: false,
    };
  },
  methods: {
    async handleSignup() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        alert("Vui lòng nhập một địa chỉ email hợp lệ.");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3005/api/mail/send-code",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: this.email,
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("signup_email", this.email);
          // Thành công, chuyển sang trang nhập OTP
          this.$router.push({
            name: "VerificationOtp",
          });
        } else {
          alert(data.message || "Gửi mã xác thực thất bại.");
        }
      } catch (error) {
        console.error("Lỗi gửi yêu cầu:", error);
        alert("Lỗi kết nối đến server.");
      }
    },
  },
};
</script>

<style scoped>
.form-container {
  margin: none;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  font-family: "Open Sans", sans-serif;
  width: 50vw;
  height: auto;
}

a {
  text-decoration: none;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.social-login .btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 30px;
  padding: 5px;
  background: white;
}

.social-login .btn i {
  margin-right: 8px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #ccc;
}

.divider span {
  margin: 0 10px;
}

input {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.btn.login {
  width: 100%;
  margin-top: 20px;
  padding: 10px;
  border-radius: 30px;
  background-color: #999; /* Màu mặc định */
  color: white;
  border: none;
  cursor: not-allowed;
  transition: background-color 0.3s ease;
}

.btn.login.active {
  background-color: #00b6ff; /* Màu xanh khi đã nhập email */
  cursor: pointer;
}

.signup-section {
  text-align: center;
  margin-top: 20px;
}

.btn.signup {
  border: 1px solid #ccc;
  border-radius: 30px;
  padding: 10px;
  width: 100%;
  background: white;
}
</style>
