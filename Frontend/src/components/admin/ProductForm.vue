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
                      <div class="col-md-4">
                        <label class="form-label required">Mã sản phẩm</label>
                        <input
                          type="text"
                          class="form-control"
                          v-model="formData.code"
                          :class="{ 'is-invalid': errors.code }"
                          readonly
                          required
                        />
                        <div class="invalid-feedback">{{ errors.code }}</div>
                      </div>
                      <div class="col-md-8">
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
                      <div
                        class="ckeditor-container"
                        :class="{ 'is-invalid': errors.content }"
                      >
                        <textarea
                          id="product-content-editor"
                          v-model="formData.content"
                          rows="5"
                        ></textarea>
                      </div>
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
                    <!-- Hướng dẫn thêm sản phẩm -->
                    <div>
                      <button
                        type="button"
                        class="btn btn-info btn-sm me-2"
                        @click="showGuideModal = true"
                        title="Hướng dẫn thêm sản phẩm"
                      >
                        <i class="fas fa-question-circle"></i> Hướng dẫn thêm
                        sản phẩm
                      </button>
                    </div>
                    <button
                      type="button"
                      class="btn btn-primary btn-sm"
                      @click="showAddAttributeTypeModal = true"
                    >
                      <i class="fas fa-plus"></i> Thêm loại thuộc tính
                    </button>
                  </div>
                  <div class="card-body">
                    <!-- Attribute Types List -->
                    <div class="attribute-types-list">
                      <div
                        v-for="(type, typeIndex) in attributeTypes"
                        :key="typeIndex"
                        class="attribute-type-item"
                      >
                        <div
                          class="d-flex justify-content-between align-items-center mb-2"
                        >
                          <div class="d-flex align-items-center gap-2">
                            <input
                              type="text"
                              class="form-control form-control-sm"
                              v-model="type.name"
                              placeholder="Tên loại thuộc tính"
                              style="width: 200px"
                            />
                          </div>
                          <div class="d-flex gap-2">
                            <button
                              type="button"
                              class="btn btn-outline-primary btn-sm"
                              @click="addNewAttribute(typeIndex)"
                            >
                              <i class="fas fa-plus"></i> Thêm thuộc tính
                            </button>
                            <button
                              type="button"
                              class="btn btn-outline-danger btn-sm"
                              @click="removeAttributeType(typeIndex)"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                        <div class="attributes-list">
                          <div
                            v-for="(attr, attrIndex) in type.attributes"
                            :key="attrIndex"
                            class="attribute-item d-flex align-items-center gap-2 mb-2"
                          >
                            <input
                              type="text"
                              class="form-control form-control-sm"
                              v-model="attr.name"
                              @input="onAttributeInput(typeIndex, attrIndex)"
                              placeholder="Tên thuộc tính"
                            />
                            <button
                              type="button"
                              class="btn btn-outline-danger btn-sm"
                              @click="removeAttribute(typeIndex, attrIndex)"
                            >
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Generated Variants -->
                    <div
                      v-if="
                        attributeTypes.length > 0 &&
                        attributeTypes.every(
                          (type) => type.attributes.length > 0
                        ) &&
                        formData.variants.length > 0
                      "
                      class="variants-list"
                    >
                      <div class="row mb-3" v-if="formData.variants.length > 0">
                        <div class="col-md-3">
                          <input
                            type="number"
                            class="form-control"
                            v-model="bulkPrice"
                            min="0"
                            placeholder="Nhập giá áp dụng cho tất cả biến thể"
                          />
                        </div>
                        <div class="col-md-3">
                          <button
                            type="button"
                            class="btn btn-success"
                            @click="applyBulkPrice"
                          >
                            Áp dụng cho tất cả biến thể
                          </button>
                        </div>
                      </div>
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
                                    attr, attrIndex
                                  ) in variant.attributes"
                                  :key="attrIndex"
                                  class="badge bg-primary me-2"
                                >
                                  {{ attr.name }}
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
                                        errors[`variants.${index}.price`] ||
                                        !variant.price,
                                    }"
                                    required
                                    min="0"
                                  />
                                  <span class="input-group-text">VNĐ</span>
                                </div>
                                <div class="invalid-feedback">
                                  {{
                                    errors[`variants.${index}.price`] ||
                                    (!variant.price
                                      ? "Vui lòng nhập giá sản phẩm"
                                      : "")
                                  }}
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
                      Vui lòng thêm loại thuộc tính và thuộc tính để tạo biến
                      thể
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Attribute Type Modal -->
            <div
              v-if="showAddAttributeTypeModal"
              class="modal fade show d-block"
              tabindex="-1"
            >
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Thêm loại thuộc tính mới</h5>
                    <button
                      type="button"
                      class="btn-close"
                      @click="showAddAttributeTypeModal = false"
                    ></button>
                  </div>
                  <div class="modal-body">
                    <div class="mb-3">
                      <label class="form-label required"
                        >Tên loại thuộc tính</label
                      >
                      <input
                        type="text"
                        class="form-control"
                        v-model="newAttributeType.name"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      @click="showAddAttributeTypeModal = false"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      class="btn btn-primary"
                      @click="addAttributeType"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Guide Modal for Add Product -->
            <div
              v-if="showGuideModal"
              class="modal fade show d-block"
              tabindex="-1"
            >
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Hướng dẫn thêm sản phẩm</h5>
                    <button
                      type="button"
                      class="btn-close"
                      @click="showGuideModal = false"
                    ></button>
                  </div>
                  <div class="modal-body text-center">
                    <img
                      :src="guideImage"
                      alt="Hướng dẫn thêm sản phẩm"
                      style="max-width: 100%; height: auto"
                    />
                  </div>
                  <div class="modal-footer">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      @click="showGuideModal = false"
                    >
                      Đóng
                    </button>
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
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import axios from "axios";
import { toast } from "vue3-toastify";
import AdminAttributeCatalogueService from "../../services/admin/attributeCatalogue.service";
import AdminAttributeService from "../../services/admin/attribute.service";

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
      attributeCatalogueIds: [],
      variants: [],
      publish: false,
    });

    const errors = ref({});
    const backendUrl = import.meta.env.VITE_API_URL;
    const attributeCatalogues = ref([]);
    const attributes = ref([]);
    const selectedAttributeCatalogues = ref([]);
    const newAttributes = ref([]);
    const selectedAttributes = ref({});
    const showAddAttributeTypeModal = ref(false);
    const newAttributeType = ref({ name: "" });
    const attributeTypes = ref([]);
    const originalAttributeTypes = ref([]);
    const originalVariants = ref([]);
    const isInitializing = ref(true);
    let editor = null;

    // Biến và hàm áp dụng giá hàng loạt cho variants
    const bulkPrice = ref(null);
    const applyBulkPrice = () => {
      if (bulkPrice.value !== null && !isNaN(bulkPrice.value)) {
        formData.value.variants.forEach((variant) => {
          variant.price = Number(bulkPrice.value);
        });
      }
    };

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith("data:image")) return imagePath;
      if (imagePath.startsWith("http")) return imagePath;
      return `${backendUrl}${imagePath}`;
    };

    // Helper function to convert full URL to relative path
    const convertToRelativePath = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith("data:image")) return imagePath;
      if (imagePath.startsWith(backendUrl)) {
        return imagePath.replace(backendUrl, "");
      }
      return imagePath;
    };

    const generateSKU = (attributes) => {
      const prefix = formData.value.code || "SKU";
      const attributeNames = attributes.map((attr) =>
        attr.name.substring(0, 3).toUpperCase()
      );
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
      // Get all attributes for each type
      const attributeGroups = attributeTypes.value.map(
        (type) => type.attributes
      );
      console.log("Attribute groups:", attributeGroups);

      // Kiểm tra xem có nhóm thuộc tính nào không có thuộc tính được chọn không
      if (attributeGroups.some((group) => group.length === 0)) {
        return;
      }

      // Generate all possible combinations
      const combinations = cartesianProduct(attributeGroups);
      console.log("Generated combinations:", combinations);

      // Nếu đang cập nhật sản phẩm và có biến thể hiện có
      if (props.product && formData.value.variants.length > 0) {
        // Cập nhật SKU cho các biến thể hiện có
        formData.value.variants.forEach((variant, index) => {
          const combination = combinations[index];
          if (combination) {
            variant.sku = generateSKU(combination);
            variant.attributes = combination.map((attr, idx) => ({
              name: attr.name,
              attributeCatalogueId: attr.attributeCatalogueId,
              index: idx,
            }));
          }
        });
      } else {
        // Clear existing variants
        formData.value.variants = [];

        // Create variants from combinations
        combinations.forEach((combination) => {
          const variant = {
            sku: generateSKU(combination),
            price: 0,
            publish: true,
            image: null,
            attributes: combination.map((attr, index) => ({
              name: attr.name,
              attributeCatalogueId: attr.attributeCatalogueId,
              index: index,
            })),
          };
          console.log("Created variant:", variant);
          formData.value.variants.push(variant);
        });
      }
    };

    const initEditor = () => {
      editor = CKEDITOR.replace("product-content-editor", {
        height: 300,
        removeButtons: "",
        toolbarGroups: [
          { name: "document", groups: ["mode", "document", "doctools"] },
          { name: "clipboard", groups: ["clipboard", "undo"] },
          {
            name: "editing",
            groups: ["find", "selection", "spellchecker", "editing"],
          },
          { name: "forms", groups: ["forms"] },
          "/",
          { name: "basicstyles", groups: ["basicstyles", "cleanup"] },
          {
            name: "paragraph",
            groups: ["list", "indent", "blocks", "align", "bidi", "paragraph"],
          },
          { name: "links", groups: ["links"] },
          { name: "insert", groups: ["insert"] },
          "/",
          { name: "styles", groups: ["styles"] },
          { name: "colors", groups: ["colors"] },
          { name: "tools", groups: ["tools"] },
          { name: "others", groups: ["others"] },
        ],
      });

      editor.on("change", () => {
        formData.value.content = editor.getData();
      });
    };

    // Add function to generate product code
    const generateProductCode = () => {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 1000);
      return `SP${timestamp}${random}`;
    };

    const fetchAttributeCatalogues = async () => {
      try {
        if (props.product) {
          // For existing product, fetch only the required catalogues
          const catalogues = [];
          const missingCatalogues = [];

          for (const catalogueId of props.product.attributeCatalogueIds) {
            try {
              const response = await axios.get(
                `${backendUrl}/api/attributeCatalogues/${catalogueId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "token-admin"
                    )}`,
                  },
                }
              );
              if (response.data) {
                catalogues.push(response.data);
              }
            } catch (error) {
              console.error(`Error fetching catalogue ${catalogueId}:`, error);
              missingCatalogues.push(catalogueId);
            }
          }

          attributeCatalogues.value = catalogues;
          console.log("Fetched required attribute catalogues:", catalogues);

          if (missingCatalogues.length > 0) {
            toast.warning(
              `Không thể tải ${missingCatalogues.length} danh mục thuộc tính. Các danh mục này có thể đã bị xóa.`
            );
            // Remove missing catalogues from product's attributeCatalogueIds
            formData.value.attributeCatalogueIds =
              formData.value.attributeCatalogueIds.filter(
                (id) => !missingCatalogues.includes(id)
              );
          }
        } else {
          // For new product, fetch all catalogues
          const response = await AdminAttributeCatalogueService.getAll();
          if (response.data) {
            attributeCatalogues.value = response.data.data || response.data;
            console.log(
              "Fetched all attribute catalogues:",
              attributeCatalogues.value
            );
          } else {
            throw new Error("Không có dữ liệu danh mục thuộc tính");
          }
        }
      } catch (error) {
        console.error("Error fetching attribute catalogues:", error);
        toast.error(
          error.message || "Không thể tải danh sách danh mục thuộc tính"
        );
        attributeCatalogues.value = [];
      }
    };

    const fetchAttributesForCatalogue = async (catalogueId) => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/attributes/catalogue/${catalogueId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token-admin")}`,
            },
          }
        );

        const catalogueAttributes = response.data.data || response.data;
        console.log(
          "Fetched attributes for catalogue:",
          catalogueId,
          catalogueAttributes
        );

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
      } catch (error) {
        console.error("Error fetching attributes for catalogue:", error);
        toast.error("Không thể tải danh sách thuộc tính");
      }
    };

    const loadExistingAttributeTypes = async () => {
      if (props.product && props.product.attributeCatalogueIds) {
        try {
          console.log(
            "Loading attribute catalogues for IDs:",
            props.product.attributeCatalogueIds
          );

          // Fetch all attribute catalogues first
          await fetchAttributeCatalogues();

          // For each catalogue ID, fetch its attributes and create attribute type
          for (const catalogueId of props.product.attributeCatalogueIds) {
            console.log("Processing catalogue ID:", catalogueId);

            const catalogue = attributeCatalogues.value.find(
              (cat) => cat._id === catalogueId
            );

            if (catalogue) {
              console.log("Found catalogue:", catalogue);

              // Fetch attributes for this catalogue
              const response = await axios.get(
                `${backendUrl}/api/attributes/catalogue/${catalogueId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "token-admin"
                    )}`,
                  },
                }
              );

              const catalogueAttributes = response.data.data || response.data;
              console.log(
                "Fetched attributes for catalogue:",
                catalogueId,
                catalogueAttributes
              );

              if (catalogueAttributes && catalogueAttributes.length > 0) {
                // Create attribute type with the fetched attributes
                attributeTypes.value.push({
                  name: catalogue.name,
                  attributes: catalogueAttributes.map((attr) => ({
                    name: attr.name,
                    attributeCatalogueId: attr.attributeCatalogueId,
                  })),
                });
              } else {
                console.warn("No attributes found for catalogue:", catalogueId);
              }
            } else {
              console.warn("Catalogue not found:", catalogueId);
            }
          }

          console.log("Final attribute types:", attributeTypes.value);

          // KHÔNG gọi generateVariants ở đây khi load attribute types từ CSDL
          // Chỉ gọi generateVariants khi thực sự thay đổi attributeTypes (ở watch)
        } catch (error) {
          console.error("Error loading existing attribute types:", error);
          toast.error("Không thể tải thông tin thuộc tính");
        }
      }
    };

    onMounted(async () => {
      console.log("Component mounted");
      if (props.product) {
        console.log("Loading existing product:", props.product);
        // Load product data
        // Đảm bảo attributes.value đã có dữ liệu trước khi map variants
        // Nếu chưa có, có thể cần fetch về trước (ở đây ưu tiên lấy từ attributes.value)
        const mappedVariants = props.product.variants.map((variant) => {
          // Nếu đã có attributes thì giữ nguyên
          if (variant.attributes && variant.attributes.length > 0)
            return {
              ...variant,
              image: getImageUrl(variant.image),
              publish: variant.publish || false,
            };
          // Nếu chưa có, map từ attributeId1, attributeId2
          const attrs = [];
          if (variant.attributeId1) {
            const attr1 = attributes.value.find(
              (a) => a._id === variant.attributeId1
            );
            if (attr1)
              attrs.push({
                name: attr1.name,
                attributeCatalogueId: attr1.attributeCatalogueId,
                _id: attr1._id,
              });
          }
          if (variant.attributeId2) {
            const attr2 = attributes.value.find(
              (a) => a._id === variant.attributeId2
            );
            if (attr2)
              attrs.push({
                name: attr2.name,
                attributeCatalogueId: attr2.attributeCatalogueId,
                _id: attr2._id,
              });
          }
          // Giữ nguyên các trường khác (giá, hình ảnh, publish, ...)
          return {
            ...variant,
            image: getImageUrl(variant.image),
            publish: variant.publish || false,
            attributes: attrs,
          };
        });
        formData.value = {
          ...props.product,
          publish: props.product.publish || false,
          catalogueId:
            props.product.catalogueId?._id || props.product.catalogueId,
          image: getImageUrl(props.product.image),
          album: props.product.album.map((img) => getImageUrl(img)),
          variants: mappedVariants,
        };
        // Lưu lại variants gốc để dùng lại nếu không thay đổi attributeTypes
        originalVariants.value = JSON.parse(JSON.stringify(mappedVariants));
        // In dữ liệu variants gốc trước khi render ra UI
        console.log(
          "=== VARIANTS FROM PRODUCT BEFORE RENDER ===",
          JSON.stringify(props.product.variants, null, 2)
        );
        console.log("Initial formData:", formData.value);

        // Load existing attribute types
        await loadExistingAttributeTypes();
        // Lưu lại attributeTypes gốc để so sánh khi cập nhật
        originalAttributeTypes.value = JSON.parse(
          JSON.stringify(attributeTypes.value)
        );
        // Đã load xong dữ liệu gốc, cho phép watch hoạt động
        isInitializing.value = false;
      } else {
        // Generate initial code for new product only once
        formData.value.code = generateProductCode();
        console.log("Generated new product code:", formData.value.code);
      }
      await fetchAttributeCatalogues();
      initEditor();
    });

    onBeforeUnmount(() => {
      if (editor) {
        editor.destroy();
      }
    });

    const handleAttributeCatalogueSelect = async (catalogueId) => {
      if (
        catalogueId &&
        !selectedAttributeCatalogues.value.includes(catalogueId)
      ) {
        selectedAttributeCatalogues.value.push(catalogueId);
        selectedAttributes[catalogueId] = [];
        await fetchAttributesForCatalogue(catalogueId);
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

    const addNewAttribute = (typeIndex) => {
      const attrs = attributeTypes.value[typeIndex].attributes;
      if (attrs.length === 0 || attrs[attrs.length - 1].name.trim() !== "") {
        attributeTypes.value[typeIndex].attributes.push({ name: "" });
      }
    };

    const onAttributeInput = (typeIndex, attrIndex) => {
      const attrs = attributeTypes.value[typeIndex].attributes;
      // Nếu đang nhập ô cuối cùng và không trống, tự động thêm ô mới
      if (
        attrIndex === attrs.length - 1 &&
        attrs[attrIndex].name.trim() !== ""
      ) {
        addNewAttribute(typeIndex);
      }
      // Nếu có nhiều ô trống liên tiếp, chỉ giữ lại 1 ô trống cuối cùng
      for (let i = attrs.length - 2; i >= 0; i--) {
        if (attrs[i].name.trim() === "" && attrs[i + 1].name.trim() === "") {
          attrs.splice(i, 1);
        }
      }
    };

    const removeAttributeType = (typeIndex) => {
      attributeTypes.value.splice(typeIndex, 1);
      generateVariants();
    };

    const removeAttribute = (typeIndex, attrIndex) => {
      attributeTypes.value[typeIndex].attributes.splice(attrIndex, 1);
      generateVariants();
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

    const removeVariantImage = (index) => {
      formData.value.variants[index].image = null;
    };

    const handleSubmit = async () => {
      try {
        // Validate attribute types and attributes
        if (attributeTypes.value.length === 0) {
          toast.error("Vui lòng thêm ít nhất một loại thuộc tính");
          return;
        }
        const invalidTypes = attributeTypes.value.filter(
          (type) =>
            !type.attributes ||
            type.attributes.length === 0 ||
            type.attributes.some((attr) => !attr.name.trim())
        );
        if (invalidTypes.length > 0) {
          toast.error(
            "Mỗi loại thuộc tính phải có ít nhất một thuộc tính và tất cả thuộc tính phải có tên"
          );
          return;
        }

        const savedAttributeTypes = [];
        const attributeCatalogueIds = [];
        let oldProduct = null;
        if (props.product) {
          try {
            const response = await axios.get(
              `${backendUrl}/api/products/${props.product._id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "token-admin"
                  )}`,
                },
              }
            );
            oldProduct = response.data;
          } catch (error) {
            oldProduct = null;
          }
        }

        // --- TÁCH LOGIC THÊM MỚI VÀ CẬP NHẬT ---
        for (const [typeIdx, type] of attributeTypes.value.entries()) {
          let catalogueId = null;
          let catalogueData = null;
          if (!props.product) {
            // Chỉ gửi tên gốc, chấp nhận trùng tên
            const catalogueResponse = await AdminAttributeCatalogueService.add({
              name: type.name,
            });
            catalogueData = catalogueResponse.data.catalogue;
            catalogueId = catalogueData._id;
          } else {
            // CẬP NHẬT: Nếu type không có _id (tức là loại thuộc tính mới), luôn tạo mới
            let isNewCatalogue = !type._id;
            if (!isNewCatalogue) {
              // Tìm theo id
              const oldCatalogue = oldProduct?.attributeCatalogueIds?.find(
                (cat) => cat._id === type._id || cat === type._id
              );
              if (oldCatalogue) {
                catalogueId = oldCatalogue._id || oldCatalogue;
                catalogueData = oldCatalogue;
                if (catalogueData.name !== type.name) {
                  await AdminAttributeCatalogueService.update(catalogueId, {
                    name: type.name,
                  });
                }
              } else {
                isNewCatalogue = true;
              }
            }
            if (isNewCatalogue) {
              // Chỉ gửi tên gốc, chấp nhận trùng tên
              const catalogueResponse =
                await AdminAttributeCatalogueService.add({
                  name: type.name,
                });
              catalogueData = catalogueResponse.data.catalogue;
              catalogueId = catalogueData._id;
            }
          }
          attributeCatalogueIds.push(catalogueId);

          // XỬ LÝ ATTRIBUTE
          let oldAttributes = [];
          if (props.product && catalogueId) {
            try {
              const response = await axios.get(
                `${backendUrl}/api/attributes/catalogue/${catalogueId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "token-admin"
                    )}`,
                  },
                }
              );
              oldAttributes = response.data.data || response.data;
            } catch {}
          }
          const attributeIds = [];
          for (const attr of type.attributes) {
            let attributeId = null;
            let attributeData = null;
            // THÊM MỚI: Luôn tạo mới attribute
            if (!props.product) {
              const attrResponse = await AdminAttributeService.add({
                name: attr.name,
                attributeCatalogueId: catalogueId,
              });
              attributeData = attrResponse.data;
              attributeId = attributeData.id;
            } else {
              // CẬP NHẬT: Tìm attribute cũ, nếu không có thì tạo mới
              const oldAttribute = oldAttributes.find(
                (oldAttr) =>
                  oldAttr._id === attr._id || oldAttr.name === attr.name
              );
              if (oldAttribute) {
                attributeId = oldAttribute._id;
                attributeData = oldAttribute;
                if (attributeData.name !== attr.name) {
                  await AdminAttributeService.update(attributeId, {
                    name: attr.name,
                  });
                }
              } else {
                const attrResponse = await AdminAttributeService.add({
                  name: attr.name,
                  attributeCatalogueId: catalogueId,
                });
                attributeData = attrResponse.data;
                attributeId = attributeData.id;
              }
            }
            attributeIds.push(attributeId);
          }
          // XÓA ATTRIBUTE KHÔNG CÒN SỬ DỤNG (chỉ khi cập nhật)
          if (props.product && oldAttributes.length > 0) {
            const attributesToDelete = oldAttributes.filter(
              (oldAttr) => !attributeIds.includes(oldAttr._id)
            );
            for (const attr of attributesToDelete) {
              try {
                await AdminAttributeService.delete(attr._id);
              } catch {}
            }
          }
          savedAttributeTypes.push({
            catalogueId,
            attributeIds,
          });
        }
        // XÓA CATALOGUE KHÔNG CÒN SỬ DỤNG (chỉ khi cập nhật)
        if (props.product && oldProduct?.attributeCatalogueIds) {
          // Xóa hết các catalogue cũ không còn trong danh sách mới (so sánh theo id)
          const newCatalogueIdSet = new Set(
            attributeCatalogueIds.map((id) =>
              typeof id === "object" ? id._id || id.id : id
            )
          );
          const cataloguesToDelete = oldProduct.attributeCatalogueIds.filter(
            (oldId) => {
              const oldIdVal = oldId._id || oldId;
              return !newCatalogueIdSet.has(oldIdVal);
            }
          );
          for (const catalogueId of cataloguesToDelete) {
            try {
              const response = await axios.get(
                `${backendUrl}/api/attributes/catalogue/${
                  catalogueId._id || catalogueId
                }`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "token-admin"
                    )}`,
                  },
                }
              );
              const attributes = response.data.data || response.data;
              for (const attr of attributes) {
                await AdminAttributeService.delete(attr._id);
              }
              await AdminAttributeCatalogueService.delete(
                catalogueId._id || catalogueId
              );
            } catch {}
          }
        }
        // --- ĐỒNG BỘ VARIANTS ---
        // Tạo variants mới dựa trên id attribute vừa tạo
        const attributeIdMatrix = savedAttributeTypes.map(
          (t) => t.attributeIds
        );
        let newVariants = [];
        if (
          attributeIdMatrix.length > 0 &&
          attributeIdMatrix.every((arr) => arr.length > 0)
        ) {
          const combinations = cartesianProduct(
            attributeIdMatrix.map((ids) =>
              ids.map((id, idx) => ({ id, index: idx }))
            )
          );
          newVariants = combinations.map((comb, idx) => {
            const variant = formData.value.variants[idx] || {};
            const attrIds = comb.map((c) => c.id);
            return {
              ...variant,
              sku: generateSKU(
                comb.map((c, i) => ({
                  name: attributeTypes.value[i].attributes[c.index].name,
                }))
              ),
              price: variant.price || 0,
              publish: variant.publish !== undefined ? variant.publish : true,
              image: variant.image
                ? convertToRelativePath(variant.image)
                : null,
              attributeId1:
                typeof attrIds[0] === "object"
                  ? attrIds[0]._id || attrIds[0].id
                  : attrIds[0],
              attributeId2: attrIds[1]
                ? typeof attrIds[1] === "object"
                  ? attrIds[1]._id || attrIds[1].id
                  : attrIds[1]
                : undefined,
              attributes: undefined,
            };
          });
        }
        // Đảm bảo attributeCatalogueIds là mảng id duy nhất
        const uniqueCatalogueIds = [
          ...new Set(
            attributeCatalogueIds.map((id) =>
              typeof id === "object" ? id._id || id.id : id
            )
          ),
        ];
        // Chuẩn bị dữ liệu gửi lên
        const submitData = {
          ...formData.value,
          attributeCatalogueIds: uniqueCatalogueIds,
          image: formData.value.image
            ? convertToRelativePath(formData.value.image)
            : null,
          album: formData.value.album.map((img) => convertToRelativePath(img)),
          variants: newVariants,
        };
        const token = localStorage.getItem("token-admin");
        if (props.product) {
          await axios.put(
            `${backendUrl}/api/products/update/${props.product._id}`,
            submitData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success("Cập nhật sản phẩm thành công");
        } else {
          await axios.post(`${backendUrl}/api/products/add`, submitData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Thêm sản phẩm mới thành công");
        }
        emit("submit");
      } catch (error) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message || "Có lỗi xảy ra khi lưu sản phẩm");
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
        console.log(
          "=== PRODUCT DATA BEFORE UPDATE ===",
          JSON.stringify(newProduct, null, 2)
        );
        if (newProduct) {
          // Khi có sản phẩm mới, cập nhật lại formData
          formData.value = {
            ...newProduct,
            publish: newProduct.publish || false,
            catalogueId: newProduct.catalogueId?._id || newProduct.catalogueId,
            image: getImageUrl(newProduct.image),
            album: newProduct.album.map((img) => getImageUrl(img)),
            variants: newProduct.variants.map((variant) => {
              console.log("Processing variant before update:", variant);
              return {
                ...variant,
                attributeId1: variant.attributeId1?._id || variant.attributeId1,
                attributeId2: variant.attributeId2?._id || variant.attributeId2,
                image: getImageUrl(variant.image),
                publish: variant.publish || false,
              };
            }),
          };
          console.log("Updated formData:", formData.value);
          // Update editor content when product changes
          if (editor) {
            editor.setData(newProduct.content || "");
          }
        }
      },
      { immediate: true }
    );

    const addAttributeType = () => {
      if (!newAttributeType.value.name.trim()) {
        toast.error("Vui lòng nhập tên loại thuộc tính");
        return;
      }

      if (attributeTypes.value.length >= 2) {
        toast.error("Chỉ được thêm tối đa 2 loại thuộc tính");
        return;
      }

      // Khi thêm mới attributeType, không có _id
      attributeTypes.value.push({
        name: newAttributeType.value.name,
        attributes: [],
        // KHÔNG có _id
      });

      newAttributeType.value.name = "";
      showAddAttributeTypeModal.value = false;
      generateVariants();
    };

    // Watch for changes in attribute types và tạo variants phù hợp
    watch(
      attributeTypes,
      (newVal, oldVal) => {
        if (isInitializing.value) return;
        if (!props.product) {
          // Chỉ generate nếu tất cả thuộc tính con đều có tên
          const allFilled = newVal.every(
            (type) =>
              type.attributes.length > 0 &&
              type.attributes.every((attr) => attr.name.trim() !== "")
          );
          if (allFilled) {
            generateVariants();
          } else {
            formData.value.variants = [];
          }
          return;
        }
        // Cập nhật: logic cũ giữ nguyên
        const isChanged =
          JSON.stringify(newVal) !==
          JSON.stringify(originalAttributeTypes.value);
        if (isChanged) {
          formData.value.variants = [];
          generateVariants();
        } else {
          formData.value.variants = JSON.parse(
            JSON.stringify(originalVariants.value)
          );
        }
      },
      { deep: true }
    );

    const showGuideModal = ref(false);
    const guideImage = new URL(
      "../../assets/images/template_addproduct.png",
      import.meta.url
    ).href;

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
      onAttributeInput,
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
      showAddAttributeTypeModal,
      newAttributeType,
      removeAttributeType,
      addAttributeType,
      removeAttribute,
      attributeTypes,
      originalAttributeTypes,
      originalVariants,
      isInitializing,
      bulkPrice,
      applyBulkPrice,
      showGuideModal,
      guideImage,
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
  overflow: hidden;
}

.ckeditor-container.is-invalid {
  border-color: #dc3545;
}

.attribute-types-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
}

.attribute-type-item {
  flex: 0 0 49%;
  max-width: 49%;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  margin-bottom: 0;
}

.attribute-type-item:hover {
  border-color: #d0d0d0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.attribute-type-item .form-control-sm {
  font-size: 0.95rem;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.attribute-type-item .form-control-sm:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.attribute-type-item .btn {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.attribute-type-item .btn-outline-primary {
  border: 1px solid #007bff;
  color: #007bff;
  background: transparent;
}

.attribute-type-item .btn-outline-primary:hover {
  background: #007bff;
  color: #fff;
  transform: translateY(-1px);
}

.attribute-type-item .btn-outline-danger {
  border: 1px solid #dc3545;
  color: #dc3545;
  background: transparent;
}

.attribute-type-item .btn-outline-danger:hover {
  background: #dc3545;
  color: #fff;
  transform: translateY(-1px);
}

.attributes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.attribute-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attribute-item input.form-control-sm {
  flex: 1;
  min-width: 0;
  background: #f8f9fa;
}

.attribute-item input.form-control-sm:focus {
  background: #fff;
}
</style>
