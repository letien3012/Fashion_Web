<template>
  <div><Header></Header></div>
  <div class="register-page">
    <FormRegister />
  </div>
</template>

<script>
import FormRegister from "../components/FormRegister.vue";
import Header from "../components/Header.vue";
export default {
  components: {
    FormRegister,
    Header
  }
};
</script>

<style scoped>
.register-page {
  margin: none;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  width: 50vw;
}
</style>
