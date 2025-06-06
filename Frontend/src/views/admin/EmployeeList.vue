<template>
  <div class="employee-list">
    <div class="page-header">
      <h1>Quản lý nhân viên</h1>
      <button class="btn btn-primary" @click="openAddModal">
        <i class="fas fa-plus"></i> Thêm nhân viên
      </button>
    </div>

    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="fetchEmployees">Thử lại</button>
      </div>
      <EmployeeTable
        v-else
        :employees="paginatedEmployees"
        :loading="loading"
        @edit="editEmployee"
        @delete="confirmDelete"
      />

      <div class="pagination-info">
        <span class="showing-info">
          Hiển thị {{ startIndex + 1 }}-{{ endIndex }} /
          {{ employees.length }} nhân viên
        </span>
        <div class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <template v-for="page in displayedPages" :key="page">
            <button
              v-if="page !== '...'"
              class="page-btn"
              :class="{ active: currentPage === page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="page-dots">...</span>
          </template>

          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

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
</template>

<script>
import Swal from "sweetalert2";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import EmployeeTable from "../../components/admin/EmployeeTable.vue";
import EmployeeForm from "../../components/admin/EmployeeForm.vue";
import AdminEmployeeService from "../../services/admin/employee.service";

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
      error: null,
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  created() {
    this.fetchEmployees();
  },
  computed: {
    totalPages() {
      return Math.ceil(this.employees.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      return Math.min(
        this.startIndex + this.itemsPerPage,
        this.employees.length
      );
    },
    paginatedEmployees() {
      const start = this.startIndex;
      const end = this.endIndex;
      return this.employees.slice(start, end);
    },
    displayedPages() {
      const pages = [];
      const maxVisiblePages = 5;

      if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (this.currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(this.totalPages);
        } else if (this.currentPage >= this.totalPages - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(this.totalPages);
        }
      }

      return pages;
    },
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
        this.error = null;
        const response = await AdminEmployeeService.getAll();
        if (response.data && response.data.data) {
          this.employees = response.data.data;
        } else {
          this.error = "Dữ liệu trả về không đúng định dạng";
          toast.error(this.error);
        }
      } catch (error) {
        console.error("Fetch employees error:", error);
        if (error.response?.status === 401) {
          this.error = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại";
          toast.error(this.error);
          this.$router.push("/admin/login");
        } else {
          this.error =
            "Không thể tải danh sách nhân viên. Vui lòng thử lại sau.";
          toast.error(this.error);
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
            await AdminEmployeeService.delete(employee._id);
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
          response = await AdminEmployeeService.update(formData._id, {
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
          response = await AdminEmployeeService.add({
            fullname: formData.fullname.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
            address: formData.address.trim(),
            role: formData.role,
            image: formData.image,
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

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
};
</script>

<style scoped>
.employee-list {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.table-container {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #8c8c8c;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state i {
  font-size: 24px;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.showing-info {
  color: #666;
  font-size: 14px;
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #40a9ff;
  color: #1890ff;
}

.page-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.page-btn:disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #d9d9d9;
  cursor: not-allowed;
}

.page-dots {
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .pagination-info {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
