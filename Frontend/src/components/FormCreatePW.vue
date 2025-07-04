<template>
  <div class="form-wrapper">
    <div class="form-container">
      <div class="form-header">
        <h2>Tạo mật khẩu</h2>
        <p class="subtitle">Nhập mật khẩu của bạn để hoàn tất đăng ký</p>
      </div>

      <form @submit.prevent="createPassword" class="form-content">
        <div class="form-group">
          <label for="password">Mật khẩu</label>
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
            Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự
            đặc biệt.
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
          :class="['submit-btn', { active: canSubmit }]"
        >
          Hoàn thành
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { toast } from "vue3-toastify";

export default {
  data() {
    return {
      password: "",
      confirmPassword: "",
      showPassword: false,
      showConfirmPassword: false,
    };
  },
  computed: {
    email() {
      return this.$route.query.email;
    },
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
  methods: {
    async createPassword() {
      if (!this.canSubmit) return;

      if (!this.email) {
        toast.error("Không tìm thấy email. Vui lòng quay lại bước trước.");
        return;
      }

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.post(`${baseUrl}/api/auth/signup`, {
          email: this.email,
          password: this.password,
          fullname: "Người dùng mới",
        });

        if (res.data.success) {
          toast.success("Đăng ký thành công!");
          this.$router.push("/login");
        } else {
          toast.error(res.data.message || "Đăng ký thất bại.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        toast.error("Đăng ký thất bại. Vui lòng thử lại.");
      }
    },
  },
};
</script>

<style scoped>
.form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;

  padding: 20px;
}

.form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  width: 50vw;
  padding: 32px;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-header h2 {
  color: #333;
  font-size: 24px;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.input-password {
  position: relative;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
}

.toggle-password {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
  padding: 4px;
}

.toggle-password:hover {
  color: #333;
}

.error-msg {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: not-allowed;
  background-color: #e9ecef;
  color: #6c757d;
  transition: all 0.3s ease;
}

.submit-btn.active {
  background-color: #4a90e2;
  color: white;
  cursor: pointer;
}

.submit-btn.active:hover {
  background-color: #357abd;
}

@media (max-width: 480px) {
  .form-container {
    padding: 24px;
  }

  .form-header h2 {
    font-size: 20px;
  }

  input {
    padding: 10px 14px;
  }
}
</style>
