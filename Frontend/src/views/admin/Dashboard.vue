<template>
  <div class="dashboard">
    <h1>Welcome to Admin Dashboard</h1>
    <p>Logged in as: {{ employeeName }}</p>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      employeeName: ''
    }
  },
  created() {
    const employee = JSON.parse(localStorage.getItem('employee'));
    if (employee) {
      this.employeeName = employee.fullname;
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 1rem;
}
</style> 