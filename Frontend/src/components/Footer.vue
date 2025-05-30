<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section about">
          <h2>JUNO</h2>
          <p>
            JUNO là thương hiệu thời trang mang đến phong cách trẻ trung, hiện
            đại và giá cả hợp lý cho phái nữ.
          </p>
          <div class="contact">
            <span><i class="fas fa-phone"></i> 1900 63 69 88</span>
            <span><i class="fas fa-envelope"></i> cskh@juno.vn</span>
          </div>
        </div>
        <div class="footer-section links">
          <h2>Liên kết hữu ích</h2>
          <ul>
            <li><a href="#">Về chúng tôi</a></li>
            <li><a href="#">Chính sách đổi trả</a></li>
            <li><a href="#">Hệ thống cửa hàng</a></li>
            <li><a href="#">Tuyển dụng</a></li>
          </ul>
        </div>
        <div class="footer-section contact-form">
          <h2>Kết nối với chúng tôi</h2>
          <div class="socials">
            <a href="#"><i class="fab fa-facebook"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
            <a href="#"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">&copy; 2025 JUNO. All rights reserved.</div>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
.footer {
  background-color: #f8f8f8;
  color: #333;
  padding: 20px 0;
  width: 100%;
}

.container {
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 30px;
}

.footer-section {
  flex: 1;
  margin: 10px;
  min-width: 250px;
}

.footer-section h2 {
  color: #ff0000; /* Red color for logo */
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: bold;
}

.footer-section p {
  color: #555;
  font-size: 14px;
  line-height: 1.6;
}

.footer-section .contact span {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  color: #555;
}

.footer-section .contact i {
  margin-right: 10px;
  color: #ff0000;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul li a {
  text-decoration: none;
  color: #555;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-section ul li a:hover {
  color: #ff0000;
}

.footer-section .socials a {
  display: inline-block;
  margin-right: 10px;
  color: #555;
  font-size: 20px;
  transition: color 0.3s ease;
}

.footer-section .socials a:hover {
  color: #ff0000;
}

.footer-bottom {
  text-align: center;
  font-size: 12px;
  color: #777;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
  }

  .footer-section {
    text-align: center;
    margin: 15px 0;
  }

  .footer-section .contact span {
    display: inline-block;
    margin: 0 10px;
  }
}
</style>
