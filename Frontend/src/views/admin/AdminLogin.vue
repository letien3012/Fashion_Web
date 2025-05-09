<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-header">
        <h1>Đăng Nhập ADMIN</h1>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            placeholder="Nhập email của bạn"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            placeholder="Nhập mật khẩu của bạn"
          >
        </div>
        
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminLogin',
  data() {
    return {
      email: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      try {
        console.log('Đang gửi request đăng nhập...');
        const response = await axios.post('http://localhost:3005/api/employees/login', {
          email: this.email,
          password: this.password
        });
        console.log('Response từ server:', response.data);

        if (response.data.employee && response.data.token) {
          localStorage.setItem('employee', JSON.stringify(response.data.employee));
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('isAdmin', 'true');
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          this.$router.push('/admin/dashboard');
        } else {
          console.error('Phản hồi không hợp lệ:', response.data);
          alert('Phản hồi không hợp lệ từ máy chủ');
        }
      } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        console.error('Chi tiết lỗi:', error.response?.data);
        alert(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.login-container {
  width: 100%;
  max-width: 600px;
  padding: 48px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  color: #1a1a1a;
  font-size: 32px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 32px;
}

label {
  display: block;
  margin-bottom: 12px;
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #1a1a1a;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background-color: #1a1a1a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  background-color: #333;
  transform: translateY(-1px);
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Thêm responsive */
@media (max-width: 768px) {
  .login-container {
    max-width: 90%;
    padding: 32px;
  }
  
  .login-header h1 {
    font-size: 28px;
  }
  
  input, .login-btn {
    font-size: 16px;
  }
}
</style> 