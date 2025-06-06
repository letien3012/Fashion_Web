<template>
  <div ref="labelContent" class="shipping-label-container">
    <div class="label-header">
      <div class="logo-section">
        <img
          src="https://giaohangtietkiem.vn/wp-content/themes/giaohangtk/images/logo.png"
          alt="GHTK Logo"
          class="ghtk-logo"
        />
        <div class="company-info">
          <div class="company-name">GiaoHangTietKiem.vn</div>
          <div class="company-desc">Chuyên nghiệp trên từng bước chân</div>
        </div>
      </div>
      <div class="label-title">
        <div class="title">Phiếu giao hàng</div>
        <div class="date">Ngày tạo đơn: {{ formatDate(order.createdAt) }}</div>
      </div>
    </div>
    <div class="label-barcode">
      <div class="code">{{ order.code }}</div>
      <svg ref="barcode"></svg>
      <div class="barcode-number">{{ order.barcode || order.code }}</div>
      <qrcode-vue :value="order.code" :size="60" class="qrcode" />
    </div>
    <div class="label-info">
      <div class="info-row">
        <div><b>Kho lấy:</b> {{ order.pickWarehouse || "Phổ Quang" }}</div>
        <div>
          <b>Kho giao:</b> {{ order.deliveryWarehouse || "C08/05 | Tân Tạo" }}
        </div>
      </div>
      <div class="info-row">
        <div class="shop-info">
          <b>Shop/cửa hàng</b><br />
          Tên: {{ order.shopName || "Shop Demo" }}<br />
          ĐT: {{ order.shopPhone || "096***9172" }}<br />
          ĐC: {{ order.shopAddress || "***, Quận Tân Phú, TP Hồ Chí Minh" }}
        </div>
        <div class="customer-info">
          <b>Người nhận hàng:</b><br />
          Tên: {{ order.fullname || "N/A" }}<br />
          ĐT: {{ order.phone || "N/A" }}<br />
          ĐC: {{ order.address || "N/A" }}
        </div>
      </div>
      <div class="info-row">
        <div><b>Mã đơn KH:</b> {{ order.customerCode || order._id }}</div>
      </div>
    </div>
    <div class="label-summary">
      <div class="summary-box">
        <div><b>Thu hộ</b></div>
        <div>
          {{ order.codAmount ? formatPrice(order.codAmount) + "đ" : "không" }}
        </div>
      </div>
      <div class="summary-box">
        <div><b>Khối lượng</b></div>
        <div>
          {{ order.weight ? (order.weight / 1000).toFixed(2) : "0.03" }} KG
        </div>
      </div>
      <div class="summary-box note-box">
        <div><b>Ghi chú hàng hóa</b></div>
        <div v-html="order.note || 'Không có'" />
      </div>
    </div>
    <table class="products-table">
      <thead>
        <tr>
          <th>Sản phẩm</th>
          <th>SL</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in order.order_detail" :key="item._id">
          <td>{{ item.productId?.name || "N/A" }}</td>
          <td>{{ item.quantity }}</td>
        </tr>
      </tbody>
    </table>
    <button class="export-btn" @click="exportPDF">Xuất PDF</button>
  </div>
</template>

<script>
import QrcodeVue from "qrcode.vue";
import JsBarcode from "jsbarcode";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default {
  name: "ShippingLabel",
  components: { QrcodeVue },
  props: {
    order: { type: Object, required: true },
  },
  mounted() {
    this.renderBarcode();
  },
  watch: {
    order: {
      handler() {
        this.renderBarcode();
      },
      deep: true,
    },
  },
  methods: {
    renderBarcode() {
      if (this.$refs.barcode) {
        JsBarcode(this.$refs.barcode, this.order.barcode || this.order.code, {
          format: "CODE128",
          width: 2,
          height: 40,
          displayValue: false,
        });
      }
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatPrice(price) {
      if (!price) return "0";
      return price.toLocaleString("vi-VN");
    },
    async exportPDF() {
      try {
        const pdf = new jsPDF({
          unit: "mm",
          format: [90, 130],
          orientation: "portrait",
        });
        pdf.setFontSize(12);
        pdf.text(`Mã đơn: ${this.order?.code || "N/A"}`, 10, 20);
        pdf.text(`Tên khách: ${this.order?.fullname || "N/A"}`, 10, 30);
        pdf.text(
          `Số sản phẩm: ${this.order?.order_detail?.length || 0}`,
          10,
          40
        );
        pdf.save("test.pdf");
      } catch (err) {
        console.error("PDF generation failed:", err);
        this.$q.notify({
          type: "negative",
          message: "Không thể tạo PDF. Vui lòng thử lại.",
          position: "top",
        });
      }
    },
    loadImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    },
  },
};
</script>

<style scoped>
.shipping-label-container {
  width: 350px;
  min-height: 500px;
  background: #fff;
  border: 1px solid #aaa;
  padding: 12px;
  font-family: Arial, sans-serif;
  font-size: 13px;
  color: #222;
  margin: 0 auto;
  position: relative;
}
.label-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #222;
  padding-bottom: 4px;
}
.logo-section {
  display: flex;
  align-items: center;
}
.ghtk-logo {
  width: 38px;
  height: 38px;
  margin-right: 6px;
}
.company-info {
  display: flex;
  flex-direction: column;
}
.company-name {
  font-weight: bold;
  font-size: 15px;
}
.company-desc {
  font-size: 11px;
  color: #666;
}
.label-title {
  text-align: right;
}
.title {
  font-weight: bold;
  font-size: 15px;
}
.date {
  font-size: 12px;
}
.label-barcode {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 4px 0;
}
.code {
  font-size: 16px;
  font-weight: bold;
  margin-right: 8px;
}
.barcode-number {
  font-size: 13px;
  margin-left: 8px;
}
.qrcode {
  margin-left: 8px;
}
.label-info {
  margin: 6px 0;
}
.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}
.shop-info,
.customer-info {
  width: 170px;
  font-size: 12px;
}
.label-summary {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
}
.summary-box {
  border: 1px solid #222;
  padding: 4px 8px;
  min-width: 80px;
  text-align: center;
  font-size: 12px;
  background: #f9f9f9;
}
.note-box {
  min-width: 120px;
  max-width: 160px;
  word-break: break-word;
}
.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
  margin-bottom: 8px;
}
.products-table th,
.products-table td {
  border: 1px solid #222;
  padding: 2px 4px;
  font-size: 12px;
  text-align: left;
}
.export-btn {
  display: block;
  margin: 10px auto 0 auto;
  padding: 6px 18px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.export-btn:hover {
  background: #1765ad;
}
@media print {
  .export-btn {
    display: none;
  }
}
</style>
