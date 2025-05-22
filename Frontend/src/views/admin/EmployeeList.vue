<template>
  <div class="list-container">
    <div class="header">
      <h2>Quản lý nhân viên</h2>
      <button class="add-btn" @click="openAddModal">
        <i class="fas fa-plus"></i> Thêm nhân viên
      </button>
    </div>

    <div class="content">
      <EmployeeTable
        :employees="employees"
        :loading="loading"
        @edit="editEmployee"
        @delete="confirmDelete"
      />

      <EmployeeForm
        :show="showModal"
        :is-editing="isEditing"
        :initial-data="formData"
        :loading="loading"
        @close="closeModal"
        @submitEmployee="handleSubmit"
        @error="handleFormError"
      />
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import EmployeeTable from "../../components/admin/EmployeeTable.vue";
import EmployeeForm from "../../components/admin/EmployeeForm.vue";
import employeeService from "../../services/employee.service";

export default {
  name: "EmployeeList",
  components: {
    EmployeeTable,
    EmployeeForm,
  },
  data() {
    return {
      employees: [],
      showModal: false,
      isEditing: false,
      formData: {
        id: null,
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        status: "active",
      },
      loading: false,
    };
  },
  created() {
    this.fetchEmployees();
  },
  methods: {
    openAddModal() {
      this.isEditing = false;
      this.formData = {
        id: null,
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        status: "active",
      };
      this.showModal = true;
    },

    editEmployee(employee) {
      if (!employee || !employee._id) {
        toast.error("Dữ liệu không hợp lệ");
        return;
      }

      this.isEditing = true;
      this.formData = {
        _id: employee._id,
        fullname: employee.fullname || "",
        email: employee.email || "",
        phone: employee.phone || "",
        address: employee.address || "",
        role: employee.role || "employee",
        image: employee.image || "",
        publish: employee.publish !== undefined ? employee.publish : true,
      };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.isEditing = false;
      this.formData = {
        _id: null,
        fullname: "",
        email: "",
        phone: "",
        address: "",
        role: "employee",
        image: "",
        publish: true,
      };
    },

    async fetchEmployees() {
      try {
        this.loading = true;
        const response = await employeeService.getAll();
        if (response.data && response.data.data) {
          this.employees = response.data.data;
        } else {
          toast.error("Dữ liệu trả về không đúng định dạng");
        }
      } catch (error) {
        console.error("Fetch employees error:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error(
            "Không thể tải danh sách nhân viên. Vui lòng thử lại sau."
          );
        }
      } finally {
        this.loading = false;
      }
    },

    async confirmDelete(employee) {
      const result = await Swal.fire({
        title: "Xác nhận xóa?",
        text: "Bạn có chắc chắn muốn xóa nhân viên này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            await employeeService.delete(employee._id);
            return true;
          } catch (error) {
            Swal.showValidationMessage(
              error.response?.data?.message || error.message
            );
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (result.isConfirmed) {
        toast.success("Xóa nhân viên thành công");
        await this.fetchEmployees();
      }
    },

    async handleSubmit(formData) {
      try {
        this.loading = true;
        let response;

        if (this.isEditing) {
          // Update existing employee
          response = await employeeService.update(formData._id, {
            fullname: formData.fullname.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            role: formData.role,
            image: formData.image,
            publish: formData.publish,
          });

          if (response.status === 200) {
            toast.success("Cập nhật nhân viên thành công");
            this.closeModal();
            await this.fetchEmployees();
          }
        } else {
          // Add new employee
          response = await employeeService.add({
            fullname: formData.fullname.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
            address: formData.address.trim(),
            role: formData.role,
            image: formData.image,
            publish: formData.publish,
          });

          if (response.status === 201) {
            toast.success("Thêm nhân viên thành công");
            this.closeModal();
            await this.fetchEmployees();
          }
        }
      } catch (error) {
        console.error("Submit error:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn");
          this.$router.push("/admin/login");
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
      } finally {
        this.loading = false;
      }
    },

    handleFormError(message) {
      toast.error(message);
    },
  },
};
</script>

<style scoped>
@import "../../assets/styles/admin/common.css";

.list-container {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.add-btn {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-btn:hover {
  opacity: 0.8;
}

.content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}
</style>
