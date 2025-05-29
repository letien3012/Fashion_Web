<template>
  <footer class="footer">
<<<<<<< HEAD
    <div class="footer-container">
      <!-- Hotline -->
      <div class="footer-column">
        <div class="footer-section">
          <p class="footer-title">
            GỌI MUA HÀNG ONLINE
            <span class="footer-small">(08:00 - 21:00 mỗi ngày)</span>
          </p>
          <p class="footer-phone">1800 1162</p>
          <p class="footer-desc">
            Tất cả các ngày trong tuần (Trừ tết Âm Lịch)
          </p>
        </div>
        <div class="footer-section">
          <p class="footer-title">
            GÓP Ý & KHIẾU NẠI <span class="footer-small">(08:30 - 20:30)</span>
          </p>
          <p class="footer-phone">1800 1160</p>
          <p class="footer-desc">
            Tất cả các ngày trong tuần (Trừ tết Âm Lịch)
          </p>
        </div>
      </div>

      <!-- Showroom -->
      <div class="footer-column text-center">
        <p class="footer-title">HỆ THỐNG SHOWROOM</p>
        <img
          src="https://file.hstatic.net/1000003969/file/chikh_ce44b1a9f11b4cbda1d4d319967d7932.jpg"
          alt="Showroom"
          class="footer-img"
        />
        <div>
          <a href="#" class="footer-link"> Xem địa chỉ hệ thống 42 showroom </a>
          <i
            class="fa-solid fa-play"
            style="font-size: 10px; padding-left: 5px"
          ></i>
        </div>
      </div>

      <!-- Fanpage -->
      <div class="footer-column text-center">
        <p class="footer-title">FANPAGE CỦA CHÚNG TÔI</p>
        <img
          src="https://file.hstatic.net/1000003969/file/dg700x400_ec94e8c3b3b64900b3d64220aacf3355.jpg"
          alt="Fanpage"
          class="footer-img"
        />
        <div class="footer-icons">
          <i class="fab fa-facebook-f"></i>
          <i class="fab fa-instagram"></i>
          <i class="fab fa-youtube"></i>
          <i class="zalo-icon">Zalo</i>
          <i class="fab fa-tiktok"></i>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© Công ty Cổ phần Seedcom Fashion Group</p>
      <p>Powered by Haravan Enterprise.</p>
    </div>
    <button class="back-to-top" v-if="showButton" @click="scrollToTop">
      <span class="arrow-up">↑</span>
      <span class="vertical-text">Về đầu trang</span>
    </button>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  data() {
    return {
      showButton: false,
    };
  },
  methods: {
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    handleScroll() {
      this.showButton = window.scrollY > 100;
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>

<style scoped>
.footer {
  background: #fff;
  color: #333;
  border-top: 1px solid #ccc;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: space-between;
}

.footer-column {
  flex: 1;
  min-width: 250px;
}

.text-center {
  text-align: center;
}

.footer-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.footer-small {
  font-weight: normal;
  font-size: 12px;
}

.footer-phone {
  font-size: 24px;
  font-weight: bold;
  margin: 6px 0;
}

.footer-desc {
  margin-bottom: 20px;
}

.footer-img {
  max-width: 100%;
  border-radius: 4px;
  margin: 10px 0;
}

.footer-link {
  color: #666;
  text-decoration: underline;
  display: inline-block;
  margin-top: 4px;
}

.footer-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
  font-size: 20px;
  margin-top: 10px;
=======
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
  padding: 40px 0;
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
>>>>>>> 4a5121ce4d9ed7ceeb3f40ac917bea9a6c42fd31
}

.footer-bottom {
  text-align: center;
<<<<<<< HEAD
  border-top: 1px solid #ddd;
  padding: 15px 10px;
  font-size: 13px;
  color: #666;
}

/* Zalo icon mockup */
.zalo-icon {
  font-style: normal;
  font-weight: bold;
  background: #007fff;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  color: #333;
}

.arrow-up {
  font-size: 20px;
  line-height: 1;
  margin-bottom: 4px;
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg); /* Để chữ đọc từ dưới lên giống trong ảnh */
=======
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
>>>>>>> 4a5121ce4d9ed7ceeb3f40ac917bea9a6c42fd31
}
</style>
