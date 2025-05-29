<template>
  <Header />
  <SidebarProfile />
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

input,
textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

textarea {
  height: 100px;
  resize: vertical;
}

.button-group {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.save-button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.save-button:hover {
  background-color: #45a049;
}

.save-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
