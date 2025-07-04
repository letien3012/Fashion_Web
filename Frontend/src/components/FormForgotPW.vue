<template>
  <div class="form-container">
    <h2>Quên mật khẩu</h2>

    <form @submit.prevent="handleLogin">
      <input
        type="text"
        placeholder="Email hoặc username"
        v-model="email"
        required
      />

      <button
        type="submit"
        class="btn login"
        :class="{ active: isEmailFilled }"
        :disabled="!isEmailFilled || isLoading"
      >
        {{ isLoading ? "Đang kiểm tra..." : "Tiếp tục" }}
      </button>
    </form>

    <div class="signup-section">
      <p>Đã có tài khoản?</p>
      <router-link to="/login">
        <button class="btn signup">Đăng nhập</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
export default {
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      rememberMe: false,
      isLoading: false,
      errorMsg: "",
      emailChecked: false,
    };
  },
  computed: {
    isEmailFilled() {
      return this.email.trim().length > 0;
    },
  },
  methods: {
    async handleLogin() {
      this.errorMsg = "";
      this.emailChecked = false;
      // Kiểm tra định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email.trim())) {
        toast.error("Email không hợp lệ!");
        return;
      }
      this.isLoading = true;
      try {
        // Kiểm tra email đã đăng ký chưa
        const data = await fetch(`${baseUrl}/api/auth/check-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: this.email }),
        });
        const checkData = await data.json();
        if (data.ok) {
          if (!checkData.exists) {
            toast.error("Email chưa được đăng ký tài khoản!");
          } else {
            // Gửi email reset password
            const response = await fetch(
              `${baseUrl}/api/mail/send-reset-password`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: this.email }),
              }
            );
            const resData = await response.json();
            if (response.ok) {
              toast.success("Vui lòng kiểm tra email để đặt lại mật khẩu.");
              this.email = ""; // Xóa email trong khung
            } else {
              toast.error(
                resData.message || "Gửi link đặt lại mật khẩu thất bại."
              );
            }
          }
        } else {
          toast.error(checkData.message || "Có lỗi xảy ra, vui lòng thử lại.");
        }
      } catch (err) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.form-container {
  margin-top: 80px;
  margin-bottom: 100px;
  padding: 32px 28px;

  border-radius: 16px;
  font-family: "Open Sans", sans-serif;
  width: 50vw;
  min-width: 320px;
  max-width: 95vw;
  height: auto;
  box-shadow: 0 6px 32px 0 rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1.5px solid #e0e0e0;
  position: relative;
}

@media (max-width: 768px) {
  .form-container {
    width: 95vw;
    max-width: 95vw;
    margin-top: 20px;
    padding: 18px 20px;
    border-radius: 10px;
  }
}

@media (min-width: 769px) {
  .form-container {
    margin-top: 150px;
    box-shadow: 0 8px 40px 0 rgba(0, 0, 0, 0.14), 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

a {
  text-decoration: none;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
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
  background-color: #999;
  color: white;
  border: none;
  transition: background 0.2s;
}

.btn.login.active {
  background-color: #00b6ff;
  cursor: pointer;
}

.btn.login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
