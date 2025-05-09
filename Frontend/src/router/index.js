import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import ForgotPW from "../views/ForgotPW.vue";
const routes = [
  { path: "/", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  { path: "/forgotpw", name: "ForgotPW", component: ForgotPW },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
