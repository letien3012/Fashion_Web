<template>
  <div class="login-page">
    <FormLogin />
  </div>
</template>

<script>
import FormLogin from "../components/FormLogin.vue";

export default {
  components: {
    FormLogin
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
  height: 80vh;
  width: 50vw;
  background: #f7f7f7;
}
</style>
