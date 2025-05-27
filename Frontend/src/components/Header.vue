<template>
  <div class="header-top-bar">
    <div class="header-top-left">
      <i class="fas fa-bolt"></i>
      <span>Chào mừng bạn đến với JUNO Store!</span>
      <i
        class="fas fa-headset"
        style="margin-left: 1.2rem; margin-right: 0.3rem"
      ></i>
      <span class="header-phone">1900 6750</span>
    </div>
    <div class="header-top-right">
      <i class="fas fa-user"></i>
      <span
        class="user-account"
        @click="handleUserClick"
        :style="userData ? 'color: #ff0000; font-weight: bold;' : ''"
      >
        {{ userData?.fullname || "Tài khoản" }}
      </span>
    </div>
  </div>
  <header class="header">
    <router-link to="/" class="logo">JUNO</router-link>
    <nav class="nav-menu">
      <router-link to="/hang-moi" class="nav-item">HÀNG MỚI</router-link>
      <router-link to="/san-pham" class="nav-item">SẢN PHẨM</router-link>
      <router-link to="/bst-he-nonstop" class="nav-item"
        >BST HÈ NONSTOP</router-link
      >
      <router-link to="/sale-happy-friday" class="nav-item"
        >SALE HAPPY FRIDAY</router-link
      >
      <router-link to="/sale-quan-ao" class="nav-item"
        >SALE QUẦN ÁO</router-link
      >
      <router-link to="/showroom" class="nav-item">SHOWROOM</router-link>
    </nav>
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Tìm kiếm"
        @keyup.enter="handleSearch"
      />
    </div>
    <div class="user-icons">
      <div
        class="cart-icon-wrapper"
        @click="handleCartClick"
        style="position: relative; cursor: pointer"
      >
        <i class="fas fa-shopping-cart icon"></i>
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
      </div>
      <CartPopup
        :visible="showCartPopup"
        :cart="cartItems"
        @view-cart="goToCart"
      />
    </div>
  </header>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import CartPopup from "./CartPopup.vue";
import { cartService } from "../services/cart.service";

export default {
  components: { CartPopup },
  setup() {
    const searchQuery = ref("");
    const router = useRouter();
    const cartCount = ref(0);
    const showCartPopup = ref(false);
    const cartItems = ref([]);
    const hasCart = ref(false);
    const userData = ref(null);

    async function checkCartOfCurrentUser() {
      try {
        const cart = await cartService.getCart();
        if (cart && cart._id) {
          hasCart.value = true;
          cartItems.value = cart.items || [];
          cartCount.value = cart.items.reduce(
            (total, item) => total + (item.variants?.length || 0),
            0
          );
        } else {
          hasCart.value = false;
          cartItems.value = [];
          cartCount.value = 0;
        }
      } catch (err) {
        hasCart.value = false;
        cartItems.value = [];
        cartCount.value = 0;
      }
    }

    const handleCartClick = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("Vui lòng đăng nhập để xem giỏ hàng!");
        router.push("/login");
      } else {
        showCartPopup.value = !showCartPopup.value;
        checkCartOfCurrentUser();
      }
    };

    const goToCart = () => {
      showCartPopup.value = false;
      router.push("/cart");
    };

    const handleUserClick = () => {
      const userStr = localStorage.getItem("user");
      console.log("USER ĐĂNG NHẬP", userStr);
      if (!userStr) {
        toast.warning("Vui lòng đăng nhập để xem thông tin cá nhân!");
        router.push("/login");
      } else {
        console.log("Đang chuyển đến trang /user");
        router.push("/user").catch((err) => {
          console.error("Lỗi khi chuyển trang:", err);
        });
      }
    };

    const handleSearch = () => {
      if (searchQuery.value) {
        router.push({ path: "/search", query: { q: searchQuery.value } });
        searchQuery.value = "";
      }
    };

    onMounted(() => {
      // Lấy thông tin user từ localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userData.value = {
            fullname: user.fullname || user.name, // Handle both regular and Google login
            email: user.email,
            avatar: user.avatar || user.image, // Handle both regular and Google login
          };
          // Chỉ kiểm tra giỏ hàng nếu đã đăng nhập
          checkCartOfCurrentUser();
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    });

    return {
      searchQuery,
      handleSearch,
      handleUserClick,
      cartCount,
      handleCartClick,
      showCartPopup,
      cartItems,
      goToCart,
      userData,
    };
  },
};
</script>

<style scoped>
.header-top-bar {
  background-color: #f8f9fa;
  padding: 8px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #666;
  width: 100%;
}

.header-top-left {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 5%;
}

.header-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: color 0.3s ease;
  margin-right: 5%;
}

.header-top-right:hover {
  color: #ff0000;
}

.header {
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  padding: 20px 5%;
  margin-bottom: 10px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-sizing: border-box;
}

.logo {
  font-size: 28px;
  font-weight: 800;
  color: #ff0000;
  margin-right: 5%;
  text-decoration: none;
  letter-spacing: 1px;
  transition: transform 0.3s ease;
  white-space: nowrap;
}

.logo:hover {
  transform: scale(1.05);
}

.nav-menu {
  display: flex;
  flex-grow: 1;
  gap: 25px;
  justify-content: center;
}

.nav-item {
  margin: 0;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 15px;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.nav-item::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #ff0000;
  transition: width 0.3s ease;
}

.nav-item:hover::after {
  width: 100%;
}

.nav-item:hover {
  color: #ff0000;
}

.nav-item.router-link-active {
  color: #ff0000;
}

.nav-item.router-link-active::after {
  width: 100%;
}

.search-bar {
  margin: 0 5%;
  flex-shrink: 0;
}

.search-bar input {
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  width: 250px;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.search-bar input:focus {
  border-color: #ff0000;
  box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.1);
}

.user-icons {
  display: flex;
  gap: 20px;
  margin-left: auto;
  flex-shrink: 0;
}

.icon {
  font-size: 20px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.icon:hover {
  color: #ff0000;
  transform: scale(1.1);
}

.cart-icon-wrapper {
  position: relative;
  transition: transform 0.3s ease;
}

.cart-icon-wrapper:hover {
  transform: scale(1.1);
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  background: #ff0000;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(255, 0, 0, 0.2);
}

@media (max-width: 1200px) {
  .nav-menu {
    gap: 15px;
  }

  .search-bar input {
    width: 200px;
  }
}

@media (max-width: 992px) {
  .header {
    padding: 15px 20px;
  }

  .nav-menu {
    display: none;
  }

  .search-bar input {
    width: 180px;
  }
}
</style>
