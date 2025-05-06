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
  <h1>{{ message }}</h1>
</template>
