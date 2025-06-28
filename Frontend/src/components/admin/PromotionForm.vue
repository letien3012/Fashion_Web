<template>
  <div class="modal-overlay" v-if="showForm">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ promotion ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi mới" }}
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="promotion-form">
            <div class="row">
              <!-- Left Column - Basic Info -->
              <div class="col-md-8">
                <div class="card mb-3">
                  <div class="card-header">
                    <h6 class="mb-0">Thông tin cơ bản</h6>
                  </div>
                  <div class="card-body">
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label required">Mã khuyến mãi</label>
                        <input
                          type="text"
                          class="form-control"
                          v-model="formData.code"
                          :class="{ 'is-invalid': errors.code }"
                          required
                        />
                        <div class="invalid-feedback">{{ errors.code }}</div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label required"
                          >Tên khuyến mãi</label
                        >
                        <input
                          type="text"
                          class="form-control"
                          v-model="formData.name"
                          :class="{ 'is-invalid': errors.name }"
                          required
                        />
                        <div class="invalid-feedback">{{ errors.name }}</div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Mô tả</label>
                      <textarea
                        class="form-control"
                        v-model="formData.description"
                        rows="3"
                        :class="{ 'is-invalid': errors.description }"
                      ></textarea>
                      <div class="invalid-feedback">
                        {{ errors.description }}
                      </div>
                    </div>

                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label required"
                          >Loại khuyến mãi</label
                        >
                        <select
                          class="form-select"
                          v-model="formData.type"
                          :class="{ 'is-invalid': errors.type }"
                          required
                        >
                          <option value="">Chọn loại khuyến mãi</option>
                          <option value="product">Giảm giá sản phẩm</option>
                          <option value="voucher">Voucher</option>
                        </select>
                        <div class="invalid-feedback">{{ errors.type }}</div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label required">Giảm giá (%)</label>
                        <input
                          type="number"
                          class="form-control"
                          v-model="formData.discount"
                          :class="{ 'is-invalid': errors.discount }"
                          required
                          min="0"
                          max="100"
                        />
                        <div class="invalid-feedback">
                          {{ errors.discount }}
                        </div>
                      </div>
                    </div>

                    <!-- Product Selection for Product Type -->
                    <div v-if="formData.type === 'product'" class="mb-3">
                      <label class="form-label">Chọn lô hàng</label>
                      <select
                        class="form-select"
                        v-model="selectedConsignmentCode"
                        @change="handleConsignmentChange"
                      >
                        <option value="">Chọn lô hàng</option>
                        <option
                          v-for="group in consignmentGroups"
                          :key="group.code"
                          :value="group.code"
                        >
                          {{ group.code }} ({{ group.items.length }} sản phẩm)
                        </option>
                      </select>
                    </div>

                    <!-- Product Selection for Product Type -->
                    <div v-if="formData.type === 'product'" class="mb-3">
                      <label class="form-label required"
                        >Sản phẩm áp dụng</label
                      >
                      <div class="product-selection">
                        <div
                          v-for="(item, index) in formData.productId"
                          :key="index"
                          class="product-item mb-2"
                        >
                          <div class="row">
                            <div class="col-md-6">
                              <select
                                class="form-select"
                                v-model="item.productId"
                                required
                                @change="handleProductChange(index)"
                              >
                                <option value="">Chọn sản phẩm</option>
                                <option
                                  v-for="product in products"
                                  :key="product._id"
                                  :value="String(product._id)"
                                >
                                  {{ product.name }}
                                </option>
                              </select>
                            </div>
                            <div class="col-md-4">
                              <select
                                class="form-select"
                                v-model="item.variantId"
                                required
                                :disabled="!item.productId"
                              >
                                <option value="">Chọn biến thể</option>
                                <option
                                  v-for="variant in getProductVariants(
                                    item.productId
                                  )"
                                  :key="variant._id"
                                  :value="variant._id"
                                >
                                  {{ getVariantLabel(variant) }}
                                </option>
                              </select>
                            </div>
                            <div class="col-md-2">
                              <button
                                type="button"
                                class="btn btn-danger"
                                @click="removeProduct(index)"
                              >
                                <i class="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                          <div
                            v-if="errors[`duplicate_${index}`]"
                            class="invalid-feedback d-block"
                          >
                            {{ errors[`duplicate_${index}`] }}
                          </div>
                        </div>
                        <button
                          type="button"
                          class="btn btn-secondary mt-2"
                          @click="addProduct"
                        >
                          Thêm sản phẩm
                        </button>
                      </div>
                    </div>

                    <!-- Voucher Conditions -->
                    <div v-if="formData.type === 'voucher'" class="mb-3">
                      <label class="form-label">Điều kiện áp dụng</label>
                      <div class="row">
                        <div class="col-md-6">
                          <label class="form-label"
                            >Giá trị đơn hàng tối thiểu</label
                          >
                          <input
                            type="number"
                            class="form-control"
                            v-model="formData.voucher_condition.min_order_value"
                            min="0"
                          />
                        </div>
                        <div class="col-md-6">
                          <label class="form-label">Giảm giá tối đa</label>
                          <input
                            type="number"
                            class="form-control"
                            v-model="formData.voucher_condition.max_discount"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label required">Ngày bắt đầu</label>
                        <input
                          type="datetime-local"
                          class="form-control"
                          v-model="formData.start_date"
                          :class="{ 'is-invalid': errors.start_date }"
                          required
                        />
                        <div class="invalid-feedback">
                          {{ errors.start_date }}
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label required">Ngày kết thúc</label>
                        <input
                          type="datetime-local"
                          class="form-control"
                          v-model="formData.end_date"
                          :class="{ 'is-invalid': errors.end_date }"
                          required
                        />
                        <div class="invalid-feedback">
                          {{ errors.end_date }}
                        </div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="formData.publish"
                          true-value="active"
                          false-value="inactive"
                          id="publishCheck"
                        />
                        <label class="form-check-label" for="publishCheck">
                          Kích hoạt khuyến mãi
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column - Image -->
              <div class="col-md-4">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">Hình ảnh khuyến mãi</h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="form-label">Hình ảnh</label>
                      <div class="image-upload">
                        <input
                          type="file"
                          class="form-control"
                          @change="handleImageUpload"
                          accept="image/*"
                        />
                        <div v-if="formData.image" class="mt-2 image-preview">
                          <img
                            :src="getImageUrl(formData.image)"
                            class="preview-image"
                          />
                          <button
                            type="button"
                            class="btn btn-danger btn-sm remove-image"
                            @click="removeImage"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('close')"
              >
                Hủy
              </button>
              <button type="submit" class="btn btn-primary">
                {{ promotion ? "Cập nhật" : "Thêm mới" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import { toast } from "vue3-toastify";

const backendUrl = "http://localhost:3005";

export default {
  name: "PromotionForm",
  props: {
    showForm: {
      type: Boolean,
      required: true,
    },
    promotion: {
      type: Object,
      default: null,
    },
  },
  emits: ["close", "saved"],
  setup(props, { emit }) {
    const formData = ref({
      code: "",
      name: "",
      description: "",
      image: "",
      publish: "inactive",
      type: "",
      discount: 0,
      productId: [],
      voucher_condition: {
        min_order_value: 0,
        max_discount: 0,
      },
      start_date: "",
      end_date: "",
    });

    const errors = ref({});
    const products = ref([]);
    const consignments = ref([]);
    const selectedConsignmentCode = ref("");

    // Group consignments by code prefix
    const consignmentGroups = computed(() => {
      const groups = {};
      consignments.value.forEach((c) => {
        const prefix = c.code.split("-")[0];
        if (!groups[prefix]) groups[prefix] = { code: prefix, items: [] };
        groups[prefix].items.push(c);
      });
      return Object.values(groups);
    });

    const resetForm = () => {
      formData.value = {
        code: "",
        name: "",
        description: "",
        image: "",
        publish: "inactive",
        type: "",
        discount: 0,
        productId: [],
        voucher_condition: {
          min_order_value: 0,
          max_discount: 0,
        },
        start_date: "",
        end_date: "",
      };
      errors.value = {};
      selectedConsignmentCode.value = "";
    };

    const getProductVariants = (productId) => {
      if (!Array.isArray(products.value)) return [];
      const product = products.value.find(
        (p) => String(p._id) === String(productId)
      );
      return product ? product.variants : [];
    };

    const getVariantLabel = (variant) => {
      return `${variant.sku} - ${variant.price.toLocaleString("vi-VN")}đ`;
    };

    const handleProductChange = (index) => {
      formData.value.productId[index].variantId = "";
      formData.value.productId[index].consignmentId = "";
    };

    const addProduct = () => {
      formData.value.productId.push({
        productId: "",
        variantId: "",
        consignmentId: "",
      });
    };

    const removeProduct = (index) => {
      formData.value.productId.splice(index, 1);
    };

    const handleConsignmentChange = () => {
      const group = consignmentGroups.value.find(
        (g) => g.code === selectedConsignmentCode.value
      );
      if (group) {
        const currentList = formData.value.productId;
        const existSet = new Set(
          currentList.map((item) => `${item.productId}_${item.variantId}`)
        );
        const toAdd = group.items.filter(
          (item) => !existSet.has(`${item.productId}_${item.variantId}`)
        );
        const merged = [
          ...currentList,
          ...toAdd.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            consignmentId: item._id,
          })),
        ];
        formData.value.productId = merged;
      }
    };

    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            formData.value.image = e.target.result;
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error("Error uploading image:", error);
          errors.value.image = "Không thể tải lên hình ảnh";
        }
      }
    };

    const removeImage = () => {
      formData.value.image = "";
    };

    const getImageUrl = (image) => {
      if (!image) return "";
      if (image.startsWith("data:image")) return image;
      if (image.startsWith("http")) return image;
      const cleanPath = image.replace(/^\/?images\//, "");
      return `${backendUrl}/images/${cleanPath}`;
    };

    const validateForm = () => {
      errors.value = {};
      let isValid = true;
      if (!formData.value.code) {
        errors.value.code = "Mã khuyến mãi là bắt buộc";
        isValid = false;
      }
      if (!formData.value.name) {
        errors.value.name = "Tên khuyến mãi là bắt buộc";
        isValid = false;
      }
      if (!formData.value.type) {
        errors.value.type = "Loại khuyến mãi là bắt buộc";
        isValid = false;
      }
      if (!formData.value.discount) {
        errors.value.discount = "Giảm giá là bắt buộc";
        isValid = false;
      }
      if (formData.value.type === "product") {
        if (formData.value.productId.length === 0) {
          errors.value.productId = "Vui lòng chọn ít nhất một sản phẩm";
          isValid = false;
        } else {
          formData.value.productId.forEach((item, index) => {
            if (!item.productId) {
              errors.value[`product_${index}`] = "Vui lòng chọn sản phẩm";
              isValid = false;
            }
            if (!item.variantId) {
              errors.value[`variant_${index}`] = "Vui lòng chọn biến thể";
              isValid = false;
            }
            if (
              item.consignmentId &&
              !item.consignmentId.toString().match(/^[a-fA-F0-9]{24}$/)
            ) {
              errors.value[`consignment_${index}`] = "ID lô hàng không hợp lệ";
              isValid = false;
            }
          });
        }
      }
      if (!formData.value.start_date) {
        errors.value.start_date = "Ngày bắt đầu là bắt buộc";
        isValid = false;
      }
      if (!formData.value.end_date) {
        errors.value.end_date = "Ngày kết thúc là bắt buộc";
        isValid = false;
      }
      return isValid;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;
      try {
        const data = { ...formData.value };
        // Xử lý productId: loại bỏ consignmentId rỗng
        if (Array.isArray(data.productId)) {
          data.productId = data.productId.map((item) => {
            const newItem = { ...item };
            if (!newItem.consignmentId) {
              delete newItem.consignmentId;
            }
            return newItem;
          });
        }
        if (props.promotion && !data.image) {
          data.image = props.promotion.image;
        }
        if (props.promotion) {
          await axios.put(
            `${backendUrl}/api/promotions/${props.promotion._id}`,
            data
          );
          toast.success("Cập nhật khuyến mãi thành công!");
        } else {
          await axios.post(`${backendUrl}/api/promotions`, data);
          toast.success("Thêm khuyến mãi thành công!");
        }
        emit("saved");
        emit("close");
        resetForm();
      } catch (error) {
        if (error.response?.data?.message) {
          errors.value = { submit: error.response.data.message };
          toast.error(error.response.data.message);
        } else {
          toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
        }
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/products`);
        products.value = response.data.data;
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    const fetchConsignments = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/consignments`);
        consignments.value = response.data.data;
      } catch (error) {
        console.error("Error fetching consignments:", error);
      }
    };

    onMounted(() => {
      fetchProducts();
      fetchConsignments();
    });

    watch(
      [() => props.promotion, products, consignments],
      ([newPromotion, productsVal, consignmentsVal]) => {
        if (newPromotion && productsVal.length) {
          formData.value = {
            code: newPromotion.code || "",
            name: newPromotion.name || "",
            description: newPromotion.description || "",
            image: newPromotion.image || "",
            publish: newPromotion.publish || "inactive",
            type: newPromotion.type || "",
            discount: newPromotion.discount || 0,
            productId: Array.isArray(newPromotion.productId)
              ? newPromotion.productId.map((item) => ({
                  productId:
                    typeof item.productId === "object"
                      ? String(item.productId._id)
                      : String(item.productId),
                  variantId:
                    typeof item.variantId === "object"
                      ? String(item.variantId._id)
                      : String(item.variantId),
                  consignmentId:
                    typeof item.consignmentId === "object"
                      ? String(item.consignmentId._id)
                      : item.consignmentId || "",
                }))
              : [],
            voucher_condition: newPromotion.voucher_condition
              ? { ...newPromotion.voucher_condition }
              : { min_order_value: 0, max_discount: 0 },
            start_date: toDatetimeLocal(newPromotion.start_date),
            end_date: toDatetimeLocal(newPromotion.end_date),
          };
          // Nếu tất cả productId đều cùng 1 consignment code thì set selectedConsignmentCode
          if (
            formData.value.productId.length > 0 &&
            consignmentsVal.length > 0
          ) {
            const firstConsignment = consignmentsVal.find(
              (c) => c._id === formData.value.productId[0].consignmentId
            );
            if (firstConsignment) {
              const prefix = firstConsignment.code.split("-")[0];
              selectedConsignmentCode.value = prefix;
            }
          }
        } else if (!newPromotion) {
          resetForm();
        }
      },
      { immediate: true }
    );

    // Kiểm tra trùng sản phẩm + biến thể (dù là từ lô hàng hay thủ công)
    watch(
      () => formData.value.productId,
      (newList) => {
        const seen = new Set();
        for (let i = 0; i < newList.length; i++) {
          const key = `${newList[i].productId}_${newList[i].variantId}`;
          if (seen.has(key)) {
            errors.value[`duplicate_${i}`] =
              "Không được chọn trùng sản phẩm và biến thể";
          } else {
            delete errors.value[`duplicate_${i}`];
            seen.add(key);
          }
        }
      },
      { deep: true }
    );

    function toDatetimeLocal(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const offset = date.getTimezoneOffset();
      const local = new Date(date.getTime() - offset * 60000);
      return local.toISOString().slice(0, 16);
    }

    return {
      formData,
      errors,
      products,
      consignments,
      consignmentGroups,
      selectedConsignmentCode,
      getProductVariants,
      getVariantLabel,
      handleProductChange,
      addProduct,
      removeProduct,
      handleConsignmentChange,
      handleImageUpload,
      removeImage,
      getImageUrl,
      handleSubmit,
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
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  background: #fff;
  border-radius: 14px;
  width: 95%;
  max-width: 1100px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18), 0 1.5px 6px rgba(0, 0, 0, 0.08);
  padding: 0;
}

.modal-content {
  border-radius: 14px;
  border: none;
  box-shadow: none;
  padding: 0 24px 24px 24px;
}

.modal-header {
  border-bottom: 1px solid #f0f0f0;
  padding: 20px 0 12px 0;
  background: #fff;
  border-radius: 14px 14px 0 0;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #222;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}
.btn-close:hover {
  color: #e74c3c;
}

.promotion-form {
  padding: 0;
  margin-top: 10px;
}

.card {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  border: none;
  margin-bottom: 18px;
}

.card-header {
  background: #f8f9fa;
  border-radius: 10px 10px 0 0;
  padding: 10px 18px;
  border-bottom: 1px solid #eee;
}

.card-body {
  padding: 18px;
}

.form-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.form-control,
.form-select {
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #fafbfc;
  transition: border 0.2s;
}
.form-control:focus,
.form-select:focus {
  border-color: #409eff;
  outline: none;
  background: #fff;
}

.invalid-feedback {
  color: #e74c3c;
  font-size: 0.95em;
  margin-top: -6px;
  margin-bottom: 6px;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  max-width: 180px;
  max-height: 180px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-top: 6px;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #fff;
  border-radius: 50%;
  border: 1px solid #eee;
  color: #e74c3c;
  font-size: 1.1em;
  padding: 2px 6px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.product-item {
  padding: 10px;
  border: 1px solid #e3e6ea;
  border-radius: 6px;
  margin-bottom: 10px;
  background: #f9fafb;
}

.required:after {
  content: " *";
  color: #e74c3c;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 0 0 0;
  background: #fff;
  border-radius: 0 0 14px 14px;
}

.btn {
  border-radius: 6px;
  font-size: 1rem;
  padding: 8px 22px;
  font-weight: 500;
  border: none;
  transition: background 0.2s, color 0.2s;
}
.btn-primary {
  background: #409eff;
  color: #fff;
}
.btn-primary:hover {
  background: #2563eb;
}
.btn-secondary {
  background: #f3f4f6;
  color: #222;
}
.btn-secondary:hover {
  background: #e5e7eb;
}
.btn-danger {
  background: #e74c3c;
  color: #fff;
}
.btn-danger:hover {
  background: #c0392b;
}

@media (max-width: 900px) {
  .modal-dialog {
    max-width: 99vw;
    width: 99vw;
    padding: 0;
  }
  .card-body {
    padding: 10px;
  }
}
@media (max-width: 600px) {
  .modal-content {
    padding: 0 4px 12px 4px;
  }
  .modal-header,
  .modal-footer {
    padding-left: 6px;
    padding-right: 6px;
  }
  .card-header {
    padding: 8px 8px;
  }
}
</style>
