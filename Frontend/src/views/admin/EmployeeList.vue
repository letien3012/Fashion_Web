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
        @edit="editEmployee"
        @delete="confirmDelete"
      />

      <EmployeeForm
        :show="showAddModal"
        :is-editing="isEditing"
        :initial-data="formData"
        @close="closeModal"
        @submitEmployee="handleSubmit"
        @error="handleFormError"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import EmployeeTable from "../../components/admin/EmployeeTable.vue";
import EmployeeForm from "../../components/admin/EmployeeForm.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "EmployeeList",
  components: {
    EmployeeTable,
    EmployeeForm,
  },
  setup() {
    const router = useRouter();
    const employees = ref([]);
    const showAddModal = ref(false);
    const isEditing = ref(false);
    const backendUrl = "http://localhost:3005";
    const formData = ref({
      id: null,
      fullname: "",
      email: "",
      phone: "",
      address: "",
      role: "employee",
      image: "",
      publish: true,
    });

    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          router.push("/admin/login");
          return;
        }

        const response = await axios.get(`${backendUrl}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data) {
          employees.value = response.data.data;
        } else {
          toast.error("Dữ liệu trả về không đúng định dạng");
        }
      } catch (error) {
        console.error("Fetch employees error:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          router.push("/admin/login");
        } else {
          toast.error(
            "Không thể tải danh sách nhân viên. Vui lòng thử lại sau."
          );
        }
      }
    };

    const openAddModal = () => {
      isEditing.value = false;
      formData.value = {
        id: null,
        fullname: "",
        email: "",
        phone: "",
        address: "",
        role: "employee",
        image: "",
        publish: true,
      };
      showAddModal.value = true;
    };

    const editEmployee = (employee) => {
      if (!employee || !employee._id) {
        toast.error("Dữ liệu không hợp lệ");
        return;
      }

      isEditing.value = true;
      formData.value = {
        id: employee._id,
        fullname: employee.fullname,
        email: employee.email,
        address: employee.address || "",
        role: employee.role || "employee",
        image: employee.image || "",
        publish: employee.publish !== undefined ? employee.publish : true,
      };
      showAddModal.value = true;
    };

    const confirmDelete = async (employee) => {
      try {
        const result = await Swal.fire({
          title: "Xác nhận xóa?",
          text: `Bạn có chắc chắn muốn xóa nhân viên "${employee.fullname}"?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
          showLoaderOnConfirm: true,
          preConfirm: async () => {
            try {
              const token = localStorage.getItem("token");
              if (!token) {
                throw new Error("Vui lòng đăng nhập để tiếp tục");
              }

              const response = await axios.delete(
                `${backendUrl}/api/employees/delete/${employee._id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (response.status === 200) {
                return response.data;
              }
              throw new Error(response.data.message || "Có lỗi xảy ra");
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
          fetchEmployees();
        }
      } catch (error) {
        console.error("Delete confirmation error:", error);
        toast.error("Có lỗi xảy ra khi xóa nhân viên");
      }
    };

    const handleSubmit = async (formData) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          router.push("/admin/login");
          return;
        }

        if (isEditing.value) {
          // Update existing employee
          const response = await axios.put(
            `${backendUrl}/api/employees/update/${formData.id}`,
            {
              fullname: formData.fullname,
              email: formData.email,
              password: formData.password,
              role: formData.role,
              address: formData.address,
              image: formData.image,
              publish: formData.publish
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 200) {
            toast.success("Cập nhật nhân viên thành công");
            closeModal();
            fetchEmployees();
          }
        } else {
          // Add new employee
          const response = await axios.post(
            `${backendUrl}/api/employees/add`,
            {
              fullname: formData.fullname,
              email: formData.email,
              password: formData.password,
              role: formData.role,
              address: formData.address,
              image: formData.image,
              publish: formData.publish
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 201) {
            toast.success("Thêm nhân viên thành công");
            closeModal();
            fetchEmployees();
          }
        }
      } catch (error) {
        console.error("Submit error:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn");
          router.push("/admin/login");
        } else if (error.response?.status === 500) {
          toast.error("Lỗi server");
        } else {
          toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
      }
    };

    const handleFormError = (error) => {
      toast.error(error);
    };

    const closeModal = () => {
      showAddModal.value = false;
      isEditing.value = false;
      formData.value = {
        id: null,
        fullname: "",
        email: "",
        phone: "",
        address: "",
        role: "employee",
        image: "",
        publish: true,
      };
    };

    return {
      employees,
      showAddModal,
      isEditing,
      formData,
      fetchEmployees,
      openAddModal,
      editEmployee,
      confirmDelete,
      handleSubmit,
      handleFormError,
      closeModal,
    };
  },
  created() {
    this.fetchEmployees();
  },
};
</script>

<style scoped>
@import "../../assets/styles/admin/list.css";
</style>
