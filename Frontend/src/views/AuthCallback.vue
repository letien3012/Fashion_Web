<template>
  <div class="auth-callback">
    <div v-if="loading" class="loading">
      Đang xử lý đăng nhập...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { toast } from "vue3-toastify";

export default {
  name: "AuthCallback",
  data() {
    return {
      loading: true,
      error: null,
    };
  },
  async created() {
    try {
      // Lấy token từ URL
      const token = this.$route.query.token;
      
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      // Lưu token vào localStorage
      localStorage.setItem("token", token);

      // Thông báo thành công
      toast.success("Đăng nhập thành công!");

      // Chuyển hướng về trang chủ
      this.$router.push("/");
    } catch (error) {
      console.error("Auth callback error:", error);
      this.error = "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(this.error);
      
      // Chuyển hướng về trang đăng nhập sau 3 giây
      setTimeout(() => {
        this.$router.push("/login");
      }, 3000);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped>
.auth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.loading {
  font-size: 1.2rem;
  color: #666;
}

.error {
  color: #dc3545;
  font-size: 1.2rem;
}
</style> 