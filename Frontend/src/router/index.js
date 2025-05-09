import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import adminRoutes from './admin';

const routes = [
  { path: "/", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  {
    path: '/',
    redirect: '/admin'
  },
  ...adminRoutes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
