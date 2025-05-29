<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-content">
          <h3>Cập nhật trạng thái lô hàng</h3>
          <div class="header-info">
            <span class="prefix">{{ getPrefix }}</span>
            <span class="count"
              >({{ relatedConsignments.length }} chi tiết)</span
            >
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="related-consignments">
          <div class="related-list">
            <div
              v-for="consignment in relatedConsignments"
              :key="consignment._id"
              class="related-item"
            >
              <div class="item-info">
                <div class="main-info">
                  <span class="code">{{ consignment.code }}</span>
                  <span class="product">{{
                    getProductName(consignment.productId)
                  }}</span>
                </div>
                <div class="sub-info">
                  <span class="quantity">
                    <i class="fas fa-box"></i>
                    {{ consignment.quantity }}
                  </span>
                  <span
                    class="current-quantity"
                    :class="{ 'low-stock': consignment.current_quantity < 10 }"
                  >
                    <i class="fas fa-warehouse"></i>
                    {{ consignment.current_quantity }}
                  </span>
                  <span class="price">
                    <i class="fas fa-tag"></i>
                    {{ formatPrice(consignment.price) }} VNĐ
                  </span>
                </div>
              </div>
              <div class="item-actions">
                <span
                  :class="[
                    'status',
                    consignment.publish ? 'active' : 'inactive',
                  ]"
                >
                  <i
                    :class="
                      consignment.publish
                        ? 'fas fa-check-circle'
                        : 'fas fa-times-circle'
                    "
                  ></i>
                  {{ consignment.publish ? "Đang bán" : "Ngừng bán" }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { toast } from "vue3-toastify";

export default {
  name: "ConsignmentForm",
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    initialData: {
      type: Object,
      default: null,
    },
    products: {
      type: Array,
      required: true,
    },
    allConsignments: {
      type: Array,
      required: true,
    },
  },
  emits: ["close", "submit"],
  setup(props, { emit }) {
    const formData = ref({
      code: "",
      productId: "",
      variantId: "",
      price: 0,
      quantity: 0,
      current_quantity: 0,
      publish: true,
    });

    const getPrefix = computed(() => {
      if (!props.initialData?.code) return "";
      return props.initialData.code.split("-")[0];
    });

    const relatedConsignments = computed(() => {
      if (!props.initialData?.code) return [];
      const prefix = props.initialData.code.split("-")[0];
      return props.allConsignments.filter(
        (c) => c.code.split("-")[0] === prefix
      );
    });

    watch(
      () => props.initialData,
      (newVal) => {
        if (newVal) {
          formData.value = { ...newVal };
        }
      },
      { immediate: true }
    );

    const getProductName = (productId) => {
      const product = props.products.find((p) => p._id === productId);
      return product ? product.name : "N/A";
    };

    const handleStatusChange = async (consignment) => {
      try {
        emit("submit", {
          _id: consignment._id,
          publish: !consignment.publish,
        });
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
      }
    };

    const formatPrice = (price) => {
      return price.toLocaleString();
    };

    return {
      formData,
      relatedConsignments,
      getProductName,
      handleStatusChange,
      getPrefix,
      formatPrice,
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafafa;
  border-radius: 12px 12px 0 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-content h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a1a1a;
  font-weight: 600;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prefix {
  font-size: 0.9rem;
  color: #1890ff;
  font-weight: 500;
  background-color: #e6f7ff;
  padding: 4px 8px;
  border-radius: 4px;
}

.count {
  font-size: 0.9rem;
  color: #666;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 8px;
  line-height: 1;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.related-consignments {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.related-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.main-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.code {
  font-weight: 600;
  color: #1890ff;
  font-size: 1.1rem;
}

.product {
  color: #333;
  font-size: 1rem;
}

.sub-info {
  display: flex;
  gap: 16px;
}

.quantity,
.current-quantity,
.price {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.price {
  color: #1890ff;
  font-weight: 500;
}

.current-quantity.low-stock {
  color: #ff4d4f;
  background-color: #fff1f0;
}

.item-actions {
  display: flex;
  align-items: center;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.status.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status.inactive {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.cancel-btn:hover {
  background-color: #e8e8e8;
  color: #333;
}

.cancel-btn i {
  font-size: 14px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.code-display {
  font-size: 0.9em;
  color: #666;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
}

.price-display {
  font-size: 1.1em;
  color: #1890ff;
  font-weight: 500;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
