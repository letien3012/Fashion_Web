<template>
  <div class="register-page">
    <FormRegister />
  </div>
</template>

<script>
import FormRegister from "../components/FormRegister.vue";

export default {
  components: {
    FormRegister
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
  background: #f7f7f7;
}
</style>
