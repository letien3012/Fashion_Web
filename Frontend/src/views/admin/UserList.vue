<template>
  <div class="user-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý khách hàng</h2>
      <button class="btn btn-primary" @click="openForm">
        <i class="fas fa-plus me-2"></i>Thêm khách hàng mới
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                v-model="searchQuery"
                placeholder="Tìm kiếm theo tên hoặc email..."
                @input="handleSearch"
              />
            </div>
          </div>
          <div class="col-md-4">
            <select
              class="form-select"
              v-model="filterStatus"
              @change="handleFilter"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã khóa</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- User Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th style="width: 60px">Ảnh</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th style="width: 120px">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user._id">
                <td>
                  <img
                    :src="getImageUrl(user.image)"
                    :alt="user.fullname"
                    class="user-avatar"
                    @error="handleImageError"
                  />
                </td>
                <td>{{ user.fullname }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone }}</td>
                <td>{{ user.address }}</td>
                <td>
                  <span
                    class="badge"
                    :class="user.isActive ? 'bg-success' : 'bg-danger'"
                  >
                    {{ user.isActive ? "Đang hoạt động" : "Đã khóa" }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="editUser(user)"
                      title="Chỉnh sửa"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(user)"
                      title="Xóa"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedUsers.length === 0">
                <td colspan="7" class="text-center py-4">
                  <i class="fas fa-users fa-2x text-muted mb-2"></i>
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
            {{ filteredUsers.length }} kết quả
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

    <!-- User Form Modal -->
    <div class="modal fade" :class="{ show: showForm }" v-if="showForm">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{
                isEditing
                  ? "Chỉnh sửa trạng thái tài khoản"
                  : "Thêm khách hàng mới"
              }}
            </h5>
            <button type="button" class="btn-close" @click="closeForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <!-- Form thêm mới -->
                <template v-if="!isEditing">
                  <div :class="formData.image ? 'col-md-8' : 'col-md-12'">
                    <div class="mb-3">
                      <label class="form-label"
                        >Họ tên <span class="text-danger">*</span></label
                      >
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.fullname"
                        required
                        placeholder="Nhập họ tên"
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label"
                        >Email <span class="text-danger">*</span></label
                      >
                      <input
                        type="email"
                        class="form-control"
                        v-model="formData.email"
                        required
                        placeholder="Nhập email"
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label"
                        >Mật khẩu <span class="text-danger">*</span></label
                      >
                      <input
                        type="password"
                        class="form-control"
                        v-model="formData.password"
                        required
                        placeholder="Nhập mật khẩu"
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Số điện thoại</label>
                      <input
                        type="tel"
                        class="form-control"
                        v-model="formData.phone"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Địa chỉ</label>
                      <textarea
                        class="form-control"
                        v-model="formData.address"
                        placeholder="Nhập địa chỉ"
                        rows="3"
                      ></textarea>
                    </div>
                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          v-model="formData.isActive"
                          id="activeCheck"
                        />
                        <label class="form-check-label" for="activeCheck">
                          Tài khoản đang hoạt động
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Ảnh đại diện</label>
                      <div class="image-upload-container">
                        <input
                          type="file"
                          class="form-control d-none"
                          @change="handleImageUpload"
                          accept="image/*"
                          ref="imageUploadInput"
                        />
                        <div class="image-preview mt-2" v-if="formData.image">
                          <img
                            :src="getImageUrl(formData.image)"
                            :alt="formData.fullname"
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
                        <div
                          class="upload-overlay"
                          @click="$refs.imageUploadInput.click()"
                        >
                          <i class="fas fa-camera fa-2x"></i>
                          <p class="mb-0">Chọn ảnh</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Form chỉnh sửa trạng thái -->
                <template v-else>
                  <div class="col-12">
                    <div class="alert alert-info">
                      <i class="fas fa-info-circle me-2"></i>
                      Chỉ có thể thay đổi trạng thái tài khoản của khách hàng
                    </div>
                    <div class="card">
                      <div class="card-body">
                        <h6 class="card-title mb-3">Thông tin khách hàng</h6>
                        <div class="row mb-3">
                          <div class="col-md-6">
                            <p class="mb-1"><strong>Họ tên:</strong></p>
                            <p>{{ formData.fullname }}</p>
                          </div>
                          <div class="col-md-6">
                            <p class="mb-1"><strong>Email:</strong></p>
                            <p>{{ formData.email }}</p>
                          </div>
                        </div>
                        <div class="row mb-3">
                          <div class="col-md-6">
                            <p class="mb-1"><strong>Số điện thoại:</strong></p>
                            <p>{{ formData.phone || "Chưa cập nhật" }}</p>
                          </div>
                          <div class="col-md-6">
                            <p class="mb-1"><strong>Địa chỉ:</strong></p>
                            <p>{{ formData.address || "Chưa cập nhật" }}</p>
                          </div>
                        </div>
                        <div class="form-check form-switch mt-3">
                          <input
                            type="checkbox"
                            class="form-check-input"
                            v-model="formData.isActive"
                            id="editActiveCheck"
                          />
                          <label class="form-check-label" for="editActiveCheck">
                            Tài khoản đang hoạt động
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
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
                  {{ isEditing ? "Cập nhật trạng thái" : "Thêm mới" }}
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
  name: "UserList",
  data() {
    return {
      users: [],
      showForm: false,
      isEditing: false,
      formData: {
        fullname: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        image: null,
        isActive: true,
      },
      backendUrl: "http://localhost:3005",
      searchQuery: "",
      filterStatus: "",
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter((user) => {
        const searchLower = this.searchQuery.toLowerCase();
        const matchesSearch =
          user.fullname.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower);
        const matchesStatus =
          !this.filterStatus || user.isActive.toString() === this.filterStatus;
        return matchesSearch && matchesStatus;
      });
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredUsers.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    },
    paginationInfo() {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(
        start + this.itemsPerPage - 1,
        this.filteredUsers.length
      );
      return { start, end };
    },
  },
  async created() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          this.$router.push("/admin/login");
          return;
        }

        const response = await axios.get(`${this.backendUrl}/api/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Response data:", response.data.data);
        this.users = response.data.data;
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Lỗi khi tải danh sách khách hàng"
        );
      }
    },

    openForm() {
      this.isEditing = false;
      this.formData = {
        fullname: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        image: null,
        isActive: true,
      };
      this.showForm = true;
    },

    closeForm() {
      this.showForm = false;
      if (!this.isEditing) {
        this.formData = {
          fullname: "",
          email: "",
          password: "",
          phone: "",
          address: "",
          image: null,
          isActive: true,
        };
      }
      const previewImg = document.querySelector(".image-preview img");
      if (previewImg && previewImg.src.startsWith("blob:")) {
        URL.revokeObjectURL(previewImg.src);
      }
      if (this.$refs.imageUploadInput) {
        this.$refs.imageUploadInput.value = null;
      }
      this.isEditing = false;
    },

    editUser(user) {
      console.log("User data when editing:", user);
      this.isEditing = true;
      this.formData = {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        password: "",
        phone: user.phone,
        address: user.address,
        image: user.image || null,
        isActive: user.isActive,
      };
      console.log("Form data after setting:", this.formData);
      this.showForm = true;
    },

    async handleSubmit() {
      try {
        const token = localStorage.getItem("token");
        console.log("Current formData before submit:", this.formData);
        const userData = { ...this.formData };
        console.log("UserData for API:", userData);

        if (this.isEditing && this.formData.id) {
          console.log("Submitting update for user ID:", this.formData.id);
          await axios.put(
            `${this.backendUrl}/api/customers/update-status/${this.formData.id}`,
            { isActive: this.formData.isActive },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          toast.success("Cập nhật trạng thái tài khoản thành công");
        } else if (!this.isEditing) {
          if (userData.image && userData.image.startsWith("blob:")) {
            delete userData.image;
          }
          await axios.post(
            `${this.backendUrl}/api/customers/register`,
            userData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          toast.success("Thêm khách hàng mới thành công");
        } else {
          throw new Error("Không tìm thấy ID khách hàng để cập nhật.");
        }

        await this.fetchUsers();
        this.closeForm();
      } catch (error) {
        console.error("Submit error:", error.response?.data || error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Lỗi khi lưu khách hàng"
        );
      }
    },

    async confirmDelete(user) {
      if (confirm(`Bạn có chắc chắn muốn xóa khách hàng "${user.fullname}"?`)) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `${this.backendUrl}/api/customers/delete/${user.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success("Xóa khách hàng thành công");
          await this.fetchUsers();
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Lỗi khi xóa khách hàng"
          );
        }
      }
    },

    getImageUrl(image) {
      if (!image) return "/images/default-avatar.png";
      let imageUrl = image.startsWith("@") ? image.substring(1) : image;
      if (imageUrl.startsWith("data:image") || imageUrl.startsWith("http")) {
        return imageUrl;
      }
      return `${this.backendUrl}/${imageUrl}`;
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error("Kích thước file không được vượt quá 2MB");
          if (this.$refs.imageUploadInput) {
            this.$refs.imageUploadInput.value = null;
          }
          return;
        }

        if (!file.type.startsWith("image/")) {
          toast.error("File phải là hình ảnh");
          if (this.$refs.imageUploadInput) {
            this.$refs.imageUploadInput.value = null;
          }
          return;
        }

        const tempUrl = URL.createObjectURL(file);
        this.formData.image = tempUrl;

        const reader = new FileReader();
        reader.onload = (e) => {
          this.formData.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    removeImage() {
      if (this.formData.image && this.formData.image.startsWith("blob:")) {
        URL.revokeObjectURL(this.formData.image);
      }
      this.formData.image = null;
      if (this.$refs.imageUploadInput) {
        this.$refs.imageUploadInput.value = null;
      }
    },

    handleImageError(e) {
      e.target.src = "/images/default-avatar.png";
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
.user-list {
  padding: 20px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
}

.image-upload-container {
  border: 2px dashed #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
  background-color: #f8f9fa;
  position: relative;
  cursor: pointer;
}

.image-upload-container:hover {
  border-color: #adb5bd;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(248, 249, 250, 0.8);
  color: #6c757d;
  z-index: 1;
}

.image-upload-container .image-preview + .upload-overlay {
  display: none;
}

.image-preview {
  position: relative;
  display: block;
  margin-top: 0;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
  display: block;
  margin: 0 auto;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  opacity: 0.8;
  z-index: 2;
}

.remove-image:hover {
  opacity: 1;
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
