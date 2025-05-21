import AdminLogin from "../views/admin/AdminLogin.vue";
import AdminDashboard from "../views/admin/Dashboard.vue";

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
        path: "promotions",
        name: "AdminPromotions",
        component: () => import("../views/admin/PromotionList.vue"),
        meta: {
          requiresAuth: true,
          requiresAdmin: true
        }
      },
    ],
  },
];

export default adminRoutes;
