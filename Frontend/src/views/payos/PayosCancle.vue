<template>
  <div class="payos-return-container">
    <div class="payos-return-content">
      <div class="error-icon">
        <i class="fas fa-times-circle"></i>
      </div>
      <h2>Thanh toán đã bị hủy</h2>
      <p class="subtext">
        Bạn đã hủy thanh toán qua PayOS.<br />
        Đơn hàng của bạn vẫn ở trạng thái <b>chờ thanh toán</b>.<br />
        Nếu cần hỗ trợ, vui lòng liên hệ CSKH.
      </p>
      <div class="action-buttons">
        <router-link to="/cart" class="btn btn-primary">
          <i class="fas fa-shopping-cart"></i>
          Quay lại giỏ hàng
        </router-link>
        <router-link to="/" class="btn btn-secondary">
          <i class="fas fa-home"></i>
          Về trang chủ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { orderService } from "../../services/order.service";

const route = useRoute();

onMounted(async () => {
  const { orderCode, id, paymentUrl } = route.query;
  let url = paymentUrl;
  // Nếu không có paymentUrl trên query, thử lấy từ localStorage (nếu trước đó đã lưu)
  if (!url) {
    const pendingOrder = localStorage.getItem("pendingPayosOrder");
    if (pendingOrder) {
      try {
        const parsed = JSON.parse(pendingOrder);
        url = parsed.paymentUrl;
      } catch {}
    }
  }
  if (orderCode && id) {
    // Gọi API cập nhật online_method_detail cho order
    try {
      await orderService.updateOrderOnlineDetail(orderCode, {
        paymentId: id,
        paymentUrl: url,
        status: "cancelled",
        cancelledAt: new Date(),
      });
    } catch (e) {
      // Không cần xử lý lỗi ở đây
    }
  }
});
</script>

<style scoped>
.payos-return-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}
.payos-return-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 650px;
  width: 100%;
}
.error-icon {
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 1rem;
}
h2 {
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}
.subtext {
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}
.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.btn-primary {
  background: #667eea;
  color: white;
}
.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}
.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
@media (max-width: 576px) {
  .payos-return-content {
    padding: 2rem 1.5rem;
    margin: 1rem;
    max-width: 98vw;
  }
  h2 {
    font-size: 1.5rem;
  }
  .subtext {
    font-size: 1rem;
  }
  .action-buttons {
    flex-direction: column;
  }
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
