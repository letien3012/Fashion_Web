<template>
  <div class="payos-return-container">
    <div class="payos-return-content">
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <h2>Đang xử lý thanh toán...</h2>
        <p>Vui lòng chờ trong giây lát</p>
      </div>

      <div v-else-if="paymentSuccess" class="success-section">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>Thanh toán thành công!</h2>
        <p class="subtext">
          Cảm ơn bạn đã mua hàng.<br />
          Đơn hàng của bạn đã được xác nhận.<br />
          Nếu cần hỗ trợ, vui lòng liên hệ CSKH.
        </p>
        <div class="action-buttons">
          <router-link to="/" class="btn btn-primary">
            <i class="fas fa-home"></i>
            Về trang chủ
          </router-link>
          <router-link to="/user" class="btn btn-secondary">
            <i class="fas fa-user"></i>
            Xem đơn hàng
          </router-link>
        </div>
      </div>

      <div v-else class="error-section">
        <div class="error-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <h2>Thanh toán không thành công</h2>
        <p class="subtext">
          Đã có lỗi xảy ra trong quá trình thanh toán.<br />
          Vui lòng thử lại hoặc liên hệ CSKH để được hỗ trợ.
        </p>
        <div v-if="errorMessage" class="error-details">
          <p><strong>Lỗi:</strong> {{ errorMessage }}</p>
        </div>
        <div class="action-buttons">
          <router-link to="/checkout" class="btn btn-primary">
            <i class="fas fa-credit-card"></i>
            Thử lại thanh toán
          </router-link>
          <router-link to="/cart" class="btn btn-secondary">
            <i class="fas fa-shopping-cart"></i>
            Về giỏ hàng
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import { payosService } from "../../services/payos.service";
import { orderService } from "../../services/order.service";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const paymentSuccess = ref(false);
const orderInfo = ref({});
const errorMessage = ref("");

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN").format(price);
};

const processPaymentReturn = async () => {
  try {
    const { orderCode, id, status, amount, signature } = route.query;
    const paymentId = id;

    if (!orderCode || !paymentId || !status) {
      throw new Error("Thiếu thông tin thanh toán");
    }

    // Xác thực thanh toán với backend
    const response = await payosService.verifyPayment(paymentId);

    if (response.success) {
      // Cập nhật trạng thái đơn hàng sang 'processing' và online_method_detail.status = 'PAID'
      try {
        // Lấy paymentUrl từ query hoặc localStorage nếu có
        let paymentUrl = route.query.paymentUrl;
        if (!paymentUrl) {
          const pendingOrder = localStorage.getItem("pendingPayosOrder");
          if (pendingOrder) {
            try {
              const parsed = JSON.parse(pendingOrder);
              paymentUrl = parsed.paymentUrl;
            } catch {}
          }
        }
        await orderService.updateOrderOnlineDetail(orderCode, {
          paymentId,
          paymentUrl,
          status: "PAID",
          paidAt: new Date(),
        });
        console.log("orderCode gửi lên:", orderCode);
        const statusRes = await orderService.updateOrderStatusByCode(
          orderCode,
          "processing"
        );
        console.log("Kết quả cập nhật trạng thái:", statusRes);
      } catch (e) {
        // Nếu cập nhật thất bại, vẫn giữ trạng thái pending
        console.error("Không thể cập nhật trạng thái đơn hàng:", e);
      }
      paymentSuccess.value = true;
      orderInfo.value = {
        orderCode,
        paymentId,
        status,
        amount: parseInt(amount),
      };

      // Xóa thông tin đơn hàng tạm thời nếu có
      localStorage.removeItem("pendingPayosOrder");

      toast.success("Thanh toán thành công!", {
        autoClose: 3000,
      });
    } else {
      throw new Error(response.message || "Xác thực thanh toán thất bại");
    }
  } catch (error) {
    console.error("PayOS verify error:", error.response?.data || error.message);
    paymentSuccess.value = false;
    errorMessage.value =
      error.message || "Có lỗi xảy ra trong quá trình xử lý thanh toán";

    toast.error("Thanh toán không thành công!", {
      autoClose: 3000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  processPaymentReturn();
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

.loading-section,
.success-section,
.error-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.success-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-icon {
  color: #10b981;
}

.error-icon {
  color: #ef4444;
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

.order-info {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  text-align: left;
  width: 100%;
}

.order-info p {
  margin: 0.5rem 0;
  color: #374151;
}

.order-info strong {
  color: #1f2937;
}

.error-details {
  background: #fef2f2;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.9rem;
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
