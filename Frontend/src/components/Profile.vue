<template>
  <Header />
  <div class="page-container">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <span class="current">Thông tin cá nhân</span>
    </div>
    <div class="row">
      <div class="col-md-3">
        <SidebarProfile />
      </div>
      <div class="col-md-9">
        <div class="main-content">
          <h3>Thông Tin Cá Nhân</h3>
          <div class="profile-details">
            <div class="detail-section">
              <div class="info-grid">
                <div class="info-item">
                  <label>Họ và Tên</label>
                  <input
                    type="text"
                    v-model="userInfo.name"
                    placeholder="Nhập họ và tên"
                    disabled
                  />
                </div>
                <div class="info-item">
                  <label>Email</label>
                  <input
                    type="email"
                    v-model="userInfo.email"
                    placeholder="Nhập email"
                    disabled
                  />
                </div>
                <div class="info-item">
                  <label>Số Điện Thoại</label>
                  <input
                    type="tel"
                    v-model="userInfo.phone"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div class="info-item">
                  <label>Địa Chỉ</label>
                  <textarea
                    v-model="userInfo.address"
                    placeholder="Nhập địa chỉ"
                  ></textarea>
                </div>
              </div>
              <div class="button-group">
                <button
                  class="save-button"
                  @click="updateProfile"
                  :disabled="isUpdating"
                >
                  {{ isUpdating ? "Đang cập nhật..." : "Cập nhật thông tin" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import Header from "./Header.vue";
import Footer from "./Footer.vue";
import SidebarProfile from "./SidebarProfile.vue";
import { customerService } from "../services/customer.service";

const router = useRouter();
const isUpdating = ref(false);
const userInfo = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
});

onMounted(async () => {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  console.log("USER ĐĂNG NHẬP TRONG PROFILE", userStr);

  if (!userStr || !token) {
    toast.warning("Vui lòng đăng nhập để xem thông tin cá nhân!");
    router.push("/login");
    return;
  }

  try {
    const user = JSON.parse(userStr);
    userInfo.value = {
      name: user.name || user.fullname || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    };
  } catch (error) {
    console.error("Error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      router.push("/login");
    } else {
      toast.error("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    }
  }
});

const updateProfile = async () => {
  try {
    isUpdating.value = true;
    const response = await customerService.updateProfile({
      fullname: userInfo.value.name,
      phone: userInfo.value.phone,
      address: userInfo.value.address,
    });

    // Update local storage with new user info
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      user.fullname = userInfo.value.name;
      user.phone = userInfo.value.phone;
      user.address = userInfo.value.address;
      localStorage.setItem("user", JSON.stringify(user));
    }

    toast.success("Cập nhật thông tin thành công!");
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error(
      error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin"
    );
  } finally {
    isUpdating.value = false;
  }
};
</script>

<style scoped>
.page-container {
  width: 95%;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 991px) {
  .page-container {
    width: 100%;
    padding: 10px;
  }
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

@media (max-width: 991px) {
  .breadcrumb {
    font-size: 12px;
    margin-bottom: 15px;
    padding: 0 10px;
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

@media (max-width: 991px) {
  .main-content {
    padding: 15px;
  }
}

h3 {
  margin-bottom: 30px;
  color: #333;
}

@media (max-width: 991px) {
  h3 {
    font-size: 1.2rem;
    margin-bottom: 20px;
    padding: 0 10px;
  }
}

.profile-details {
  max-width: 800px;
}

@media (max-width: 991px) {
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

@media (max-width: 991px) {
  .detail-section {
    padding: 15px;
    margin-bottom: 15px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 991px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
}

@media (max-width: 991px) {
  .info-item {
    margin-bottom: 10px;
  }
}

label {
  margin-bottom: 8px;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 991px) {
  label {
    font-size: 0.85rem;
  }
}

input,
textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 991px) {
  input,
  textarea {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}

input:focus,
textarea:focus {
  border-color: #ee4d2d;
  box-shadow: 0 0 0 2px rgba(238, 77, 45, 0.1);
  outline: none;
}

textarea {
  height: 100px;
  resize: vertical;
  min-height: 100px;
  max-height: 200px;
}

.button-group {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 991px) {
  .button-group {
    margin-top: 15px;
    padding: 0 10px;
  }
}

.save-button {
  background: #ee4d2d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 150px;
}

@media (max-width: 991px) {
  .save-button {
    width: 100%;
    padding: 10px;
    font-size: 0.9rem;
  }
}

.save-button:hover:not(:disabled) {
  background: #f05d40;
  transform: translateY(-2px);
}

.save-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
}

/* Row and Col overrides */
@media (max-width: 991px) {
  :deep(.row) {
    margin: 0;
  }

  :deep(.col-md-3),
  :deep(.col-md-9) {
    padding: 0;
  }

  :deep(.col-md-3) {
    margin-bottom: 15px;
  }
}

/* Additional styles for very small screens */
@media (max-width: 576px) {
  .page-container {
    padding: 5px;
  }

  .breadcrumb {
    font-size: 11px;
    padding: 0 5px;
  }

  h3 {
    font-size: 1.1rem;
    padding: 0 5px;
  }

  .detail-section {
    padding: 10px;
  }

  .info-grid {
    gap: 10px;
  }

  input,
  textarea {
    padding: 6px 10px;
    font-size: 0.85rem;
  }

  .button-group {
    padding: 0 5px;
  }

  .save-button {
    padding: 8px;
    font-size: 0.85rem;
  }
}
</style>
