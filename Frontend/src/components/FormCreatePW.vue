<template>
  <div class="reset-password-container">
    <h2>Tạo mật khẩu</h2>
    <p>Nhập mật khẩu của bạn để hoàn tất đăng ký</p>

    <form @submit.prevent="createPassword">
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
          Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc
          biệt.
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
        Hoàn thành
      </button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

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

      const email = localStorage.getItem("signup_email");
      if (!email) {
        alert("Không tìm thấy email. Vui lòng quay lại bước trước.");
        return;
      }

      try {
        const res = await axios.post("http://localhost:3005/api/auth/signup", {
          email,
          password: this.password,
          fullname: "Người dùng mới",
        });

        if (res.data.success) {
          alert("Đăng ký thành công!");
          localStorage.removeItem("signup_email");
          this.$router.push("/login"); // hoặc chuyển sang trang chính
        } else {
          alert(res.data.message || "Đăng ký thất bại.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        alert("Đăng ký thất bại. Vui lòng thử lại.");
      }
    },
  },
};
</script>

<style scoped>
h2 {
  text-align: center;
}
.reset-password-container {
  margin: none;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  font-family: "Open Sans", sans-serif;
  width: 50vw;
  height: auto;
  text-align: left;
}

.form-group {
  margin-bottom: 15px;
}

.input-password {
  position: relative;
}

input {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
}

small {
  font-size: 12px;
  margin-top: 4px;
  display: block;
  color: #888;
}

.error-msg {
  color: red;
}

.reset-btn {
  width: 100%;
  padding: 10px;
  border-radius: 30px;
  background-color: #ccc;
  color: white;
  border: none;
  cursor: not-allowed;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.reset-btn.active {
  background-color: #28a745;
  cursor: pointer;
}

.reset-btn.active:hover {
  background-color: #218838;
}
</style>
