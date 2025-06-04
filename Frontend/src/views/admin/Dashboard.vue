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
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="card-title mb-0">Thống kê doanh thu</h5>
              <div class="d-flex gap-2">
                <select
                  class="form-select form-select-sm"
                  v-model="timeFilter"
                  @change="updateChart"
                >
                  <option value="year">Theo năm</option>
                  <option value="month">Theo tháng</option>
                  <option value="custom">Tùy chọn</option>
                </select>

                <div v-if="timeFilter === 'year'" class="year-select">
                  <select
                    class="form-select form-select-sm"
                    v-model="selectedYear"
                    @change="updateChart"
                  >
                    <option v-for="year in years" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>

                <div v-if="timeFilter === 'month'" class="d-flex gap-2">
                  <select
                    class="form-select form-select-sm"
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
                    class="form-select form-select-sm"
                    v-model="selectedYear"
                    @change="updateChart"
                  >
                    <option v-for="year in years" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>

                <div
                  v-if="timeFilter === 'custom'"
                  class="d-flex gap-2 align-items-center"
                >
                  <input
                    type="date"
                    class="form-control form-control-sm"
                    v-model="startDate"
                    @change="updateChart"
                  />
                  <span class="text-muted">đến</span>
                  <input
                    type="date"
                    class="form-control form-control-sm"
                    v-model="endDate"
                    @change="updateChart"
                  />
                </div>
              </div>
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
              <div class="d-flex gap-2">
                <select
                  class="form-select form-select-sm"
                  v-model="productTimeFilter"
                  @change="updateProductChart"
                >
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="year">Năm nay</option>
                </select>
              </div>
            </div>

            <div class="row mb-4">
              <div class="col-md-4">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">Tổng sản phẩm đã bán</h6>
                  <h3 class="mb-0">1,234</h3>
                  <small class="text-success">
                    <i class="fas fa-arrow-up"></i> 12% so với kỳ trước
                  </small>
                </div>
              </div>
              <div class="col-md-4">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">Doanh thu sản phẩm</h6>
                  <h3 class="mb-0">45.678.000 ₫</h3>
                  <small class="text-success">
                    <i class="fas fa-arrow-up"></i> 8% so với kỳ trước
                  </small>
                </div>
              </div>
              <div class="col-md-4">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">Đơn giá trung bình</h6>
                  <h3 class="mb-0">370.000 ₫</h3>
                  <small class="text-danger">
                    <i class="fas fa-arrow-down"></i> 3% so với kỳ trước
                  </small>
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
                  <tr>
                    <td>
                      <div class="d-flex align-items-center">
                        <img
                          src="https://via.placeholder.com/40"
                          class="rounded me-2"
                          alt="Product"
                        />
                        <div>
                          <h6 class="mb-0">Áo thun basic</h6>
                          <small class="text-muted">Mã: AT001</small>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">245</td>
                    <td class="text-center">12.250.000 ₫</td>
                    <td class="text-center">
                      <div class="progress" style="height: 5px">
                        <div
                          class="progress-bar bg-primary"
                          style="width: 75%"
                        ></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="d-flex align-items-center">
                        <img
                          src="https://via.placeholder.com/40"
                          class="rounded me-2"
                          alt="Product"
                        />
                        <div>
                          <h6 class="mb-0">Quần jean slim</h6>
                          <small class="text-muted">Mã: QJ002</small>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">180</td>
                    <td class="text-center">18.000.000 ₫</td>
                    <td class="text-center">
                      <div class="progress" style="height: 5px">
                        <div
                          class="progress-bar bg-success"
                          style="width: 60%"
                        ></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="d-flex align-items-center">
                        <img
                          src="https://via.placeholder.com/40"
                          class="rounded me-2"
                          alt="Product"
                        />
                        <div>
                          <h6 class="mb-0">Váy liền thân</h6>
                          <small class="text-muted">Mã: VL003</small>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">120</td>
                    <td class="text-center">9.600.000 ₫</td>
                    <td class="text-center">
                      <div class="progress" style="height: 5px">
                        <div
                          class="progress-bar bg-info"
                          style="width: 45%"
                        ></div>
                      </div>
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

      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Sản phẩm theo danh mục</h5>
            <div style="height: 300px">
              <canvas ref="categoryChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";
import axios from "axios";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export default {
  name: "AdminDashboard",
  data() {
    return {
      backendUrl: "http://localhost:3005",
      employeeName: "",
      salesChart: null,
      productsChart: null,
      orderStatusChart: null,
      newCustomersChart: null,
      categoryChart: null,
      timeFilter: "year",
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      startDate: null,
      endDate: null,
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
      productTimeFilter: "week",
      // Data for overview cards
      totalOrders: null,
      totalCustomers: null,
      totalProducts: null,
      totalRevenue: null,
      // Data for charts
      salesData: {
        labels: [],
        datasets: [],
      },
      orderStatusData: {
        labels: [],
        datasets: [],
      },
      // Data for top products table
      topProducts: [],
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
  },
  async mounted() {
    // Initial data fetch for overview cards
    await this.fetchOverviewStats();

    // Initialize charts after data is potentially fetched
    this.renderSalesChart();
    this.renderOrderStatusChart();

    // Initial data fetch for charts and tables (example - need actual APIs)
    // await this.fetchSalesData();
    // await this.fetchOrderStatusData();
    // await this.fetchTopProducts();
  },
  methods: {
    formatCurrency(value) {
      if (value === null || value === undefined) return "";
      return value.toLocaleString("vi-VN") + " ₫";
    },
    async fetchOverviewStats() {
      try {
        const token = localStorage.getItem("token");
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
        data: this.salesData, // Use actual data
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return value.toLocaleString("vi-VN") + " ₫";
                },
              },
            },
          },
        },
      });
    },
    renderOrderStatusChart() {
      if (this.orderStatusChart) {
        this.orderStatusChart.destroy();
      }
      const ctx = this.$refs.orderStatusChart.getContext("2d");
      this.orderStatusChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Đang chờ", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"],
          datasets: [
            {
              data: [300, 150, 100, 500, 84], // Replace with actual data
              backgroundColor: [
                "#ffc107", // warning (pending)
                "#0dcaf0", // info (processing)
                "#0d6efd", // primary (shipping)
                "#198754", // success (delivered)
                "#dc3545", // danger (cancelled)
              ],
            },
          ],
        }, // Use actual data
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },
    updateChart() {
      // This method will be updated later to fetch and update sales data
      console.log(
        "Updating chart for filter:",
        this.timeFilter,
        this.selectedYear,
        this.selectedMonth,
        this.startDate,
        this.endDate
      );
      // Example data update (replace with API call)
      // this.salesData = { labels: [...], datasets: [...] };
      // this.renderSalesChart();
    },
    updateProductChart() {
      // This method will be updated later to fetch and update top products data
      console.log("Updating product chart for filter:", this.productTimeFilter);
      // Example data update (replace with API call)
      // this.topProducts = [...];
    },
    // Placeholder methods for fetching chart/table data
    async fetchSalesData() {
      // Need backend API
      console.log("Fetching sales data...");
    },
    async fetchOrderStatusData() {
      // Need backend API
      console.log("Fetching order status data...");
    },
    async fetchTopProducts() {
      // Need backend API
      console.log("Fetching top products data...");
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

.form-select-sm,
.form-control-sm {
  min-width: 120px;
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

/* Responsive */
@media (max-width: 768px) {
  .form-select-sm,
  .form-control-sm {
    min-width: 100%;
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
</style>
