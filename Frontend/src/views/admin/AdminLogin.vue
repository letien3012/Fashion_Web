<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h1>ĐĂNG NHẬP ADMIN</h1>
          <p class="subtitle">Chào mừng bạn quay trở lại!</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <input
              type="email"
              id="email"
              v-model="email"
              required
              placeholder=" "
            />
            <label for="email">Email</label>
            <div class="input-icon">
              <i class="fas fa-envelope"></i>
            </div>
          </div>

          <div class="form-group">
            <input
              type="password"
              id="password"
              v-model="password"
              required
              placeholder=" "
            />
            <label for="password">Mật khẩu</label>
            <div class="input-icon">
              <i class="fas fa-lock"></i>
            </div>
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="!loading">Đăng Nhập</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { toast } from "vue3-toastify";
import AdminAuthService from "../../services/admin/auth.service";

export default {
  name: "AdminLogin",
  data() {
    return {
      email: "",
      password: "",
      loading: false,
    };
  },
  methods: {
    async handleLogin() {
      try {
        this.loading = true;
        const response = await AdminAuthService.login(
          this.email,
          this.password
        );

        if (response.success) {
          toast.success("Đăng nhập thành công!");
          await this.$router.push("/admin/dashboard");
        } else {
          toast.error("Thông tin đăng nhập không hợp lệ!");
        }
      } catch (error) {
        console.error("Login error:", error);
        if (error.response?.status === 401) {
          toast.error("Email hoặc mật khẩu không đúng!");
        } else if (error.response?.status === 400) {
          toast.error(
            error.response.data.message || "Vui lòng nhập đầy đủ thông tin!"
          );
        } else {
          toast.error("Đăng nhập thất bại. Vui lòng thử lại sau!");
        }
      } finally {
        this.loading = false;
      }
    },
  },
  created() {
    // Kiểm tra nếu đã đăng nhập thì chuyển hướng
    if (AdminAuthService.isAuthenticated()) {
      this.$router.push("/admin/dashboard");
    }
  },
};
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");

.admin-login {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    180deg,
    #ffebee,
    #ffffff,
    #ffebee
  ); /* Light red and white gradient */
  background-size: 400% 400%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  animation: gradientBackground 15s ease infinite;
}

@keyframes gradientBackground {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.admin-login::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(
    255,
    235,
    238,
    0.3
  ); /* Adjusted overlay for light red background */
  backdrop-filter: blur(5px); /* Reduced blur */
  z-index: 0;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  perspective: 1500px;
}

.login-box {
  background: rgba(
    128,
    128,
    128,
    0.2
  ); /* Light gray background with transparency */
  backdrop-filter: blur(12px) brightness(1.05); /* Re-added backdrop-filter */
  padding: 50px 40px;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2),
    inset 0 0 30px rgba(200, 200, 200, 0.1); /* Adjusted shadow */
  transform-style: preserve-3d;
  animation: float 8s ease-in-out infinite,
    subtleRotate 20s linear infinite alternate;
  border: 1px solid rgba(200, 200, 200, 0.3); /* Adjusted border */
  transition: transform 0.5s ease;
  transform-origin: center;
}

.login-box:hover {
  transform: translateY(-15px) rotateX(3deg) rotateY(3deg) scale(1.03);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3),
    inset 0 0 40px rgba(200, 200, 200, 0.2);
}

@keyframes float {
  0% {
    transform: translateY(0px) rotateX(0deg) rotateY(0deg);
  }
  50% {
    transform: translateY(-15px) rotateX(2deg) rotateY(2deg);
  }
  100% {
    transform: translateY(0px) rotateX(0deg) rotateY(0deg);
  }
}

@keyframes subtleRotate {
  0% {
    transform: rotateY(0deg) rotateX(0deg);
  }
  100% {
    transform: rotateY(2deg) rotateX(1deg);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  color: #333; /* Darker text for contrast on light form */
  font-size: 38px;
  font-weight: 700;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.1); /* Darker shadow for visibility */
  letter-spacing: 3px;
  margin-bottom: 10px;
}

.subtitle {
  color: #555; /* Darker text for contrast on light form */
  font-size: 18px;
  margin-top: 10px;
}

.form-group {
  position: relative;
  margin-bottom: 30px;
}

.input-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #555; /* Darker icons */
  transition: color 0.3s ease;
  font-size: 18px;
}

input:focus ~ .input-icon {
  color: #000;
}

input {
  width: 100%;
  padding: 15px 50px 15px 20px;
  background: rgba(
    255,
    255,
    255,
    0.7
  ); /* Lighter input background on red form */
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  color: #333; /* Darker text in input */
  font-size: 18px;
  transition: all 0.4s ease;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
}

input::placeholder {
  color: rgba(51, 51, 51, 0.6); /* Darker placeholder text */
}

input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.9); /* Lighter focus background */
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 0, 0, 0.1);
}

label {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #555; /* Darker label */
  pointer-events: none;
  transition: all 0.3s ease;
  font-size: 18px;
}

input:focus + label,
input:not(:placeholder-shown) + label {
  top: -12px;
  left: 15px;
  font-size: 14px;
  background: rgba(
    255,
    255,
    255,
    0.9
  ); /* Lighter background for floating label */
  padding: 2px 8px;
  border-radius: 5px;
  color: #333; /* Darker text */
  font-weight: 600;
  text-transform: uppercase;
}

.login-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(
    45deg,
    #ff4b4b,
    #ff0000,
    #ff4b4b
  ); /* Reddish gradient for button */
  background-size: 300% 300%;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(255, 0, 0, 0.4); /* Red shadow */
  animation: buttonGradient 4s ease infinite alternate;
}

@keyframes buttonGradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-7px) scale(1.03);
  box-shadow: 0 20px 30px rgba(255, 0, 0, 0.6); /* Red shadow on hover */
  background-position: right center;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 4px solid rgba(0, 0, 0, 0.3); /* Darker spinner border */
  border-radius: 50%;
  border-top-color: #333; /* Darker spinner color */
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .login-box {
    margin: 15px;
    padding: 40px 25px;
  }

  .login-header h1 {
    font-size: 32px;
  }

  .subtitle {
    font-size: 16px;
  }

  input,
  label {
    font-size: 16px;
  }

  input {
    padding: 14px 45px 14px 18px;
  }

  label {
    left: 18px;
  }

  input:focus + label,
  input:not(:placeholder-shown) + label {
    top: -10px;
    left: 15px;
    font-size: 12px;
    padding: 1px 5px;
  }

  .input-icon {
    right: 15px;
    font-size: 16px;
  }

  .login-btn {
    padding: 16px;
    font-size: 16px;
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border-width: 3px;
  }
}
</style>
