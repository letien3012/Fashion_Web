<template>
  <div class="reset-password-container">
    <div v-if="isLoading" class="loading-container">
      <p>Đang xác thực token...</p>
    </div>
    <div v-else-if="!isTokenValid" class="error-container">
      <h2>Token không hợp lệ</h2>
      <p>Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
      <button @click="$router.push('/forgotpw')" class="back-btn">
        Quay lại trang quên mật khẩu
      </button>
    </div>
    <div v-else>
      <h2>Đặt lại mật khẩu</h2>
      <p>Nhập mật khẩu mới của bạn</p>

      <form @submit.prevent="resetPassword">
        <div class="form-group">
          <label for="password">Mật khẩu mới</label>
          <div class="input-password">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Mật khẩu mới"
            />
            <span class="toggle-password" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
          <small v-if="password && !passwordValid" class="error-msg">
            Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
          </small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Xác nhận mật khẩu</label>
          <div class="input-password">
            <input
              id="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="Xác nhận mật khẩu"
            />
            <span
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i
                :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
              ></i>
            </span>
          </div>
          <small v-if="confirmPassword && !passwordsMatch" class="error-msg">
            Mật khẩu xác nhận không khớp.
          </small>
        </div>

        <button
          type="submit"
          :disabled="!canSubmit"
          :class="['reset-btn', { active: canSubmit }]"
        >
          Đặt lại mật khẩu
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export default {
  data() {
    return {
      password: "",
      confirmPassword: "",
      showPassword: false,
      showConfirmPassword: false,
      isLoading: true,
      isTokenValid: false,
    };
  },
  computed: {
    passwordValid() {
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^+=-])[A-Za-z\d@$!%*#?&^+=-]{8,}$/;
      return regex.test(this.password);
    },
    passwordsMatch() {
      return this.password === this.confirmPassword;
    },
    canSubmit() {
      return this.passwordValid && this.passwordsMatch;
    },
  },
  async created() {
    await this.verifyToken();
  },
  methods: {
    async verifyToken() {
      const token = this.$route.query.token;
      if (!token) {
        this.isTokenValid = false;
        this.isLoading = false;
        return;
      }

      try {
        const res = await axios.post("http://localhost:3005/api/auth/verify-reset-token", {
          token,
        });

        this.isTokenValid = res.data.valid;
      } catch (error) {
        console.error("Lỗi khi xác thực token:", error);
        this.isTokenValid = false;
      } finally {
        this.isLoading = false;
      }
    },
    async resetPassword() {
      if (!this.canSubmit) return;

      const token = this.$route.query.token;
      try {
        const res = await axios.post("http://localhost:3005/api/auth/reset-password", {
          token,
          password: this.password,
        });

        if (res.data.success) {
          toast.success("Đặt lại mật khẩu thành công!");
          this.$router.push("/login");
        } else {
          toast.error(res.data.message || "Đặt lại mật khẩu thất bại.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        toast.error("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      }
    },
  },
};
</script>

<style scoped>
.reset-password-container {
  width: 50vw;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.3);
  font-family: "Open Sans", sans-serif;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 2rem;
}

.error-container h2 {
  color: #dc3545;
  margin-bottom: 1rem;
}

.back-btn {
  margin-top: 1.5rem;
  padding: 0.8rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1rem;
}

.back-btn:hover {
  background-color: #0056b3;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.input-password {
  position: relative;
}

input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
}

small {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
  color: #666;
}

.error-msg {
  color: #dc3545;
}

.reset-btn {
  width: 100%;
  padding: 1rem;
  border-radius: 6px;
  background-color: #ccc;
  color: white;
  border: none;
  cursor: not-allowed;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.reset-btn.active {
  background-color: #28a745;
  cursor: pointer;
}

.reset-btn.active:hover {
  background-color: #218838;
  transform: translateY(-1px);
}

/* Responsive styles */
@media (max-width: 768px) {
  .reset-password-container {
    width: 90vw;
    height: auto;
    margin: 1rem;
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  input {
    padding: 0.7rem 0.9rem;
  }

  .reset-btn {
    padding: 0.8rem;
  }
}

@media (max-width: 480px) {
  .reset-password-container {
    margin: 0.5rem;
    padding: 1rem;
  }

  h2 {
    font-size: 1.3rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  input {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

  .reset-btn {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
}
</style> 