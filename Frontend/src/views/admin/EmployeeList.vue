<template>
  <div class="employee-list">
    <div class="header">
      <h2>Quản lý nhân viên</h2>
      <button class="add-btn" @click="showAddModal = true">
        <i class="fas fa-plus"></i> Thêm nhân viên
      </button>
    </div>

    <EmployeeTable 
      :employees="employees"
      @edit="editEmployee"
      @delete="confirmDelete"
    />

    <EmployeeForm
      :show="showAddModal"
      :is-editing="isEditing"
      :initial-data="formData"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import EmployeeTable from "../../components/admin/EmployeeTable.vue";
import EmployeeForm from "../../components/admin/EmployeeForm.vue";

export default {
  name: "EmployeeList",
  components: {
    EmployeeTable,
    EmployeeForm
  },
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
        console.error('Fetch employees error:', error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error("Không thể tải danh sách nhân viên. Vui lòng thử lại sau.");
        }
      }
    },
    editEmployee(employee) {
      console.log('Employee to edit:', employee);
      this.isEditing = true;
      this.formData = {
        id: employee.id,
        ...employee,
        image: employee.image ? `http://localhost:3005${employee.image}` : "",
        publish: employee.publish === undefined ? true : employee.publish,
      };
      this.formData.password = ""; // Không hiển thị mật khẩu cũ
      this.showAddModal = true;
    },
    async confirmDelete(employee) {
      const result = await Swal.fire({
        title: "Xác nhận xóa",
        text: `Bạn có chắc muốn xóa nhân viên ${employee.fullname}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
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
    async handleSubmit(formData) {
      try {
        const token = localStorage.getItem("token");
        const data = { ...formData };

        if (this.isEditing && !data.password) {
          delete data.password;
        }

        // Handle image for update
        if (this.isEditing) {
          // Nếu có ảnh mới (base64) thì giữ nguyên
          // Nếu không có ảnh mới và có ảnh cũ (URL) thì xóa trường image
          if (!data.image || data.image.startsWith("http://localhost:3005")) {
            delete data.image;
          }
        }

        let response;
        if (this.isEditing) {
          // Kiểm tra ID trước khi gửi request
          if (!data.id) {
            toast.error("Không tìm thấy ID nhân viên. Vui lòng thử lại sau.");
            return;
          }

          const employeeId = data.id;
          delete data.id; 

          response = await axios.put(
            `http://localhost:3005/api/employees/update/${employeeId}`,
            data,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } else {
          response = await axios.post(
            "http://localhost:3005/api/employees/create",
            data,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }

        // Kiểm tra response từ server
        if (response.data && response.data.success) {
          toast.success(this.isEditing ? "Cập nhật nhân viên thành công!" : "Thêm nhân viên thành công!");
          this.closeModal();
          this.fetchEmployees();
        } else {
          toast.error(response.data?.message || `Không thể ${this.isEditing ? "cập nhật" : "thêm"} nhân viên. Vui lòng thử lại sau.`);
        }
      } catch (error) {
        console.error('Error:', error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else if (error.response?.status === 500) {
          toast.error("Lỗi server. Vui lòng thử lại sau.");
        } else {
          toast.error(`Không thể ${this.isEditing ? "cập nhật" : "thêm"} nhân viên. Vui lòng thử lại sau.`);
        }
      }
    },
    closeModal() {
      this.showAddModal = false;
      this.isEditing = false;
      this.formData = {
        fullname: "",
        email: "",
        password: "",
        role: "staff",
        publish: true,
        address: "",
        image: "",
      };
    }
  },
  created() {
    this.fetchEmployees();
  }
};
</script>

<style scoped>
.employee-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.add-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background-color: #40a9ff;
}

.add-btn i {
  font-size: 14px;
}
</style>
