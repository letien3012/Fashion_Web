<template>
  <div><Header></Header></div>
  <div>
    <FormVerification />
  </div>
</template>

<script>
import FormVerification from "../components/FormVerification.vue";
import Header from "../components/Header.vue";
export default {
  components: {
    FormVerification,
    Header,
  },
};
</script>
