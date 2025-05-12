<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

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
  padding: 0px 30px;
  box-sizing: border-box;
}
</style>
