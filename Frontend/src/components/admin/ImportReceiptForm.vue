<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ getTitle }}</h3>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-overlay">
          <div class="spinner"></div>
        </div>

        <form @submit.prevent="handleSubmit" v-else class="import-receipt-form">
          <!-- Supplier Selection -->
          <div class="form-group">
            <label class="form-label"
              >Nhà cung cấp <span class="required">*</span></label
            >
            <select
              v-model="formData.supplierId"
              class="form-control"
              required
              :disabled="isInputDisabled"
              :class="{ 'is-invalid': errors.supplierId }"
            >
              <option value="">Chọn nhà cung cấp</option>
              <option
                v-for="supplier in suppliers"
                :key="supplier._id"
                :value="supplier._id"
              >
                {{ supplier.name }}
              </option>
            </select>
            <div class="invalid-feedback" v-if="errors.supplierId">
              {{ errors.supplierId }}
            </div>
          </div>

          <!-- Product Details Table -->
          <div class="form-group">
            <div class="header">
              <h2>Chi tiết sản phẩm</h2>
              <button
                type="button"
                class="add-btn"
                @click="addProductDetail"
                v-if="isUpdatable"
                :disabled="!formData.supplierId"
              >
                <i class="fas fa-plus"></i> Thêm sản phẩm
              </button>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm <span class="required">*</span></th>
                    <th>Biến thể <span class="required">*</span></th>
                    <th>Số lượng <span class="required">*</span></th>
                    <th>Đơn giá <span class="required">*</span></th>
                    <th>Thành tiền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(detail, index) in formData.import_details"
                    :key="index"
                  >
                    <td>
                      <select
                        v-model="detail.productId"
                        class="form-control"
                        @change="handleProductChange(index)"
                        required
                        :disabled="isInputDisabled"
                        :class="{
                          'is-invalid':
                            errors[`import_details.${index}.productId`],
                        }"
                      >
                        <option value="">Chọn sản phẩm</option>
                        <option
                          v-for="product in products"
                          :key="product._id"
                          :value="product._id"
                        >
                          {{ product.name }}
                        </option>
                      </select>
                      <div
                        class="invalid-feedback"
                        v-if="errors[`import_details.${index}.productId`]"
                      >
                        {{ errors[`import_details.${index}.productId`] }}
                      </div>
                    </td>
                    <td>
                      <select
                        v-model="detail.variantId"
                        class="form-control"
                        required
                        :disabled="isInputDisabled"
                        :class="{
                          'is-invalid':
                            errors[`import_details.${index}.variantId`],
                        }"
                      >
                        <option value="">Chọn biến thể</option>
                        <option
                          v-for="variant in getProductVariants(
                            detail.productId
                          )"
                          :key="variant._id"
                          :value="variant._id"
                        >
                          {{ getVariantName(variant) }}
                        </option>
                      </select>
                      <div
                        class="invalid-feedback"
                        v-if="errors[`import_details.${index}.variantId`]"
                      >
                        {{ errors[`import_details.${index}.variantId`] }}
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        v-model.number="detail.quantity"
                        class="form-control"
                        min="1"
                        @input="calculateDetailTotal(index)"
                        required
                        :disabled="isInputDisabled"
                        :class="{
                          'is-invalid':
                            errors[`import_details.${index}.quantity`],
                        }"
                      />
                      <div
                        class="invalid-feedback"
                        v-if="errors[`import_details.${index}.quantity`]"
                      >
                        {{ errors[`import_details.${index}.quantity`] }}
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        v-model.number="detail.price"
                        class="form-control"
                        min="0"
                        @input="calculateDetailTotal(index)"
                        required
                        :disabled="isInputDisabled"
                        :class="{
                          'is-invalid': errors[`import_details.${index}.price`],
                        }"
                      />
                      <div
                        class="invalid-feedback"
                        v-if="errors[`import_details.${index}.price`]"
                      >
                        {{ errors[`import_details.${index}.price`] }}
                      </div>
                    </td>
                    <td>{{ formatCurrency(detail.total) }}</td>
                    <td>
                      <div class="actions">
                        <button
                          type="button"
                          class="delete-btn"
                          @click="removeProductDetail(index)"
                          v-if="isUpdatable"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="text-right">
                      <strong>Tổng cộng:</strong>
                    </td>
                    <td colspan="2">
                      <strong>{{ formatCurrency(totalAmount) }}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Status Selection -->
          <div class="form-group" v-if="isEdit">
            <label class="form-label"
              >Trạng thái phiếu nhập <span class="required">*</span></label
            >
            <select
              v-model="formData.status"
              class="form-control"
              :disabled="isStatusDisabled"
            >
              <option
                v-for="status in availableStatuses"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label class="form-label">Ghi chú</label>
            <textarea
              v-model="formData.note"
              class="form-control"
              rows="3"
              :disabled="isInputDisabled"
              placeholder="Nhập ghi chú (nếu có)"
            ></textarea>
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleClose"
            >
              {{ isViewMode ? "Đóng" : "Hủy" }}
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              v-if="!isViewMode && (isUpdatable || isStatusUpdatable)"
              :disabled="loading"
            >
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              {{ isEdit ? "Cập nhật" : "Tạo mới" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import "../../assets/styles/admin/list.css";
import "../../assets/styles/admin/table.css";

export default {
  name: "ImportReceiptForm",
  props: {
    receipt: {
      type: Object,
      default: null,
    },
    isViewMode: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "saved"],
  setup(props, { emit }) {
    const backendUrl = "http://localhost:3005";
    const token = localStorage.getItem("token");
    const suppliers = ref([]);
    const products = ref([]);
    const attributes = ref([]);
    const loading = ref(false);
    const errors = ref({});

    const formData = ref({
      supplierId: "",
      import_details: [],
      note: "",
      status: "pending",
    });

    const isEdit = computed(() => !!props.receipt);

    const getTitle = computed(() => {
      if (props.isViewMode) return "Chi tiết phiếu nhập";
      return isEdit.value ? "Chỉnh sửa phiếu nhập" : "Tạo phiếu nhập mới";
    });

    const totalAmount = computed(() => {
      return formData.value.import_details.reduce(
        (sum, detail) => sum + (detail.total || 0),
        0
      );
    });

    const isUpdatable = computed(() => {
      return formData.value.status === "pending" && !props.isViewMode;
    });

    const isStatusUpdatable = computed(() => {
      return (
        ["pending", "processing", "completed"].includes(
          formData.value.status
        ) && !props.isViewMode
      );
    });

    const isFormEditable = computed(() => {
      return isUpdatable.value || isStatusUpdatable.value;
    });

    const isInputDisabled = computed(() => {
      if (props.isViewMode) return true;
      if (isUpdatable.value) return false;
      return true;
    });

    const isStatusDisabled = computed(() => {
      if (props.isViewMode) return true;
      if (!isEdit.value) return true;
      if (!["pending", "processing"].includes(formData.value.status))
        return true;
      return false;
    });

    const availableStatuses = computed(() => {
      const currentStatus = formData.value.status;
      switch (currentStatus) {
        case "pending":
          return [
            { value: "pending", label: "Chờ xử lý" },
            { value: "processing", label: "Đang xử lý" },
            { value: "cancelled", label: "Đã hủy" },
          ];
        case "processing":
          return [
            { value: "processing", label: "Đang xử lý" },
            { value: "completed", label: "Hoàn thành" },
            { value: "cancelled", label: "Đã hủy" },
          ];
        default:
          return [
            { value: currentStatus, label: getStatusText(currentStatus) },
          ];
      }
    });

    const getStatusText = (status) => {
      const statusMap = {
        pending: "Chờ xử lý",
        processing: "Đang xử lý",
        completed: "Hoàn thành",
        cancelled: "Đã hủy",
      };
      return statusMap[status] || status;
    };

    const fetchSuppliers = async () => {
      try {
        loading.value = true;
        const response = await axios.get(`${backendUrl}/api/suppliers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        suppliers.value = response.data.data || response.data;
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        errors.value.supplierId = "Không thể tải danh sách nhà cung cấp";
        suppliers.value = [];
      } finally {
        loading.value = false;
      }
    };

    const fetchProducts = async () => {
      try {
        loading.value = true;
        const response = await axios.get(`${backendUrl}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        products.value = response.data.data || response.data;
      } catch (error) {
        console.error("Error fetching products:", error);
        errors.value.products = "Không thể tải danh sách sản phẩm";
        products.value = [];
      } finally {
        loading.value = false;
      }
    };

    const fetchAttributes = async () => {
      try {
        loading.value = true;
        const response = await axios.get(`${backendUrl}/api/attributes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        attributes.value = response.data.data || response.data || [];
      } catch (error) {
        console.error("Error fetching attributes:", error);
        attributes.value = [];
      } finally {
        loading.value = false;
      }
    };

    const getProductVariants = (productId) => {
      if (!productId) return [];
      const product = products.value.find((p) => p._id === productId);
      return product?.variants || [];
    };

    const getVariantName = (variant) => {
      if (!variant) return "";
      const parts = variant.sku.split("-");
      // Lấy phần cuối và áp chót
      if (parts.length >= 3) {
        return `${parts[1]}, ${parts[2]}`;
      }
      return variant.sku;
    };

    const addProductDetail = () => {
      formData.value.import_details.push({
        productId: "",
        variantId: "",
        quantity: 1,
        price: 0,
        total: 0,
      });
      calculateDetailTotal(formData.value.import_details.length - 1);
    };

    const removeProductDetail = (index) => {
      formData.value.import_details.splice(index, 1);
    };

    const handleProductChange = async (index) => {
      const productId = formData.value.import_details[index].productId;
      formData.value.import_details[index].variantId = "";
      calculateDetailTotal(index);
    };

    const calculateDetailTotal = (index) => {
      const detail = formData.value.import_details[index];
      const qty = Number(detail.quantity) || 0;
      const price = Number(detail.price) || 0;
      detail.total = qty * price;
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const updateStatus = async (newStatus) => {
      try {
        loading.value = true;
        await axios.put(
          `${backendUrl}/api/import-receipts/status/${props.receipt._id}`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        emit("saved");
      } catch (error) {
        console.error("Error updating status:", error);
        console.error("Backend error:", error.response?.data);
        errors.value.submit =
          "Không thể cập nhật trạng thái. Vui lòng thử lại.";
      } finally {
        loading.value = false;
      }
    };

    const generateImportReceiptCode = () => {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `PN${year}${month}${day}${random}`;
    };

    const handleSubmit = async () => {
      try {
        loading.value = true;
        const employeeId = JSON.parse(localStorage.getItem("employee"))._id;

        // Nếu chỉ cập nhật trạng thái
        if (isEdit.value && formData.value.status !== props.receipt.status) {
          await updateStatus(formData.value.status);
          return;
        }

        // Nếu cập nhật thông tin khác
        const data = {
          code: isEdit.value ? props.receipt.code : generateImportReceiptCode(),
          import_details: formData.value.import_details.map((detail) => {
            const variant = getProductVariants(detail.productId).find(
              (v) => v._id === detail.variantId
            );
            return {
              productId: detail.productId,
              sku: variant?.sku || "",
              quantity: detail.quantity,
              price: detail.price,
              attributeId1: variant?.attributeId1 || null,
              attributeId2: variant?.attributeId2 || null,
              variant_id: detail.variantId,
            };
          }),
          supplierId: formData.value.supplierId,
          employeeId: employeeId,
          total_price: totalAmount.value,
          status: formData.value.status,
          note: formData.value.note,
        };

        if (isEdit.value) {
          await axios.put(
            `${backendUrl}/api/import-receipts/update/${props.receipt._id}`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await axios.post(`${backendUrl}/api/import-receipts/add`, data, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        emit("saved");
      } catch (error) {
        console.error("Error saving import receipt:", error);
        console.error("Backend error:", error.response?.data);
        errors.value.submit = "Không thể lưu phiếu nhập. Vui lòng thử lại.";
      } finally {
        loading.value = false;
      }
    };

    const handleClose = () => {
      emit("close");
    };

    // Watch for isVisible changes
    watch(
      () => props.isVisible,
      async (newValue) => {
        if (newValue) {
          try {
            loading.value = true;
            await Promise.all([
              fetchSuppliers(),
              fetchProducts(),
              fetchAttributes(),
            ]);
          } catch (error) {
            console.error("Error loading data:", error);
          } finally {
            loading.value = false;
          }

          if (props.receipt) {
            formData.value = {
              ...props.receipt,
              supplierId:
                typeof props.receipt.supplierId === "object"
                  ? props.receipt.supplierId._id
                  : props.receipt.supplierId,
              import_details: Array.isArray(props.receipt.import_details)
                ? props.receipt.import_details.map((detail) => ({
                    ...detail,
                    productId:
                      typeof detail.productId === "object"
                        ? detail.productId._id
                        : detail.productId,
                    variantId:
                      typeof detail.variant_id === "object"
                        ? detail.variant_id._id
                        : detail.variant_id || detail.variantId,
                  }))
                : [],
            };
            // Tính lại total cho từng dòng
            formData.value.import_details.forEach((_, idx) =>
              calculateDetailTotal(idx)
            );
          }
        }
      },
      { immediate: true }
    );

    return {
      suppliers,
      products,
      attributes,
      formData,
      isEdit,
      isViewMode: props.isViewMode,
      isVisible: props.isVisible,
      loading,
      errors,
      getTitle,
      totalAmount,
      getProductVariants,
      getVariantName,
      addProductDetail,
      removeProductDetail,
      handleProductChange,
      calculateDetailTotal,
      formatCurrency,
      handleSubmit,
      handleClose,
      isUpdatable,
      isStatusUpdatable,
      isFormEditable,
      isInputDisabled,
      isStatusDisabled,
      availableStatuses,
      getStatusText,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 24px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
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

.import-receipt-form {
  position: relative;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header h2 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.table-container {
  overflow-x: auto;
  margin: 0 -24px;
  padding: 0 24px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0;
}

.table th,
.table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.table tfoot {
  background-color: #f8f9fa;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  border: 1px solid #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  border: 1px solid #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
  border-color: #545b62;
}

.btn-danger {
  background-color: #dc3545;
  border: 1px solid #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
  border-color: #bd2130;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.add-btn {
  background-color: #007bff;
  border: 1px solid #007bff;
  color: white;
}

.add-btn:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}

.delete-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.delete-btn:hover:not(:disabled) {
  text-decoration: underline;
}
</style>
