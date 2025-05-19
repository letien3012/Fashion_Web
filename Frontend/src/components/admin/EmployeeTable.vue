<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Ảnh</th>
          <th>Họ tên</th>
          <th>Email</th>
          <th>Vị trí</th>
          <th>Địa chỉ</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="employee in employees" :key="employee._id">
          <td>{{ employee._id }}</td>
          <td>
            <img
              :src="
                employee.image
                  ? `http://localhost:3005${employee.image}`
                  : '/default-avatar.png'
              "
              alt="Avatar"
              style="width: 40px; height: 40px; border-radius: 50%"
            />
          </td>
          <td>{{ employee.fullname }}</td>
          <td>{{ employee.email }}</td>
          <td>{{ employee.role }}</td>
          <td>{{ employee.address }}</td>
          <td>
            <span :class="['status', employee.publish ? 'active' : 'inactive']">
              {{ employee.publish ? "Đang làm việc" : "Đã nghỉ" }}
            </span>
          </td>
          <td class="actions">
            <button class="edit-btn" @click="$emit('edit', employee)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" @click="$emit('delete', employee)">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
        <tr v-if="employees.length === 0">
          <td colspan="8" class="text-center">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "EmployeeTable",
  props: {
    employees: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
@import "../../assets/styles/admin/table.css";
</style>
