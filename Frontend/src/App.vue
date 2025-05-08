<script setup>
import { ref, onMounted } from "vue";

const message = ref("Loading...");
onMounted(async () => {
  const res = await fetch("http://localhost:3005/api/hello");
  const data = await res.json();
  message.value = data.message;
});
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(
      to bottom,
      rgba(65, 184, 131, 0.6) 0%,
      rgba(131, 197, 190, 0.6) 100%
    ),
    url("./assets/images/bg.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  padding: 30px;
  box-sizing: border-box;
}
</style>
