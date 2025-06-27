<template>
  <div ref="reportContent" class="report-container">
    <!-- Header -->
    <div class="report-header">
      <div class="company-info">
        <h2 class="company-name">FASHION STORE</h2>
        <p class="company-details">Báo cáo doanh thu và thống kê sản phẩm</p>
      </div>
      <div class="report-meta">
        <p><strong>Ngày tạo:</strong> {{ currentDate }}</p>
        <p><strong>Thời gian báo cáo:</strong> {{ timeRangeText }}</p>
      </div>
    </div>

    <!-- Revenue Chart Data -->
    <div class="section">
      <h3 class="section-title">Biểu đồ doanh thu theo thời gian</h3>
      <div class="chart-data">
        <table class="data-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Doanh thu</th>
              <th>Lợi nhuận</th>
              <th>Số đơn hàng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in salesData" :key="index">
              <td>{{ item.label }}</td>
              <td>{{ formatCurrency(item.revenue) }}</td>
              <td>{{ formatCurrency(item.profit) }}</td>
              <td>{{ item.orders }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Top Products -->
    <div class="section">
      <h3 class="section-title">Top sản phẩm bán chạy</h3>
      <div class="products-summary">
        <div class="summary-stats">
          <div class="summary-item">
            <span class="label">Tổng sản phẩm đã bán:</span>
            <span class="value">{{
              topProductsSummary.totalProductsSold
            }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Doanh thu sản phẩm:</span>
            <span class="value">{{
              formatCurrency(topProductsSummary.totalRevenue)
            }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Đơn giá trung bình:</span>
            <span class="value">{{
              formatCurrency(topProductsSummary.averagePrice)
            }}</span>
          </div>
        </div>
      </div>

      <div class="products-table">
        <table class="data-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Sản phẩm</th>
              <th>Mã SKU</th>
              <th>Đã bán</th>
              <th>Doanh thu</th>
              <th>Tỷ lệ (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(product, index) in topProducts"
              :key="product.productId"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ product.name || "Chưa có tên" }}</td>
              <td>
                {{
                  Array.isArray(product.sku)
                    ? product.sku.join(", ")
                    : product.sku
                }}
              </td>
              <td>{{ product.totalQuantity }}</td>
              <td>{{ formatCurrency(product.totalRevenue) }}</td>
              <td>
                {{
                  calculatePercentage(
                    product.totalQuantity,
                    topProducts[0]?.totalQuantity
                  )
                }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div class="report-footer">
      <p>
        <strong>Ghi chú:</strong> Báo cáo được tạo tự động từ hệ thống quản lý
        Fashion Store
      </p>
      <p><strong>Người tạo:</strong> {{ employeeName }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineExpose } from "vue";
import html2pdf from "html2pdf.js";
import { toast } from "vue3-toastify";

const props = defineProps({
  reportName: {
    type: String,
    default: "Báo cáo doanh thu",
  },
  timeFilter: {
    type: String,
    default: "month",
  },
  selectedYear: {
    type: Number,
    default: new Date().getFullYear(),
  },
  selectedMonth: {
    type: Number,
    default: new Date().getMonth() + 1,
  },
  startDate: {
    type: String,
    default: "",
  },
  endDate: {
    type: String,
    default: "",
  },
  salesData: {
    type: Array,
    default: () => [],
  },
  topProducts: {
    type: Array,
    default: () => [],
  },
  topProductsSummary: {
    type: Object,
    default: () => ({
      totalProductsSold: 0,
      totalRevenue: 0,
      averagePrice: 0,
    }),
  },
  employeeName: {
    type: String,
    default: "Admin",
  },
});

const reportContent = ref(null);

// Computed properties
const currentDate = computed(() => {
  return new Date().toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const timeRangeText = computed(() => {
  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  switch (props.timeFilter) {
    case "year":
      return `Năm ${props.selectedYear}`;
    case "month":
      return `${months[props.selectedMonth - 1]} năm ${props.selectedYear}`;
    case "custom":
      return `Từ ${formatDate(props.startDate)} đến ${formatDate(
        props.endDate
      )}`;
    default:
      return "Không xác định";
  }
});

// Methods
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0 ₫";
  return value.toLocaleString("vi-VN") + " ₫";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

const exportPDF = () => {
  const filename = `bao-cao-doanh-thu-${props.timeFilter}-${Date.now()}.pdf`;

  html2pdf()
    .from(reportContent.value)
    .set({
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    })
    .save()
    .then(() => {
      toast.success("Báo cáo PDF đã được tạo thành công!");
    })
    .catch((error) => {
      console.error("Lỗi khi tạo PDF:", error);
      toast.error("Lỗi khi tạo báo cáo PDF");
    });
};

// Cho phép gọi exportPDF từ component cha
defineExpose({ exportPDF });
</script>

<style scoped>
.report-container {
  background: white;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  max-width: 800px;
  margin: 0 auto;
}

.report-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.company-name {
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 24px;
  font-weight: bold;
}

.company-details {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 14px;
}

.report-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6c757d;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  color: #2c3e50;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 12px;
}

.data-table th,
.data-table td {
  border: 1px solid #dee2e6;
  padding: 8px 12px;
  text-align: left;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #495057;
}

.data-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.products-summary {
  margin-bottom: 20px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.summary-item .label {
  font-weight: 500;
  color: #495057;
}

.summary-item .value {
  font-weight: bold;
  color: #2c3e50;
}

.report-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
  font-size: 12px;
  color: #6c757d;
  text-align: center;
}

.report-footer p {
  margin: 5px 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .report-container {
    padding: 15px;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .report-meta {
    flex-direction: column;
    gap: 5px;
  }

  .data-table {
    font-size: 11px;
  }

  .data-table th,
  .data-table td {
    padding: 6px 8px;
  }
}
</style>
