<template>
  <div class="form-container">
    <h2>Đăng nhập</h2>

    <div class="social-login">
      <button class="btn social" @click="loginWithGoogle"><img src="../assets/images/google.png" height="16px" width="16px" style="margin-right: 5px"> Tiếp tục với Google</button>
      <button class="btn social" @click="loginWithFacebook"><img src="../assets/images/facebook.png"  height="16px" width="16px" style="margin-right: 5px"> Tiếp tục với Facebook</button>
    </div>

    <div class="divider">
      <span>OR</span>
    </div>

    <form @submit.prevent="handleLogin">
      <input type="email" placeholder="Email hoặc username" v-model="email" required />
      
      <div class="password-group">
        <input :type="showPassword ? 'text' : 'password'" placeholder="Mật khẩu" v-model="password" required />
        <span @click="showPassword = !showPassword">{{ showPassword ? 'Ẩn' : 'Hiện' }}</span>
      </div>

      <div class="remember-forgot">
        <label ><input type="checkbox" v-model="rememberMe" style="width: auto;"> Ghi nhớ đăng nhập</label>
        <a href="/forgotpw">Quên mật khẩu?</a>
      </div>

      <button type="submit" class="btn login">Đăng nhập</button>
    </form>

    <div class="signup-section">
      <p>Chưa có tài khoản?</p>
      <router-link to="/register">
         <button class="btn signup" >Đăng ký</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';

export default {
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false
    };
  },
  methods: {
    handleLogin() {
      alert(`Login with ${this.email}`);
    },
    loginWithGoogle() {
      window.location.href = 'http://localhost:3005/api/auth/google';
    },
    async loginWithFacebook() {
      const provider = new FacebookAuthProvider();

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const idToken = await user.getIdToken();

        // Gửi token lên server để xác thực
        const response = await fetch('http://localhost:3005/api/verifyToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) throw new Error('Token verification failed');

        const data = await response.json();
        console.log('Xác thực thành công với UID:', data.uid);
      } catch (error) {
        console.error('Lỗi đăng nhập:', error.message);
      }
    },
  }
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
  content: '';
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
  padding: 10px;
  border-radius: 30px;
  background-color: #999;
  color: white;
  border: none;
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
