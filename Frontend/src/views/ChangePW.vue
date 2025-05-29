<template>
  <Header />
  <SidebarProfile />
  <div class="main-content">
    <h1>Đổi Mật Khẩu</h1>
    <div class="profile-details">
      <div class="detail-section">
        <h2>Thay đổi mật khẩu</h2>
        <form @submit.prevent="handleChangePassword" class="pw-form">
          <div class="info-grid">
            <div class="info-item">
              <label for="oldPassword">Mật khẩu hiện tại</label>
              <div class="input-wrapper">
                <input
                  :type="showOld ? 'text' : 'password'"
                  id="oldPassword"
                  v-model="oldPassword"
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
                <span class="toggle" @click="showOld = !showOld">
                  <i :class="showOld ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </span>
              </div>
              <span v-if="errorOld" class="error">{{ errorOld }}</span>
            </div>
            <div class="info-item">
              <label for="newPassword">Mật khẩu mới</label>
              <div class="input-wrapper">
                <input
                  :type="showNew ? 'text' : 'password'"
                  id="newPassword"
                  v-model="newPassword"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
                <span class="toggle" @click="showNew = !showNew">
                  <i :class="showNew ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </span>
              </div>
              <span v-if="errorNew" class="error">{{ errorNew }}</span>
            </div>
            <div class="info-item">
              <label for="confirmPassword">Xác nhận mật khẩu mới</label>
              <div class="input-wrapper">
                <input
                  :type="showConfirm ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
                <span class="toggle" @click="showConfirm = !showConfirm">
                  <i
                    :class="showConfirm ? 'fas fa-eye-slash' : 'fas fa-eye'"
                  ></i>
                </span>
              </div>
              <span v-if="errorConfirm" class="error">{{ errorConfirm }}</span>
            </div>
          </div>
          <button class="change-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            Đổi mật khẩu
          </button>
          <span v-if="successMsg" class="success">{{ successMsg }}</span>
          <span v-if="errorMsg" class="error">{{ errorMsg }}</span>
        </form>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref } from "vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import SidebarProfile from "../components/SidebarProfile.vue";

const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showOld = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);
const loading = ref(false);
const errorOld = ref("");
const errorNew = ref("");
const errorConfirm = ref("");
const errorMsg = ref("");
const successMsg = ref("");

const validate = () => {
  errorOld.value = "";
  errorNew.value = "";
  errorConfirm.value = "";
  let valid = true;
  if (!oldPassword.value) {
    errorOld.value = "Vui lòng nhập mật khẩu hiện tại";
    valid = false;
  }
  if (!newPassword.value) {
    errorNew.value = "Vui lòng nhập mật khẩu mới";
    valid = false;
  } else if (newPassword.value.length < 6) {
    errorNew.value = "Mật khẩu mới phải từ 6 ký tự";
    valid = false;
  }
  if (confirmPassword.value !== newPassword.value) {
    errorConfirm.value = "Mật khẩu xác nhận không khớp";
    valid = false;
  }
  return valid;
};

const handleChangePassword = async () => {
  errorMsg.value = "";
  successMsg.value = "";
  if (!validate()) return;
  loading.value = true;
  try {
    // TODO: Gọi API đổi mật khẩu ở đây
    await new Promise((r) => setTimeout(r, 1200)); // demo loading
    successMsg.value = "Đổi mật khẩu thành công!";
    oldPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (err) {
    errorMsg.value = "Đổi mật khẩu thất bại. Vui lòng thử lại!";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 30px;
  background: #f8f9fa;
}

h1 {
  margin-bottom: 30px;
  color: #333;
}

.profile-details {
  max-width: 800px;
}

.detail-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.pw-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  color: #666;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
}

input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 10px 38px 10px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border 0.2s;
}
input:focus {
  border-color: #ee4d2d;
  outline: none;
}
.toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  cursor: pointer;
  font-size: 1.1rem;
}
.error {
  color: #ff4d4f;
  font-size: 0.95rem;
  margin-top: 2px;
}
.success {
  color: #52c41a;
  font-size: 1rem;
  margin-top: 8px;
  text-align: center;
  display: block;
}
.change-btn {
  width: 200px;
  background: #ee4d2d;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin: 24px auto 0 auto;
  transition: background 0.2s;
  position: relative;
  display: block;
}
.change-btn:disabled {
  background: #f5a091;
  cursor: not-allowed;
}
.spinner {
  border: 2px solid #fff;
  border-top: 2px solid #ee4d2d;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
