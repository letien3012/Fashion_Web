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
import { toast } from "vue3-toastify";

export default {
  data() {
    return {
      email: "" || localStorage.getItem("signup_email"),
      password: "",
      showPassword: false,
      rememberMe: false,
    };
  },
  methods: {
    async handleSignup() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        toast.error("Vui lòng nhập một địa chỉ email hợp lệ.");
        return;
      }

      try {
        // Bước 1: Kiểm tra email đã đăng ký chưa
        const checkRes = await fetch(
          "http://localhost:3005/api/auth/check-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: this.email }),
          }
        );

        const checkData = await checkRes.json();
        if (checkRes.ok) {
          if (checkData.exists) {
            toast.error(
              "Email này đã được đăng ký. Vui lòng sử dụng email khác."
            );
            return;
          }

          // Bước 2: Gửi mã OTP nếu email chưa được đăng ký
          const response = await fetch(
            "http://localhost:3005/api/mail/send-code",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: this.email }),
            }
          );

          const data = await response.json();
          if (response.ok) {
            localStorage.setItem("signup_email", this.email);
            toast.success("Mã xác thực đã được gửi đến email của bạn.");
            this.$router.push({ name: "VerificationOtp" });
          } else {
            toast.error(data.message || "Gửi mã xác thực thất bại.");
          }
        } else {
          toast.error(checkData.message || "Lỗi kiểm tra email.");
        }
      } catch (error) {
        console.error("Lỗi:", error);
        toast.error("Lỗi kết nối đến server.");
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
