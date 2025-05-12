<template>
  <div><Header></Header></div>
  <div class="login-page">
    <FormLogin />
  </div>
</template>

<script>
import FormLogin from "../components/FormLogin.vue";
import Header from "../components/Header.vue";
export default {
  components: {
    FormLogin,
    Header
  }
};
</script>

<style scoped>
.login-page {
  margin: none;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  width: 50vw;
  background: #f7f7f7;
}
</style>
