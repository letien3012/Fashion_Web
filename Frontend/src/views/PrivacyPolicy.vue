<template>
  <Header />
  <div class="page-container">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <span class="current">Chính sách bảo mật</span>
    </div>

    <div class="content-section">
      <h1 class="section-title">Chính sách bảo mật</h1>
      <p class="policy-intro">
        Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách
        hàng. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng
        và bảo vệ thông tin của bạn.
      </p>

      <div class="policy-content">
        <section class="policy-section">
          <h2><i class="fas fa-user-shield"></i> 1. Thu thập thông tin</h2>
          <p>Chúng tôi thu thập các thông tin sau từ khách hàng:</p>
          <ul>
            <li>
              <strong>Thông tin cá nhân:</strong> họ tên, email, số điện thoại,
              địa chỉ, ngày sinh
            </li>
            <li>
              <strong>Thông tin thanh toán:</strong> số thẻ, thông tin tài khoản
              ngân hàng (được mã hóa)
            </li>
            <li>
              <strong>Thông tin đơn hàng:</strong> lịch sử mua hàng, sở thích,
              đánh giá sản phẩm
            </li>
            <li>
              <strong>Thông tin thiết bị:</strong> địa chỉ IP, loại trình duyệt,
              cookie
            </li>
          </ul>
        </section>

        <section class="policy-section">
          <h2><i class="fas fa-cogs"></i> 2. Sử dụng thông tin</h2>
          <p>Thông tin thu thập được sử dụng để:</p>
          <ul>
            <li>Xử lý đơn hàng và giao dịch thanh toán</li>
            <li>Gửi thông tin về sản phẩm mới và khuyến mãi</li>
            <li>Cải thiện trải nghiệm mua sắm và dịch vụ khách hàng</li>
            <li>Phòng chống gian lận và bảo vệ tài khoản</li>
            <li>Phân tích xu hướng và tối ưu hóa website</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2><i class="fas fa-lock"></i> 3. Bảo mật thông tin</h2>
          <p>Chúng tôi cam kết bảo vệ thông tin của khách hàng bằng cách:</p>
          <ul>
            <li>Sử dụng công nghệ mã hóa SSL 256-bit</li>
            <li>Tuân thủ các tiêu chuẩn bảo mật PCI DSS</li>
            <li>Giới hạn quyền truy cập vào thông tin nhạy cảm</li>
            <li>Thường xuyên cập nhật và kiểm tra hệ thống bảo mật</li>
            <li>Không chia sẻ thông tin với bên thứ ba trừ khi có sự đồng ý</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2><i class="fas fa-user-check"></i> 4. Quyền của khách hàng</h2>
          <p>Khách hàng có quyền:</p>
          <ul>
            <li>Truy cập và chỉnh sửa thông tin cá nhân</li>
            <li>Yêu cầu xóa hoặc ẩn danh hóa dữ liệu</li>
            <li>Từ chối nhận thông tin tiếp thị</li>
            <li>Khiếu nại về việc sử dụng thông tin</li>
            <li>Xuất dữ liệu cá nhân của mình</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2><i class="fas fa-envelope"></i> 5. Liên hệ</h2>
          <p>
            Nếu bạn có bất kỳ thắc mắc nào về chính sách bảo mật, vui lòng liên
            hệ:
          </p>
          <ul>
            <li>Email: privacy@fashionstore.com</li>
            <li>Hotline: 1900-xxxx</li>
            <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
  <Footer />
  <Chatbot />
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Chatbot from "../components/Chatbot.vue";

export default {
  name: "PrivacyPolicy",
  components: {
    Header,
    Footer,
    Chatbot,
  },
};
</script>

<style scoped>
.page-container {
  width: 95%;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 991px) {
  .page-container {
    width: 100%;
    padding: 10px;
    max-width: 100vw;
    overflow-x: hidden;
  }
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

@media (max-width: 991px) {
  .breadcrumb {
    font-size: 12px;
    margin-bottom: 15px;
    padding: 0 10px;
  }
}

.breadcrumb a {
  color: #666;
  text-decoration: none;
}

.breadcrumb .separator {
  margin: 0 8px;
  color: #999;
}

.breadcrumb .current {
  color: #e63946;
}

.content-section {
  background: #fff;
  padding: 40px;
}

.section-title {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
}

.policy-intro {
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.policy-content {
  max-width: 900px;
  margin: 0 auto;
}

.policy-section {
  margin-bottom: 40px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.policy-section:hover {
  transform: translateY(-5px);
}

.policy-section h2 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e63946;
  display: flex;
  align-items: center;
  gap: 10px;
}

.policy-section h2 i {
  color: #e63946;
}

.policy-section ul {
  padding-left: 20px;
  margin-bottom: 15px;
}

.policy-section li {
  margin-bottom: 12px;
  color: #555;
  line-height: 1.6;
  position: relative;
}

.policy-section li strong {
  color: #333;
}

.policy-section p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .page-container {
    width: 100%;
    padding: 15px;
  }

  .content-section {
    padding: 20px;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .policy-section {
    padding: 15px;
  }

  .policy-section h2 {
    font-size: 1.3rem;
  }
}
</style>
