<template>
  <Header></Header>
  <div class="login-page">
    <FormLogin :loading="loading" @submit-login="handleLogin" />
  </div>
  <Footer></Footer>
</template>

<script>
import FormLogin from "../components/FormLogin.vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import axios from "axios";
import { toast } from "vue3-toastify";

export default {
  name: "Login",
  components: {
    FormLogin,
    Header,
    Footer,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async handleLogin(loginData) {
      try {
        this.loading = true;
        console.log(loginData);
        const response = await axios.post(
          "http://localhost:3005/api/customers/login",
          loginData
        );

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.customer));
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
.login-container {
  width: 100%;
  min-height: 100vh;
}

.login-page {
  margin: 20px auto;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  width: 50vw;
  background: #f7f7f7;
}
</style>
