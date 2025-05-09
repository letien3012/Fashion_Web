<template>
  <div class="employee-list">
    <div class="header">
      <h2>Quản lý nhân viên</h2>
      <button class="add-btn" @click="showAddModal = true">
        <i class="fas fa-plus"></i> Thêm nhân viên
      </button>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Vị trí</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.id">
            <td>{{ employee.id }}</td>
            <td>{{ employee.name }}</td>
            <td>{{ employee.email }}</td>
            <td>{{ employee.position }}</td>
            <td>
              <span :class="['status', employee.status]">
                {{ employee.status === 'active' ? 'Đang làm việc' : 'Đã nghỉ' }}
              </span>
            </td>
            <td class="actions">
              <button class="edit-btn" @click="editEmployee(employee)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-btn" @click="confirmDelete(employee)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm/sửa nhân viên -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <h3>{{ isEditing ? 'Sửa nhân viên' : 'Thêm nhân viên' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Họ tên</label>
            <input v-model="formData.name" type="text" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="formData.email" type="email" required>
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <input v-model="formData.password" type="password" :required="!isEditing">
          </div>
          <div class="form-group">
            <label>Vị trí</label>
            <input v-model="formData.position" type="text" required>
          </div>
          <div class="form-group">
            <label>Trạng thái</label>
            <select v-model="formData.status">
              <option value="active">Đang làm việc</option>
              <option value="inactive">Đã nghỉ</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal">Hủy</button>
            <button type="submit">{{ isEditing ? 'Cập nhật' : 'Thêm' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EmployeeList',
  data() {
    return {
      employees: [],
      showAddModal: false,
      isEditing: false,
      formData: {
        name: '',
        email: '',
        password: '',
        position: '',
        status: 'active'
      }
    }
  },
  methods: {
    async fetchEmployees() {
      try {
        const response = await axios.get('http://localhost:3000/api/employees');
        this.employees = response.data;
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    },
    editEmployee(employee) {
      this.isEditing = true;
      this.formData = { ...employee };
      this.formData.password = '';
      this.showAddModal = true;
    },
    async confirmDelete(employee) {
      if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
        try {
          await axios.delete(`http://localhost:3000/api/employees/${employee.id}`);
          this.fetchEmployees();
        } catch (error) {
          console.error('Error deleting employee:', error);
        }
      }
    },
    async handleSubmit() {
      try {
        const data = { ...this.formData };
        if (this.isEditing && !data.password) {
          delete data.password;
        }

        if (this.isEditing) {
          await axios.put(`http://localhost:3000/api/employees/${this.formData.id}`, data);
        } else {
          await axios.post('http://localhost:3000/api/employees', data);
        }
        this.closeModal();
        this.fetchEmployees();
      } catch (error) {
        console.error('Error saving employee:', error);
      }
    },
    closeModal() {
      this.showAddModal = false;
      this.isEditing = false;
      this.resetForm();
    },
    resetForm() {
      this.formData = {
        name: '',
        email: '',
        password: '',
        position: '',
        status: 'active'
      };
    }
  },
  mounted() {
    this.fetchEmployees();
  }
}
</script>

<style scoped>
.employee-list {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.add-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.add-btn:hover {
  background-color: #45a049;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status.inactive {
  background-color: #ffebee;
  color: #c62828;
}

.actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.edit-btn:hover {
  background-color: #1976D2;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
}

.modal-content h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #2196F3;
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions button {
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.modal-actions button[type="submit"] {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.modal-actions button[type="submit"]:hover {
  background-color: #45a049;
}

.modal-actions button[type="button"] {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}

.modal-actions button[type="button"]:hover {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    min-width: 800px;
  }
}
</style> 