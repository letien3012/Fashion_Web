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
              <!-- Loading state -->
              <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Đang kiểm tra thông tin tài khoản...</p>
              </div>

              <!-- Step 1: Verify current password (for local accounts) -->
              <div
                v-else-if="!isVerified && hasLocalProvider"
                class="verification-step"
              >
                <h4>Xác minh mật khẩu hiện tại</h4>
                <p class="step-description">
                  Vui lòng nhập mật khẩu hiện tại để tiếp tục đổi mật khẩu
                </p>
                <form
                  @submit.prevent="handleVerifyPassword"
                  class="verify-form"
                >
                  <div class="info-item">
                    <label for="verifyPassword">Mật khẩu hiện tại</label>
                    <div class="input-wrapper">
                      <input
                        :type="showVerify ? 'text' : 'password'"
                        id="verifyPassword"
                        v-model="verifyPassword"
                        placeholder="Nhập mật khẩu hiện tại"
                        required
                      />
                      <span class="toggle" @click="showVerify = !showVerify">
                        <i
                          :class="
                            showVerify ? 'fas fa-eye-slash' : 'fas fa-eye'
                          "
                        ></i>
                      </span>
                    </div>
                    <span v-if="errorVerify" class="error">{{
                      errorVerify
                    }}</span>
                  </div>
                  <button class="verify-btn" :disabled="loading">
                    <span v-if="loading" class="spinner"></span>
                    Xác minh
                  </button>
                  <span v-if="errorMsg" class="error">{{ errorMsg }}</span>
                </form>
              </div>

              <!-- Step 1: Email verification (for non-local accounts) -->
              <div
                v-else-if="!isVerified && !hasLocalProvider"
                class="verification-step"
              >
                <h4>Xác minh qua email</h4>
                <p class="step-description">
                  Mã xác minh sẽ được gửi đến email:
                  <strong>{{ userEmail }}</strong>
                </p>
                <form
                  @submit.prevent="handleSendVerificationCode"
                  class="verify-form"
                >
                  <button class="verify-btn" :disabled="loading">
                    <span v-if="loading" class="spinner"></span>
                    Gửi mã xác minh
                  </button>
                  <span v-if="errorMsg" class="error">{{ errorMsg }}</span>
                  <span v-if="successMsg" class="success">{{
                    successMsg
                  }}</span>
                </form>

                <!-- Code input form -->
                <div v-if="codeSent" class="code-form">
                  <div class="info-item">
                    <label for="verificationCode">Mã xác minh</label>
                    <div class="input-wrapper">
                      <input
                        type="text"
                        id="verificationCode"
                        v-model="verificationCode"
                        placeholder="Nhập mã 6 số"
                        maxlength="6"
                        required
                      />
                    </div>
                    <span v-if="errorCode" class="error">{{ errorCode }}</span>
                  </div>
                  <button
                    @click="handleVerifyCode"
                    class="verify-btn"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner"></span>
                    Xác minh mã
                  </button>
                  <button
                    @click="handleResendCode"
                    class="resend-btn"
                    :disabled="loading"
                  >
                    Gửi lại mã
                  </button>
                </div>
              </div>

              <!-- Step 2: Change password -->
              <div v-else class="change-password-step">
                <div class="step-header">
                  <h4>Đổi mật khẩu mới</h4>
                  <button class="back-btn" @click="backToVerification">
                    <i class="fas fa-arrow-left"></i> Quay lại
                  </button>
                </div>
                <p class="step-description">
                  {{
                    hasLocalProvider
                      ? "Mật khẩu hiện tại đã được xác minh."
                      : "Email đã được xác minh."
                  }}
                  Vui lòng nhập mật khẩu mới
                </p>
                <form @submit.prevent="handleChangePassword" class="pw-form">
                  <div class="info-grid">
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
                        <span
                          class="toggle"
                          @click="showConfirm = !showConfirm"
                        >
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
                  <span v-if="successMsg" class="success">{{
                    successMsg
                  }}</span>
                  <span v-if="errorMsg" class="error">{{ errorMsg }}</span>
                </form>
              </div>
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
import { ref, onMounted } from "vue";
import axios from "axios";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Chatbot from "../components/Chatbot.vue";
import SidebarProfile from "../components/SidebarProfile.vue";

const backendUrl = import.meta.env.VITE_API_BASE_URL;

// Account info
const hasLocalProvider = ref(false);
const userEmail = ref("");

// Verification step
const isVerified = ref(false);
const verifyPassword = ref("");
const showVerify = ref(false);
const errorVerify = ref("");

// Email verification
const codeSent = ref(false);
const verificationCode = ref("");
const errorCode = ref("");

// Change password step
const newPassword = ref("");
const confirmPassword = ref("");
const showNew = ref(false);
const showConfirm = ref(false);
const loading = ref(false);
const errorNew = ref("");
const errorConfirm = ref("");
const errorMsg = ref("");
const successMsg = ref("");

// Check account info on mount
onMounted(async () => {
  await checkAccountInfo();
});

const checkAccountInfo = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token đăng nhập");
    }

    const response = await axios.get(`${backendUrl}/api/auth/account-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      hasLocalProvider.value = response.data.data.hasLocalProvider;
      userEmail.value = response.data.data.email;
    }
  } catch (err) {
    console.error("Lỗi kiểm tra thông tin tài khoản:", err);
    errorMsg.value =
      "Không thể kiểm tra thông tin tài khoản. Vui lòng thử lại!";
  } finally {
    loading.value = false;
  }
};

const validateVerification = () => {
  errorVerify.value = "";
  if (!verifyPassword.value) {
    errorVerify.value = "Vui lòng nhập mật khẩu hiện tại";
    return false;
  }
  return true;
};

const validateCode = () => {
  errorCode.value = "";
  if (!verificationCode.value) {
    errorCode.value = "Vui lòng nhập mã xác minh";
    return false;
  }
  if (verificationCode.value.length !== 6) {
    errorCode.value = "Mã xác minh phải có 6 số";
    return false;
  }
  return true;
};

const validateChangePassword = () => {
  errorNew.value = "";
  errorConfirm.value = "";
  let valid = true;

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

const handleVerifyPassword = async () => {
  errorMsg.value = "";
  if (!validateVerification()) return;

  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token đăng nhập");
    }

    const response = await axios.post(
      `${backendUrl}/api/auth/verify-current-password`,
      { currentPassword: verifyPassword.value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      isVerified.value = true;
      verifyPassword.value = "";
      showVerify.value = false;
      errorMsg.value = "";
    }
  } catch (err) {
    console.error("Lỗi xác minh mật khẩu:", err);
    if (err.response?.data?.message) {
      errorMsg.value = err.response.data.message;
    } else {
      errorMsg.value = "Mật khẩu hiện tại không đúng. Vui lòng thử lại!";
    }
  } finally {
    loading.value = false;
  }
};

const handleSendVerificationCode = async () => {
  errorMsg.value = "";
  successMsg.value = "";
  loading.value = true;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token đăng nhập");
    }

    const response = await axios.post(
      `${backendUrl}/api/auth/send-verification-code`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      codeSent.value = true;
      successMsg.value = response.data.message;
    }
  } catch (err) {
    console.error("Lỗi gửi mã xác minh:", err);
    if (err.response?.data?.message) {
      errorMsg.value = err.response.data.message;
    } else {
      errorMsg.value = "Không thể gửi mã xác minh. Vui lòng thử lại!";
    }
  } finally {
    loading.value = false;
  }
};

const handleVerifyCode = async () => {
  errorMsg.value = "";
  if (!validateCode()) return;

  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token đăng nhập");
    }

    const response = await axios.post(
      `${backendUrl}/api/auth/verify-code`,
      { code: verificationCode.value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      isVerified.value = true;
      verificationCode.value = "";
      codeSent.value = false;
      errorMsg.value = "";
      successMsg.value = "";
    }
  } catch (err) {
    console.error("Lỗi xác minh mã:", err);
    if (err.response?.data?.message) {
      errorMsg.value = err.response.data.message;
    } else {
      errorMsg.value = "Mã xác minh không đúng. Vui lòng thử lại!";
    }
  } finally {
    loading.value = false;
  }
};

const handleResendCode = async () => {
  await handleSendVerificationCode();
};

const handleChangePassword = async () => {
  errorMsg.value = "";
  successMsg.value = "";
  if (!validateChangePassword()) return;

  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token đăng nhập");
    }

    const response = await axios.post(
      `${backendUrl}/api/auth/change-password`,
      { newPassword: newPassword.value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      successMsg.value = "Đổi mật khẩu thành công!";

      // Reset form
      newPassword.value = "";
      confirmPassword.value = "";
      showNew.value = false;
      showConfirm.value = false;

      // Reset to verification step after 2 seconds
      setTimeout(() => {
        isVerified.value = false;
        successMsg.value = "";
        codeSent.value = false;
      }, 2000);
    }
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    if (err.response?.data?.message) {
      errorMsg.value = err.response.data.message;
    } else {
      errorMsg.value = "Đổi mật khẩu thất bại. Vui lòng thử lại!";
    }
  } finally {
    loading.value = false;
  }
};

const backToVerification = () => {
  isVerified.value = false;
  verifyPassword.value = "";
  verificationCode.value = "";
  codeSent.value = false;
  errorVerify.value = "";
  errorCode.value = "";
  errorMsg.value = "";
  successMsg.value = "";
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

h4 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.1rem;
}

.step-description {
  color: #666;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.step-description strong {
  color: #333;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.back-btn {
  background: none;
  border: 1px solid #ddd;
  color: #666;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-state .spinner {
  margin: 0 auto 20px auto;
}

.loading-state p {
  color: #666;
  font-size: 0.9rem;
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

.verify-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 400px;
}

.code-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 15px;
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

.verify-btn,
.change-btn {
  background: #ee4d2d;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: block;
}

.verify-btn {
  width: 150px;
  margin: 0;
}

.change-btn {
  width: 200px;
  margin: 24px auto 0 auto;
}

.resend-btn {
  background: none;
  border: 1px solid #ddd;
  color: #666;
  padding: 10px 0;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.resend-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .verify-btn,
  .change-btn {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    margin-top: 20px;
  }
}

.verify-btn:hover:not(:disabled),
.change-btn:hover:not(:disabled) {
  background: #f05d40;
  transform: translateY(-2px);
}

.verify-btn:disabled,
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
