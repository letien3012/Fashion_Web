<template>
  <div class="table-container">
    <div class="table-header">
      <div class="search-filter">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Tìm kiếm theo tên nhân viên..."
            @input="handleSearch"
          />
          <i class="fas fa-search"></i>
        </div>
        <div class="filter-box">
          <select v-model="filterRole" @change="handleFilter">
            <option value="">Tất cả vị trí</option>
            <option value="admin">Quản trị viên</option>
            <option value="employee">Nhân viên</option>
          </select>
        </div>
        <div class="filter-box">
          <select v-model="filterStatus" @change="handleFilter">
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang làm việc</option>
            <option value="false">Đã nghỉ</option>
          </select>
        </div>
      </div>
    </div>

    <div class="table-content">
      <table>
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
          <tr v-if="loading">
            <td colspan="9" class="loading">Đang tải...</td>
          </tr>
          <tr v-else-if="filteredEmployees.length === 0">
            <td colspan="9" class="no-data">Không có dữ liệu</td>
          </tr>
          <tr
            v-for="(employee, index) in filteredEmployees"
            :key="employee._id"
          >
            <td>{{ index + 1 }}</td>
            <td>
              <img
                :src="
                  employee.image
                    ? `${import.meta.env.VITE_API_URL}${employee.image}`
                    : '/default-avatar.png'
                "
                alt="Avatar"
                class="employee-avatar"
              />
            </td>
            <td>
              <div class="employee-info">
                <span class="employee-name">{{ employee.fullname }}</span>
              </div>
            </td>
            <td>{{ employee.email }}</td>
            <td>{{ employee.phone }}</td>
            <td>{{ employee.address || "-" }}</td>
            <td>
              <span class="role-badge" :class="employee.role">
                {{ employee.role === "admin" ? "Quản trị viên" : "Nhân viên" }}
              </span>
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
            <td>
              <div class="actions">
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
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";

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
  setup(props) {
    const searchQuery = ref("");
    const filterRole = ref("");
    const filterStatus = ref("");

    const filteredEmployees = computed(() => {
      let result = [...props.employees];

      // Lọc theo tên nhân viên
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (employee) =>
            employee.fullname?.toLowerCase().includes(query) ||
            employee.email?.toLowerCase().includes(query)
        );
      }

      // Lọc theo vị trí
      if (filterRole.value) {
        result = result.filter(
          (employee) => employee.role === filterRole.value
        );
      }

      // Lọc theo trạng thái
      if (filterStatus.value !== "") {
        result = result.filter(
          (employee) => employee.publish === (filterStatus.value === "true")
        );
      }

      return result;
    });

    const handleSearch = () => {
      // Có thể thêm debounce ở đây nếu cần
    };

    const handleFilter = () => {
      // Có thể thêm logic xử lý filter ở đây nếu cần
    };

    return {
      searchQuery,
      filterRole,
      filterStatus,
      filteredEmployees,
      handleSearch,
      handleFilter,
    };
  },
};
</script>

<style scoped>
.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th {
  background: #fafafa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #262626;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.employee-name {
  font-weight: 500;
  color: #1890ff;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.role-badge.admin {
  background-color: #e6f7ff;
  color: #1890ff;
}

.role-badge.employee {
  background-color: #f6ffed;
  color: #52c41a;
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
  background: #e6f7ff;
  color: #1890ff;
}

.action-btn.edit:hover {
  background: #bae7ff;
}

.action-btn.delete {
  background: #fff1f0;
  color: #ff4d4f;
}

.action-btn.delete:hover {
  background: #ffccc7;
}

.loading,
.no-data {
  text-align: center;
  color: #8c8c8c;
  padding: 24px;
}

tr:hover {
  background: #fafafa;
}

.search-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8c8c8c;
}

.search-box input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.filter-box select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-box select:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}
</style>
