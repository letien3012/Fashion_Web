<template>
  <div class="sidebar-profile">
    <div class="profile-header">
      <div class="image-container">
        <img
          :src="getimageUrl(customer?.image)"
          alt="User image"
          class="image"
        />
        <div class="edit-image" @click="handleimageClick">
          <i class="fas fa-camera"></i>
          <input
            type="file"
            ref="imageInput"
            accept="image/*"
            style="display: none"
            @change="handleimageChange"
          />
        </div>
      </div>
      <h2 class="user-name">{{ customer?.fullname || "Loading..." }}</h2>
      <p class="user-email">{{ customer?.email || "Loading..." }}</p>
    </div>

    <div class="profile-stats">
      <div class="stat-item">
        <span class="stat-value">{{ orderCount }}</span>
        <span class="stat-label">Đơn Hàng</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ wishlistCount }}</span>
        <span class="stat-label">Sản Phẩm Yêu Thích</span>
      </div>
    </div>

    <nav class="profile-menu">
      <router-link to="/user" class="menu-item">
        <i class="fas fa-shopping-bag"></i>
        <span>Đơn Hàng Của Tôi</span>
      </router-link>
      <router-link to="/profile" class="menu-item">
        <i class="fas fa-user"></i>
        <span>Thông Tin Cá Nhân</span>
      </router-link>
      <router-link to="/wishlist" class="menu-item">
        <i class="fas fa-heart"></i>
        <span>Sản Phẩm Yêu Thích</span>
      </router-link>
      <router-link to="/change-password" class="menu-item">
        <i class="fas fa-lock"></i>
        <span>Đổi Mật Khẩu</span>
      </router-link>
      <div class="menu-item logout" @click="handleLogout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Đăng Xuất</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import authService from "../services/auth.service";
import { orderService } from "../services/order.service";
import { productService } from "../services/product.service";
import { customerService } from "../services/customer.service";

const router = useRouter();

const customer = ref({
  fullname: "",
  email: "",
  image: "",
  phone: "",
  address: "",
});

const orderCount = ref(0);
const wishlistCount = ref(0);
const imageInput = ref(null);
const loading = ref(false);

const handleLogout = () => {
  // Xóa dữ liệu người dùng khỏi localStorage
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("isAdmin");

  // Hiển thị thông báo
  toast.success("Đăng xuất thành công!");

  // Chuyển hướng về trang chủ
  router.push("/");
};

const initCustomerData = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
  if (userData) {
    customer.value = {
      fullname: userData.name || userData.fullname || "",
      email: userData.email || "",
      image: userData.image || "https://via.placeholder.com/150",
      phone: userData.phone || "",
      address: userData.address || "",
    };
    return true;
  }
  return false;
};

const fetchCustomerProfile = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/login");
      return;
    }

    const response = await axios.get(
      "http://localhost:3005/api/customers/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data) {
      customer.value = {
        ...customer.value,
        ...response.data,
      };
      // Cập nhật lại localStorage với thông tin mới
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userData,
          ...response.data,
        })
      );
    }
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    } else {
      toast.error("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    }
  }
};

const fetchOrderCount = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const orders = await orderService.getCustomerOrders();
    orderCount.value = orders.length;
  } catch (error) {
    console.error("Error fetching order count:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }
};

const fetchWishlistCount = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const response = await productService.getWishlist();
    wishlistCount.value = response.wishlist.length;
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }
};

const handleimageClick = () => {
  imageInput.value.click();
};

const handleimageChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/login");
      return;
    }

    const response = await customerService.uploadProfileImage(file);

    if (response) {
      customer.value.image = response.image;
      // Cập nhật lại localStorage với image mới
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userData,
          image: response.image,
        })
      );
      toast.success("Cập nhật ảnh đại diện thành công!");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    } else {
      toast.error("Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.");
    }
  }
};

const getimageUrl = (image) => {
  if (!image) return "/default-image.png";

  // Nếu là URL từ internet
  if (image.startsWith("http")) {
    return image;
  }

  // Nếu là ảnh local từ thư mục images
  if (image.startsWith("/images/")) {
    return `http://localhost:3005${image}`;
  }

  return "/default-image.png";
};

onMounted(async () => {
  if (initCustomerData()) {
    loading.value = true;
    try {
      await Promise.all([
        fetchCustomerProfile(),
        fetchOrderCount(),
        fetchWishlistCount(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      loading.value = false;
    }
  } else {
    router.push("/login");
  }
});
</script>

<style scoped>
.sidebar-profile {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.profile-header {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.image-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 15px;
}

.image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.edit-image {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #007bff;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
}

.user-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 10px 0 5px;
  color: #333;
}

.user-email {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 15px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
}

.profile-menu {
  margin-top: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 5px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #f8f9fa;
}

.menu-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.menu-item i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.menu-item.router-link-active {
  background: #007bff;
  color: white;
}

.logout {
  margin-top: 20px;
  color: #dc3545;
  background: #fff5f5;
}

.logout:hover {
  background: #dc3545;
  color: white;
}
</style>
