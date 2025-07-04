<template>
  <div class="container-fluid py-4">
    <div class="row g-4 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <div class="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
              <i class="fas fa-shopping-cart text-primary fs-4"></i>
            </div>
            <div>
              <h6 class="card-subtitle text-muted mb-1">Tổng đơn hàng</h6>
              <h3 class="card-title mb-0">
                {{ totalOrders !== null ? totalOrders : "Đang tải..." }}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <div class="rounded-circle bg-success bg-opacity-10 p-3 me-3">
              <i class="fas fa-users text-success fs-4"></i>
            </div>
            <div>
              <h6 class="card-subtitle text-muted mb-1">Tổng khách hàng</h6>
              <h3 class="card-title mb-0">
                {{ totalCustomers !== null ? totalCustomers : "Đang tải..." }}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <div class="rounded-circle bg-info bg-opacity-10 p-3 me-3">
              <i class="fas fa-box text-info fs-4"></i>
            </div>
            <div>
              <h6 class="card-subtitle text-muted mb-1">Tổng sản phẩm</h6>
              <h3 class="card-title mb-0">
                {{ totalProducts !== null ? totalProducts : "Đang tải..." }}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <div class="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
              <i class="fas fa-dollar-sign text-warning fs-4"></i>
            </div>
            <div>
              <h6 class="card-subtitle text-muted mb-1">Tổng doanh thu</h6>
              <h3 class="card-title mb-0">
                {{
                  totalRevenue !== null
                    ? formatCurrency(totalRevenue)
                    : "Đang tải..."
                }}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4" style="margin-bottom: 20px">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="dashboard-toolbar">
              <h5 class="toolbar-title">Thống kê doanh thu</h5>
              <div class="toolbar-filters">
                <select
                  class="toolbar-select"
                  v-model="timeFilter"
                  @change="updateChart"
                >
                  <option value="year">Theo năm</option>
                  <option value="month">Theo tháng</option>
                  <option value="custom">Tùy chọn</option>
                </select>
                <select
                  v-if="timeFilter === 'year'"
                  class="toolbar-select"
                  v-model="selectedYear"
                  @change="updateChart"
                >
                  <option v-for="year in years" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
                <div v-if="timeFilter === 'month'" class="toolbar-row">
                  <select
                    class="toolbar-select"
                    v-model="selectedMonth"
                    @change="updateChart"
                  >
                    <option
                      v-for="(month, index) in months"
                      :key="index"
                      :value="index + 1"
                    >
                      {{ month }}
                    </option>
                  </select>
                  <select
                    class="toolbar-select"
                    v-model="selectedYear"
                    @change="updateChart"
                  >
                    <option v-for="year in years" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
                <div v-if="timeFilter === 'custom'" class="toolbar-row">
                  <input
                    type="date"
                    class="toolbar-select"
                    v-model="startDate"
                    @change="updateChart"
                  />
                  <span class="toolbar-between">đến</span>
                  <input
                    type="date"
                    class="toolbar-select"
                    v-model="endDate"
                    @change="updateChart"
                  />
                </div>
              </div>
              <button class="toolbar-btn" @click="exportPDF">
                <i class="bi bi-file-earmark-pdf-fill"></i> Xuất PDF
              </button>
            </div>
            <div style="height: 400px">
              <canvas ref="salesChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-12 col-xl-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="card-title mb-0">Top sản phẩm bán chạy</h5>
            </div>

            <div class="row mb-4">
              <div class="col-md-4">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">Tổng sản phẩm đã bán</h6>
                  <h3 class="mb-0">
                    {{ topProductsSummary?.totalProductsSold ?? "Đang tải..." }}
                  </h3>
                </div>
              </div>
              <div class="col-md-4">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">Doanh thu sản phẩm</h6>
                  <h3 class="mb-0">
                    {{
                      formatCurrency(topProductsSummary?.totalRevenue) ||
                      "Đang tải..."
                    }}
                  </h3>
                </div>
              </div>
              <div class="col-md-4">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">Đơn giá trung bình</h6>
                  <h3 class="mb-0">
                    {{
                      formatCurrency(topProductsSummary?.averagePrice) ||
                      "Đang tải..."
                    }}
                  </h3>
                </div>
              </div>
            </div>

            <div class="table-responsive mb-4">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th class="text-center">Đã bán</th>
                    <th class="text-center">Doanh thu</th>
                    <th class="text-center">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(product, idx) in topProducts"
                    :key="product.productId"
                  >
                    <td>
                      <div class="d-flex align-items-center">
                        <img
                          :src="
                            product.image
                              ? `${backendUrl}${product.image}`
                              : 'https://via.placeholder.com/50'
                          "
                          class="rounded me-3"
                          alt="Product"
                          style="width: 50px; height: 50px; object-fit: cover"
                        />
                        <div>
                          <h6
                            class="mb-0 text-truncate"
                            style="max-width: 200px"
                          >
                            {{ product.name || "Chưa có tên" }}
                          </h6>
                          <small class="text-muted"
                            >Mã:
                            {{
                              Array.isArray(product.sku)
                                ? product.sku.join(", ")
                                : product.sku
                            }}</small
                          >
                        </div>
                      </div>
                    </td>
                    <td class="text-center">{{ product.totalQuantity }}</td>
                    <td class="text-center">
                      {{ formatCurrency(product.totalRevenue) }}
                    </td>
                    <td class="text-center">
                      <div class="progress" style="height: 5px">
                        <div
                          class="progress-bar bg-primary"
                          :style="{
                            width:
                              (product.totalQuantity /
                                (topProducts[0]?.totalQuantity || 1)) *
                                100 +
                              '%',
                          }"
                        ></div>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="topProducts.length === 0">
                    <td colspan="4" class="text-center text-muted">
                      Không có dữ liệu
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Sản phẩm bán chạy</h5>
            <div style="height: 400px">
              <canvas ref="productsChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Trạng thái đơn hàng</h5>
            <div style="height: 300px">
              <canvas ref="orderStatusChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Khách hàng mới</h5>
            <div style="height: 300px">
              <canvas ref="newCustomersChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Export PDF Component (hidden) -->
  <div style="position: absolute; left: -9999px; top: -9999px">
    <ExportPDF
      ref="exportPDFRef"
      :time-filter="timeFilter"
      :selected-year="selectedYear"
      :selected-month="selectedMonth"
      :start-date="startDate"
      :end-date="endDate"
      :sales-data="salesDataForPDF"
      :top-products="topProducts"
      :top-products-summary="
        topProductsSummary || {
          totalProductsSold: 0,
          totalRevenue: 0,
          averagePrice: 0,
        }
      "
      :employee-name="employeeName"
    />
  </div>
</template>

<script>
import Chart from "chart.js/auto";
import axios from "axios";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ExportPDF from "@/components/admin/ExportPDF.vue";

export default {
  name: "AdminDashboard",
  components: {
    ExportPDF,
  },
  data() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.toISOString().split("T")[0];
    const nextDate = new Date(today.setDate(today.getDate() + 1))
      .toISOString()
      .split("T")[0];
    return {
      backendUrl: import.meta.env.VITE_API_BASE_URL,
      employeeName: "",
      salesChart: null,
      productsChart: null,
      orderStatusChart: null,
      newCustomersChart: null,
      timeFilter: "month",
      selectedYear: currentYear,
      selectedMonth: currentMonth,
      startDate: currentDate,
      endDate: nextDate,
      years: [],
      months: [
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
      ],
      // Data for overview cards
      totalOrders: null,
      totalCustomers: null,
      totalProducts: null,
      totalRevenue: null,
      // Data for charts
      salesData: { labels: [], datasets: [] },
      orderStatusData: {
        labels: [
          "Đang chờ",
          "Đang xử lý",
          "Đang giao",
          "Đã giao",
          "Đã hủy",
          "Đã trả hàng",
        ],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: [
              "#ffc107",
              "#0dcaf0",
              "#0d6efd",
              "#198754",
              "#dc3545",
              "#6c757d",
            ],
          },
        ],
      },
      // Data for top products table
      topProducts: [],
      topProductsSummary: null,
    };
  },
  computed: {
    years() {
      const currentYear = new Date().getFullYear();
      const startYear = 2020; // Adjust as needed
      const yearsArray = [];
      for (let i = currentYear; i >= startYear; i--) {
        yearsArray.push(i);
      }
      return yearsArray;
    },
    months() {
      return [
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
    },
    salesDataForPDF() {
      return this.salesData.labels.map((label, index) => ({
        label: label,
        revenue: this.salesData.datasets[0]?.data[index] || 0,
        profit: this.salesData.datasets[1]?.data[index] || 0,
        orders: this.salesData.datasets[2]?.data[index] || 0,
      }));
    },
    employeeName() {
      return localStorage.getItem("employee-name") || "Admin";
    },
  },
  async mounted() {
    await this.updateChart();
    await this.fetchOverviewStats();
    await this.fetchOrderStatusData();
    this.renderOrderStatusChart();
    await this.fetchTopProducts();
    this.initProductsChart();
    await this.initNewCustomersChart();
  },
  methods: {
    formatCurrency(value) {
      if (value === null || value === undefined) return "";
      return value.toLocaleString("vi-VN") + " ₫";
    },
    async fetchOverviewStats() {
      try {
        const token = localStorage.getItem("token-admin");
        if (!token) {
          // Or redirect to login
          console.error("Authentication token not found.");
          toast.error("Vui lòng đăng nhập để xem trang này.");
          // Redirect to login page if using Vue Router
          // this.$router.push('/admin/login');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [ordersRes, customersRes, productsRes, revenueRes] =
          await Promise.all([
            axios.get(`${this.backendUrl}/api/orders/total`, { headers }),
            axios.get(`${this.backendUrl}/api/customers/total`, { headers }),
            axios.get(`${this.backendUrl}/api/products/total`, { headers }),
            axios.get(`${this.backendUrl}/api/orders/revenue`, { headers }),
          ]);

        this.totalOrders = ordersRes.data.data.totalOrders;
        this.totalCustomers = customersRes.data.data.totalCustomers;
        this.totalProducts = productsRes.data.data.totalProducts;
        this.totalRevenue = revenueRes.data.data.totalRevenue;
      } catch (error) {
        console.error("Error fetching overview stats:", error);
        toast.error("Lỗi khi tải dữ liệu tổng quan");
      }
    },
    renderSalesChart() {
      if (this.salesChart) {
        this.salesChart.destroy();
      }
      const ctx = this.$refs.salesChart.getContext("2d");
      this.salesChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.salesData.labels,
          datasets: [
            {
              ...this.salesData.datasets[0], // Doanh thu
              yAxisID: "y",
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: "#0d6efd",
            },
            {
              ...this.salesData.datasets[1], // Lợi nhuận
              yAxisID: "y",
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: "#198754",
            },
            {
              ...this.salesData.datasets[2], // Số đơn hàng
              yAxisID: "y1",
              borderColor: "#dc3545",
              backgroundColor: "rgba(220, 53, 69, 0.1)",
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 4,
              pointBackgroundColor: "#dc3545",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Doanh thu / Lợi nhuận (₫)",
              },
              ticks: {
                callback: function (value) {
                  return value.toLocaleString("vi-VN") + " ₫";
                },
              },
            },
            y1: {
              beginAtZero: true,
              position: "right",
              title: {
                display: true,
                text: "Số đơn hàng",
              },
              grid: {
                drawOnChartArea: false,
              },
              min: 0,
              max: 5,
              ticks: {
                min: 0,
                max: 5,
                stepSize: 1,
                callback: function (value) {
                  return Math.round(value) + " đơn";
                },
                afterBuildTicks: function (axis) {
                  axis.ticks = [0, 1, 2, 3, 4, 5];
                },
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  if (context.dataset.label === "Số đơn hàng") {
                    return (
                      context.dataset.label +
                      ": " +
                      Math.round(context.raw) +
                      " đơn"
                    );
                  }
                  return (
                    context.dataset.label +
                    ": " +
                    context.raw.toLocaleString("vi-VN") +
                    " ₫"
                  );
                },
              },
            },
          },
        },
      });
    },
    renderOrderStatusChart() {
      if (!this.$refs.orderStatusChart) return;

      const ctx = this.$refs.orderStatusChart.getContext("2d");
      if (this.orderStatusChart) {
        this.orderStatusChart.destroy();
      }

      // Base colors for each status
      const baseColors = {
        "Đang chờ": "#ffc107",
        "Đang xử lý": "#0dcaf0",
        "Đang giao": "#0d6efd",
        "Đã giao": "#198754",
        "Đã hủy": "#dc3545",
        "Đã trả hàng": "#6c757d",
      };

      // Get the data and calculate max value
      const data = this.orderStatusData.datasets[0].data;
      const maxValue = Math.max(...data);

      // Generate colors based on quantity
      const colors = this.orderStatusData.labels.map((label, index) => {
        const value = data[index];
        const baseColor = baseColors[label];

        // Convert hex to RGB
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);

        // Calculate opacity based on value relative to max
        const opacity = value === 0 ? 0.2 : 0.2 + (value / maxValue) * 0.8;

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      });

      // Create new chart data with dynamic colors
      const chartData = {
        ...this.orderStatusData,
        datasets: [
          {
            ...this.orderStatusData.datasets[0],
            backgroundColor: colors,
          },
        ],
      };

      this.orderStatusChart = new Chart(ctx, {
        type: "pie",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: {
                  size: 12,
                },
                boxWidth: 12,
                padding: 15,
                generateLabels: (chart) => {
                  const data = chart.data;
                  return data.labels.map((label, i) => ({
                    text: `${label} (${data.datasets[0].data[i]})`,
                    fillStyle: colors[i],
                    strokeStyle: colors[i],
                    lineWidth: 0,
                    hidden: false,
                    index: i,
                  }));
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || "";
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce(
                    (a, b) => (a || 0) + (b || 0),
                    0
                  );
                  const percentage =
                    total > 0 ? Math.round((value / total) * 100) : 0;
                  return `${label}: ${value} đơn hàng (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    },
    updateChart() {
      // Gọi fetchSalesData để lấy dữ liệu mới (dựa trên filter) và cập nhật biểu đồ
      this.fetchSalesData().then(() => {
        this.renderSalesChart();
        // Sau khi cập nhật doanh thu, cập nhật luôn top sản phẩm theo cùng filter
        this.fetchTopProducts({
          timeFilter: this.timeFilter,
          year: this.selectedYear,
          month: this.selectedMonth,
          startDate: this.startDate,
          endDate: this.endDate,
        });
      });
    },
    updateProductChart() {
      this.fetchTopProducts();
      // Có thể thêm renderProductsChart nếu có biểu đồ
    },
    async fetchSalesData() {
      try {
        const token = localStorage.getItem("token-admin");
        if (!token) {
          console.error("Không tìm thấy token xác thực.");
          toast.error("Vui lòng đăng nhập để xem trang này.");
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const params = { timeFilter: this.timeFilter };

        if (this.timeFilter === "year") {
          params.year = this.selectedYear;
        } else if (this.timeFilter === "month") {
          params.year = this.selectedYear;
          params.month = this.selectedMonth;
        } else if (this.timeFilter === "custom") {
          params.startDate = this.startDate;
          params.endDate = this.endDate;
        }

        const response = await axios.get(
          `${this.backendUrl}/api/orders/sales`,
          { headers, params }
        );

        let { labels, datasets } = response.data.data;

        // Xử lý dữ liệu theo từng loại filter
        if (this.timeFilter === "year") {
          // Đảm bảo có đủ 12 tháng
          const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
          const monthLabels = allMonths.map((month) => `Tháng ${month}`);
          const monthData = new Array(12).fill(0);
          const profitData = new Array(12).fill(0);
          const countData = new Array(12).fill(0);

          labels.forEach((label, index) => {
            const monthIndex = parseInt(label.split(" ")[1]) - 1;
            monthData[monthIndex] = datasets[0].data[index];
            profitData[monthIndex] = datasets[1].data[index];
            countData[monthIndex] = datasets[2].data[index];
          });

          labels = monthLabels;
          datasets = [
            {
              label: "Doanh thu",
              data: monthData,
              borderColor: "#0d6efd",
              backgroundColor: "rgba(13, 110, 253, 0.1)",
              tension: 0.4,
              yAxisID: "y",
            },
            {
              label: "Lợi nhuận",
              data: profitData,
              borderColor: "#198754",
              backgroundColor: "rgba(25, 135, 84, 0.1)",
              tension: 0.4,
              yAxisID: "y",
            },
            {
              label: "Số đơn hàng",
              data: countData,
              borderColor: "#dc3545",
              backgroundColor: "rgba(220, 53, 69, 0.1)",
              tension: 0.4,
              yAxisID: "y1",
            },
          ];
        } else if (this.timeFilter === "month") {
          // Tạo mảng chứa tất cả các ngày trong tháng
          const daysInMonth = new Date(
            this.selectedYear,
            this.selectedMonth,
            0
          ).getDate();
          const dayLabels = Array.from(
            { length: daysInMonth },
            (_, i) => `Ngày ${i + 1}`
          );
          const dayData = new Array(daysInMonth).fill(0);
          const profitData = new Array(daysInMonth).fill(0);
          const countData = new Array(daysInMonth).fill(0);

          // Map dữ liệu từ API vào các ngày tương ứng
          labels.forEach((label, index) => {
            const day = parseInt(label.split(" ")[1]) - 1;
            if (day >= 0 && day < daysInMonth) {
              dayData[day] = datasets[0].data[index];
              profitData[day] = datasets[1].data[index];
              countData[day] = datasets[2].data[index];
            }
          });

          labels = dayLabels;
          datasets = [
            {
              label: "Doanh thu",
              data: dayData,
              borderColor: "#0d6efd",
              backgroundColor: "rgba(13, 110, 253, 0.1)",
              tension: 0.4,
              yAxisID: "y",
            },
            {
              label: "Lợi nhuận",
              data: profitData,
              borderColor: "#198754",
              backgroundColor: "rgba(25, 135, 84, 0.1)",
              tension: 0.4,
              yAxisID: "y",
            },
            {
              label: "Số đơn hàng",
              data: countData,
              borderColor: "#dc3545",
              backgroundColor: "rgba(220, 53, 69, 0.1)",
              tension: 0.4,
              yAxisID: "y1",
            },
          ];
        } else if (this.timeFilter === "custom") {
          // Tạo mảng chứa tất cả các ngày trong khoảng thời gian
          const start = new Date(this.startDate);
          const end = new Date(this.endDate);
          const allDays = [];
          const currentDate = new Date(start);

          while (currentDate <= end) {
            allDays.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          const dayLabels = allDays.map((date) => {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            return `${day}/${month}`;
          });
          const dayData = new Array(allDays.length).fill(0);
          const profitData = new Array(allDays.length).fill(0);
          const countData = new Array(allDays.length).fill(0);

          // Map dữ liệu từ API vào các ngày tương ứng
          labels.forEach((label, index) => {
            const [year, month, day] = label.split("-");
            const dateStr = `${parseInt(day)}/${parseInt(month)}`;
            const dateIndex = dayLabels.findIndex(
              (dayLabel) => dayLabel === dateStr
            );

            if (dateIndex !== -1) {
              dayData[dateIndex] = datasets[0].data[index];
              profitData[dateIndex] = datasets[1].data[index];
              countData[dateIndex] = datasets[2].data[index];
            }
          });

          labels = dayLabels.map((label) => `Ngày ${label}`);
          datasets = [
            {
              label: "Doanh thu",
              data: dayData,
              borderColor: "#0d6efd",
              backgroundColor: "rgba(13, 110, 253, 0.1)",
              tension: 0.4,
              yAxisID: "y",
            },
            {
              label: "Lợi nhuận",
              data: profitData,
              borderColor: "#198754",
              backgroundColor: "rgba(25, 135, 84, 0.1)",
              tension: 0.4,
              yAxisID: "y",
            },
            {
              label: "Số đơn hàng",
              data: countData,
              borderColor: "#dc3545",
              backgroundColor: "rgba(220, 53, 69, 0.1)",
              tension: 0.4,
              yAxisID: "y1",
            },
          ];
        }

        this.salesData = { labels, datasets };
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
        toast.error("Lỗi khi tải dữ liệu doanh thu");

        // Tạo dữ liệu mặc định khi có lỗi
        if (this.timeFilter === "year") {
          this.salesData = {
            labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
            datasets: [
              {
                label: "Doanh thu",
                data: new Array(12).fill(0),
                borderColor: "#0d6efd",
                backgroundColor: "rgba(13, 110, 253, 0.1)",
                tension: 0.4,
                yAxisID: "y",
              },
              {
                label: "Lợi nhuận",
                data: new Array(12).fill(0),
                borderColor: "#198754",
                backgroundColor: "rgba(25, 135, 84, 0.1)",
                tension: 0.4,
                yAxisID: "y",
              },
              {
                label: "Số đơn hàng",
                data: new Array(12).fill(0),
                borderColor: "#dc3545",
                backgroundColor: "rgba(220, 53, 69, 0.1)",
                tension: 0.4,
                yAxisID: "y1",
              },
            ],
          };
        } else if (this.timeFilter === "month") {
          const daysInMonth = new Date(
            this.selectedYear,
            this.selectedMonth,
            0
          ).getDate();
          this.salesData = {
            labels: Array.from(
              { length: daysInMonth },
              (_, i) => `Ngày ${i + 1}`
            ),
            datasets: [
              {
                label: "Doanh thu",
                data: new Array(daysInMonth).fill(0),
                borderColor: "#0d6efd",
                backgroundColor: "rgba(13, 110, 253, 0.1)",
                tension: 0.4,
                yAxisID: "y",
              },
              {
                label: "Lợi nhuận",
                data: new Array(daysInMonth).fill(0),
                borderColor: "#198754",
                backgroundColor: "rgba(25, 135, 84, 0.1)",
                tension: 0.4,
                yAxisID: "y",
              },
              {
                label: "Số đơn hàng",
                data: new Array(daysInMonth).fill(0),
                borderColor: "#dc3545",
                backgroundColor: "rgba(220, 53, 69, 0.1)",
                tension: 0.4,
                yAxisID: "y1",
              },
            ],
          };
        } else {
          const start = new Date(this.startDate);
          const end = new Date(this.endDate);
          const allDays = [];
          const currentDate = new Date(start);

          while (currentDate <= end) {
            allDays.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          this.salesData = {
            labels: allDays.map((date) => {
              const day = date.getDate();
              const month = date.getMonth() + 1;
              return `Ngày ${day}/${month}`;
            }),
            datasets: [
              {
                label: "Doanh thu",
                data: new Array(allDays.length).fill(0),
                borderColor: "#0d6efd",
                backgroundColor: "rgba(13, 110, 253, 0.1)",
                tension: 0.4,
                yAxisID: "y",
              },
              {
                label: "Lợi nhuận",
                data: new Array(allDays.length).fill(0),
                borderColor: "#198754",
                backgroundColor: "rgba(25, 135, 84, 0.1)",
                tension: 0.4,
                yAxisID: "y",
              },
              {
                label: "Số đơn hàng",
                data: new Array(allDays.length).fill(0),
                borderColor: "#dc3545",
                backgroundColor: "rgba(220, 53, 69, 0.1)",
                tension: 0.4,
                yAxisID: "y1",
              },
            ],
          };
        }
      }
    },
    async fetchOrderStatusData() {
      try {
        const token = localStorage.getItem("token-admin");
        if (!token) {
          toast.error("Vui lòng đăng nhập để xem trang này.");
          return;
        }

        const response = await axios.get(
          `${this.backendUrl}/api/orders/order-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success && response.data.data) {
          this.orderStatusData = response.data.data;
          this.$nextTick(() => {
            this.renderOrderStatusChart();
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu trạng thái đơn hàng:", error);
        toast.error("Lỗi khi tải dữ liệu trạng thái đơn hàng");
        // Set default data
        this.orderStatusData = {
          labels: [
            "Đang chờ",
            "Đang xử lý",
            "Đang giao",
            "Đã giao",
            "Đã hủy",
            "Đã trả hàng",
          ],
          datasets: [
            {
              data: [0, 0, 0, 0, 0, 0],
              backgroundColor: [
                "#ffc107",
                "#0dcaf0",
                "#0d6efd",
                "#198754",
                "#dc3545",
                "#6c757d",
              ],
            },
          ],
        };
        this.$nextTick(() => {
          this.renderOrderStatusChart();
        });
      }
    },
    async fetchTopProducts(filterParams) {
      try {
        const token = localStorage.getItem("token-admin");
        if (!token) {
          toast.error("Vui lòng đăng nhập để xem trang này.");
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        let params = {};
        if (filterParams) {
          params = { ...filterParams };
        } else {
          params = {
            timeFilter: this.timeFilter,
            year: this.selectedYear,
            month: this.selectedMonth,
            startDate: this.startDate,
            endDate: this.endDate,
          };
        }
        const response = await axios.get(
          `${this.backendUrl}/api/orders/top-products`,
          { headers, params }
        );
        const { topProducts, summary } = response.data.data;
        this.topProducts = topProducts || [];
        this.topProductsSummary = summary || {
          totalProductsSold: 0,
          totalRevenue: 0,
          averagePrice: 0,
        };
        // Update the products chart with new data
        this.$nextTick(() => {
          this.initProductsChart();
        });
      } catch (error) {
        console.error("Lỗi khi lấy top sản phẩm bán chạy:", error);
        toast.error("Lỗi khi tải top sản phẩm bán chạy");
        // Reset data to prevent undefined errors
        this.topProducts = [];
        this.topProductsSummary = {
          totalProductsSold: 0,
          totalRevenue: 0,
          averagePrice: 0,
        };
        this.$nextTick(() => {
          this.initProductsChart();
        });
      }
    },
    initProductsChart() {
      if (!this.$refs.productsChart) return;

      const ctx = this.$refs.productsChart.getContext("2d");
      if (this.productsChart) {
        this.productsChart.destroy();
      }

      // Ensure we have valid data
      const labels =
        this.topProducts?.map((product) => product.name || "Chưa có tên") || [];
      const data =
        this.topProducts?.map((product) => product.totalQuantity || 0) || [];

      this.productsChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: [
                "#0d6efd",
                "#198754",
                "#dc3545",
                "#ffc107",
                "#6f42c1",
                "#0dcaf0",
                "#fd7e14",
                "#20c997",
                "#6610f2",
                "#e83e8c",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: {
                  size: 12,
                },
                boxWidth: 12,
                padding: 15,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  if (!context.raw && context.raw !== 0) return [];

                  const label = context.label || "";
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce(
                    (a, b) => (a || 0) + (b || 0),
                    0
                  );
                  const percentage =
                    total > 0 ? Math.round((value / total) * 100) : 0;
                  const product = this.topProducts?.[context.dataIndex];

                  return [
                    `${label}`,
                    `Số lượng: ${value} sản phẩm`,
                    `Doanh thu: ${this.formatCurrency(
                      product?.totalRevenue || 0
                    )}`,
                    `Tỷ lệ: ${percentage}%`,
                  ];
                },
              },
            },
          },
        },
      });
    },
    async initNewCustomersChart() {
      try {
        const token = localStorage.getItem("token-admin");
        if (!token) {
          toast.error("Vui lòng đăng nhập để xem trang này.");
          return;
        }

        const response = await axios.get(
          `${this.backendUrl}/api/customers/new-customers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Lỗi khi lấy dữ liệu khách hàng mới"
          );
        }

        const { labels, datasets } = response.data.data;

        const ctx = this.$refs.newCustomersChart.getContext("2d");
        if (this.newCustomersChart) {
          this.newCustomersChart.destroy();
        }

        this.newCustomersChart = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Khách hàng mới",
                data: datasets[0].data,
                borderColor: "#6f42c1",
                backgroundColor: "rgba(111, 66, 193, 0.1)",
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `${context.raw} khách hàng mới`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: "#f0f0f0",
                },
                ticks: {
                  stepSize: 1,
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          },
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách hàng mới:", error);
        toast.error("Lỗi khi tải dữ liệu khách hàng mới");

        // Fallback to empty chart
        const ctx = this.$refs.newCustomersChart.getContext("2d");
        if (this.newCustomersChart) {
          this.newCustomersChart.destroy();
        }

        this.newCustomersChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
            datasets: [
              {
                label: "Khách hàng mới",
                data: [0, 0, 0, 0, 0, 0, 0],
                borderColor: "#6f42c1",
                backgroundColor: "rgba(111, 66, 193, 0.1)",
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `${context.raw} khách hàng mới`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: "#f0f0f0",
                },
                ticks: {
                  stepSize: 1,
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          },
        });
      }
    },
    async exportPDF() {
      try {
        if (this.$refs.exportPDFRef) {
          this.$refs.exportPDFRef.exportPDF();
        } else {
          toast.error("Không thể tạo báo cáo PDF");
        }
      } catch (error) {
        console.error("Lỗi khi xuất PDF:", error);
        toast.error("Lỗi khi xuất PDF");
      }
    },
  },
};
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: #fff;
  border-radius: 12px;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-body {
  padding: 1.5rem;
}

.d-flex.gap-2 {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px !important;
  align-items: center;
}
.form-select-sm,
.form-control-sm {
  min-width: 100px;
  max-width: 180px;
  border: none;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
.form-select-sm:focus,
.form-control-sm:focus {
  box-shadow: none;
  background-color: #f8f9fa;
}

.rounded-circle {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Thống kê tổng quan */
.border.rounded {
  border: none !important;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.border.rounded:hover {
  background: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.border.rounded h6 {
  font-size: 0.875rem;
  font-weight: 500;
}

.border.rounded h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.border.rounded small {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Bảng sản phẩm */
.table {
  margin-bottom: 0;
}

.table th {
  font-weight: 600;
  font-size: 0.875rem;
  color: #6c757d;
  border-top: none;
  padding: 1rem;
}

.table td {
  padding: 1rem;
  vertical-align: middle;
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.table img {
  width: 40px;
  height: 40px;
  object-fit: cover;
}

.table h6 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.table small {
  font-size: 0.75rem;
  color: #6c757d;
}

/* Progress bar */
.progress {
  background-color: #e9ecef;
  border-radius: 10px;
  width: 100px;
  margin: 0 auto;
}

.progress-bar {
  border-radius: 10px;
}

/* Filter & Export PDF button group */
.btn.btn-outline-primary {
  min-width: 140px;
  max-width: 200px;
  margin-left: 8px;
  margin-top: 2px;
  margin-bottom: 2px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  border-width: 2px;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.05);
}
.btn.btn-outline-primary:hover {
  background: #0d6efd;
  color: #fff;
  border-color: #0d6efd;
}

@media (max-width: 768px) {
  .d-flex.gap-2 {
    flex-direction: column;
    align-items: stretch;
    gap: 8px !important;
  }
  .btn.btn-outline-primary {
    width: 100%;
    margin-left: 0;
  }
  .form-select-sm,
  .form-control-sm {
    min-width: 100%;
    max-width: 100%;
  }
  .border.rounded {
    margin-bottom: 1rem;
  }
  .table th,
  .table td {
    padding: 0.75rem;
  }
  .table img {
    width: 32px;
    height: 32px;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeIn 0.5s ease-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.dashboard-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 16px 16px 16px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
}
.toolbar-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 24px 0 0;
  color: #222;
  white-space: nowrap;
}
.toolbar-filters {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.toolbar-row {
  display: flex;
  gap: 12px;
}
.toolbar-select {
  min-width: 120px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #f8f9fa;
  font-size: 1rem;
  transition: border 0.2s;
}
.toolbar-select:focus {
  border: 1.5px solid #0d6efd;
  outline: none;
  background: #fff;
}
.toolbar-between {
  color: #888;
  margin: 0 8px;
}
.toolbar-btn {
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.08);
  display: flex;
  align-items: center;
  gap: 8px;
}
.toolbar-btn:hover {
  background: #b02a37;
}
@media (max-width: 900px) {
  .dashboard-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .toolbar-title {
    margin-bottom: 8px;
  }
}
</style>
