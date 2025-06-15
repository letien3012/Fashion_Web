<template>
  <Header />
  <div class="page-container">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <span class="current">Chính sách đổi trả</span>
    </div>

    <div class="content-section">
      <h1 class="section-title">Chính sách đổi trả</h1>
      <p class="policy-intro">
        Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất cho khách hàng.
        Chính sách đổi trả này được thiết kế để đảm bảo quyền lợi của bạn và tạo
        sự tin tưởng trong mỗi giao dịch.
      </p>

      <div class="policy-content">
        <section class="policy-section">
          <h2><i class="fas fa-check-circle"></i> 1. Điều kiện đổi trả</h2>
          <div class="info-box">
            <h3>Sản phẩm đủ điều kiện đổi trả:</h3>
            <ul>
              <li>
                Sản phẩm còn nguyên tem, mác, hộp, không bị dơ bẩn, hư hỏng
              </li>
              <li>Thời gian đổi trả trong vòng 30 ngày kể từ ngày nhận hàng</li>
              <li>Sản phẩm không thuộc danh mục không được đổi trả</li>
              <li>Còn đầy đủ hóa đơn mua hàng hoặc email xác nhận đơn hàng</li>
            </ul>
          </div>
          <div class="warning-box">
            <h3>Sản phẩm không được đổi trả:</h3>
            <ul>
              <li>Sản phẩm đã qua sử dụng hoặc có dấu hiệu hư hỏng</li>
              <li>Sản phẩm đã hết hạn đổi trả</li>
              <li>Sản phẩm thuộc danh mục đồ lót, phụ kiện cá nhân</li>
              <li>Sản phẩm đã được tùy chỉnh theo yêu cầu</li>
            </ul>
          </div>
        </section>

        <section class="policy-section">
          <h2><i class="fas fa-exchange-alt"></i> 2. Quy trình đổi trả</h2>
          <div class="process-steps">
            <div class="step">
              <div class="step-number">1</div>
              <h3>Liên hệ hỗ trợ</h3>
              <p>
                Liên hệ với chúng tôi qua hotline hoặc email để được tư vấn và
                hướng dẫn
              </p>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <h3>Chuẩn bị sản phẩm</h3>
              <p>Đóng gói sản phẩm kèm hóa đơn mua hàng và phiếu đổi trả</p>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <h3>Gửi sản phẩm</h3>
              <p>
                Gửi sản phẩm về trung tâm bảo hành theo địa chỉ được cung cấp
              </p>
            </div>
            <div class="step">
              <div class="step-number">4</div>
              <h3>Xác nhận và xử lý</h3>
              <p>Chờ xác nhận và xử lý đổi trả từ đội ngũ hỗ trợ</p>
            </div>
          </div>
        </section>

        <section class="policy-section">
          <h2><i class="fas fa-clock"></i> 3. Thời gian xử lý</h2>
          <div class="timeline">
            <div class="timeline-item">
              <h3>Kiểm tra sản phẩm</h3>
              <p>1-2 ngày làm việc</p>
            </div>
            <div class="timeline-item">
              <h3>Xử lý yêu cầu</h3>
              <p>1-2 ngày làm việc</p>
            </div>
            <div class="timeline-item">
              <h3>Hoàn tất đổi trả</h3>
              <p>1-2 ngày làm việc</p>
            </div>
          </div>
          <p class="note">
            * Tổng thời gian xử lý: 3-5 ngày làm việc kể từ khi nhận được sản
            phẩm
          </p>
        </section>

        <section class="policy-section">
          <h2><i class="fas fa-money-bill-wave"></i> 4. Chi phí đổi trả</h2>
          <div class="cost-table">
            <div class="cost-item">
              <h3>Miễn phí đổi trả</h3>
              <ul>
                <li>Sản phẩm lỗi từ nhà sản xuất</li>
                <li>Sai sót trong quá trình giao hàng</li>
                <li>Sai mẫu mã, kích thước</li>
              </ul>
            </div>
            <div class="cost-item">
              <h3>Phí đổi trả</h3>
              <ul>
                <li>Phí vận chuyển: 30.000đ - 50.000đ</li>
                <li>Phí kiểm tra: 20.000đ/sản phẩm</li>
                <li>Phí xử lý: 50.000đ/đơn hàng</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="policy-section">
          <h2><i class="fas fa-headset"></i> 5. Hỗ trợ khách hàng</h2>
          <div class="support-info">
            <div class="support-item">
              <i class="fas fa-phone"></i>
              <h3>Hotline</h3>
              <p>1900-xxxx</p>
            </div>
            <div class="support-item">
              <i class="fas fa-envelope"></i>
              <h3>Email</h3>
              <p>support@fashionstore.com</p>
            </div>
            <div class="support-item">
              <i class="fas fa-clock"></i>
              <h3>Giờ làm việc</h3>
              <p>8:00 - 20:00 (Thứ 2 - Chủ nhật)</p>
            </div>
          </div>
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
  name: "ReturnPolicy",
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

.info-box,
.warning-box {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-box {
  border-left: 4px solid #28a745;
}

.warning-box {
  border-left: 4px solid #dc3545;
}

.info-box h3,
.warning-box h3 {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.step {
  text-align: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  position: relative;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #e63946;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 auto 15px;
}

.timeline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.timeline-item {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.timeline-item h3 {
  color: #333;
  margin-bottom: 10px;
}

.note {
  text-align: center;
  color: #666;
  font-style: italic;
  margin-top: 20px;
}

.cost-table {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.cost-item {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.cost-item h3 {
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.support-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  text-align: center;
}

.support-item {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.support-item i {
  font-size: 2rem;
  color: #e63946;
  margin-bottom: 15px;
}

.support-item h3 {
  color: #333;
  margin-bottom: 10px;
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

  .process-steps,
  .timeline,
  .cost-table,
  .support-info {
    grid-template-columns: 1fr;
  }
}
</style>
