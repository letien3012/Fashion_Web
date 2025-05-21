<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Mã</th>
          <th>Tên</th>
          <th>Loại</th>
          <th>Giảm giá</th>
          <th>Trạng thái</th>
          <th>Thời gian</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="promotion in promotions" :key="promotion._id">
          <td>{{ promotion.code }}</td>
          <td>{{ promotion.name }}</td>
          <td>
            <span :class="getTypeBadgeClass(promotion.type)">
              {{ getTypeLabel(promotion.type) }}
            </span>
          </td>
          <td>{{ promotion.discount }}%</td>
          <td>
            <span :class="getStatusBadgeClass(promotion.publish)">
              {{ getStatusLabel(promotion.publish) }}
            </span>
          </td>
          <td>
            <div>{{ formatDate(promotion.start_date) }}</div>
            <div>{{ formatDate(promotion.end_date) }}</div>
          </td>
          <td class="actions">
            <button class="edit-btn" @click="editPromotion(promotion)" title="Sửa">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" @click="confirmDelete(promotion)" title="Xóa">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Delete Confirmation Modal -->
  <div class="modal fade" :class="{ show: showDeleteModal }" v-if="showDeleteModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Xác nhận xóa</h5>
          <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
        </div>
        <div class="modal-body">
          <p>Bạn có chắc chắn muốn xóa khuyến mãi "{{ selectedPromotion?.name }}" không?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
            Hủy
          </button>
          <button type="button" class="btn btn-danger" @click="deletePromotion">
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'PromotionTable',
  props: {
    promotions: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    showForm: {
      type: Boolean,
      required: true
    },
    selectedPromotion: {
      type: Object,
      default: null
    }
  },
  emits: ['edit', 'delete', 'saved', 'close-form'],
  setup(props, { emit }) {
    const showDeleteModal = ref(false);
    const selectedPromotion = ref(null);

    const editPromotion = (promotion) => {
      console.log('Table: Emitting edit event for promotion:', promotion);
      emit('edit', promotion);
    };

    const closeForm = () => {
      console.log('Table: Emitting close-form event');
      emit('close-form');
    };

    const confirmDelete = (promotion) => {
      selectedPromotion.value = promotion;
      showDeleteModal.value = true;
    };

    const deletePromotion = () => {
      emit('delete', selectedPromotion.value);
      showDeleteModal.value = false;
    };

    const handleSaved = () => {
      console.log('Table: Emitting saved event');
      emit('saved');
    };

    const getTypeLabel = (type) => {
      return type === 'product' ? 'Giảm giá sản phẩm' : 'Voucher';
    };

    const getTypeBadgeClass = (type) => {
      return {
        'badge bg-primary': type === 'product',
        'badge bg-success': type === 'voucher'
      };
    };

    const getStatusLabel = (status) => {
      return status === 'active' ? 'Đang áp dụng' : 'Không áp dụng';
    };

    const getStatusBadgeClass = (status) => {
      return {
        'badge bg-success': status === 'active',
        'badge bg-secondary': status === 'inactive'
      };
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('vi-VN');
    };

    return {
      showDeleteModal,
      selectedPromotion,
      editPromotion,
      closeForm,
      confirmDelete,
      deletePromotion,
      handleSaved,
      getTypeLabel,
      getTypeBadgeClass,
      getStatusLabel,
      getStatusBadgeClass,
      formatDate
    };
  }
};
</script>

<style scoped>
@import "../../assets/styles/admin/table.css";
</style> 