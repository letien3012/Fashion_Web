<template>
  <div class="table-container">
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Mã phiếu</th>
            <th>Nhà cung cấp</th>
            <th>Ngày tạo</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="receipt in importReceipts" :key="receipt._id" :class="{ 'highlight-row': receipt.status === 'pending' }">
            <td>{{ receipt.code }}</td>
            <td>{{ receipt.supplierId?.name }}</td>
            <td>{{ formatDate(receipt.createdAt) }}</td>
            <td>{{ formatCurrency(receipt.total_price) }}</td>
            <td>
              <span :class="['status', receipt.status]">
                {{ getStatusText(receipt.status) }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="edit-btn" @click="viewDetails(receipt)" title="Xem chi tiết">
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  class="edit-btn" 
                  @click="editReceipt(receipt)" 
                  v-if="receipt.status === 'pending'"
                  title="Chỉnh sửa"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="edit-btn" 
                  @click="updateStatus(receipt)" 
                  v-if="receipt.status === 'processing'"
                  title="Cập nhật trạng thái"
                >
                  <i class="fas fa-arrow-right"></i>
                </button>
                <button 
                  class="delete-btn" 
                  @click="confirmDelete(receipt)" 
                  v-if="receipt.status === 'pending'"
                  title="Xóa"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="importReceipts.length === 0">
            <td colspan="6" class="text-center no-data">
              <div class="no-data-content">
                <i class="fas fa-inbox fa-3x"></i>
                <p>Không có dữ liệu</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import '../../assets/styles/admin/list.css';
import '../../assets/styles/admin/table.css';

export default {
  name: "ImportReceiptTable",
  props: {
    importReceipts: {
      type: Array,
      required: true
    }
  },
  emits: ['edit', 'delete', 'view', 'update-status'],
  setup(props, { emit }) {
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatCurrency = (amount) => {
      if (typeof amount !== 'number' || isNaN(amount)) return '0 ₫';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    };

    const getStatusText = (status) => {
      const statusMap = {
        pending: "Chờ xử lý",
        processing: "Đang xử lý",
        completed: "Hoàn thành",
        cancelled: "Đã hủy",
      };
      return statusMap[status] || "Chờ xử lý";
    };

    const updateStatus = (receipt) => {
      emit('update-status', receipt);
    };

    const viewDetails = (receipt) => {
      emit('view', receipt);
    };

    const editReceipt = (receipt) => {
      emit('edit', receipt);
    };

    const confirmDelete = (receipt) => {
      if (confirm("Bạn có chắc chắn muốn xóa phiếu nhập này?")) {
        emit('delete', receipt);
      }
    };

    return {
      formatDate,
      formatCurrency,
      getStatusText,
      viewDetails,
      editReceipt,
      confirmDelete,
      updateStatus
    };
  },
};
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-top: 20px;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.highlight-row {
  background-color: #fff3cd;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.status.pending {
  background-color: #e3fcef;
  color: #00a854;
}

.status.processing {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status.completed {
  background-color: #f6ffed;
  color: #52c41a;
}

.status.cancelled {
  background-color: #fff1f0;
  color: #f5222d;
}

.actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background-color: #e6f7ff;
  color: #1890ff;
}

.delete-btn {
  background-color: #fff1f0;
  color: #f5222d;
}

.edit-btn:hover {
  background-color: #bae7ff;
}

.delete-btn:hover {
  background-color: #ffccc7;
}

.text-center {
  text-align: center;
  color: #999;
  padding: 24px !important;
}

.no-data {
  text-align: center;
  padding: 40px !important;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #999;
}

.no-data-content i {
  font-size: 48px;
  color: #d9d9d9;
}
</style>
