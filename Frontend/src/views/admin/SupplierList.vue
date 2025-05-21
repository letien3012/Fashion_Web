<template>
  <div class="supplier-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0">Quản lý nhà cung cấp</h4>
      <button class="btn btn-primary" @click="showForm = true">
        <i class="fas fa-plus"></i> Thêm mới
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        <SupplierTable
          :suppliers="suppliers"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <SupplierForm
      v-if="showForm"
      :supplier="selectedSupplier"
      @close="closeForm"
      @submit="handleSubmit"
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { toast } from "vue3-toastify";
import SupplierTable from "../../components/admin/SupplierTable.vue";
import SupplierForm from "../../components/admin/SupplierForm.vue";

export default {
  name: "SupplierList",
  components: {
    SupplierTable,
    SupplierForm,
  },
  setup() {
    const suppliers = ref([]);
    const showForm = ref(false);
    const selectedSupplier = ref(null);
    const backendUrl = "http://localhost:3005";

    const fetchSuppliers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${backendUrl}/api/suppliers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        suppliers.value = response.data.data || response.data;
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast.error("Không thể tải danh sách nhà cung cấp");
      }
    };

    const handleEdit = (supplier) => {
      selectedSupplier.value = supplier;
      showForm.value = true;
    };

    const handleDelete = async (supplierId) => {
      suppliers.value = suppliers.value.filter((s) => s._id !== supplierId);
    };

    const closeForm = () => {
      showForm.value = false;
      selectedSupplier.value = null;
    };

    const handleSubmit = () => {
      closeForm();
      fetchSuppliers();
    };

    onMounted(() => {
      fetchSuppliers();
    });

    return {
      suppliers,
      showForm,
      selectedSupplier,
      handleEdit,
      handleDelete,
      closeForm,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.supplier-list {
  padding: 20px;
}
</style>
