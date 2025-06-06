<template>
  <div class="header-top-bar">
    <div class="header-top-left">
      <i class="fas fa-bolt"></i>
      <span class="welcome-text">Chào mừng bạn đến với JUNO Store!</span>
      <i class="fas fa-headset header-icon"></i>
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
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="mobile-menu-toggle" @click="toggleMobileMenu">
      <i class="fas fa-bars"></i>
    </div>
    <router-link to="/" class="logo">JUNO</router-link>
    <nav class="nav-menu" :class="{ 'mobile-active': isMobileMenuOpen }">
      <div class="mobile-menu-header">
        <span class="mobile-menu-title">Menu</span>
        <i class="fas fa-times close-menu" @click="closeMobileMenu"></i>
      </div>
      <router-link to="/" class="nav-item" @click="closeMobileMenu"
        >TRANG CHỦ</router-link
      >
      <div
        class="nav-item product-menu-wrapper"
        @mouseenter="showProductMenu = true"
        @mouseleave="showProductMenu = false"
      >
        <router-link to="/products" class="nav-item" @click="closeMobileMenu">
          SẢN PHẨM
        </router-link>
        <transition name="fade">
          <div
            v-if="showProductMenu && !isMobileMenuOpen"
            class="product-mega-menu"
          >
            <div
              v-for="category in categories"
              :key="category._id"
              class="mega-menu-column"
            >
              <router-link
                :to="{ name: 'Products', query: { category: category._id } }"
                class="mega-menu-title"
              >
                {{ category.name }}
              </router-link>
              <router-link
                v-for="child in category.children"
                :key="child._id"
                :to="{ name: 'Products', query: { category: child._id } }"
                class="mega-menu-item"
              >
                {{ child.name }}
              </router-link>
            </div>
          </div>
        </transition>
      </div>
      <router-link
        to="/bst-he-nonstop"
        class="nav-item"
        @click="closeMobileMenu"
        >BST HÈ NONSTOP</router-link
      >
      <router-link
        to="/sale-happy-friday"
        class="nav-item"
        @click="closeMobileMenu"
        >SALE HAPPY FRIDAY</router-link
      >
      <router-link to="/sale-quan-ao" class="nav-item" @click="closeMobileMenu"
        >SALE QUẦN ÁO</router-link
      >
      <router-link to="/showroom" class="nav-item" @click="closeMobileMenu"
        >SHOWROOM</router-link
      >
    </nav>
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Tìm kiếm"
        @keyup.enter="handleSearch"
      />
      <i class="fas fa-search search-icon" @click="handleSearch"></i>
      <i
        class="fas fa-camera search-camera-icon"
        @click="showImageSearchModal"
      ></i>
    </div>
    <div class="user-icons">
      <router-link to="/wishlist" class="wishlist-icon-wrapper">
        <i class="fas fa-heart icon"></i>
      </router-link>
      <div
        class="cart-icon-wrapper"
        @click="handleCartClick"
        style="position: relative; cursor: pointer"
      >
        <i class="fas fa-shopping-cart icon"></i>
        <span
          v-if="!userData || (userData && cartCount === 0)"
          class="cart-badge"
          >0</span
        >
        <span v-else-if="cartCount > 0" class="cart-badge">{{
          cartCount
        }}</span>
      </div>
      <CartPopup
        :visible="showCartPopup"
        :cart="cartItems"
        @view-cart="goToCart"
      />
    </div>
    <div
      class="mobile-overlay"
      v-if="isMobileMenuOpen"
      @click="closeMobileMenu"
    ></div>
  </header>
  <ImageSearchModal :visible="showImageSearch" @close="closeImageSearchModal" />
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import CartPopup from "./CartPopup.vue";
import ImageSearchModal from "./ImageSearchModal.vue";
import { cartService } from "../services/cart.service";
import { productCatalogueService } from "../services/productCatalogue.service";

export default {
  components: { CartPopup, ImageSearchModal },
  setup() {
    const searchQuery = ref("");
    const router = useRouter();
    const cartCount = ref(0);
    const showCartPopup = ref(false);
    const cartItems = ref([]);
    const hasCart = ref(false);
    const userData = ref(null);
    const isMobileMenuOpen = ref(false);
    const showImageSearch = ref(false);
    const showProductMenu = ref(false);
    const isScrolled = ref(false);
    const categories = ref([]);

    async function fetchCategories() {
      try {
        const response = await productCatalogueService.getTree();
        if (response && response.data) {
          categories.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

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
      if (searchQuery.value.trim()) {
        router.push({
          name: "Search",
          query: { keyword: searchQuery.value.trim() },
        });
        searchQuery.value = "";
      }
    };

    const showImageSearchModal = () => {
      showImageSearch.value = true;
    };

    const closeImageSearchModal = () => {
      showImageSearch.value = false;
    };

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
    };

    onMounted(() => {
      // Lấy thông tin user từ localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userData.value = {
            fullname: user.fullname || user.name,
            email: user.email,
            avatar: user.avatar || user.image,
          };
          checkCartOfCurrentUser();
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }

      // Fetch categories
      fetchCategories();

      // Thêm event listener cho scroll
      window.addEventListener("scroll", handleScroll);
    });

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 36; // 36px là chiều cao của header-top-bar
    };

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
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      showImageSearch,
      showImageSearchModal,
      closeImageSearchModal,
      showProductMenu,
      isScrolled,
      categories,
    };
  },
};
</script>

<style scoped>
.header-top-bar {
  background-color: #f8f9fa;
  padding: 8px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #666;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1001;
}

.header-top-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  margin-left: 1.2rem;
  margin-right: 0.3rem;
}

.header-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: color 0.3s ease;
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
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1000;
  box-sizing: border-box;
  max-width: 1920px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.header.scrolled {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.logo {
  font-size: 28px;
  font-weight: 800;
  color: #ff0000;
  margin-right: 40px;
  text-decoration: none;
  letter-spacing: 1px;
  transition: transform 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.logo:hover {
  transform: scale(1.05);
}

.nav-menu {
  display: flex;
  flex-grow: 1;
  gap: 25px;
  justify-content: center;
  margin-right: 40px;
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
  position: relative;
  display: flex;
  align-items: center;
  width: 300px;
}

.search-bar input {
  width: 100%;
  padding: 10px 80px 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.search-icon {
  position: absolute;
  right: 45px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
  top: 50%;
  transform: translateY(-50%);
}

.search-camera-icon {
  position: absolute;
  right: 15px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
  top: 50%;
  transform: translateY(-50%);
}

.search-bar input:focus {
  border-color: #ff0000;
  box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.1);
}

.user-icons {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
  margin-left: 40px;
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

.wishlist-icon-wrapper {
  text-decoration: none;
  transition: transform 0.3s ease;
}

.wishlist-icon-wrapper:hover {
  transform: scale(1.1);
}

.wishlist-icon-wrapper .icon {
  color: #ff0000;
  animation: heartBeat 1.5s ease-in-out infinite;
  text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
    color: #ff0000;
    text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
  }
  14% {
    transform: scale(1.1);
    color: #ff3333;
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
  }
  28% {
    transform: scale(1);
    color: #ff0000;
    text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
  }
  42% {
    transform: scale(1.1);
    color: #ff3333;
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
  }
  70% {
    transform: scale(1);
    color: #ff0000;
    text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
  }
}

.mobile-menu-toggle {
  display: none;
  font-size: 24px;
  cursor: pointer;
  margin-right: 15px;
  color: #333;
}

.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.mobile-menu-header {
  display: none;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.mobile-menu-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-menu {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

@media (max-width: 1400px) {
  .nav-menu {
    gap: 20px;
    margin-right: 30px;
  }

  .search-bar {
    width: 250px;
    margin: 0 30px;
  }

  .user-icons {
    margin-left: 30px;
  }
}

@media (max-width: 1200px) {
  .nav-menu {
    gap: 15px;
    margin-right: 20px;
  }

  .search-bar {
    width: 200px;
    margin: 0 20px;
  }

  .user-icons {
    margin-left: 20px;
  }
}

@media (max-width: 992px) {
  .header {
    padding: 15px 5%;
    flex-wrap: wrap;
    gap: 15px;
  }

  .mobile-menu-toggle {
    display: block;
    order: 1;
  }

  .logo {
    order: 2;
    margin-right: auto;
  }

  .user-icons {
    order: 3;
    margin-left: auto;
  }

  .search-bar {
    order: 4;
    margin: 15px 0 0 0;
    width: 100%;
  }

  .nav-menu {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100vh;
    background-color: white;
    flex-direction: column;
    padding: 0;
    transition: left 0.3s ease;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow-y: auto;
    margin-right: 0;
  }

  .nav-menu.mobile-active {
    left: 0;
  }

  .nav-item {
    padding: 15px 20px;
    width: 100%;
    text-align: left;
    border-bottom: 1px solid #f5f5f5;
  }

  .search-bar input {
    width: 100%;
    padding: 12px 20px;
    font-size: 15px;
    border-radius: 30px;
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
  }

  .search-bar input:focus {
    background-color: #fff;
    border-color: #ff0000;
    box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.1);
  }

  .logo {
    font-size: 24px;
    margin-right: 15px;
  }
}

@media (max-width: 576px) {
  .header {
    padding: 10px 5%;
    gap: 10px;
  }

  .logo {
    font-size: 20px;
  }

  .search-bar {
    margin-top: 10px;
  }

  .user-icons {
    gap: 15px;
  }

  .icon {
    font-size: 18px;
  }

  .cart-badge {
    font-size: 10px;
    min-width: 16px;
    height: 16px;
  }
}

.product-menu-wrapper {
  position: relative;
  display: inline-block;
}

.product-mega-menu {
  position: absolute;
  left: 0;
  top: 100%;
  background: rgba(30, 30, 30, 0.92);
  color: #fff;
  display: flex;
  flex-wrap: wrap;
  min-width: 700px;
  max-width: 1000px;
  padding: 20px 16px 20px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  z-index: 2000;
  border-radius: 0 0 16px 16px;
  gap: 28px;
  backdrop-filter: blur(2px);
  border-top: 2px solid #ff0000;
  animation: dropDown 0.3s;
  max-height: 80vh;
  overflow-y: auto;
}

@keyframes dropDown {
  from {
    transform: translateY(-10px);
    opacity: 0.7;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.mega-menu-column {
  min-width: 160px;
  max-width: 220px;
  flex: 1 1 22%; /* tối đa 4 cột trên 1 hàng */
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding-right: 18px;
  margin-bottom: 10px;
}
.mega-menu-column:nth-child(4n) {
  border-right: none;
  padding-right: 0;
}
.mega-menu-column:last-child {
  border-right: none;
  padding-right: 0;
}

.mega-menu-title {
  font-weight: 700;
  color: #ff0000;
  margin-bottom: 8px;
  font-size: 15px;
  text-transform: uppercase;
  text-decoration: underline;
  letter-spacing: 0.5px;
  transition: color 0.2s;
  cursor: pointer;
  display: block;
}
.mega-menu-title:hover {
  color: #fff;
  text-decoration: none;
}

.mega-menu-item {
  color: #fff;
  font-size: 13px;
  padding: 4px 0 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  display: block;
  text-decoration: none;
}
.mega-menu-item:hover {
  color: #ff0000;
  background: rgba(255, 255, 255, 0.07);
  text-decoration: underline;
}

/* Fade effect for mega menu */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive for mega menu */
@media (max-width: 992px) {
  .product-mega-menu {
    display: none !important;
  }
  .product-menu-wrapper {
    width: 100%;
  }
}
</style>
