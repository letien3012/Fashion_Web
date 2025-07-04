<template>
  <div class="table-container">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Khách hàng</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Địa chỉ</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="customers.length > 0">
          <tr v-for="customer in customers" :key="customer.id">
            <td>
              <div class="customer-info">
                <div class="customer-avatar">
                  <img :src="getImageUrl(customer.image)" alt="Avatar" />
                </div>
                <span class="customer-name">{{ customer.fullname }}</span>
              </div>
            </td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.phone || "Chưa cập nhật" }}</td>
            <td>{{ customer.address || "Chưa cập nhật" }}</td>
            <td>
              <span :class="['status-badge', customer.status]">
                {{
                  customer.status === "active" ? "Hoạt động" : "Không hoạt động"
                }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="edit-btn" @click="$emit('edit', customer)">
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="delete-btn"
                  @click="handleDelete(customer)"
                  :disabled="customer.status === 'inactive'"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </template>
        <tr v-else>
          <td colspan="6" class="text-center">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "CustomerTable",
  props: {
    customers: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getImageUrl(image) {
      if (!image) return "../../assets/images/avatar_default.jpg";
      if (image.startsWith("http")) return image;
      if (image.startsWith("/images")) return `${import.meta.env.VITE_API_URL}${image}`;
      return image;
    },
    handleDelete(customer) {
      console.log("CustomerTable - handleDelete called with:", customer);
      this.$emit("delete", customer);
    },
  },
};
</script>

<style scoped>
.table-container {
  position: relative;
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th,
td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background-color: #fafafa;
  font-weight: 600;
  color: #262626;
}

tr:hover {
  background-color: #fafafa;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.customer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.customer-name {
  font-weight: 500;
  color: #262626;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-badge.inactive {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  background-color: #e6f7ff;
  color: #1890ff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background-color: #bae7ff;
}

.delete-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  background-color: #fff1f0;
  color: #ff4d4f;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background-color: #ffccc7;
}

.text-center {
  text-align: center;
  color: #999;
  padding: 24px !important;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
