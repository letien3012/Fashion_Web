<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="page-container">
        <div class="footer-content">
          <div class="footer-section about">
            <div class="logo">
              <h2>JUNO</h2>
              <div class="logo-line"></div>
            </div>
            <p>
              JUNO là thương hiệu thời trang mang đến phong cách trẻ trung, hiện
              đại và giá cả hợp lý cho phái nữ.
            </p>
            <div class="contact">
              <div class="contact-item">
                <i class="fas fa-phone"></i>
                <span>1900 63 69 88</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>cskh@juno.vn</span>
              </div>
            </div>
          </div>

          <div class="footer-section links">
            <h2>Liên kết hữu ích</h2>
            <div class="links-grid">
              <router-link to="/about" class="link-item">
                <i class="fas fa-chevron-right"></i>
                <span>Về chúng tôi</span>
              </router-link>
              <router-link to="/store-system" class="link-item">
                <i class="fas fa-chevron-right"></i>
                <span>Hệ thống cửa hàng</span>
              </router-link>
              <router-link to="/return-policy" class="link-item">
                <i class="fas fa-chevron-right"></i>
                <span>Chính sách đổi trả</span>
              </router-link>
              <router-link to="/privacy-policy" class="link-item">
                <i class="fas fa-chevron-right"></i>
                <span>Chính sách bảo mật</span>
              </router-link>
            </div>
          </div>

          <div class="footer-section social">
            <h2>Kết nối với chúng tôi</h2>
            <div class="social-grid">
              <a href="#" class="social-item facebook">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="#" class="social-item instagram">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="#" class="social-item youtube">
                <i class="fab fa-youtube"></i>
              </a>
            </div>
            <div class="newsletter">
              <h3>Đăng ký nhận tin</h3>
              <div class="newsletter-form">
                <input type="email" placeholder="Nhập email của bạn" />
                <button type="submit">
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="page-container">
        <div class="footer-bottom-content">
          <p>&copy; 2025 JUNO. All rights reserved.</p>
          <div class="payment-methods">
            <i class="fab fa-cc-visa"></i>
            <i class="fab fa-cc-mastercard"></i>
            <i class="fab fa-cc-paypal"></i>
            <i class="fab fa-cc-apple-pay"></i>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
.footer {
  background-color: #ffffff;
  color: #333;
  padding-top: 50px;
  width: 100%;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.page-container {
  margin: 0 auto;
  padding: 0 20px;
  width: 95%;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 20px;
}

/* About Section */
.footer-section.about {
  max-width: 350px;
}

.logo {
  margin-bottom: 20px;
}

.logo h2 {
  color: #ff0000 !important;
  font-size: 28px !important;
  font-weight: 800 !important;
  margin: 0;
  letter-spacing: 1px;
  transition: transform 0.3s ease;
}

.logo h2:hover {
  transform: scale(1.05);
}

.logo-line {
  width: 50px;
  height: 3px;
  background: #ff0000;
  margin-top: 10px;
}

.footer-section p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.contact {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
}

.contact-item i {
  color: #ff0000;
  font-size: 16px;
}

/* Links Section */
.footer-section h2 {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 10px;
}

.footer-section h2::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 30px;
  height: 2px;
  background: #ff0000;
}

.links-grid {
  display: grid;
  gap: 15px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
}

.link-item i {
  font-size: 12px;
  color: #ff0000;
  transition: transform 0.3s ease;
}

.link-item:hover {
  color: #ff0000;
  transform: translateX(5px);
}

.link-item:hover i {
  transform: translateX(3px);
}

/* Social Section */
.social-grid {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.social-item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-item.facebook {
  background: #1877f2;
}

.social-item.instagram {
  background: #e4405f;
}

.social-item.youtube {
  background: #ff0000;
}

.social-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.newsletter h3 {
  color: #333;
  font-size: 16px;
  margin-bottom: 15px;
}

.newsletter-form {
  display: flex;
  gap: 10px;
}

.newsletter-form input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #333;
}

.newsletter-form input::placeholder {
  color: #999;
}

.newsletter-form button {
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  background: #ff0000;
  color: #fff;
  cursor: pointer;
  transition: background 0.3s ease;
}

.newsletter-form button:hover {
  background: #cc0000;
}

/* Footer Bottom */
.footer-bottom {
  background: #f8f8f8;
  padding: 20px 0;
  border-top: 1px solid #eee;
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bottom p {
  color: #666;
  font-size: 14px;
}

.payment-methods {
  display: flex;
  gap: 15px;
}

.payment-methods i {
  font-size: 24px;
  color: #666;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .page-container {
    width: 95%;
    padding: 0 15px;
  }
}

@media (max-width: 768px) {
  .footer-top {
    padding: 40px 0 20px;
  }

  .page-container {
    width: 95%;
    padding: 0 10px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-section.about {
    max-width: 100%;
  }

  .logo-line {
    margin: 10px auto;
  }

  .footer-section h2 {
    font-size: 16px;
  }

  .footer-section h2::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .link-item {
    justify-content: center;
  }

  .social-grid {
    justify-content: center;
  }

  .footer-bottom-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .logo h2 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .page-container {
    width: 95%;
    padding: 0 5px;
  }

  .footer-section h2 {
    font-size: 15px;
  }

  .logo h2 {
    font-size: 20px;
  }

  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-form button {
    width: 100%;
  }

  .payment-methods {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
