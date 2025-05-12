<template>
    <div><Header></Header></div>
    <div class="register-page">
      <FormForgotPW />
    </div>
  </template>
  
  <script>
  import FormForgotPW from "../components/FormForgotPW.vue";
  import Header from "../components/Header.vue";
  export default {
    components: {
        FormForgotPW,
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
    background: #f7f7f7;
  }
  </style>
  