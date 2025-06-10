<template>
  <Header></Header>
  <div class="createPW-page"><FormCreatePw /></div>
  <Footer></Footer>
  <Chatbot />
</template>

<script>
import FormCreatePw from "../components/FormCreatePW.vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Chatbot from "../components/Chatbot.vue";
export default {
  components: {
    FormCreatePw,
    Header,
    Footer,
    Chatbot,
  },
};
</script>

<style scoped>
.createPW-page {
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
