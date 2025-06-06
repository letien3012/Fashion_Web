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
                          <img
                            :src="getImageUrl(formData.image)"
                            class="preview-image"
                          />
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
                            <img
                              :src="getImageUrl(image)"
                              class="preview-image"
                            />
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
                          :src="getImageUrl(formData.image)"
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
                        @change="
                          handleAttributeCatalogueSelect($event.target.value)
                        "
                      >
                        <option value="">Chọn danh mục thuộc tính</option>
                        <option
                          v-for="catalogue in attributeCatalogues"
                          :key="catalogue._id"
                          :value="catalogue._id"
                          :disabled="
                            selectedAttributeCatalogues.includes(catalogue._id)
                          "
                        >
                          {{ catalogue.name }}
                        </option>
                      </select>
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
                          class="btn btn-sm btn-outline-danger"
                          @click="removeAttributeCatalogue(catalogueId)"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Attribute Selection -->
                    <div
                      v-if="selectedAttributeCatalogues.length > 0"
                      class="mb-4"
                    >
                      <div class="row">
                        <div
                          v-for="catalogueId in selectedAttributeCatalogues"
                          :key="catalogueId"
                          class="col-md-6 mb-3"
                        >
                          <div
                            class="d-flex justify-content-between align-items-center mb-2"
                          >
                            <label class="form-label required mb-0">
                              {{
                                attributeCatalogues.find(
                                  (c) => c._id === catalogueId
                                )?.name
                              }}
                            </label>
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-primary"
                              @click="addNewAttribute(catalogueId)"
                            >
                              <i class="fas fa-plus"></i> Thêm thuộc tính
                            </button>
                          </div>
                          <select
                            class="form-select"
                            multiple
                            v-model="selectedAttributes[catalogueId]"
                            @change="handleAttributeSelection"
                          >
                            <option
                              v-for="attr in attributes.filter(
                                (a) =>
                                  String(
                                    a.attributeCatalogueId?._id ||
                                      a.attributeCatalogueId
                                  ) === String(catalogueId)
                              )"
                              :key="attr._id"
                              :value="attr._id"
                            >
                              {{ attr.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <!-- Generated Variants -->
                    <div
                      v-if="formData.variants.length > 0"
                      class="variants-list"
                    >
                      <div class="row">
                        <div
                          v-for="(variant, index) in formData.variants"
                          :key="index"
                          class="col-md-6 mb-3"
                        >
                          <div class="variant-item p-3 border rounded">
                            <div class="variant-header mb-3">
                              <h6 class="mb-2">Biến thể #{{ index + 1 }}</h6>
                              <div class="variant-attributes mb-2">
                                <span
                                  v-for="(
                                    attrId, catIndex
                                  ) in selectedAttributeCatalogues"
                                  :key="attrId"
                                  class="badge bg-primary me-2"
                                >
                                  {{
                                    getAttributeName(
                                      attrId,
                                      variant[`attributeId${catIndex + 1}`]
                                    )
                                  }}
                                </span>
                              </div>
                              <div class="variant-sku text-muted small">
                                SKU: {{ variant.sku }}
                              </div>
                            </div>

                            <div class="variant-content">
                              <!-- Price Input -->
                              <div class="mb-3">
                                <label class="form-label required">Giá</label>
                                <div class="input-group">
                                  <input
                                    type="number"
                                    class="form-control"
                                    v-model="variant.price"
                                    :class="{
                                      'is-invalid':
                                        errors[`variants.${index}.price`],
                                    }"
                                    required
                                    min="0"
                                  />
                                  <span class="input-group-text">VNĐ</span>
                                </div>
                                <div class="invalid-feedback">
                                  {{ errors[`variants.${index}.price`] }}
                                </div>
                              </div>

                              <!-- Image Upload -->
                              <div class="mb-3">
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
                                  <div
                                    v-if="variant.image"
                                    class="mt-2 variant-image-preview"
                                  >
                                    <img
                                      :src="getImageUrl(variant.image)"
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

                              <!-- Publish Status -->
                              <div class="form-check">
                                <input
                                  class="form-check-input"
                                  type="checkbox"
                                  v-model="variant.publish"
                                  :id="'variantPublish' + index"
                                />
                                <label
                                  class="form-check-label"
                                  :for="'variantPublish' + index"
                                >
                                  Hiển thị biến thể
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-center text-muted py-3">
                      Vui lòng chọn thuộc tính để tạo biến thể
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
import { ref, onMounted, watch } from "vue";
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
      publish: false,
    });

    const errors = ref({});
    const backendUrl = "http://localhost:3005";
    const attributeCatalogues = ref([]);
    const attributes = ref([]);
    const selectedAttributeCatalogues = ref([]);
    const newAttributes = ref([]);
    const selectedAttributes = ref({});

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith("data:image")) return imagePath;
      if (imagePath.startsWith("http")) return imagePath;
      return `${backendUrl}${imagePath}`;
    };

    const generateSKU = (combination) => {
      const prefix = formData.value.code || "SKU";
      const attributeNames = combination.map((attrId) => {
        const attr = attributes.value.find((a) => a._id === attrId);
        if (!attr || !attr.name) {
          console.warn("Attribute not found or has no name:", attrId);
          return "UNK";
        }
        return attr.name.substring(0, 3).toUpperCase();
      });
      return `${prefix}-${attributeNames.join("-")}`;
    };

    const cartesianProduct = (arrays) => {
      if (arrays.length === 0) return [[]];

      const [first, ...rest] = arrays;
      const restCombinations = cartesianProduct(rest);

      return first.flatMap((firstItem) =>
        restCombinations.map((restCombination) => [
          firstItem,
          ...restCombination,
        ])
      );
    };

    const generateVariants = () => {
      // Nếu đang cập nhật sản phẩm và có biến thể hiện có, không tạo biến thể mới
      if (props.product && formData.value.variants.length > 0) {
        return;
      }

      // Clear existing variants
      formData.value.variants = [];

      // Get all selected attributes for each catalogue
      const attributeGroups = selectedAttributeCatalogues.value.map(
        (catalogueId) => selectedAttributes.value[catalogueId] || []
      );

      // Kiểm tra xem có nhóm thuộc tính nào không có thuộc tính được chọn không
      if (attributeGroups.some((group) => group.length === 0)) {
        return;
      }

      // Generate all possible combinations
      const combinations = cartesianProduct(attributeGroups);

      // Create variants from combinations
      combinations.forEach((combination) => {
        // Đảm bảo combination có ít nhất một phần tử
        if (combination.length === 0) return;

        const variant = {
          sku: generateSKU(combination),
          price: 0,
          publish: true,
          image: null,
        };

        // Add attribute IDs to variant
        combination.forEach((attrId, index) => {
          // Đảm bảo attributeId1 luôn được set
          if (index === 0) {
            variant.attributeId1 = attrId;
          } else {
            variant[`attributeId${index + 1}`] = attrId;
          }
        });

        // Chỉ thêm variant nếu có attributeId1
        if (variant.attributeId1) {
          formData.value.variants.push(variant);
        }
      });
    };

    onMounted(async () => {
      if (props.product) {
        // Load product data
        formData.value = {
          ...props.product,
          publish: props.product.publish || false,
          catalogueId:
            props.product.catalogueId?._id || props.product.catalogueId,
          image: getImageUrl(props.product.image),
          album: props.product.album.map((img) => getImageUrl(img)),
          variants: props.product.variants.map((variant) => ({
            ...variant,
            attributeId1: variant.attributeId1?._id || variant.attributeId1,
            attributeId2: variant.attributeId2?._id || variant.attributeId2,
            image: getImageUrl(variant.image),
            publish: variant.publish || false,
          })),
        };

        // Load attribute catalogues for existing variants
        const variantCatalogues = new Set();
        props.product.variants.forEach((variant) => {
          if (variant.attributeId1) {
            const attr1 = attributes.value.find(
              (a) =>
                a._id === (variant.attributeId1?._id || variant.attributeId1)
            );
            if (attr1) variantCatalogues.add(attr1.attributeCatalogueId);
          }
          if (variant.attributeId2) {
            const attr2 = attributes.value.find(
              (a) =>
                a._id === (variant.attributeId2?._id || variant.attributeId2)
            );
            if (attr2) variantCatalogues.add(attr2.attributeCatalogueId);
          }
        });

        // Add selected catalogues
        selectedAttributeCatalogues.value = Array.from(variantCatalogues);

        // Fetch attributes for each catalogue
        for (const catalogueId of selectedAttributeCatalogues.value) {
          await fetchAttributes(catalogueId);
        }

        // Set selected attributes based on existing variants
        selectedAttributes.value = {};
        props.product.variants.forEach((variant) => {
          if (variant.attributeId1) {
            const attr1 = attributes.value.find(
              (a) =>
                a._id === (variant.attributeId1?._id || variant.attributeId1)
            );
            if (attr1) {
              if (!selectedAttributes.value[attr1.attributeCatalogueId]) {
                selectedAttributes.value[attr1.attributeCatalogueId] = [];
              }
              if (
                !selectedAttributes.value[attr1.attributeCatalogueId].includes(
                  attr1._id
                )
              ) {
                selectedAttributes.value[attr1.attributeCatalogueId].push(
                  attr1._id
                );
              }
            }
          }
          if (variant.attributeId2) {
            const attr2 = attributes.value.find(
              (a) =>
                a._id === (variant.attributeId2?._id || variant.attributeId2)
            );
            if (attr2) {
              if (!selectedAttributes.value[attr2.attributeCatalogueId]) {
                selectedAttributes.value[attr2.attributeCatalogueId] = [];
              }
              if (
                !selectedAttributes.value[attr2.attributeCatalogueId].includes(
                  attr2._id
                )
              ) {
                selectedAttributes.value[attr2.attributeCatalogueId].push(
                  attr2._id
                );
              }
            }
          }
        });
      }
      await fetchAttributeCatalogues();
    });

    const fetchAttributeCatalogues = async () => {
      try {
        const token = localStorage.getItem("token-admin");
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
        const token = localStorage.getItem("token-admin");
        const response = await axios.get(`${backendUrl}/api/attributes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API Response:", response.data);

        // Kiểm tra và lấy dữ liệu từ response
        let allAttributes = [];
        if (response.data && response.data.data) {
          allAttributes = response.data.data;
        } else if (Array.isArray(response.data)) {
          allAttributes = response.data;
        }

        console.log("All attributes before filter:", allAttributes);

        // Lọc thuộc tính theo _id của danh mục
        const catalogueAttributes = allAttributes.filter(
          (attr) =>
            String(
              attr.attributeCatalogueId?._id || attr.attributeCatalogueId
            ) === String(catalogueId)
        );

        console.log("Catalogue ID:", catalogueId);
        console.log("Filtered attributes:", catalogueAttributes);

        // Thêm vào danh sách attributes nếu chưa tồn tại
        catalogueAttributes.forEach((attr) => {
          if (
            !attributes.value.some(
              (existingAttr) => existingAttr._id === attr._id
            )
          ) {
            attributes.value.push(attr);
          }
        });

        console.log("Current attributes list:", attributes.value);

        // Sắp xếp lại danh sách attributes theo tên
        attributes.value.sort((a, b) => a.name.localeCompare(b.name));
      } catch (error) {
        console.error("Error fetching attributes:", error);
        toast.error("Không thể tải danh sách thuộc tính");
      }
    };

    const handleAttributeCatalogueSelect = async (catalogueId) => {
      if (
        catalogueId &&
        !selectedAttributeCatalogues.value.includes(catalogueId)
      ) {
        selectedAttributeCatalogues.value.push(catalogueId);
        selectedAttributes[catalogueId] = [];
        await fetchAttributes(catalogueId);
      }
    };

    const removeAttributeCatalogue = (catalogueId) => {
      const index = selectedAttributeCatalogues.value.indexOf(catalogueId);
      if (index > -1) {
        selectedAttributeCatalogues.value.splice(index, 1);
        delete selectedAttributes[catalogueId];
        formData.value.variants = [];
        generateVariants();
      }
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
        const token = localStorage.getItem("token-admin");
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

        // Đảm bảo dữ liệu trả về có cấu trúc đúng
        const newAttribute = {
          _id: response.data.data?._id || response.data._id,
          name: response.data.data?.name || response.data.name || attributeName,
          attributeCatalogueId: catalogueId,
        };

        // Kiểm tra xem thuộc tính đã tồn tại chưa
        const existingIndex = attributes.value.findIndex(
          (a) => a._id === newAttribute._id
        );
        if (existingIndex === -1) {
          attributes.value.push(newAttribute);
        } else {
          attributes.value[existingIndex] = newAttribute;
        }

        // Tự động chọn thuộc tính mới
        if (!selectedAttributes.value[catalogueId]) {
          selectedAttributes.value[catalogueId] = [];
        }
        selectedAttributes.value[catalogueId].push(newAttribute._id);

        // Sắp xếp lại danh sách attributes
        attributes.value.sort((a, b) => a.name.localeCompare(b.name));

        // Kích hoạt tạo biến thể mới
        handleAttributeSelection();

        toast.success("Thêm thuộc tính mới thành công");
      } catch (error) {
        console.error("Error adding new attribute:", error);
        toast.error("Không thể thêm thuộc tính mới");
      }
    };

    const handleVariantAttributeChange = (
      variantIndex,
      attributeId,
      isFirst
    ) => {
      const variant = formData.value.variants[variantIndex];

      // Cập nhật thuộc tính mới
      if (isFirst) {
        variant.attributeId1 = attributeId;
      } else {
        variant.attributeId2 = attributeId;
      }

      // Cập nhật SKU dựa trên các thuộc tính
      const attr1 = attributes.value.find(
        (attr) => attr._id === variant.attributeId1
      );
      const attr2 = attributes.value.find(
        (attr) => attr._id === variant.attributeId2
      );

      variant.sku = `${formData.value.code || "TEMP"}-${attr1?.name || ""}-${
        attr2?.name || ""
      }`
        .replace(/\s+/g, "")
        .toUpperCase();
    };

    const addVariant = () => {
      if (selectedAttributeCatalogues.value.length === 0) {
        toast.warning("Vui lòng chọn ít nhất một danh mục thuộc tính");
        return;
      }

      const variant = {
        sku: "",
        price: 0,
        image: null,
        attributeId1: null,
        attributeId2: null,
        publish: true,
      };

      formData.value.variants.push(variant);
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
        // Validate variants before submitting
        const invalidVariants = formData.value.variants.filter(
          (v) => !v.attributeId1
        );
        if (invalidVariants.length > 0) {
          toast.error("Mỗi biến thể phải có ít nhất một thuộc tính");
          return;
        }

        const token = localStorage.getItem("token-admin");

        // Log data before sending
        console.log(
          "Submitting product form data:",
          JSON.parse(JSON.stringify(formData.value))
        );

        if (props.product) {
          const response = await axios.put(
            `${backendUrl}/api/products/update/${props.product._id}`,
            formData.value,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("Update response:", response.data);
          toast.success("Cập nhật sản phẩm thành công");
        } else {
          const response = await axios.post(
            `${backendUrl}/api/products/add`,
            formData.value,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("Add response:", response.data);
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

    const handleAttributeSelection = () => {
      // Kiểm tra xem có thuộc tính nào được chọn không
      const hasSelectedAttributes = Object.values(
        selectedAttributes.value
      ).some((attrs) => attrs && attrs.length > 0);

      if (hasSelectedAttributes) {
        // Đảm bảo tất cả các nhóm thuộc tính đều có ít nhất một thuộc tính được chọn
        const allGroupsHaveAttributes = selectedAttributeCatalogues.value.every(
          (catalogueId) =>
            selectedAttributes.value[catalogueId] &&
            selectedAttributes.value[catalogueId].length > 0
        );

        if (allGroupsHaveAttributes) {
          generateVariants();
        } else if (!props.product) {
          // Chỉ xóa biến thể nếu không phải đang cập nhật sản phẩm
          formData.value.variants = [];
        }
      } else if (!props.product) {
        // Chỉ xóa biến thể nếu không phải đang cập nhật sản phẩm
        formData.value.variants = [];
      }
    };

    const getAttributeName = (catalogueId, attributeId) => {
      const attribute = attributes.value.find(
        (a) =>
          a._id === attributeId &&
          String(a.attributeCatalogueId?._id || a.attributeCatalogueId) ===
            String(catalogueId)
      );
      return attribute ? attribute.name : "";
    };

    // Thêm watch để theo dõi thay đổi của selectedAttributes
    watch(
      selectedAttributes,
      () => {
        handleAttributeSelection();
      },
      { deep: true }
    );

    // Thêm watch để theo dõi thay đổi của selectedAttributeCatalogues
    watch(
      selectedAttributeCatalogues,
      () => {
        handleAttributeSelection();
      },
      { deep: true }
    );

    // Thêm watch để theo dõi thay đổi của props.product
    watch(
      () => props.product,
      (newProduct) => {
        if (newProduct) {
          // Khi có sản phẩm mới, cập nhật lại formData
          formData.value = {
            ...newProduct,
            publish: newProduct.publish || false,
            catalogueId: newProduct.catalogueId?._id || newProduct.catalogueId,
            image: getImageUrl(newProduct.image),
            album: newProduct.album.map((img) => getImageUrl(img)),
            variants: newProduct.variants.map((variant) => ({
              ...variant,
              attributeId1: variant.attributeId1?._id || variant.attributeId1,
              attributeId2: variant.attributeId2?._id || variant.attributeId2,
              image: getImageUrl(variant.image),
              publish: variant.publish || false,
            })),
          };
        }
      },
      { immediate: true }
    );

    return {
      formData,
      errors,
      attributeCatalogues,
      productCatalogues: props.productCatalogues,
      attributes,
      selectedAttributeCatalogues,
      newAttributes,
      selectedAttributes,
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
      getImageUrl,
      generateVariants,
      cartesianProduct,
      generateSKU,
      getAttributeName,
      handleAttributeSelection,
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
  max-width: 150px;
  max-height: 150px;
  object-fit: contain;
  border-radius: 4px;
}

.main-image-preview,
.album-image-item,
.variant-image-preview {
  position: relative;
  display: inline-block;
  margin: 5px;
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
  z-index: 1;
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
  background-color: #fff;
  transition: all 0.3s ease;
}

.variant-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.variant-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.variant-attributes .badge {
  font-size: 0.9em;
  padding: 6px 10px;
}

.variant-sku {
  font-size: 0.85em;
}

.variant-content {
  padding-top: 10px;
}

.variant-image-preview {
  position: relative;
  display: inline-block;
  margin-top: 10px;
}

.variant-image-preview img {
  max-width: 120px;
  max-height: 120px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.variant-image-preview .remove-image {
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
  background-color: #dc3545;
  border: none;
  color: white;
  font-size: 12px;
}

.variant-image-preview .remove-image:hover {
  background-color: #c82333;
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
  margin-bottom: 8px;
}

.selected-catalogue-item span {
  font-weight: 500;
  flex-grow: 1;
}

.variant-image-upload {
  position: relative;
}

.variant-image-preview {
  position: relative;
  display: inline-block;
}

.variant-image-preview img {
  max-width: 150px;
  max-height: 150px;
  object-fit: contain;
}

.variant-image-preview .remove-image {
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

.ckeditor-container {
  border: 1px solid #ced4da;
  border-radius: 4px;
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.ckeditor-container :deep(.ck.ck-editor) {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  box-sizing: border-box;
}

.ckeditor-container :deep(.ck.ck-editor__main) {
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.ckeditor-container :deep(.ck-editor__editable) {
  min-height: 200px;
  max-height: 400px;
  display: block;
  width: 100%;
  overflow-y: auto;
  padding: 10px;
  box-sizing: border-box;
}

.ckeditor-container :deep(.ck-editor__editable_inline) {
  padding: 0 10px;
}

.ckeditor-container :deep(.ck.ck-toolbar) {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}
</style>
