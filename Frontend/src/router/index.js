import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import adminRoutes from "./admin";
import ForgotPW from "../views/ForgotPW.vue";
import Verification from "../views/OtpVerification.vue";
import CreatePW from "../views/CreatePW.vue";
import Home from "../views/Home.vue";
import About from "../views/About.vue";
import ProductDetail from "../views/ProductDetail.vue";
import CartDetail from "../views/CartDetail.vue";
import Checkout from "../views/Checkout.vue";
import Customer from "../views/Customer.vue";
import Profile from "../components/Profile.vue";
import ChangePW from "../views/ChangePW.vue";
import Products from "../views/Products.vue";
import FeatureUpload from "../views/FeatureUpload.vue";
import Search from "../views/Search.vue";
import WishList from "../views/WishList.vue";
import Outlet from "../views/Outlet.vue";
import ResetPW from "../components/FormResetPW.vue";
import StoreSystem from "../views/StoreSystem.vue";
import ReturnPolicy from "../views/ReturnPolicy.vue";
import PrivacyPolicy from "../views/PrivacyPolicy.vue";
import VnpayReturn from "../views/VnpayReturn.vue";
import PayosReturn from "../views/payos/PayosReturn.vue";
import PayosCancle from "../views/payos/PayosCancle.vue";

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
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPW,
  },
  {
    path: "/products",
    name: "Products",
    component: Products,
  },
  {
    path: "/feature-upload",
    name: "FeatureUpload",
    component: FeatureUpload,
    meta: {
      requiresAuth: false,
      requiresAdmin: false,
    },
  },
  {
    path: "/search",
    name: "Search",
    component: Search,
  },
  {
    path: "/wishlist",
    name: "WishList",
    component: WishList,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/outlet",
    name: "Outlet",
    component: Outlet,
  },
  {
    path: "/store-system",
    name: "store-system",
    component: StoreSystem,
  },
  {
    path: "/return-policy",
    name: "return-policy",
    component: ReturnPolicy,
  },
  {
    path: "/privacy-policy",
    name: "privacy-policy",
    component: PrivacyPolicy,
  },
  {
    path: "/vnpay-return",
    name: "VnpayReturn",
    component: VnpayReturn,
  },
  {
    path: "/paypal-return",
    component: () => import("../views/PaypalReturn.vue"),
  },
  {
    path: "/payos-return",
    component: PayosReturn,
  },
  {
    path: "/payos-cancle",
    component: PayosCancle,
  },
  ...adminRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

// Navigation guardMore actions

router.beforeEach((to, from, next) => {
  const isAdminAuthenticated = localStorage.getItem("token-admin");
  const isUserAuthenticated = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // Nếu route yêu cầu xác thực admin
  if (to.meta.requiresAdmin) {
    if (!isAdminAuthenticated || !isAdmin) {
      next("/admin/login");
    } else {
      next();
    }
  }
  // Nếu route yêu cầu xác thực user thường
  else if (to.meta.requiresAuth) {
    if (!isUserAuthenticated) {
      next("/login");
    } else {
      next();
    }
  }
  // Các route không yêu cầu xác thực
  else {
    next();
  }
});

export default router;
