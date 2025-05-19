import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import adminRoutes from "./admin";
import ForgotPW from "../views/ForgotPW.vue";
<<<<<<< HEAD
import Verification from "../views/OtpVerification.vue";
=======
import AuthCallback from "../views/AuthCallback.vue";
>>>>>>> 6fe69737aa2c255c5eaad4635240370470430f36

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
<<<<<<< HEAD
  { path: "/forgotpw", name: "ForgotPW", component: ForgotPW },
  { path: "/verification", name: "VerificationOtp", component: Verification },
=======
  {
    path: "/forgotpw",
    name: "ForgotPW",
    component: ForgotPW,
  },
  {
    path: "/auth/callback",
    name: "AuthCallback",
    component: AuthCallback,
  },
>>>>>>> 6fe69737aa2c255c5eaad4635240370470430f36
  ...adminRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/admin/login");
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next("/admin/login");
  } else {
    next();
  }
});

export default router;
