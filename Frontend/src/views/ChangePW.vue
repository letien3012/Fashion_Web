<template>
  <Header />
  <div class="page-container">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <span class="current">Đổi mật khẩu</span>
    </div>
    <div class="row">
      <div class="col-md-3">
        <SidebarProfile />
      </div>
      <div class="col-md-9">
        <div class="main-content">
          <h3>Đổi Mật Khẩu</h3>
          <div class="profile-details">
            <div class="detail-section">
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
                        <i
                          :class="showOld ? 'fas fa-eye-slash' : 'fas fa-eye'"
                        ></i>
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
                        <i
                          :class="showNew ? 'fas fa-eye-slash' : 'fas fa-eye'"
                        ></i>
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
                          :class="
                            showConfirm ? 'fas fa-eye-slash' : 'fas fa-eye'
                          "
                        ></i>
                      </span>
                    </div>
                    <span v-if="errorConfirm" class="error">{{
                      errorConfirm
                    }}</span>
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
      </div>
    </div>
  </div>
  <Footer />
  <Chatbot />
</template>

<script setup>
import { ref } from "vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Chatbot from "../components/Chatbot.vue";
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
.page-container {
  width: 95%;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .page-container {
    width: 100%;
    padding: 10px;
  }
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .breadcrumb {
    font-size: 12px;
    margin-bottom: 15px;
  }
}

.breadcrumb a {
  color: #666;
  text-decoration: none;
}

.breadcrumb .separator {
  margin: 0 8px;
  color: #999;
}

.breadcrumb .current {
  color: #e63946;
}

.main-content {
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }

  h3 {
    font-size: 1.2rem;
    margin-bottom: 20px;
  }
}

h3 {
  margin-bottom: 30px;
  color: #333;
}

.profile-details {
  max-width: 800px;
}

@media (max-width: 768px) {
  .profile-details {
    max-width: 100%;
  }
}

.detail-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .detail-section {
    padding: 15px;
    margin-bottom: 15px;
  }
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

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .info-item {
    margin-bottom: 10px;
  }

  label {
    font-size: 0.85rem;
  }

  input[type="password"],
  input[type="text"] {
    padding: 8px 35px 8px 12px;
    font-size: 0.9rem;
  }

  .toggle {
    font-size: 1rem;
  }
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
  transition: all 0.3s ease;
}

input:focus {
  border-color: #ee4d2d;
  box-shadow: 0 0 0 2px rgba(238, 77, 45, 0.1);
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
  transition: color 0.3s ease;
}

.toggle:hover {
  color: #ee4d2d;
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
  transition: all 0.3s ease;
  position: relative;
  display: block;
}

@media (max-width: 768px) {
  .change-btn {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    margin-top: 20px;
  }
}

.change-btn:hover:not(:disabled) {
  background: #f05d40;
  transform: translateY(-2px);
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
