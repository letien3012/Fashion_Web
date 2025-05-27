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
import { toast } from "vue3-toastify";
import SupplierTable from "../../components/admin/SupplierTable.vue";
import SupplierForm from "../../components/admin/SupplierForm.vue";
import { AdminSupplierService } from "../../services/admin/supplier.service";

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

    const fetchSuppliers = async () => {
      try {
        suppliers.value = await AdminSupplierService.getAllSuppliers();
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
      try {
        await AdminSupplierService.deleteSupplier(supplierId);
        suppliers.value = suppliers.value.filter((s) => s._id !== supplierId);
        toast.success("Xóa nhà cung cấp thành công");
      } catch (error) {
        console.error("Error deleting supplier:", error);
        toast.error("Không thể xóa nhà cung cấp");
      }
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
