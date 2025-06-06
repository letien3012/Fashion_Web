<template>
  <div class="table-container">
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th style="width: 100px">Hình ảnh</th>
            <th>Tên</th>
            <th>Loại</th>
            <th>Trạng thái</th>
            <th style="width: 120px">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="banner in banners" :key="banner._id">
            <td>
              <img
                :src="getImageUrl(banner.image)"
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
              <div class="action-buttons">
                <button
                  class="edit-btn"
                  @click="$emit('edit', banner)"
                  title="Chỉnh sửa"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="delete-btn"
                  @click="confirmDelete(banner)"
                  title="Xóa"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="banners.length === 0">
            <td colspan="5" class="no-data">
              <i class="fas fa-inbox fa-2x mb-2"></i>
              <p>Không có dữ liệu</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "BannerTable",
  props: {
    banners: {
      type: Array,
      required: true,
    },
    backendUrl: {
      type: String,
      default: "http://localhost:3005",
    },
  },
  emits: ["edit", "delete"],
  methods: {
    getImageUrl(image) {
      if (!image) return "";
      if (image.startsWith("data:image")) return image;
      if (image.startsWith("http")) return image;
      return `${this.backendUrl}/${image}`;
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

    confirmDelete(banner) {
      if (confirm(`Bạn có chắc chắn muốn xóa banner "${banner.name}"?`)) {
        this.$emit("delete", banner);
      }
    },
  },
};
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th {
  background: #fafafa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #262626;
}

.banner-thumbnail {
  width: 100px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.bg-primary {
  color: #fff;
}

.bg-info {
  color: #1890ff;
}

.bg-warning {
  color: #fa8c16;
}

.bg-success {
  color: #fff;
}

.bg-secondary {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #e6f7ff;
  color: #1890ff;
}

.edit-btn:hover {
  background: #bae7ff;
}

.delete-btn {
  background: #fff1f0;
  color: #ff4d4f;
}

.delete-btn:hover {
  background: #ffccc7;
}

.no-data {
  text-align: center;
  color: #8c8c8c;
  padding: 24px;
}

.no-data i {
  display: block;
  margin-bottom: 8px;
  color: #d9d9d9;
}
</style>
