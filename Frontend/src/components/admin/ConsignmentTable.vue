<template>
  <div class="consignment-table">
    <table>
      <thead>
        <tr>
          <th>Mã lô hàng</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="group in groupedConsignments" :key="group.prefix">
          <tr>
            <td>
              <div class="consignment-info">
                <span class="prefix">{{ group.prefix }}</span>
                <span class="count"
                  >({{ group.consignments.length }} chi tiết)</span
                >
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  class="edit-btn"
                  @click="$emit('edit', group.consignments[0])"
                >
                  <i class="fas fa-edit"></i>
                </button>
              </div>
            </td>
          </tr>
        </template>
        <tr v-if="groupedConsignments.length === 0">
          <td colspan="2" class="no-data">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "ConsignmentTable",
  props: {
    consignments: {
      type: Array,
      required: true,
    },
  },
  computed: {
    groupedConsignments() {
      if (!this.consignments || !this.consignments.length) return [];

      const groups = {};
      this.consignments.forEach((consignment) => {
        if (!consignment || !consignment.code) return;

        const prefix = consignment.code.split("-")[0];
        if (!groups[prefix]) {
          groups[prefix] = {
            prefix,
            consignments: [],
          };
        }
        groups[prefix].consignments.push(consignment);
      });
      return Object.values(groups);
    },
  },
};
</script>

<style scoped>
.consignment-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th {
  background: #fafafa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #262626;
}

.consignment-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prefix {
  font-weight: 500;
  color: #1890ff;
}

.count {
  color: #8c8c8c;
  font-size: 0.9em;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #e6f7ff;
  color: #1890ff;
}

.edit-btn:hover {
  background: #bae7ff;
}

.no-data {
  text-align: center;
  color: #8c8c8c;
  padding: 24px;
}
</style>
