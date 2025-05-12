<template>
  <div class="login-page">
    <FormLogin />
  </div>
</template>

<script>
import FormLogin from "../components/FormLogin.vue";
import axios from "axios";
import { toast } from 'vue3-toastify';

export default {
  name: "Login",
  components: {
    FormLogin
  },
  data() {
    return {
      email: "",
      password: "",
      loading: false,
    };
  },
  methods: {
    async handleLogin() {
      try {
        this.loading = true;
        const response = await axios.post("http://localhost:3005/api/customers/login", {
          email: this.email,
          password: this.password,
        });

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          toast.success("Đăng nhập thành công!");
          this.$router.push("/");
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Email hoặc mật khẩu không đúng!");
        } else {
          toast.error("Đăng nhập thất bại. Vui lòng thử lại sau!");
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  margin: none;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  width: 50vw;
  background: #f7f7f7;
}
</style>
