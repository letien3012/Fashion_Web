<template>
  <div class="admin-layout">
    <AdminSidebar :is-collapsed="isSidebarCollapsed" />

    <main class="admin-main">
      <AdminHeader
        :employee-name="employeeName"
        :employee-image="employeeImage"
        @toggle-sidebar="toggleSidebar"
      />

      <div class="admin-content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar.vue";
import AdminHeader from "../../components/admin/AdminHeader.vue";

export default {
  name: "AdminLayout",
  components: {
    AdminSidebar,
    AdminHeader,
  },
  data() {
    return {
      isSidebarCollapsed: false,
      employeeName: "",
      employeeImage: "",
    };
  },
  created() {
    const employee = JSON.parse(localStorage.getItem("employee"));
    const token = localStorage.getItem("token-admin");

    if (employee && token) {
      this.employeeName = employee.fullname;
      this.employeeImage = employee.image
        ? `${import.meta.env.VITE_API_BASE_URL}/${employee.image}`
        : "";
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
  },
};
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

.admin-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
