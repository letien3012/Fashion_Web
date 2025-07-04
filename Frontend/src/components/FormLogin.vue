<template>
  <div class="form-container">
    <h2>Đăng nhập</h2>

    <div class="social-login">
      <button class="btn social" @click="loginWithGoogle">
        <img
          src="../assets/images/google.png"
          height="16px"
          width="16px"
          style="margin-right: 5px"
        />
        Tiếp tục với Google
      </button>
      <button class="btn social" @click="loginWithFacebook">
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

    <form @submit.prevent="handleSubmit">
      <input
        type="email"
        placeholder="Email hoặc username"
        v-model="email"
        required
      />

      <div class="password-group">
        <input
          :type="showPassword ? 'text' : 'password'"
          placeholder="Mật khẩu"
          v-model="password"
          required
        />
        <span @click="showPassword = !showPassword">{{
          showPassword ? "Ẩn" : "Hiện"
        }}</span>
      </div>

      <div class="remember-forgot">
        <label
          ><input type="checkbox" v-model="rememberMe" style="width: auto" />
          Ghi nhớ đăng nhập</label
        >
        <a href="/forgotpw">Quên mật khẩu?</a>
      </div>

      <button type="submit" class="btn login" :disabled="loading">
        {{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}
      </button>
    </form>

    <div class="signup-section">
      <p>Chưa có tài khoản?</p>
      <router-link to="/register">
        <button class="btn signup">Đăng ký</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import { toast } from "vue3-toastify";
import { useRouter } from "vue-router";

export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const router = useRouter();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    return { router, baseUrl };
  },
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      rememberMe: false,
    };
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          toast.success("Đăng nhập thành công!");
          this.router.push("/");
        } else {
          toast.error(data.message || "Đăng nhập thất bại!");
        }
      } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        toast.error("Đăng nhập thất bại. Vui lòng thử lại!");
      }
    },
    loginWithGoogle() {
      const googleAuthURL = `${this.baseUrl}/api/auth/google`;

      const popup = window.open(
        googleAuthURL,
        "_blank",
        "width=500,height=600"
      );

      // Nghe kết quả từ popup gửi về
      window.addEventListener("message", (event) => {
        if (event.origin !== this.baseUrl) return;

        const { token, user } = event.data;
        console.log("Received data from Google login:", { token, user });

        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          toast.success("Đăng nhập thành công!");
          this.router.push("/");
        } else {
          console.error("No token received from Google login");
          toast.error("Đăng nhập thất bại. Vui lòng thử lại!");
        }
      });
    },
    loginWithFacebook() {
      const facebookAuthURL = `${this.baseUrl}/api/auth/facebook`;

      const popup = window.open(
        facebookAuthURL,
        "_blank",
        "width=500,height=600"
      );

      // Nghe kết quả từ popup gửi về
      window.addEventListener("message", (event) => {
        if (event.origin !== this.baseUrl) return;

        const { token, user } = event.data;

        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          toast.success("Đăng nhập bằng Facebook thành công!");
          this.router.push("/");
        }
      });
    },
  },
};
</script>

<style scoped>
.form-container {
  margin-bottom: 100px;
  padding: 32px 28px;
  border-radius: 16px;
  font-family: "Open Sans", sans-serif;
  width: 50vw;
  min-width: 320px;
  max-width: 95vw;
  height: auto;
  border: 1.5px solid #e0e0e0;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  background: white;
}

@media (max-width: 768px) {
  .form-container {
    width: 95vw;
    max-width: 95vw;
    margin-top: 20px;
    margin-bottom: 40px;
    padding: 24px 20px;
    border-radius: 10px;
  }

  .social-login .btn {
    padding: 8px;
    font-size: 14px;
  }

  .divider {
    margin: 15px 0;
  }

  input {
    padding: 8px;
    font-size: 14px;
  }

  .btn.login,
  .btn.signup {
    padding: 8px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 20px 16px;
    margin-top: 15px;
    margin-bottom: 30px;
  }

  h2 {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .social-login .btn {
    padding: 6px;
    font-size: 13px;
  }

  .divider span {
    font-size: 12px;
  }

  input {
    padding: 6px;
    font-size: 13px;
  }

  .remember-forgot {
    font-size: 12px;
  }

  .btn.login,
  .btn.signup {
    padding: 6px;
    font-size: 13px;
  }

  .signup-section p {
    font-size: 13px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .form-container {
    width: 70vw;
    margin-top: 40px;
  }
}

@media (min-width: 1025px) {
  .form-container {
    margin-top: 40px;
  }
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

.password-group {
  position: relative;
}

.password-group span {
  position: absolute;
  right: 10px;
  top: 20px;
  cursor: pointer;
  font-size: 14px;
  color: gray;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.btn.login {
  width: 100%;
  margin-top: 20px;
  padding: 10px;
  border-radius: 30px;
  background-color: #999;
  color: white;
  border: none;
  cursor: not-allowed;
  transition: background-color 0.3s ease;
}

.btn.login:disabled {
  background-color: #ccc;
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
