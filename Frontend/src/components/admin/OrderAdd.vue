<template>
  <div v-if="show" class="modal-overlay" @mousedown.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Thêm đơn hàng mới</h3>
        <button class="close-btn" @click="handleClose" title="Đóng">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <h5>Thông tin khách hàng</h5>
          <div class="row g-2">
            <div class="col-md-6">
              <label>Họ tên <span class="required">*</span></label>
              <input
                v-model="customerInfo.name"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-6">
              <label>Số điện thoại <span class="required">*</span></label>
              <input
                v-model="customerInfo.phone"
                class="form-control"
                required
              />
            </div>
          </div>
          <div class="row g-2 mt-2">
            <div class="col-md-12">
              <label>Địa chỉ chi tiết <span class="required">*</span></label>
              <input
                v-model="customerInfo.address"
                class="form-control"
                required
              />
            </div>
          </div>
          <div class="row g-2 mt-2">
            <div class="col-md-12">
              <LocationPicker
                :provinceCode="customerInfo.province_code"
                :districtCode="customerInfo.district_code"
                :wardCode="customerInfo.ward_code"
                @update:location="updateLocation"
              />
            </div>
          </div>
        </div>

        <div class="form-section mt-4">
          <h5>Chọn sản phẩm</h5>
          <div v-if="isLoadingProducts" class="text-center">
            Đang tải sản phẩm...
          </div>
          <table class="table table-bordered" v-else>
            <thead>
              <tr>
                <th>Sản phẩm <span class="required">*</span></th>
                <th>Biến thể <span class="required">*</span></th>
                <th>Tồn kho</th>
                <th>Giá</th>
                <th>Số lượng <span class="required">*</span></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in selectedItems" :key="idx">
                <td>{{ getProductName(item.productId) }}</td>
                <td>{{ getVariantSku(item.productId, item.variantId) }}</td>
                <td>{{ getVariantStock(item.productId, item.variantId) }}</td>
                <td>
                  {{
                    getVariantPrice(item.productId, item.variantId) | currency
                  }}
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    :max="getVariantStock(item.productId, item.variantId)"
                    v-model.number="item.quantity"
                    class="form-control"
                    style="width: 80px"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    @click="removeItem(idx)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td style="position: relative; min-width: 220px">
                  <input
                    ref="productInputRef"
                    v-model="productSearch"
                    class="form-control"
                    placeholder="Tìm và chọn sản phẩm..."
                    @focus="showProductSuggestions = true"
                    @input="handleProductInput"
                    @blur="handleProductBlur"
                  />
                  <ul
                    v-if="
                      showProductSuggestions &&
                      !newItem.productId &&
                      getAvailableProducts().length
                    "
                    class="autocomplete-list"
                  >
                    <li
                      v-for="p in getAvailableProducts()"
                      :key="p._id"
                      @mousedown.prevent="handleProductSelect(p)"
                    >
                      {{ p.name }}
                    </li>
                  </ul>
                </td>
                <td>
                  <select v-model="newItem.variantId" class="form-select">
                    <option value="">Chọn biến thể</option>
                    <option
                      v-for="v in getAvailableVariants(newItem.productId)"
                      :key="v._id"
                      :value="v._id"
                    >
                      {{ v.sku }}
                    </option>
                  </select>
                </td>
                <td>
                  {{ getVariantStock(newItem.productId, newItem.variantId) }}
                </td>
                <td>
                  {{
                    getVariantPrice(newItem.productId, newItem.variantId)
                      | currency
                  }}
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    :max="getVariantStock(newItem.productId, newItem.variantId)"
                    v-model.number="newItem.quantity"
                    class="form-control"
                    style="width: 80px"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    class="btn btn-success btn-sm"
                    @click="addItem"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="form-section mt-4">
          <h5>Phương thức thanh toán</h5>
          <select class="form-select" v-model="paymentMethod" disabled>
            <option value="COD">Thanh toán khi nhận hàng (COD)</option>
          </select>
        </div>

        <div class="form-section mt-4">
          <button type="submit" class="btn btn-primary">Tạo đơn hàng</button>
          <button
            type="button"
            class="btn btn-secondary ms-2"
            @click="handleClose"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import LocationPicker from "../LocationPicker.vue";
import axios from "axios";
import { toast } from "vue3-toastify";

const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(["order-added", "close"]);

const isLoadingProducts = ref(false);
const products = ref([]);
const consignmentMap = ref({});

const customerInfo = reactive({
  name: "",
  phone: "",
  address: "",
  province_code: "",
  district_code: "",
  ward_code: "",
});

const selectedItems = ref([]);
const newItem = reactive({ productId: "", variantId: "", quantity: 1 });
const paymentMethod = ref("COD");
const productSearch = ref("");
const showProductSuggestions = ref(false);
const productInputRef = ref(null);

const getProductName = (productId) => {
  const p = products.value.find((x) => x._id === productId);
  return p ? p.name : "";
};
const getVariantSku = (productId, variantId) => {
  const p = products.value.find((x) => x._id === productId);
  if (!p) return "";
  const v = p.variants.find((v) => v._id === variantId);
  return v ? v.sku : "";
};
const getVariantPrice = (productId, variantId) => {
  const p = products.value.find((x) => x._id === productId);
  if (!p) return 0;
  const v = p.variants.find((v) => v._id === variantId);
  return v ? v.price : 0;
};
const getVariantStock = (productId, variantId) => {
  return consignmentMap.value[`${productId}-${variantId}`]?.stock || 0;
};
const getAvailableProducts = () => {
  // Trả về các sản phẩm có ít nhất 1 biến thể còn hàng và khớp search
  const keyword = productSearch.value.trim().toLowerCase();
  return products.value.filter(
    (p) =>
      p.variants.some((v) => getVariantStock(p._id, v._id) > 0) &&
      (!keyword || p.name.toLowerCase().includes(keyword))
  );
};
const getAvailableVariants = (productId) => {
  const p = products.value.find((x) => x._id === productId);
  if (!p) return [];
  return p.variants.filter((v) => getVariantStock(productId, v._id) > 0);
};

const onProductChange = () => {
  newItem.variantId = "";
  newItem.quantity = 1;
  productSearch.value = "";
};

const addItem = () => {
  console.log("==> ĐÃ NHẤN NÚT +");
  console.log(
    "addItem:",
    newItem.productId,
    newItem.variantId,
    newItem.quantity,
    typeof newItem.quantity
  );
  if (!newItem.productId || !newItem.variantId || !Number(newItem.quantity)) {
    toast.error("Vui lòng chọn sản phẩm, biến thể và số lượng hợp lệ!");
    return;
  }
  if (
    getVariantStock(newItem.productId, newItem.variantId) < newItem.quantity
  ) {
    toast.error("Số lượng vượt quá tồn kho!");
    return;
  }
  selectedItems.value.push({
    productId: newItem.productId,
    variantId: newItem.variantId,
    quantity: newItem.quantity,
  });
  console.log(
    "selectedItems:",
    JSON.parse(JSON.stringify(selectedItems.value))
  );
  newItem.productId = "";
  newItem.variantId = "";
  newItem.quantity = 1;
};
const removeItem = (idx) => {
  selectedItems.value.splice(idx, 1);
};

const resetForm = () => {
  customerInfo.name = "";
  customerInfo.phone = "";
  customerInfo.address = "";
  customerInfo.province_code = "";
  customerInfo.district_code = "";
  customerInfo.ward_code = "";
  selectedItems.value = [];
  newItem.productId = "";
  newItem.variantId = "";
  newItem.quantity = 1;
};

const handleClose = () => {
  resetForm();
  emit("close");
};

const handleSubmit = async () => {
  console.log(customerInfo);
  // Validate
  if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
    toast.error("Vui lòng nhập đầy đủ thông tin khách hàng!");
    return;
  }
  if (
    !customerInfo.province_code ||
    !customerInfo.district_code ||
    !customerInfo.ward_code
  ) {
    toast.error("Vui lòng chọn địa chỉ!");
    return;
  }
  // Nếu dòng thêm mới đã chọn đủ mà chưa nhấn nút cộng, tự động thêm vào
  if (
    newItem.productId &&
    newItem.variantId &&
    Number(newItem.quantity) &&
    !selectedItems.value.some(
      (item) =>
        item.productId === newItem.productId &&
        item.variantId === newItem.variantId
    )
  ) {
    selectedItems.value.push({
      productId: newItem.productId,
      variantId: newItem.variantId,
      quantity: newItem.quantity,
    });
  }
  if (selectedItems.value.length === 0) {
    toast.error("Vui lòng chọn ít nhất 1 sản phẩm!");
    return;
  }
  // Chuẩn bị dữ liệu gửi lên backend
  const items = selectedItems.value.map((item) => {
    const p = products.value.find((x) => x._id === item.productId);
    const v = p.variants.find((v) => v._id === item.variantId);
    return {
      productId: item.productId,
      variants: [
        {
          _id: item.variantId,
          sku: v.sku,
          quantity: item.quantity,
          price: v.price,
        },
      ],
      quantity: item.quantity,
      price: v.price,
    };
  });
  const total_product_price = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const total_price = total_product_price; // Không tính phí ship, giảm giá
  // Lấy employeeId từ localStorage
  const employee = JSON.parse(localStorage.getItem("employee") || "{}");
  try {
    await axios.post("http://localhost:3005/api/orders/admin", {
      customerInfo: {
        customerId: null,
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        province_code: customerInfo.province_code,
        district_code: customerInfo.district_code,
        ward_code: customerInfo.ward_code,
      },
      items,
      total_product_price,
      total_price,
      discount: 0,
      method: paymentMethod.value,
      note: "",
      status: "delivered",
      employeeId: employee._id || null,
    });
    toast.success("Tạo đơn hàng thành công!");
    resetForm();
    emit("order-added");
    emit("close");
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi khi tạo đơn hàng!");
  }
};

const fetchProductsAndStock = async () => {
  isLoadingProducts.value = true;
  try {
    const [productRes, consignmentRes] = await Promise.all([
      axios.get("http://localhost:3005/api/products"),
      axios.get("http://localhost:3005/api/consignments"),
    ]);
    products.value = productRes.data.data || [];
    // Build consignment map
    const map = {};
    for (const c of consignmentRes.data.data) {
      if (c.publish && c.current_quantity > 0) {
        map[`${c.productId}-${c.variantId}`] = {
          stock: c.current_quantity,
          price: c.price,
        };
      }
    }
    consignmentMap.value = map;
  } catch (err) {
    toast.error("Không thể tải sản phẩm hoặc tồn kho!");
  } finally {
    isLoadingProducts.value = false;
  }
};

const handleProductInput = (e) => {
  showProductSuggestions.value = true;
};
const handleProductSelect = (product) => {
  newItem.productId = product._id;
  newItem.variantId = "";
  newItem.quantity = 1;
  showProductSuggestions.value = false;
  productSearch.value = getProductName(product._id);
};
const handleProductBlur = () => {
  setTimeout(() => {
    showProductSuggestions.value = false;
  }, 150);
};
const clearProductSelection = () => {
  newItem.productId = "";
  newItem.variantId = "";
  productSearch.value = "";
  showProductSuggestions.value = false;
};

const updateLocation = (location) => {
  customerInfo.province_code = location.province_code || "";
  customerInfo.district_code = location.district_code || "";
  customerInfo.ward_code = location.ward_code || "";
};

onMounted(() => {
  fetchProductsAndStock();
});

watch(
  () => props.show,
  (val) => {
    if (val) fetchProductsAndStock();
    if (!val) resetForm();
  }
);

// Thêm watch để debug quá trình chọn sản phẩm, biến thể, số lượng
watch(
  () => [newItem.productId, newItem.variantId, newItem.quantity],
  ([productId, variantId, quantity]) => {
    console.log(
      "Chọn sản phẩm:",
      productId,
      "Biến thể:",
      variantId,
      "Số lượng:",
      quantity
    );
  }
);

// Currency filter
const currency = (value) => {
  if (!value) return "0₫";
  return value.toLocaleString("vi-VN") + "₫";
};
</script>

<script>
export default {
  name: "OrderAdd",
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
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.modal-content {
  background: #fff;
  padding: 10px 32px 32px 32px;
  border-radius: 18px;
  max-width: 900px;
  width: 98vw;
  max-height: 92vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18), 0 2px 8px #0001;
  border: 1.5px solid #e6e6e6;
  animation: modalPop 0.25s;
}
@keyframes modalPop {
  from {
    transform: scale(0.95);
    opacity: 0.7;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 1px;
  text-align: left;
  text-shadow: none;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}
.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}
.form-section {
  margin-bottom: 28px;
  background: #f8fafd;
  border-radius: 10px;
  padding: 18px 18px 10px 18px;
  box-shadow: 0 1px 4px #0001;
}
.form-section h5 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}
label {
  font-weight: 500;
  color: #444;
  margin-bottom: 6px;
  display: block;
}
input.form-control,
select.form-select {
  border-radius: 7px;
  border: 1.2px solid #d9d9d9;
  padding: 10px 12px;
  font-size: 1rem;
  margin-bottom: 8px;
  transition: border 0.2s, box-shadow 0.2s;
  background: #fff;
}
input.form-control:focus,
select.form-select:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px #e6f0ff;
  outline: none;
}
.table {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px #0001;
  margin-bottom: 0;
}
.table-bordered th,
.table-bordered td {
  border: 1px solid #e6e6e6;
  padding: 10px 8px;
  text-align: center;
  vertical-align: middle;
}
.table thead th {
  background: #f0f7ff;
  color: #1890ff;
  font-weight: 600;
  font-size: 1rem;
}
.table tbody tr:hover {
  background: #f5faff;
  transition: background 0.2s;
}
.btn {
  border-radius: 7px;
  font-size: 1rem;
  padding: 8px 18px;
  font-weight: 500;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  border: none;
  outline: none;
}
.btn-primary {
  background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
  color: #fff;
  box-shadow: 0 2px 8px #1890ff22;
}
.btn-primary:hover {
  background: linear-gradient(90deg, #40a9ff 60%, #1890ff 100%);
  color: #fff;
}
.btn-success {
  background: #52c41a;
  color: #fff;
}
.btn-success:hover {
  background: #389e0d;
}
.btn-danger {
  background: #ff4d4f;
  color: #fff;
}
.btn-danger:hover {
  background: #d9363e;
}
.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1.2px solid #d9d9d9;
}
.btn-secondary:hover {
  background: #e6e6e6;
  color: #111;
}
.btn[disabled],
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
@media (max-width: 600px) {
  .modal-content {
    padding: 12px 2vw 12px 2vw;
    max-width: 99vw;
  }
  .form-section {
    padding: 10px 4px 6px 4px;
  }
  .table th,
  .table td {
    font-size: 0.95rem;
    padding: 6px 2px;
  }
}
.autocomplete-list {
  position: absolute;
  left: 0;
  min-width: 320px;
  max-width: 600px;
  width: max-content;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 6px 24px #0002, 0 2px 8px #0001;
  z-index: 10000;
  max-height: 260px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 15px;
}
.autocomplete-list li {
  padding: 10px 18px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
}
.autocomplete-list li:hover {
  background: #f0f7ff;
  color: #1890ff;
}
.required {
  color: #ff4d4f;
  margin-left: 2px;
  font-weight: bold;
}
</style>
