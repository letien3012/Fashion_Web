const adminRoutes = [
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
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
      },
      {
        path: 'employees',
        name: 'EmployeeList',
        component: () => import('../views/admin/EmployeeList.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  }
]

export default adminRoutes
