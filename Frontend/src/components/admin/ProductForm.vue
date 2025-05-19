<template>
  <div class="modal" v-if="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ product ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới" }}
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="product-form">
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
                        <label class="form-label required">Mã sản phẩm</label>
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
                        <label class="form-label required">Tên sản phẩm</label>
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
                      <label class="form-label">Mô tả ngắn</label>
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

                    <div class="mb-3">
                      <label class="form-label">Nội dung chi tiết</label>
                      <textarea
                        class="form-control"
                        v-model="formData.content"
                        rows="5"
                        :class="{ 'is-invalid': errors.content }"
                      ></textarea>
                      <div class="invalid-feedback">{{ errors.content }}</div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label required"
                        >Danh mục sản phẩm</label
                      >
                      <select
                        class="form-select"
                        v-model="formData.catalogueId"
                        :class="{ 'is-invalid': errors.catalogueId }"
                        required
                      >
                        <option value="">Chọn danh mục sản phẩm</option>
                        <option
                          v-for="catalogue in productCatalogues"
                          :key="catalogue._id"
                          :value="catalogue._id"
                        >
                          {{ catalogue.name }}
                        </option>
                      </select>
                      <div class="invalid-feedback">
                        {{ errors.catalogueId }}
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="formData.publish"
                          id="publishCheck"
                        />
                        <label class="form-check-label" for="publishCheck">
                          Hiển thị sản phẩm
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column - Images -->
              <div class="col-md-4">
                <div class="card mb-3">
                  <div class="card-header">
                    <h6 class="mb-0">Hình ảnh sản phẩm</h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="form-label required">Hình ảnh chính</label>
                      <div class="main-image-upload">
                        <input
                          type="file"
                          class="form-control"
                          @change="handleImageUpload"
                          accept="image/*"
                          :class="{ 'is-invalid': errors.image }"
                        />
                        <div class="invalid-feedback">{{ errors.image }}</div>
                        <div
                          v-if="formData.image"
                          class="mt-2 main-image-preview"
                        >
                          <img :src="formData.image" class="preview-image" />
                          <button
                            type="button"
                            class="btn btn-danger btn-sm remove-image"
                            @click="removeMainImage"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Album ảnh</label>
                      <div class="album-upload">
                        <input
                          type="file"
                          class="form-control"
                          @change="handleAlbumUpload"
                          accept="image/*"
                          multiple
                        />
                        <div class="album-preview mt-2">
                          <div
                            v-for="(image, index) in formData.album"
                            :key="index"
                            class="album-image-item"
                          >
                            <img :src="image" class="preview-image" />
                            <button
                              type="button"
                              class="btn btn-danger btn-sm remove-image"
                              @click="removeAlbumImage(index)"
                            >
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Preview Section -->
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">Xem trước</h6>
                  </div>
                  <div class="card-body">
                    <div class="product-preview">
                      <div class="preview-image-container">
                        <img
                          v-if="formData.image"
                          :src="formData.image"
                          class="preview-main-image"
                        />
                        <div v-else class="no-image">
                          <i class="fas fa-image"></i>
                          <span>Chưa có hình ảnh</span>
                        </div>
                      </div>
                      <div class="preview-info">
                        <h5>{{ formData.name || "Tên sản phẩm" }}</h5>
                        <p class="text-muted">
                          {{ formData.code || "Mã sản phẩm" }}
                        </p>
                        <p class="description">
                          {{ formData.description || "Mô tả sản phẩm" }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row" style="margin-top: 20px">
              <div class="col-md-12">
                <div class="card mb-3">
                  <div
                    class="card-header d-flex justify-content-between align-items-center"
                  >
                    <h6 class="mb-0">Biến thể sản phẩm</h6>
                    <div class="d-flex gap-2">
                      <select
                        class="form-select"
                        v-model="selectedAttributeCatalogue"
                        @change="handleAttributeCatalogueSelect($event.target.value)"
                      >
                        <option value="">Chọn danh mục thuộc tính</option>
                        <option
                          v-for="catalogue in attributeCatalogues"
                          :key="catalogue._id"
                          :value="catalogue._id"
                          :disabled="selectedAttributeCatalogues.includes(catalogue._id)"
                        >
                          {{ catalogue.name }}
                        </option>
                      </select>
                      <button
                        type="button"
                        class="btn btn-primary btn-sm"
                        @click="addVariant"
                        :disabled="selectedAttributeCatalogues.length === 0"
                      >
                        <i class="fas fa-plus"></i> Thêm biến thể
                      </button>
                    </div>
                  </div>
                  <div class="card-body">
                    <!-- Selected Attribute Catalogues -->
                    <div class="selected-catalogues mb-3">
                      <div
                        v-for="catalogueId in selectedAttributeCatalogues"
                        :key="catalogueId"
                        class="selected-catalogue-item"
                      >
                        <span>{{
                          attributeCatalogues.find((c) => c._id === catalogueId)
                            ?.name
                        }}</span>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-primary"
                          @click="addNewAttribute(catalogueId)"
                        >
                          <i class="fas fa-plus"></i> Thêm thuộc tính
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-danger"
                          @click="removeAttributeCatalogue(catalogueId)"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Variants List -->
                    <div
                      v-for="(variant, index) in formData.variants"
                      :key="index"
                      class="variant-item mb-3 p-3 border rounded"
                    >
                      <div
                        class="d-flex justify-content-between align-items-center mb-2"
                      >
                        <h6 class="mb-0">Biến thể #{{ index + 1 }}</h6>
                        <button
                          type="button"
                          class="btn btn-danger btn-sm"
                          @click="removeVariant(index)"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                      <div class="row">
                        <!-- Attribute Selection -->
                        <div class="col-md-6 mb-3">
                          <div
                            v-for="(catalogueId, catIndex) in selectedAttributeCatalogues"
                            :key="catalogueId"
                            class="mb-3"
                          >
                            <label class="form-label required">
                              {{
                                attributeCatalogues.find(
                                  (c) => c._id === catalogueId
                                )?.name
                              }}
                            </label>
                            <select
                              class="form-select"
                              :value="variant[`attributeId${catIndex + 1}`]"
                              @change="handleVariantAttributeChange(index, $event.target.value, catIndex === 0)"
                              required
                            >
                              <option value="">Chọn thuộc tính</option>
                              <option
                                v-for="attr in attributes.filter(
                                  (a) => a.attributeCatalogueId === catalogueId
                                )"
                                :key="attr._id"
                                :value="attr._id"
                              >
                                {{ attr.name }}
                              </option>
                            </select>
                          </div>
                        </div>

                        <!-- SKU (auto-generated) -->
                        <div class="col-md-3">
                          <label class="form-label required">SKU</label>
                          <input
                            type="text"
                            class="form-control"
                            v-model="variant.sku"
                            readonly
                          />
                        </div>

                        <!-- Price and Quantity (only shown when attributes are selected) -->
                        <template v-if="variant.attributeId1">
                          <div class="col-md-6">
                            <label class="form-label required">Giá</label>
                            <input
                              type="number"
                              class="form-control"
                              v-model="variant.price"
                              :class="{
                                'is-invalid': errors[`variants.${index}.price`],
                              }"
                              required
                            />
                            <div class="invalid-feedback">
                              {{ errors[`variants.${index}.price`] }}
                            </div>
                          </div>
                        </template>

                        <!-- Variant Image -->
                        <div class="col-md-6">
                          <label class="form-label">Hình ảnh</label>
                          <div class="variant-image-upload">
                            <input
                              type="file"
                              class="form-control"
                              @change="
                                (e) => handleVariantImageUpload(e, index)
                              "
                              accept="image/*"
                            />
                            <div v-if="variant.image" class="mt-2 variant-image-preview">
                              <img
                                :src="variant.image"
                                class="preview-image"
                              />
                              <button
                                type="button"
                                class="btn btn-danger btn-sm remove-image"
                                @click="removeVariantImage(index)"
                              >
                                <i class="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div class="col-md-12 mt-3">
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              v-model="variant.publish"
                              :id="'variantPublish' + index"
                            />
                            <label class="form-check-label" :for="'variantPublish' + index">
                              Hiển thị biến thể
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="formData.variants.length === 0"
                      class="text-center text-muted py-3"
                    >
                      Chưa có biến thể nào được thêm
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('close')"
              >
                Hủy
              </button>
              <button type="submit" class="btn btn-primary">
                {{ product ? "Cập nhật" : "Thêm mới" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { toast } from "vue3-toastify";

export default {
  name: "ProductForm",
  props: {
    product: {
      type: Object,
      default: null,
    },
    attributeCatalogues: {
      type: Array,
      required: true,
    },
    productCatalogues: {
      type: Array,
      required: true,
    },
  },
  emits: ["close", "submit"],
  setup(props, { emit }) {
    const formData = ref({
      code: "",
      name: "",
      description: "",
      content: "",
      image: null,
      album: [],
      catalogueId: "",
      variants: [],
      publish: false
    });

    const errors = ref({});
    const backendUrl = "http://localhost:3005";
    const attributeCatalogues = ref([]);
    const attributes = ref([]);
    const selectedAttributeCatalogues = ref([]);
    const newAttributes = ref([]);

    onMounted(async () => {
      if (props.product) {
        formData.value = { 
          ...props.product,
          publish: props.product.publish || false,
          catalogueId: props.product.catalogueId || "",
          variants: props.product.variants.map(variant => ({
            ...variant,
            attributeId1: variant.attributeId1?._id || variant.attributeId1,
            attributeId2: variant.attributeId2?._id || variant.attributeId2
          }))
        };
      }
      await fetchAttributeCatalogues();
    });

    const fetchAttributeCatalogues = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${backendUrl}/api/attributeCatalogues`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        attributeCatalogues.value = response.data.data || response.data;
      } catch (error) {
        console.error("Error fetching attribute catalogues:", error);
        toast.error("Không thể tải danh sách danh mục thuộc tính");
      }
    };

    const fetchAttributes = async (catalogueId) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${backendUrl}/api/attributes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allAttributes = response.data.data || response.data;
        // Lọc thuộc tính theo danh mục và loại bỏ các thuộc tính đã tồn tại
        const newAttributes = allAttributes.filter(
          (attr) => attr.attributeCatalogueId === catalogueId && 
          !attributes.value.some(existingAttr => existingAttr._id === attr._id)
        );
        attributes.value = [...attributes.value, ...newAttributes];
      } catch (error) {
        console.error("Error fetching attributes:", error);
        toast.error("Không thể tải danh sách thuộc tính");
      }
    };

    const handleAttributeCatalogueSelect = async (catalogueId) => {
      if (!catalogueId) return;

      if (selectedAttributeCatalogues.value.length >= 2) {
        toast.warning("Chỉ có thể chọn tối đa 2 danh mục thuộc tính");
        return;
      }

      if (!selectedAttributeCatalogues.value.includes(catalogueId)) {
        selectedAttributeCatalogues.value.push(catalogueId);
        await fetchAttributes(catalogueId);
      }
    };

    const removeAttributeCatalogue = (catalogueId) => {
      selectedAttributeCatalogues.value =
        selectedAttributeCatalogues.value.filter((id) => id !== catalogueId);
      newAttributes.value = newAttributes.value.filter(
        (attr) => attr.attributeCatalogueId !== catalogueId
      );
      formData.value.variants = [];
    };

    const addNewAttribute = async (catalogueId) => {
      const catalogue = attributeCatalogues.value.find(
        (cat) => cat._id === catalogueId
      );
      if (!catalogue) return;

      const attributeName = prompt(
        `Nhập tên thuộc tính cho danh mục ${catalogue.name}:`
      );
      if (!attributeName) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${backendUrl}/api/attributes/add`,
          {
            name: attributeName,
            attributeCatalogueId: catalogueId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const newAttribute = {
          id: response.data.id,
          name: attributeName,
          attributeCatalogueId: catalogueId,
        };

        newAttributes.value.push(newAttribute);
        attributes.value.push(newAttribute);
        toast.success("Thêm thuộc tính mới thành công");
      } catch (error) {
        console.error("Error adding new attribute:", error);
        toast.error("Không thể thêm thuộc tính mới");
      }
    };

    const generateSKU = (productId, attributeId1, attributeId2) => {
      const attr1 = attributes.value.find(attr => attr._id === attributeId1)?.name || '';
      const attr2 = attributes.value.find(attr => attr._id === attributeId2)?.name || '';
      return `${productId}-${attr1}-${attr2}`.replace(/\s+/g, '').toUpperCase();
    };

    const addVariant = () => {
      if (selectedAttributeCatalogues.value.length === 0) {
        toast.warning("Vui lòng chọn ít nhất một danh mục thuộc tính");
        return;
      }

      const variant = {
        sku: "",
        price: 0,
        quantity: 0,
        image: null,
        attributeId1: null,
        attributeId2: null,
        publish: false
      };

      formData.value.variants.push(variant);
    };

    const handleVariantAttributeChange = (variantIndex, attributeId, isFirst) => {
      const variant = formData.value.variants[variantIndex];
      
      // Lưu giá trị thuộc tính cũ
      const oldAttributeId1 = variant.attributeId1;
      const oldAttributeId2 = variant.attributeId2;

      // Cập nhật thuộc tính mới
      if (isFirst) {
        variant.attributeId1 = attributeId;
        // Giữ nguyên thuộc tính thứ 2 nếu có
        variant.attributeId2 = oldAttributeId2;
      } else {
        variant.attributeId2 = attributeId;
        // Giữ nguyên thuộc tính thứ 1
        variant.attributeId1 = oldAttributeId1;
      }

      // Cập nhật SKU dựa trên các thuộc tính
      if (variant.attributeId1 && variant.attributeId2) {
        variant.sku = generateSKU(
          formData.value._id || "temp",
          variant.attributeId1,
          variant.attributeId2
        );
      } else if (variant.attributeId1) {
        variant.sku = generateSKU(
          formData.value._id || "temp",
          variant.attributeId1,
          null
        );
      } else if (variant.attributeId2) {
        variant.sku = generateSKU(
          formData.value._id || "temp",
          null,
          variant.attributeId2
        );
      }
    };

    const uploadImage = async (file) => {
      try {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        return await base64Promise;
      } catch (error) {
        console.error("Error converting image to base64:", error);
        throw new Error("Không thể xử lý hình ảnh");
      }
    };

    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const base64Image = await uploadImage(file);
          formData.value.image = base64Image;
          errors.value.image = null;
        } catch (error) {
          console.error("Error uploading image:", error);
          errors.value.image = "Không thể tải lên hình ảnh";
        }
      }
    };

    const removeMainImage = () => {
      formData.value.image = null;
    };

    const handleAlbumUpload = async (event) => {
      const files = event.target.files;
      if (files.length) {
        try {
          const uploadPromises = Array.from(files).map((file) =>
            uploadImage(file)
          );
          const base64Images = await Promise.all(uploadPromises);
          formData.value.album = [...formData.value.album, ...base64Images];
        } catch (error) {
          console.error("Error uploading album images:", error);
          toast.error("Không thể tải lên một số hình ảnh");
        }
      }
    };

    const removeAlbumImage = (index) => {
      formData.value.album.splice(index, 1);
    };

    const handleVariantImageUpload = async (event, index) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const base64Image = await uploadImage(file);
          formData.value.variants[index].image = base64Image;
        } catch (error) {
          console.error("Error uploading variant image:", error);
          toast.error("Không thể tải lên hình ảnh biến thể");
        }
      }
    };

    const removeVariant = (index) => {
      formData.value.variants.splice(index, 1);
    };

    const removeVariantImage = (index) => {
      formData.value.variants[index].image = null;
    };

    const handleSubmit = async () => {
      try {
        const token = localStorage.getItem("token");
        if (props.product) {
          await axios.put(
            `${backendUrl}/api/products/update/${props.product.id}`,
            formData.value,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success("Cập nhật sản phẩm thành công");
        } else {
          await axios.post(`${backendUrl}/api/products/add`, formData.value, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Thêm sản phẩm mới thành công");
        }
        emit("submit");
      } catch (error) {
        console.error("Error submitting form:", error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Có lỗi xảy ra khi lưu sản phẩm");
        }
      }
    };

    return {
      formData,
      errors,
      attributeCatalogues,
      productCatalogues: props.productCatalogues,
      attributes,
      selectedAttributeCatalogues,
      newAttributes,
      handleAttributeCatalogueSelect,
      removeAttributeCatalogue,
      addNewAttribute,
      handleVariantAttributeChange,
      addVariant,
      removeVariant,
      handleImageUpload,
      removeMainImage,
      handleAlbumUpload,
      removeAlbumImage,
      handleVariantImageUpload,
      removeVariantImage,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}

.required::after {
  content: " *";
  color: red;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.main-image-preview {
  position: relative;
  display: inline-block;
}

.album-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.album-image-item {
  position: relative;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.variant-item {
  background-color: #f8f9fa;
}

.product-preview {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.preview-image-container {
  width: 100%;
  height: 200px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6c757d;
}

.no-image i {
  font-size: 48px;
  margin-bottom: 8px;
}

.preview-info {
  padding: 16px;
}

.preview-info h5 {
  margin-bottom: 8px;
}

.preview-info .description {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
}

.selected-catalogues {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-catalogue-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.selected-catalogue-item span {
  font-weight: 500;
}

.variant-image-upload {
  position: relative;
}
</style>
