<template>
  <div class="paypal-return">
    <div v-if="loading">Đang xác thực thanh toán PayPal...</div>
    <div v-else-if="success">Thanh toán PayPal thành công! Cảm ơn bạn.</div>
    <div v-else>Thanh toán PayPal thất bại. Vui lòng thử lại.</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { paypalService } from "../services/paypal.service";
import { orderService } from "../services/order.service";
import { toast } from "vue3-toastify";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const success = ref(false);

onMounted(async () => {
  const orderId = route.query.token;
  let orderData = null;
  try {
    orderData = JSON.parse(localStorage.getItem("pendingPaypalOrder"));
  } catch {}
  if (!orderId) {
    loading.value = false;
    success.value = false;
    // Lưu đơn hàng thất bại nếu có orderData
    if (orderData) {
      await orderService.create({
        ...orderData,
        paypalOrderId: orderId,
        paypalStatus: "fail",
      });
      localStorage.removeItem("pendingPaypalOrder");
    }
    return;
  }
  try {
    const res = await paypalService.captureOrder(orderId);
    if (res.success) {
      success.value = true;
      toast.success("Thanh toán PayPal thành công!");
      // Lưu đơn hàng thành công
      if (orderData) {
        const orderResponse = await orderService.create({
          ...orderData,
          paypalOrderId: orderId,
          paypalStatus: "success",
        });

        // Email đã được gửi tự động từ backend khi tạo đơn hàng
        // Không cần gửi email ở đây nữa

        localStorage.removeItem("pendingPaypalOrder");
      }
      setTimeout(() => router.push("/"), 2000);
    } else {
      success.value = false;
      toast.error("Xác thực PayPal thất bại!");
      // Lưu đơn hàng thất bại
      if (orderData) {
        await orderService.create({
          ...orderData,
          paypalOrderId: orderId,
          paypalStatus: "fail",
        });
        localStorage.removeItem("pendingPaypalOrder");
      }
    }
  } catch (e) {
    success.value = false;
    toast.error("Có lỗi khi xác thực PayPal!");
    // Lưu đơn hàng thất bại
    if (orderData) {
      await orderService.create({
        ...orderData,
        paypalOrderId: orderId,
        paypalStatus: "fail",
      });
      localStorage.removeItem("pendingPaypalOrder");
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.paypal-return {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #2c3e50;
}
</style>
