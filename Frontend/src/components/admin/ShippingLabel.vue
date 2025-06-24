<template>
  <div ref="labelContent" class="shipping-label-container">
    <div class="label-header">
      <div class="logo-section">
        <img
          src="../../assets/images/shipping_lable.png"
          alt="GHTK Logo"
          class="ghtk-logo"
        />
        <div class="company-info">
          <div class="company-name">GHN.vn</div>
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
      <qrcode-vue :value="order.code" :size="60" class="qrcode" />
    </div>
    <div class="label-info">
      <div class="info-row">
        <div class="shop-info">
          <b>Cửa hàng</b><br />
          Tên: {{ order.shopName || "Shop Demo" }}<br />
          ĐT: {{ order.shopPhone || "096***9172" }}<br />
          ĐC: {{ order.shopAddress || "***,TP Hồ Chí Minh" }}
        </div>
        <div class="customer-info">
          <b>Người nhận hàng:</b><br />
          Tên: {{ order.fullname || "N/A" }}<br />
          ĐT:
          <span class="customer-phone">{{
            formatPhoneMasked(order.phone)
          }}</span
          ><br />
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
    <button class="export-btn no-export" @click="exportPDF">Xuất PDF</button>
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
    formatPhoneMasked(phone) {
      if (!phone) return "N/A";
      const str = phone.toString();
      if (str.length < 7) return str.replace(/.(?=.{2})/g, "*");
      return str.slice(0, 3) + "***" + str.slice(-3);
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
  width: 400px;
  min-height: 600px;
  background: #fff;
  border: 1px solid #aaa;
  padding: 24px 20px 24px 20px;
  font-family: Arial, sans-serif;
  font-size: 11px;
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
  font-size: 12px;
  margin-bottom: 10px;
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
  font-size: 13px;
}
.company-desc {
  font-size: 10px;
  color: #666;
}
.label-title {
  text-align: right;
  font-size: 12px;
}
.title {
  font-weight: bold;
  font-size: 15px;
}
.date {
  font-size: 10px;
}
.label-barcode {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 4px 0;
  font-size: 11px;
}
.code {
  font-size: 15px;
  font-weight: bold;
  margin-right: 8px;
}
.barcode-number {
  font-size: 11px;
  margin-left: 8px;
}
.qrcode {
  margin-left: 8px;
  width: 50px !important;
  height: 50px !important;
}
.label-info {
  margin: 6px 0;
  font-size: 11px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}
.shop-info,
.customer-info {
  width: 180px;
  font-size: 10px;
}
.label-summary {
  display: flex;
  justify-content: space-between;
  margin: 16px 0;
  font-size: 11px;
}
.summary-box {
  border: 1px solid #222;
  padding: 4px 8px;
  min-width: 90px;
  text-align: center;
  font-size: 10px;
  background: #f9f9f9;
}
.note-box {
  min-width: 120px;
  max-width: 180px;
  word-break: break-word;
}
.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  margin-bottom: 12px;
  font-size: 10px;
}
.products-table th,
.products-table td {
  border: 1px solid #222;
  padding: 2px 4px;
  font-size: 10px;
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
  font-size: 12px;
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
.no-export {
  display: none !important;
}
.customer-phone {
  font-weight: bold;
  word-break: break-all;
}
</style>
