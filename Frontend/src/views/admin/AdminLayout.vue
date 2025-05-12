<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ 'collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" class="nav-item">
          <i class="fas fa-home"></i>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/admin/employees" class="nav-item">
          <i class="fas fa-users"></i>
          <span>Quản lý nhân viên</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          <span class="logout-text">Đăng xuất</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <header class="admin-header">
        <div class="header-left">
          <button @click="toggleSidebar" class="menu-toggle">
            <i class="fas fa-bars"></i>
          </button>
        </div>
        <div class="header-right">
          <div class="admin-profile">
            <span>{{ employeeName }}</span>
          </div>
        </div>
      </header>

      <div class="admin-content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import { toast } from 'vue3-toastify';

export default {
  name: 'AdminLayout',
  data() {
    return {
      isSidebarCollapsed: false,
      employeeName: ''
    }
  },
  created() {
    const employee = JSON.parse(localStorage.getItem('employee'));
    const token = localStorage.getItem('token');
    
    if (employee && token) {
      this.employeeName = employee.fullname;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    handleLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("employee");
      localStorage.removeItem("isAdmin");
      toast.success("Đăng xuất thành công!");
      this.$router.push("/admin/login");
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

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
  z-index: 1000;
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
}

.sidebar-header h2 {
  font-size: 24px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
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

/* Khi sidebar collapsed, ẩn text và điều chỉnh icon */
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

.admin-main {
  flex: 1;
  margin-left: 280px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  transition: margin-left 0.3s ease;
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: calc(100vw - 280px);
}

.admin-sidebar.collapsed + .admin-main {
  margin-left: 80px;
  width: calc(100vw - 80px);
}

.admin-header {
  height: 80px;
  background-color: white;
  border-bottom: 1px solid #e1e1e1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: #333;
}

.admin-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  height: calc(100vh - 80px);
  background-color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }

  .admin-sidebar.collapsed {
    transform: translateX(0);
    width: 280px;
  }

  .admin-sidebar.collapsed .logout-text {
    width: auto;
    opacity: 1;
    margin-left: 12px;
  }

  .admin-sidebar.collapsed .logout-btn i {
    margin-right: 12px;
  }

  .admin-main {
    margin-left: 0;
    width: 100vw;
  }

  .admin-sidebar.collapsed + .admin-main {
    margin-left: 0;
    width: 100vw;
  }
}
</style> 