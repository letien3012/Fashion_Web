import AdminLogin from "../views/admin/AdminLogin.vue";
import AdminDashboard from "../views/admin/Dashboard.vue";
import AdminDashboardTest from "../views/admin/DashboardTest.vue";
import BannerList from "../views/admin/BannerList.vue";
import CustomerList from "../views/admin/CustomerList.vue";

const adminRoutes = [
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: AdminLogin,
    meta: { requiresAuth: false },
  },
  {
    path: "/admin",
    component: () => import("../views/admin/AdminLayout.vue"),
    children: [
      {
        path: "",
        redirect: "/admin/dashboard",
      },
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "dashboardTest",
        name: "AdminDashboardTest",
        component: AdminDashboardTest,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "employees",
        name: "EmployeeList",
        component: () => import("../views/admin/EmployeeList.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "attribute-catalogues",
        name: "AttributeCatalogueList",
        component: () => import("../views/admin/AttributeCatalogueList.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "product-catalogues",
        name: "ProductCatalogueList",
        component: () => import("../views/admin/ProductCatalogueList.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "products",
        name: "ProductList",
        component: () => import("../views/admin/ProductList.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "suppliers",
        name: "admin-suppliers",
        component: () => import("../views/admin/SupplierList.vue"),
        meta: {
          requiresAuth: true,
          title: "Quản lý nhà cung cấp",
        },
      },
      {
        path: "import-receipts",
        name: "ImportReceiptList",
        component: () => import("../views/admin/ImportReceiptList.vue"),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Quản lý phiếu nhập hàng",
        },
      },
      {
        path: "consignments",
        name: "ConsignmentList",
        component: () => import("../views/admin/ConsignmentList.vue"),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Quản lý kho hàng",
        },
      },
      {
        path: "promotions",
        name: "AdminPromotions",
        component: () => import("../views/admin/PromotionList.vue"),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: "orders",
        name: "OrderList",
        component: () => import("../views/admin/OrderList.vue"),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Quản lý đơn hàng",
        },
      },
      {
        path: "banners",
        name: "AdminBannerList",
        component: BannerList,
        meta: {
          requiresAdmin: true,
        },
      },
      {
        path: "Customers",
        name: "CustomerList",
        component: CustomerList,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "reviews",
        name: "ReviewList",
        component: () => import("../views/admin/ReviewList.vue"),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Quản lý đánh giá",
        },
      },
    ],
  },
];

export default adminRoutes;
