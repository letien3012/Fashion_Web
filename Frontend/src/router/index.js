import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import adminRoutes from "./admin";
import ForgotPW from "../views/ForgotPW.vue";
import Verification from "../views/OtpVerification.vue";
//import AuthCallback from "../views/AuthCallback.vue";
import About from "../views/About.vue";
import Home from "../views/Home.vue";
import ProductDetail from "../views/ProductDetail.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  { path: "/forgotpw", name: "ForgotPW", component: ForgotPW },
  { path: "/verification", name: "VerificationOtp", component: Verification },
  {
    path: "/forgotpw",
    name: "ForgotPW",
    component: ForgotPW,
  },
  //{
  //  path: "/auth/callback",
  //  name: "AuthCallback",
  //  component: AuthCallback,
  //},
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/product-detail",
    name: "ProductDetail",
    component: ProductDetail,
  },
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
