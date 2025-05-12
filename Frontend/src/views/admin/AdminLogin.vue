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
import { toast } from 'vue3-toastify';

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
      try {
        this.loading = true;
        const response = await axios.post('http://localhost:3005/api/employees/login', {
          email: this.email,
          password: this.password
        });

        if (response.data.token && response.data.employee) {
          // Lưu token và thông tin employee
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('employee', JSON.stringify(response.data.employee));
          localStorage.setItem('isAdmin', 'true');
          
          // Cập nhật header mặc định cho axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
          toast.success('Đăng nhập thành công!');
          
          // Chuyển hướng sau khi đăng nhập thành công
          await this.$router.push('/admin/dashboard');
        } else {
          toast.error('Thông tin đăng nhập không hợp lệ!');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Email hoặc mật khẩu không đúng!');
        } else {
          toast.error('Đăng nhập thất bại. Vui lòng thử lại sau!');
        }
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