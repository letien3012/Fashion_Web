<template>
  <div class="banner-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý banner</h2>
      <button class="btn btn-primary" @click="openForm">
        <i class="fas fa-plus me-2"></i>Thêm banner mới
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                v-model="searchQuery"
                placeholder="Tìm kiếm theo tên..."
                @input="handleSearch"
              />
            </div>
          </div>
          <div class="col-md-3">
            <select
              class="form-select"
              v-model="filterType"
              @change="handleFilter"
            >
              <option value="">Tất cả loại banner</option>
              <option value="main">Banner chính</option>
              <option value="sub">Banner phụ</option>
              <option value="promotion">Khuyến mãi</option>
            </select>
          </div>
          <div class="col-md-3">
            <select
              class="form-select"
              v-model="filterStatus"
              @change="handleFilter"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hiển thị</option>
              <option value="false">Đang ẩn</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Banner Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th style="width: 100px">Hình ảnh</th>
                <th>Tên</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th style="width: 120px">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="banner in paginatedBanners" :key="banner._id">
                <td>
                  <img
                    :src="
                      banner.image.startsWith('http')
                        ? banner.image
                        : `${backendUrl}/${banner.image}`
                    "
                    :alt="banner.name"
                    class="banner-thumbnail"
                    @error="handleImageError"
                  />
                </td>
                <td>{{ banner.name }}</td>
                <td>
                  <span class="badge" :class="getTypeBadgeClass(banner.type)">
                    {{ getTypeLabel(banner.type) }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="banner.publish ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ banner.publish ? "Đang hiển thị" : "Ẩn" }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="editBanner(banner)"
                      title="Chỉnh sửa"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(banner)"
                      title="Xóa"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedBanners.length === 0">
                <td colspan="5" class="text-center py-4">
                  <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
                  <p class="text-muted mb-0">Không có dữ liệu</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-4">
          <div class="text-muted">
            Hiển thị {{ paginationInfo.start }} - {{ paginationInfo.end }} của
            {{ filteredBanners.length }} kết quả
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="changePage(currentPage - 1)"
                >
                  <i class="fas fa-chevron-left"></i>
                </a>
              </li>
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="changePage(page)">
                  {{ page }}
                </a>
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="changePage(currentPage + 1)"
                >
                  <i class="fas fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Banner Form Modal -->
    <div class="modal fade" :class="{ show: showForm }" v-if="showForm">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? "Chỉnh sửa banner" : "Thêm banner mới" }}
            </h5>
            <button type="button" class="btn-close" @click="closeForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label"
                      >Tên banner <span class="text-danger">*</span></label
                    >
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.name"
                      required
                      placeholder="Nhập tên banner"
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label"
                      >Loại banner <span class="text-danger">*</span></label
                    >
                    <select
                      class="form-select"
                      v-model="formData.type"
                      required
                    >
                      <option value="main">Banner chính</option>
                      <option value="sub">Banner phụ</option>
                      <option value="promotion">Khuyến mãi</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Nội dung</label>
                    <textarea
                      class="form-control"
                      v-model="formData.content"
                      rows="3"
                      placeholder="Nhập nội dung banner (nếu có)"
                    ></textarea>
                  </div>
                  <div class="mb-3">
                    <div class="form-check form-switch">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        v-model="formData.publish"
                        id="publishCheck"
                      />
                      <label class="form-check-label" for="publishCheck">
                        Hiển thị banner
                      </label>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label"
                      >Hình ảnh <span class="text-danger">*</span></label
                    >
                    <div class="image-upload-container">
                      <input
                        type="file"
                        class="form-control"
                        @change="handleImageUpload"
                        accept="image/*"
                        :required="!isEditing"
                      />
                      <div class="image-preview mt-2" v-if="formData.image">
                        <img
                          :src="getImageUrl(formData.image)"
                          class="img-fluid rounded"
                          @error="handleImageError"
                        />
                        <button
                          type="button"
                          class="btn btn-danger btn-sm remove-image"
                          @click="removeImage"
                          v-if="formData.image"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-end mt-4">
                <button
                  type="button"
                  class="btn btn-light me-2"
                  @click="closeForm"
                >
                  Hủy
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-save me-2"></i>
                  {{ isEditing ? "Cập nhật" : "Thêm mới" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal-backdrop fade"
      :class="{ show: showForm }"
      v-if="showForm"
    ></div>
  </div>
</template>

<script>
import axios from "axios";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export default {
  name: "BannerList",
  data() {
    return {
      banners: [],
      showForm: false,
      isEditing: false,
      formData: {
        name: "",
        type: "main",
        content: "",
        image: null,
        publish: true,
      },
      backendUrl: "http://localhost:3005",
      searchQuery: "",
      filterType: "",
      filterStatus: "",
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    filteredBanners() {
      return this.banners.filter((banner) => {
        const matchesSearch = banner.name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
        const matchesType = !this.filterType || banner.type === this.filterType;
        const matchesStatus =
          !this.filterStatus || banner.publish.toString() === this.filterStatus;
        return matchesSearch && matchesType && matchesStatus;
      });
    },
    paginatedBanners() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredBanners.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredBanners.length / this.itemsPerPage);
    },
    paginationInfo() {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(
        start + this.itemsPerPage - 1,
        this.filteredBanners.length
      );
      return { start, end };
    },
  },
  async created() {
    await this.fetchBanners();
  },
  methods: {
    async fetchBanners() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          this.$router.push("/admin/login");
          return;
        }

        const response = await axios.get(`${this.backendUrl}/api/banners`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.banners = response.data.data;
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Lỗi khi tải danh sách banner"
        );
      }
    },

    openForm() {
      this.isEditing = false;
      this.formData = {
        name: "",
        type: "main",
        content: "",
        image: null,
        publish: true,
      };
      this.showForm = true;
    },

    closeForm() {
      this.showForm = false;
      this.formData = {
        name: "",
        type: "main",
        content: "",
        image: null,
        publish: true,
      };
      // Giải phóng URL tạm nếu có
      const previewImg = document.querySelector(".image-preview img");
      if (previewImg && previewImg.src.startsWith("blob:")) {
        URL.revokeObjectURL(previewImg.src);
      }
    },

    editBanner(banner) {
      this.isEditing = true;
      this.formData = { ...banner };
      this.showForm = true;
    },

    async handleSubmit() {
      try {
        const token = localStorage.getItem("token");

        // Tạo object dữ liệu để gửi
        const bannerData = {
          name: this.formData.name,
          type: this.formData.type,
          content: this.formData.content || "",
          publish: this.formData.publish,
          image: this.formData.image, // Gửi base64 image trực tiếp
        };

        console.log("Sending banner data:", {
          ...bannerData,
          image: bannerData.image ? "base64 image..." : null, // Log ngắn gọn hơn
        });

        if (this.isEditing) {
          const response = await axios.put(
            `${this.backendUrl}/api/banners/update/${this.formData._id}`,
            bannerData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Update response:", response.data);
          toast.success("Cập nhật banner thành công");
        } else {
          const response = await axios.post(
            `${this.backendUrl}/api/banners/add`,
            bannerData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Add response:", response.data);
          toast.success("Thêm banner mới thành công");
        }

        await this.fetchBanners();
        this.closeForm();
      } catch (error) {
        console.error("Submit error:", error.response?.data || error);
        toast.error(error.response?.data?.message || "Lỗi khi lưu banner");
      }
    },

    async confirmDelete(banner) {
      if (confirm(`Bạn có chắc chắn muốn xóa banner "${banner.name}"?`)) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `${this.backendUrl}/api/banners/delete/${banner._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success("Xóa banner thành công");
          await this.fetchBanners();
        } catch (error) {
          toast.error(error.response?.data?.message || "Lỗi khi xóa banner");
        }
      }
    },

    getImageUrl(image) {
      if (!image) return "";
      if (image.startsWith("data:image")) return image;
      if (image.startsWith("http")) return image;
      return `${this.backendUrl}/${image}`;
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // Kiểm tra kích thước file (giới hạn 2MB)
        if (file.size > 2 * 1024 * 1024) {
          toast.error("Kích thước file không được vượt quá 2MB");
          return;
        }

        // Kiểm tra loại file
        if (!file.type.startsWith("image/")) {
          toast.error("File phải là hình ảnh");
          return;
        }

        // Tạo URL tạm thời để preview ngay lập tức
        const tempUrl = URL.createObjectURL(file);
        // Cập nhật src của ảnh preview
        const previewImg = document.querySelector(".image-preview img");
        if (previewImg) {
          previewImg.src = tempUrl;
        }
        // Chuyển file thành base64 để gửi
        const reader = new FileReader();
        reader.onload = (e) => {
          this.formData.image = e.target.result; // Lưu toàn bộ data URL
        };
        reader.readAsDataURL(file);
      }
    },

    removeImage() {
      this.formData.image = null;
      // Giải phóng URL tạm nếu có
      const previewImg = document.querySelector(".image-preview img");
      if (previewImg && previewImg.src.startsWith("blob:")) {
        URL.revokeObjectURL(previewImg.src);
      }
    },

    handleImageError(e) {
      e.target.src = "/images/placeholder.jpg";
    },

    getTypeLabel(type) {
      const types = {
        main: "Banner chính",
        sub: "Banner phụ",
        promotion: "Khuyến mãi",
      };
      return types[type] || type;
    },

    getTypeBadgeClass(type) {
      const classes = {
        main: "bg-primary",
        sub: "bg-info",
        promotion: "bg-warning",
      };
      return classes[type] || "bg-secondary";
    },

    handleSearch() {
      this.currentPage = 1;
    },

    handleFilter() {
      this.currentPage = 1;
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
};
</script>

<style scoped>
.banner-list {
  padding: 20px;
}

.banner-thumbnail {
  width: 100px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.image-preview {
  position: relative;
  display: inline-block;
  margin-top: 1rem;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  opacity: 0.8;
}

.remove-image:hover {
  opacity: 1;
}

.image-upload-container {
  border: 2px dashed #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
  background-color: #f8f9fa;
  position: relative;
}

.image-upload-container:hover {
  border-color: #adb5bd;
}

.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  opacity: 1;
}

.modal-backdrop.show {
  opacity: 0.5;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

.table > :not(caption) > * > * {
  padding: 1rem;
}

.badge {
  padding: 0.5em 0.75em;
}
</style>
