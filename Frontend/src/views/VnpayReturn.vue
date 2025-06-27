<template>
  <div class="vnpay-return-container">
    <h1>Kết quả thanh toán VNPAY</h1>
    <div v-if="loading">Đang xác thực kết quả thanh toán...</div>
    <div v-else>
      <div v-if="success" class="success-message">
        <i class="fas fa-check-circle"></i>
        Thanh toán thành công! Cảm ơn bạn đã mua hàng.
      </div>
      <div v-else class="error-message">
        <i class="fas fa-times-circle"></i>
        Thanh toán thất bại hoặc bị hủy. Vui lòng thử lại hoặc liên hệ hỗ trợ.
      </div>
      <router-link to="/" class="back-home">Quay về trang chủ</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const loading = ref(true);
const success = ref(false);

onMounted(() => {
  // Xử lý query string trả về từ VNPAY
  const params = route.query;
  // Có thể kiểm tra vnp_ResponseCode === '00' là thành công
  if (params.vnp_ResponseCode === "00") {
    success.value = true;
  } else {
    success.value = false;
  }
  loading.value = false;
});
</script>

<style scoped>
.vnpay-return-container {
  max-width: 500px;
  margin: 60px auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
}
.success-message {
  color: #10b981;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}
.error-message {
  color: #ef4444;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}
.back-home {
  display: inline-block;
  margin-top: 1rem;
  color: #2563eb;
  text-decoration: underline;
  font-weight: 500;
}
.success-message i,
.error-message i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
</style>
