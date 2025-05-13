<template>
  <header class="admin-header">
    <div class="header-left">
      <button @click="$emit('toggle-sidebar')" class="menu-toggle">
        <i class="fas fa-bars"></i>
      </button>
    </div>
    <div class="header-right">
      <div class="admin-profile">
        <span>{{ employeeName }}</span>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AdminHeader',
  props: {
    employeeName: {
      type: String,
      required: true
    }
  }
}
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
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.menu-toggle:hover {
  background-color: #f5f5f5;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-profile span {
  font-weight: 500;
  color: #333;
}
</style> 