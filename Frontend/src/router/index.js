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
  ...adminRoutes
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
    next('/admin/login')
  } else {
    next()
  }
})

export default router;