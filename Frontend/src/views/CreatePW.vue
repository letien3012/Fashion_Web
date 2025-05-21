<template>
  <div class="createPW-page"><FormCreatePw /></div>
</template>

<script>
import FormCreatePw from "../components/FormCreatePW.vue";
import Header from "../components/Header.vue";
export default {
  components: {
    FormCreatePw,
    Header,
  },
};
</script>

<style scoped>
.createPW-page {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
