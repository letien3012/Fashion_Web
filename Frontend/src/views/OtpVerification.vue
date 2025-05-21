<template>
  <div class="Otp-verify-page">
    <FormVerification />
  </div>
</template>

<script>
import FormVerification from "../components/FormVerification.vue";
export default {
  components: {
    FormVerification,
  },
};
</script>

<style scoped>
.Otp-verify-page {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
