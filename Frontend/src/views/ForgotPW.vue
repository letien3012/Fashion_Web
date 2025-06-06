<template>
  <Header></Header>
  <div class="register-page">
    <FormForgotPW />
  </div>
  <Footer></Footer>
  <Chatbot />
</template>

<script>
import FormForgotPW from "../components/FormForgotPW.vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Chatbot from "../components/Chatbot.vue";
export default {
  components: {
    FormForgotPW,
    Header,
    Footer,
    Chatbot,
  },
};
</script>

<style scoped>
.register-page {
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
