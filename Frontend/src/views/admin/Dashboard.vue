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
                            product.image || 'https://via.placeholder.com/40'
                          "
                          class="rounded me-2"
                          alt="Product"
                        />
                        <div>
                          <h6 class="mb-0">{{ product.name }}</h6>
                          <small class="text-muted"
                            >Mã: {{ product.sku }}</small
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
    // Lấy ngày hiện tại (today) và ngày tiếp theo (tomorrow) (ngày hôm nay + 1)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // (getMonth() trả về 0–11)
    const currentDate = today.toISOString().split("T")[0]; // (format: YYYY–MM–DD)
    const nextDate = tomorrow.toISOString().split("T")[0]; // (format: YYYY–MM–DD)

    return {
      backendUrl: "http://localhost:3005",
      employeeName: "",
      salesChart: null,
      productsChart: null,
      orderStatusChart: null,
      newCustomersChart: null,
      categoryChart: null,
      // (Mặc định lọc theo tháng hiện tại)
      timeFilter: "month",
      selectedYear: currentYear,
      selectedMonth: currentMonth,
      // (Mặc định cho tùy chọn: ngày bắt đầu là hôm nay, ngày kết thúc là ngày tiếp theo (hôm nay + 1))
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
      productTimeFilter: "week",
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
  },
  async mounted() {
    // (Gọi updateChart() để lấy dữ liệu doanh thu mặc định (lọc theo tháng hiện tại) khi component được tạo)
    await this.updateChart();
    // (Gọi fetchOverviewStats() để lấy dữ liệu tổng quan)
    await this.fetchOverviewStats();
    // (Khởi tạo biểu đồ trạng thái đơn hàng)
    await this.fetchOrderStatusData();
    this.renderOrderStatusChart();
    await this.fetchTopProducts();
    // Khởi tạo các biểu đồ còn lại
    this.initProductsChart();
    this.initNewCustomersChart();
    this.initCategoryChart();
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
        data: this.orderStatusData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },
    updateChart() {
      // Gọi fetchSalesData để lấy dữ liệu mới (dựa trên filter) và cập nhật biểu đồ
      this.fetchSalesData().then(() => {
        this.renderSalesChart();
      });
    },
    updateProductChart() {
      this.fetchTopProducts();
      // Có thể thêm renderProductsChart nếu có biểu đồ
    },
    async fetchSalesData() {
      // Gọi API để lấy dữ liệu doanh thu từ backend (order.controller.js)
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Không tìm thấy token xác thực.");
          toast.error("Vui lòng đăng nhập để xem trang này.");
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        // Gọi API getSalesData với các tham số từ bộ lọc thời gian
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
        const { labels, datasets } = response.data.data; // (API trả về { data: { labels: [...], datasets: [...] } })
        this.salesData = { labels, datasets };
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
        toast.error("Lỗi khi tải dữ liệu doanh thu");
      }
    },
    async fetchOrderStatusData() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$toast.error("Bạn chưa đăng nhập");
        return;
      }
      try {
        console.log(
          "Gọi API lấy dữ liệu trạng thái đơn hàng (fetchOrderStatusData) tại:",
          this.backendUrl + "/api/orders/order-status"
        );
        const res = await axios.get(
          this.backendUrl + "/api/orders/order-status",
          { headers: { Authorization: "Bearer " + token } }
        );
        console.log("Kết quả API (fetchOrderStatusData):", res.data);
        if (res.data.success && res.data.data) {
          this.orderStatusData = res.data.data;
        } else {
          console.warn(
            "API không trả về đúng định dạng (hoặc không có dữ liệu), sử dụng dữ liệu mẫu."
          );
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
        }
      } catch (err) {
        console.error(
          "Lỗi khi lấy dữ liệu trạng thái đơn hàng (fetchOrderStatusData):",
          err
        );
        // (Nếu có lỗi, sử dụng dữ liệu mẫu (hoặc mặc định) cho biểu đồ trạng thái đơn hàng.)
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
      }
    },
    async fetchTopProducts() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để xem trang này.");
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const params = { timeFilter: this.productTimeFilter };
        const response = await axios.get(
          `${this.backendUrl}/api/orders/top-products`,
          { headers, params }
        );
        const { topProducts, summary } = response.data.data;
        this.topProducts = topProducts;
        this.topProductsSummary = summary;
      } catch (error) {
        console.error("Lỗi khi lấy top sản phẩm bán chạy:", error);
        toast.error("Lỗi khi tải top sản phẩm bán chạy");
      }
    },
    initProductsChart() {
      const ctx = this.$refs.productsChart.getContext("2d");
      this.productsChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Áo thun", "Quần jean", "Váy", "Giày", "Phụ kiện"],
          datasets: [
            {
              data: [30, 25, 20, 15, 10],
              backgroundColor: [
                "#0d6efd",
                "#198754",
                "#dc3545",
                "#ffc107",
                "#6f42c1",
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
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || "";
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} sản phẩm (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    },
    initNewCustomersChart() {
      const ctx = this.$refs.newCustomersChart.getContext("2d");
      this.newCustomersChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
          datasets: [
            {
              label: "Khách hàng mới",
              data: [12, 19, 15, 25, 22, 30, 18],
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
    },
    initCategoryChart() {
      const ctx = this.$refs.categoryChart.getContext("2d");
      this.categoryChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Áo", "Quần", "Váy", "Giày", "Phụ kiện", "Túi xách"],
          datasets: [
            {
              label: "Số lượng sản phẩm",
              data: [120, 80, 60, 40, 30, 25],
              backgroundColor: [
                "#0d6efd",
                "#198754",
                "#dc3545",
                "#ffc107",
                "#6f42c1",
                "#0dcaf0",
              ],
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
                  return `${context.raw} sản phẩm`;
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
