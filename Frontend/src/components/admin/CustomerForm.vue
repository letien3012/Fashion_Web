<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-content">
          <h3>Cập nhật trạng thái khách hàng</h3>
          <div class="header-info">
            <span class="customer-name">{{ initialData?.fullname }}</span>
            <span class="customer-email">{{ initialData?.email }}</span>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="customer-details">
          <div class="detail-item">
            <div class="detail-header">
              <i class="fas fa-user"></i>
              <span>Thông tin cá nhân</span>
            </div>
            <div class="detail-content">
              <div class="info-row">
                <span class="label">Họ tên:</span>
                <span class="value">{{ initialData?.fullname }}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">{{ initialData?.email }}</span>
              </div>
              <div class="info-row">
                <span class="label">Số điện thoại:</span>
                <span class="value">{{
                  initialData?.phone || "Chưa cập nhật"
                }}</span>
              </div>
              <div class="info-row">
                <span class="label">Địa chỉ:</span>
                <span class="value">{{
                  initialData?.address || "Chưa cập nhật"
                }}</span>
              </div>
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-header">
              <i class="fas fa-toggle-on"></i>
              <span>Trạng thái tài khoản</span>
            </div>
            <div class="detail-content">
              <div class="status-section">
                <span class="current-status">
                  Trạng thái hiện tại:
                  <span :class="['status-badge', initialData?.status]">
                    {{
                      initialData?.status === "active"
                        ? "Hoạt động"
                        : "Không hoạt động"
                    }}
                  </span>
                </span>
                <div class="status-actions">
                  <button
                    class="status-btn"
                    :class="{ active: initialData?.status === 'active' }"
                    @click="handleStatusChange('active')"
                  >
                    <i class="fas fa-check-circle"></i>
                    Kích hoạt
                  </button>
                  <button
                    class="status-btn"
                    :class="{ active: initialData?.status === 'inactive' }"
                    @click="handleStatusChange('inactive')"
                  >
                    <i class="fas fa-ban"></i>
                    Vô hiệu hóa
                  </button>
                </div>
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
import { ref, watch } from "vue";
import { toast } from "vue3-toastify";

export default {
  name: "CustomerForm",
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    initialData: {
      type: Object,
      default: null,
    },
  },
  emits: ["close", "submit"],
  setup(props, { emit }) {
    const handleStatusChange = async (newStatus) => {
      try {
        emit("submit", {
          id: props.initialData.id,
          status: newStatus,
        });
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
      }
    };

    return {
      handleStatusChange,
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
  gap: 12px;
}

.customer-name {
  font-size: 0.9rem;
  color: #1890ff;
  font-weight: 500;
}

.customer-email {
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

.customer-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-item {
  background-color: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}

.detail-header {
  padding: 16px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #262626;
}

.detail-header i {
  color: #1890ff;
}

.detail-content {
  padding: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  width: 120px;
  color: #666;
  font-size: 0.9rem;
}

.value {
  flex: 1;
  color: #262626;
  font-weight: 500;
}

.status-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #262626;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-badge.inactive {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.status-actions {
  display: flex;
  gap: 12px;
}

.status-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: white;
  color: #666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.status-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
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

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
  }

  .status-actions {
    flex-direction: column;
  }

  .status-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
