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
            <th>Ảnh</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Vị trí</th>
            <th>Địa chỉ</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.id">
            <td>{{ employee.id }}</td>
            <td>
              <img
                :src="
                  employee.image
                    ? `http://localhost:3005${employee.image}`
                    : '/default-avatar.png'
                "
                alt="Avatar"
                style="width: 40px; height: 40px; border-radius: 50%"
              />
            </td>
            <td>{{ employee.fullname }}</td>
            <td>{{ employee.email }}</td>
            <td>{{ employee.role }}</td>
            <td>{{ employee.address }}</td>
            <td>
              <span
                :class="['status', employee.publish ? 'active' : 'inactive']"
              >
                {{ employee.publish ? "Đang làm việc" : "Đã nghỉ" }}
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
        <h3>{{ isEditing ? "Sửa nhân viên" : "Thêm nhân viên" }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Họ tên</label>
            <input v-model="formData.fullname" type="text" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="formData.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <input
              v-model="formData.password"
              type="password"
              :required="!isEditing"
            />
          </div>
          <div class="form-group">
            <label>Vị trí</label>
            <select v-model="formData.role">
              <option value="admin">Admin</option>
              <option value="staff">Nhân viên</option>
            </select>
          </div>
          <div class="form-group">
            <label>Địa chỉ</label>
            <input v-model="formData.address" type="text" />
          </div>
          <div class="form-group">
            <label>Ảnh đại diện</label>
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              ref="imageInput"
            />
            <img
              v-if="formData.image"
              :src="formData.image"
              class="preview-image"
              alt="Preview"
            />
            <div v-if="isEditing && formData.image" class="current-image-info">
              <small>Ảnh hiện tại</small>
            </div>
          </div>
          <div class="form-group">
            <label>Trạng thái</label>
            <select v-model="formData.publish">
              <option :value="true">Đang làm việc</option>
              <option :value="false">Đã nghỉ</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal">Hủy</button>
            <button type="submit">{{ isEditing ? "Cập nhật" : "Thêm" }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from 'sweetalert2';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default {
  name: "EmployeeList",
  data() {
    return {
      employees: [],
      showAddModal: false,
      isEditing: false,
      backendUrl: "http://localhost:3005",
      formData: {
        fullname: "",
        email: "",
        password: "",
        role: "staff",
        publish: true,
        address: "",
        image: "",
      },
    };
  },
  methods: {
    async fetchEmployees() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          this.$router.push("/admin/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:3005/api/employees",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.data) {
          this.employees = response.data.data;
        } else {
          toast.error("Dữ liệu trả về không đúng định dạng");
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error("Không thể tải danh sách nhân viên. Vui lòng thử lại sau.");
        }
      }
    },
    editEmployee(employee) {
      this.isEditing = true;
      this.formData = { 
        ...employee,
        image: employee.image ? `http://localhost:3005${employee.image}` : '',
        publish: employee.publish === undefined ? true : employee.publish
      };
      this.formData.password = ""; // Không hiển thị mật khẩu cũ
      this.showAddModal = true;
    },
    async confirmDelete(employee) {
      const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: `Bạn có chắc muốn xóa nhân viên ${employee.fullname}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `http://localhost:3005/api/employees/delete/${employee.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success("Đã xóa nhân viên thành công!");
          this.fetchEmployees();
        } catch (error) {
          if (error.response?.status === 401) {
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
            this.$router.push("/admin/login");
          } else {
            toast.error("Không thể xóa nhân viên. Vui lòng thử lại sau.");
          }
        }
      }
    },
    async handleSubmit() {
      try {
        const token = localStorage.getItem("token");
        const data = { ...this.formData };

        if (this.isEditing && !data.password) {
          delete data.password;
        }

        // Handle image for update
        if (this.isEditing) {
          // If no new image is selected, keep the existing image
          if (!data.image || data.image.startsWith('http://localhost:3005')) {
            delete data.image; // Remove image field to keep existing one
          }
        }

        if (this.isEditing) {
          await axios.put(
            `http://localhost:3005/api/employees/update/${data.id}`,
            data,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success("Cập nhật nhân viên thành công!");
        } else {
          await axios.post(`http://localhost:3005/api/employees/add`, data, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Thêm nhân viên thành công!");
        }

        this.closeModal();
        this.fetchEmployees();
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error("Không thể lưu nhân viên. Vui lòng thử lại sau.");
        }
      }
    },
    closeModal() {
      this.showAddModal = false;
      this.isEditing = false;
      this.resetForm();
    },
    resetForm() {
      this.formData = {
        fullname: "",
        email: "",
        password: "",
        role: "staff",
        publish: true,
        address: "",
        image: "",
      };
      if (this.$refs.imageInput) {
        this.$refs.imageInput.value = "";
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.formData.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    getImageUrl(imagePath) {
      if (!imagePath) return "/default-avatar.png";
      if (imagePath.startsWith("data:")) return imagePath;
      return `${this.backendUrl}${imagePath}`;
    },
  },
  mounted() {
    this.fetchEmployees();
  },
};
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
  background-color: #4caf50;
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
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
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
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
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

.edit-btn,
.delete-btn {
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background-color: #2196f3;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type="submit"] {
  background-color: #4caf50;
  color: white;
}

.modal-actions button[type="button"] {
  background-color: #f5f5f5;
  color: #333;
}

.current-image-info {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  margin-top: 10px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #ddd;
}

input[type="file"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 8px;
}

img {
  object-fit: cover;
  background-color: #f5f5f5;
}
</style>
