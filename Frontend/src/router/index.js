import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import adminRoutes from "./admin";
import ForgotPW from "../views/ForgotPW.vue";
import Verification from "../views/OtpVerification.vue";
import CreatePW from "../views/CreatePW.vue";
import Home from "../views/Home.vue";
import ImageSearch from "../views/ImageSearch.vue";
import About from "../views/About.vue";
import ProductDetail from "../views/ProductDetail.vue";
import CartDetail from "../views/CartDetail.vue";
import Checkout from "../views/Checkout.vue";
import Customer from "../views/Customer.vue";
import Profile from "../components/Profile.vue";
import ChangePW from "../views/ChangePW.vue";
import Products from "../views/Products.vue";

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
  { path: "/createpw", name: "CreatePW", component: CreatePW },
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
    path: "/product-detail/:id",
    name: "ProductDetail",
    component: ProductDetail,
  },
  {
    path: "/imageSearch",
    name: "ImageSearch",
    component: ImageSearch,
  },
  {
    path: "/cart",
    name: "Cart",
    component: CartDetail,
    meta: { requiresAuth: true },
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: Checkout,
    meta: { requiresAuth: true },
  },
  {
    path: "/user",
    name: "Customer",
    component: Customer,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/change-password",
    name: "ChangePW",
    component: ChangePW,
  },
  {
    path: "/products",
    name: "Products",
    component: Products,
  },
  ...adminRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStr = localStorage.getItem("user");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (to.meta.requiresAuth && !userStr) {
    next("/login");
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next("/admin/login");
  } else {
    next();
  }
});

export default router;
