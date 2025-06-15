<template>
  <Header />
  <div class="about-container">
    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <span class="current">Về chúng tôi</span>
    </div>

    <!-- Hero Section -->
    <div class="hero-section">
      <h1 class="hero-title">JUNO - Thương hiệu thời trang trẻ trung</h1>
      <p class="hero-subtitle">
        Nơi phong cách gặp gỡ sự sáng tạo, nơi chất lượng hòa quyện với xu hướng
      </p>
    </div>

    <!-- Story Section -->
    <div class="story-section">
      <div class="story-content">
        <h2>Câu chuyện của chúng tôi</h2>
        <p>
          JUNO được thành lập với tình yêu và đam mê dành cho thời trang. Chúng
          tôi tin rằng mỗi người đều xứng đáng được thể hiện cá tính riêng thông
          qua phong cách thời trang của mình.
        </p>
        <p>
          Từ những ngày đầu tiên, chúng tôi đã cam kết mang đến những sản phẩm
          chất lượng cao với thiết kế độc đáo, phù hợp với xu hướng thời trang
          hiện đại.
        </p>
      </div>
      <div class="story-image">
        <img src="../assets/images/about-story.jpg" alt="JUNO Story" />
      </div>
    </div>

    <!-- Values Section -->
    <div class="values-section">
      <h2>Giá trị cốt lõi</h2>
      <div class="values-grid">
        <div class="value-card">
          <i class="fas fa-star"></i>
          <h3>Chất lượng</h3>
          <p>
            Cam kết mang đến những sản phẩm chất lượng cao, bền bỉ với thời gian
          </p>
        </div>
        <div class="value-card">
          <i class="fas fa-heart"></i>
          <h3>Sáng tạo</h3>
          <p>Không ngừng đổi mới và sáng tạo trong thiết kế và phong cách</p>
        </div>
        <div class="value-card">
          <i class="fas fa-handshake"></i>
          <h3>Uy tín</h3>
          <p>
            Xây dựng niềm tin với khách hàng thông qua sự minh bạch và chuyên
            nghiệp
          </p>
        </div>
        <div class="value-card">
          <i class="fas fa-leaf"></i>
          <h3>Bền vững</h3>
          <p>Hướng đến phát triển bền vững và thân thiện với môi trường</p>
        </div>
      </div>
    </div>

    <!-- Milestones Section -->
    <div class="milestones-section">
      <h2>Những cột mốc phát triển</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="year">2015</div>
          <div class="content">
            <h3>Thành lập JUNO</h3>
            <p>Ra mắt thương hiệu với bộ sưu tập đầu tiên</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="year">2017</div>
          <div class="content">
            <h3>Mở rộng thị trường</h3>
            <p>Phát triển hệ thống cửa hàng trên toàn quốc</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="year">2019</div>
          <div class="content">
            <h3>Đổi mới công nghệ</h3>
            <p>Ứng dụng công nghệ số trong sản xuất và kinh doanh</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="year">2023</div>
          <div class="content">
            <h3>Phát triển bền vững</h3>
            <p>Triển khai chiến lược phát triển bền vững</p>
          </div>
        </div>
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
  name: "About",
  components: {
    Header,
    Footer,
    Chatbot,
  },
};
</script>

<style scoped>
.about-container {
  width: 95%;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
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

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 60px 0;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5));
  background-size: cover;
  background-position: center;
  color: white;
  border-radius: 8px;
  margin-bottom: 40px;
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
}

/* Story Section */
.story-section {
  display: flex;
  gap: 40px;
  margin-bottom: 60px;
  align-items: center;
}

.story-content {
  flex: 1;
}

.story-content h2 {
  color: #333;
  margin-bottom: 20px;
}

.story-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.story-image {
  flex: 1;
}

.story-image img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Values Section */
.values-section {
  margin-bottom: 60px;
}

.values-section h2 {
  text-align: center;
  margin-bottom: 40px;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.value-card {
  text-align: center;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.value-card:hover {
  transform: translateY(-5px);
}

.value-card i {
  font-size: 2rem;
  color: #e63946;
  margin-bottom: 20px;
}

.value-card h3 {
  margin-bottom: 15px;
  color: #333;
}

.value-card p {
  color: #666;
  line-height: 1.6;
}

/* Milestones Section */
.milestones-section {
  margin-bottom: 60px;
}

.milestones-section h2 {
  text-align: center;
  margin-bottom: 40px;
}

.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: #e63946;
}

.timeline-item {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  position: relative;
}

.year {
  background: #e63946;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  margin: 0 20px;
}

.content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.content h3 {
  color: #333;
  margin-bottom: 10px;
}

.content p {
  color: #666;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .story-section {
    flex-direction: column;
  }

  .timeline::before {
    left: 0;
  }

  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 20px;
  }

  .year {
    margin-bottom: 10px;
  }
}
</style>
