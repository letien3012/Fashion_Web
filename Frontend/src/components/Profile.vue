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
              <form @submit.prevent="updateProfile">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label>Họ và Tên</label>
                    <input
                      type="text"
                      v-model="userInfo.fullname"
                      placeholder="Nhập họ và tên"
                      class="form-control"
                      :class="{
                        'is-valid': isFullnameValid,
                        'is-invalid': !isFullnameValid && userInfo.fullname,
                      }"
                    />
                    <div
                      v-if="!isFullnameValid && userInfo.fullname"
                      class="invalid-feedback"
                      style="color: #e63946; font-size: 0.9em"
                    >
                      Họ và tên phải có ít nhất 2 ký tự.
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      v-model="userInfo.phone"
                      placeholder="Nhập số điện thoại"
                      class="form-control"
                      :class="{
                        'is-valid': isPhoneValid,
                        'is-invalid': !isPhoneValid && userInfo.phone,
                      }"
                      maxlength="10"
                    />
                    <div
                      v-if="!isPhoneValid && userInfo.phone"
                      class="invalid-feedback"
                      style="color: #e63946; font-size: 0.9em"
                    >
                      Số điện thoại phải đủ 10 số và bắt đầu bằng số 0.
                    </div>
                  </div>
                  <div class="col-12">
                    <label>Email</label>
                    <input
                      type="email"
                      v-model="userInfo.email"
                      placeholder="Theo dõi đơn hàng sẽ được gửi qua Email và ZNS"
                      class="form-control"
                      disabled
                    />
                  </div>
                  <div class="col-12">
                    <label>Địa chỉ</label>
                    <input
                      v-model="userInfo.address"
                      placeholder="Địa chỉ (ví dụ: 103 Vạn Phúc, phường Vạn Phúc)"
                      class="form-control mb-2"
                      :class="{
                        'is-valid': isAddressValid,
                        'is-invalid': !isAddressValid && userInfo.address,
                      }"
                    />
                    <div
                      v-if="!isAddressValid && userInfo.address"
                      class="invalid-feedback"
                      style="color: #e63946; font-size: 0.9em"
                    >
                      Địa chỉ phải có ít nhất 4 ký tự.
                    </div>
                    <div class="row g-2 mt-2">
                      <div class="col-md-12">
                        <LocationPicker
                          v-model:address="userInfo.address"
                          @update:location="updateLocation"
                          :provinceCode="userInfo.province_code"
                          :districtCode="userInfo.district_code"
                          :wardCode="userInfo.ward_code"
                          :showOnlyDropdowns="true"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="button-group d-flex justify-content-end mt-4">
                  <button class="save-button" :disabled="isUpdating">
                    {{ isUpdating ? "Đang cập nhật..." : "Cập nhật thông tin" }}
                  </button>
                </div>
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
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import Header from "./Header.vue";
import Footer from "./Footer.vue";
import Chatbot from "./Chatbot.vue";
import SidebarProfile from "./SidebarProfile.vue";
import { customerService } from "../services/customer.service";
import LocationPicker from "./LocationPicker.vue";

const router = useRouter();
const isUpdating = ref(false);
const userInfo = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
  ward_code: "",
  district_code: "",
  province_code: "",
});
const isFullnameValid = ref(true);
const isPhoneValid = ref(true);
const isAddressValid = ref(true);

const updateLocation = (location) => {
  userInfo.value.ward_code = location.ward_code || "";
  userInfo.value.district_code = location.district_code || "";
  userInfo.value.province_code = location.province_code || "";
};

function validateFullname(name) {
  return name && name.trim().length > 1;
}
function validatePhone(phone) {
  return /^0\d{9}$/.test(phone);
}
function validateAddress(address) {
  return address && address.trim().length > 3;
}

watch(
  () => userInfo.value.fullname,
  (newVal) => {
    isFullnameValid.value = validateFullname(newVal);
  }
);
watch(
  () => userInfo.value.phone,
  (newVal) => {
    isPhoneValid.value = validatePhone(newVal);
  }
);
watch(
  () => userInfo.value.address,
  (newVal) => {
    isAddressValid.value = validateAddress(newVal);
  }
);

onMounted(async () => {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (!userStr || !token) {
    toast.warning("Vui lòng đăng nhập để xem thông tin cá nhân!");
    router.push("/login");
    return;
  }

  try {
    const user = JSON.parse(userStr);
    // Lấy userId từ user object (có thể là id hoặc _id tuỳ backend)
    const userId = user.id || user._id;
    // Gọi API lấy thông tin user từ CSDL
    const userFromDB = await customerService.getCustomerInforById(userId);
    userInfo.value = {
      fullname: userFromDB.fullname || "",
      email: userFromDB.email || "",
      phone: userFromDB.phone || "",
      address: userFromDB.address || "",
      ward_code: userFromDB.ward_code || "",
      district_code: userFromDB.district_code || "",
      province_code: userFromDB.province_code || "",
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
      fullname: userInfo.value.fullname,
      phone: userInfo.value.phone,
      address: userInfo.value.address,
      ward_code: userInfo.value.ward_code,
      district_code: userInfo.value.district_code,
      province_code: userInfo.value.province_code,
    });

    // Update local storage with new user info
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      user.fullname = userInfo.value.fullname;
      user.phone = userInfo.value.phone;
      user.address = userInfo.value.address;
      user.ward_code = userInfo.value.ward_code;
      user.district_code = userInfo.value.district_code;
      user.province_code = userInfo.value.province_code;
      localStorage.setItem("user", JSON.stringify(user));
    }
    console.log("User Info:", userInfo.value);

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

.info-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.info-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.address-textarea {
  margin-top: 8px;
  min-height: 60px;
  resize: vertical;
}

.button-group {
  margin-top: 32px;
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

  .info-grid-2col {
    gap: 16px;
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

.is-valid {
  border-color: #28a745 !important;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.1);
}
.is-invalid {
  border-color: #e63946 !important;
  box-shadow: 0 0 0 2px rgba(230, 57, 70, 0.1);
}
</style>
