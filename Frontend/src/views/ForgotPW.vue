<template>
    <Header></Header>
    <div class="forgotpw-page">
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
.forgotpw-page {
    margin: none;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
    width: 50vw; 
}
</style>
