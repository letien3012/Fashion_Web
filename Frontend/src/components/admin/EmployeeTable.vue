<template>
  <div class="table-container">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Ảnh</th>
          <th>Họ và tên</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Địa chỉ</th>
          <th>Vị trí</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(employee, index) in employees" :key="employee._id">
          <td>{{ index + 1 }}</td>
          <td>
            <img
              :src="
                employee.image
                  ? `http://localhost:3005${employee.image}`
                  : '/default-avatar.png'
              "
              alt="Avatar"
              class="employee-avatar"
            />
          </td>
          <td>{{ employee.fullname }}</td>
          <td>{{ employee.email }}</td>
          <td>{{ employee.phone }}</td>
          <td>{{ employee.address || "-" }}</td>
          <td>
            {{ employee.role === "admin" ? "Quản trị viên" : "Nhân viên" }}
          </td>
          <td>
            <span
              :class="[
                'status-badge',
                employee.publish ? 'active' : 'inactive',
              ]"
            >
              {{ employee.publish ? "Đang làm việc" : "Đã nghỉ" }}
            </span>
          </td>
          <td class="actions">
            <button
              class="action-btn edit"
              @click="$emit('edit', employee)"
              title="Chỉnh sửa"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="action-btn delete"
              @click="$emit('delete', employee)"
              title="Xóa"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
        <tr v-if="employees.length === 0">
          <td colspan="9" class="no-data">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "EmployeeTable",
  props: {
    employees: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["edit", "delete"],
};
</script>

<style scoped>
.table-container {
  position: relative;
  width: 100%;
  overflow-x: auto;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
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

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: white;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

.data-table th {
  background-color: #fafafa;
  font-weight: 500;
  color: #333;
}

.data-table tbody tr:hover {
  background-color: #f5f5f5;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.status-badge {
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

.action-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.edit {
  background-color: #e6f7ff;
  color: #1890ff;
}

.action-btn.delete {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.action-btn:hover {
  opacity: 0.8;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 24px;
}
</style>
