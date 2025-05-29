<template>
  <header class="admin-header">
    <div class="header-left">
      <button @click="$emit('toggle-sidebar')" class="menu-toggle">
        <i class="fas fa-bars"></i>
      </button>
    </div>
    <div class="header-right">
      <div class="admin-image">
        <img
          :src="employeeImage || '../../assets/images/avatar_default.jpg'"
          alt="Admin Avatar"
        />
      </div>
      <div class="admin-profile">
        <span>{{ employeeName }}</span>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "AdminHeader",
  props: {
    employeeName: {
      type: String,
      required: true,
    },
    employeeImage: {
      type: String,
      default: "",
    },
  },
};
</script>

<style scoped>
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-image {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.admin-image img:hover {
  transform: scale(1.05);
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-profile span {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.menu-toggle:hover {
  background-color: #f5f5f5;
  transform: scale(1.05);
}
</style>
