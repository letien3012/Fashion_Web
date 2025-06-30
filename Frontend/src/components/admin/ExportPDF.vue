<template>
  <div ref="reportContent" class="report-container">
    <!-- Header with Logo and Meta -->
    <div class="report-header">
      <div class="header-left">
        <!-- Nếu có file logo thì dùng, nếu không thì dùng text JUNO -->
        <!-- <img src="/src/assets/images/juno-logo.png" alt="JUNO Logo" class="company-logo" /> -->
        <div class="company-logo company-logo-text">JUNO</div>
        <div class="company-info">
          <h1 class="company-name">JUNO SHOP</h1>
          <p class="company-details">Báo cáo doanh thu & thống kê sản phẩm</p>
        </div>
      </div>
      <div class="header-right">
        <div class="report-meta">
          <p><strong>Ngày tạo:</strong> {{ currentDate }}</p>
          <p><strong>Thời gian báo cáo:</strong> {{ timeRangeText }}</p>
        </div>
      </div>
    </div>

    <!-- Summary Box -->
    <div class="summary-box">
      <div class="summary-item">
        <span class="summary-label">Tổng doanh thu</span>
        <span class="summary-value">{{ formatCurrency(totalRevenue) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Tổng lợi nhuận</span>
        <span class="summary-value">{{ formatCurrency(totalProfit) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Tổng số đơn hàng</span>
        <span class="summary-value">{{ totalOrders }}</span>
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

    <!-- Signature & Footer -->
    <div class="signature-section">
      <div class="signature-block">
        <p><strong>Người lập báo cáo:</strong></p>
        <div class="signature-line"></div>
        <div class="signature-info">
          <div><strong>Họ tên:</strong> {{ employeeInfo.fullname }}</div>
          <div><strong>SĐT:</strong> {{ employeeInfo.phone }}</div>
          <div><strong>Vai trò:</strong> {{ employeeInfo.role }}</div>
        </div>
      </div>
    </div>
    <div class="watermark-footer">JUNO SHOP - www.juno.vn</div>
  </div>
</template>

<script setup>
import { ref, computed, defineExpose } from "vue";
import html2pdf from "html2pdf.js";
import { toast } from "vue3-toastify";

const props = defineProps({
  reportName: { type: String, default: "Báo cáo doanh thu" },
  timeFilter: { type: String, default: "month" },
  selectedYear: { type: Number, default: new Date().getFullYear() },
  selectedMonth: { type: Number, default: new Date().getMonth() + 1 },
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },
  salesData: { type: Array, default: () => [] },
  topProducts: { type: Array, default: () => [] },
  topProductsSummary: {
    type: Object,
    default: () => ({ totalProductsSold: 0, totalRevenue: 0, averagePrice: 0 }),
  },
  employeeName: { type: String, default: "Admin" },
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

// Summary values for the summary box
const totalRevenue = computed(() =>
  props.salesData.reduce((sum, item) => sum + (item.revenue || 0), 0)
);
const totalProfit = computed(() =>
  props.salesData.reduce((sum, item) => sum + (item.profit || 0), 0)
);
const totalOrders = computed(() =>
  props.salesData.reduce((sum, item) => sum + (item.orders || 0), 0)
);

// Get employee info from localStorage
const employeeInfo = computed(() => {
  let emp = localStorage.getItem("employee");
  if (!emp) return { fullname: "Admin", phone: "", role: "" };
  try {
    emp = JSON.parse(emp);
    return {
      fullname: emp.fullname || "Admin",
      phone: emp.phone || "",
      role: emp.role || "",
    };
  } catch {
    return { fullname: "Admin", phone: "", role: "" };
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
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
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
defineExpose({ exportPDF });
</script>

<style scoped>
.report-container {
  background: #fff;
  padding: 32px 32px 60px 32px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  position: relative;
}
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 18px;
  margin-bottom: 28px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 18px;
}
.company-logo {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: contain;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #eee;
  font-size: 2.1rem;
  font-weight: bold;
  color: #e53935;
  letter-spacing: 2px;
}
.company-logo-text {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(90deg, #e53935 60%, #fff 100%);
  color: #fff;
  text-shadow: 1px 1px 2px #e53935, 0 0 2px #fff;
}
.company-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.company-name {
  color: #e53935;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  letter-spacing: 1px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  text-transform: none;
}
.company-details {
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
}
.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.report-meta {
  font-size: 0.98rem;
  color: #495057;
  text-align: right;
}
.summary-box {
  display: flex;
  justify-content: space-between;
  background: #f8f9fa;
  border: 1.5px solid #dee2e6;
  border-radius: 10px;
  padding: 18px 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.summary-label {
  color: #6c757d;
  font-size: 1rem;
  font-weight: 500;
}
.summary-value {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: bold;
}
.section {
  margin-bottom: 32px;
}
.section-title {
  color: #0d6efd;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 16px;
  border-left: 4px solid #0d6efd;
  padding-left: 12px;
  background: #f4f8ff;
  border-radius: 4px;
}
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 20px;
  font-size: 0.98rem;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  overflow: hidden;
}
.data-table th,
.data-table td {
  border: 1px solid #dee2e6;
  padding: 10px 14px;
  text-align: left;
}
.data-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #495057;
  font-size: 1rem;
}
.data-table tr:nth-child(even) {
  background-color: #f4f8ff;
}
.data-table tr:nth-child(odd) {
  background-color: #fff;
}
.products-summary {
  margin-bottom: 18px;
}
.summary-stats {
  display: flex;
  gap: 18px;
  margin-bottom: 10px;
}
.signature-section {
  margin-top: 48px;
  display: flex;
  justify-content: flex-end;
}
.signature-block {
  text-align: right;
}
.signature-line {
  width: 180px;
  height: 1.5px;
  background: #495057;
  margin: 18px 0 6px 0;
  border-radius: 2px;
}
.signature-name {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
}
.watermark-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  text-align: center;
  color: #e0e0e0;
  font-size: 1.1rem;
  letter-spacing: 2px;
  user-select: none;
  pointer-events: none;
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
@media (max-width: 768px) {
  .report-container {
    padding: 12px;
  }
  .summary-box {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
  .summary-stats {
    flex-direction: column;
    gap: 8px;
  }
  .report-header {
    flex-direction: column;
    gap: 12px;
  }
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .header-right {
    align-items: flex-start;
  }
}
</style>
