<template>
  <aside
    class="admin-sidebar"
    :class="{ collapsed: isCollapsed || (isSmallScreen && !isExpanded) }"
  >
    <div class="sidebar-header">
      <h2>Admin Panel</h2>
      <button class="toggle-btn" @click="toggleExpand">
        <i
          :class="isExpanded ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"
        ></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <!-- Tổng quan -->
      <div class="nav-section">
        <h3 class="section-title">Tổng quan</h3>
        <router-link to="/admin/dashboard" class="nav-item">
          <i class="fas fa-home"></i>
          <span>Dashboard</span>
        </router-link>
      </div>

      <!-- Quản lý đơn hàng & Khách hàng -->
      <div class="nav-section">
        <h3 class="section-title">Quản lý đơn hàng & Khách hàng</h3>
        <router-link to="/admin/orders" class="nav-item">
          <i class="fas fa-shopping-cart"></i>
          <span>Quản lý đơn hàng</span>
        </router-link>
        <router-link to="/admin/customers" class="nav-item">
          <i class="fas fa-users"></i>
          <span>Quản lý người dùng</span>
        </router-link>
      </div>

      <!-- Quản lý sản phẩm & Danh mục -->
      <div class="nav-section">
        <h3 class="section-title">Quản lý sản phẩm & Danh mục</h3>
        <router-link to="/admin/products" class="nav-item">
          <i class="fas fa-box"></i>
          <span>Quản lý sản phẩm</span>
        </router-link>
        <router-link to="/admin/product-catalogues" class="nav-item">
          <i class="fas fa-folder"></i>
          <span>Danh mục sản phẩm</span>
        </router-link>
        <router-link to="/admin/attribute-catalogues" class="nav-item">
          <i class="fas fa-list"></i>
          <span>Danh mục thuộc tính</span>
        </router-link>
      </div>

      <!-- Quản lý kho & Nhà cung cấp -->
      <div class="nav-section">
        <h3 class="section-title">Quản lý kho & Nhà cung cấp</h3>
        <router-link to="/admin/consignments" class="nav-item">
          <i class="fas fa-warehouse"></i>
          <span>Quản lý kho hàng</span>
        </router-link>
        <router-link to="/admin/suppliers" class="nav-item">
          <i class="fas fa-truck"></i>
          <span>Quản lý nhà cung cấp</span>
        </router-link>
        <router-link to="/admin/import-receipts" class="nav-item">
          <i class="fas fa-file-import"></i>
          <span>Phiếu nhập hàng</span>
        </router-link>
      </div>

      <!-- Quản lý Marketing & Đánh giá -->
      <div class="nav-section">
        <h3 class="section-title">Quản lý Marketing & Đánh giá</h3>
        <router-link to="/admin/promotions" class="nav-item">
          <i class="fas fa-percent"></i>
          <span>Khuyến mãi</span>
        </router-link>
        <router-link to="/admin/banners" class="nav-item">
          <i class="fas fa-images"></i>
          <span>Quản lý banner</span>
        </router-link>
        <router-link to="/admin/reviews" class="nav-item">
          <i class="fas fa-star"></i>
          <span>Quản lý đánh giá</span>
        </router-link>
      </div>

      <!-- Quản lý nhân viên -->
      <div class="nav-section">
        <h3 class="section-title">Quản lý nhân viên</h3>
        <router-link to="/admin/employees" class="nav-item">
          <i class="fas fa-users"></i>
          <span>Quản lý nhân viên</span>
        </router-link>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button @click="handleLogout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        <span class="logout-text">Đăng xuất</span>
      </button>
    </div>
  </aside>
</template>

<script>
import { toast } from "vue3-toastify";

export default {
  name: "AdminSidebar",
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isSmallScreen: false,
      isExpanded: false,
    };
  },
  mounted() {
    this.checkScreenSize();
    window.addEventListener("resize", this.checkScreenSize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkScreenSize);
  },
  methods: {
    checkScreenSize() {
      this.isSmallScreen = window.innerWidth < 1200;
      if (!this.isSmallScreen) {
        this.isExpanded = false;
      }
    },
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
    },
    handleLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("employee");
      localStorage.removeItem("isAdmin");
      toast.success("Đăng xuất thành công!");
      this.$router.push("/admin/login");
    },
  },
};
</script>

<style scoped>
.admin-sidebar {
  width: 280px;
  height: 100vh;
  background-color: #1a1a1a;
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
}

.admin-sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h2 {
  font-size: 24px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  color: white;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item i {
  margin-right: 16px;
  width: 20px;
  text-align: center;
  font-size: 18px;
}

.nav-item span {
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.logout-btn i {
  margin-right: 12px;
  font-size: 18px;
}

.logout-text {
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.3s ease;
}

.admin-sidebar.collapsed .logout-btn {
  padding: 12px;
  justify-content: center;
}

.admin-sidebar.collapsed .logout-btn i {
  margin-right: 0;
}

.admin-sidebar.collapsed .logout-text {
  width: 0;
  opacity: 0;
  margin-left: 0;
}

@media screen and (max-width: 1200px) {
  .admin-sidebar {
    width: 80px;
  }

  .admin-sidebar:not(.collapsed) {
    width: 280px;
  }

  .admin-sidebar.collapsed .nav-item span {
    display: none;
  }

  .admin-sidebar.collapsed .sidebar-header h2 {
    display: none;
  }

  .admin-sidebar.collapsed .logout-text {
    display: none;
  }

  .admin-sidebar.collapsed .nav-item {
    justify-content: center;
    padding: 16px;
  }

  .admin-sidebar.collapsed .nav-item i {
    margin-right: 0;
  }
}

.nav-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  padding: 0 24px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-sidebar.collapsed .section-title {
  display: none;
}
</style>
