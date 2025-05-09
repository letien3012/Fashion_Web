import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import adminRoutes from './admin';

const routes = [
  { 
    path: "/", 
    name: "Login", 
    component: Login 
  },
  { 
    path: "/register", 
    name: "Register", 
    component: Register 
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'  // Redirect đến dashboard
      },
      {
        path: 'login',
        name: 'AdminLogin',
        component: () => import('../views/admin/AdminLogin.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
  ...adminRoutes // Chỉ giữ lại phần import admin routes
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  const isAdmin = localStorage.getItem('isAdmin') === 'true'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/admin/login')
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router;
