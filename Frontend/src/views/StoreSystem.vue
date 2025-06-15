<template>
  <Header />
  <div class="page-container">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <span class="current">Hệ thống cửa hàng</span>
    </div>

    <h1 class="page-title">Hệ thống cửa hàng JUNO</h1>

    <!-- Giới thiệu ngắn -->
    <div class="intro-section">
      <p>
        JUNO - Thương hiệu thời trang trẻ trung, năng động với phong cách thiết
        kế độc đáo và chất lượng vượt trội.
      </p>
    </div>

    <!-- Container chính cho danh sách cửa hàng và bản đồ -->
    <div class="store-container">
      <!-- Danh sách cửa hàng bên trái -->
      <div class="store-list">
        <h2>Hệ thống cửa hàng</h2>
        <div
          class="store-item"
          v-for="store in stores"
          :key="store.id"
          @click="selectStore(store)"
        >
          <h3>{{ store.name }}</h3>
          <p><i class="fas fa-map-marker-alt"></i> {{ store.address }}</p>
          <p><i class="fas fa-phone"></i> {{ store.phone }}</p>
          <p><i class="fas fa-clock"></i> {{ store.hours }}</p>
        </div>
      </div>

      <!-- Bản đồ bên phải -->
      <div class="map-container">
        <div id="map" ref="map"></div>
      </div>
    </div>
  </div>
  <Footer />
  <Chatbot />
</template>

<script>
import { ref, onMounted } from "vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Chatbot from "../components/Chatbot.vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
  name: "StoreSystem",
  components: {
    Header,
    Footer,
    Chatbot,
  },
  setup() {
    const map = ref(null);
    const mapInstance = ref(null);
    const markers = ref([]);
    const stores = ref([
      {
        id: 1,
        name: "JUNO Hà Nội",
        address: "123 Nguyễn Huệ, Quận 1, Hà Nội",
        phone: "024 1234 5678",
        hours: "9:00 - 22:00",
        lat: 21.0285,
        lng: 105.8542,
      },
      {
        id: 2,
        name: "JUNO Hồ Chí Minh",
        address: "456 Lê Lợi, Quận 1, TP.HCM",
        phone: "028 8765 4321",
        hours: "9:00 - 22:00",
        lat: 10.7757,
        lng: 106.7004,
      },
      {
        id: 3,
        name: "JUNO Đà Nẵng",
        address: "789 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng",
        phone: "0236 9876 5432",
        hours: "9:00 - 22:00",
        lat: 16.0544,
        lng: 108.2022,
      },
    ]);

    const selectStore = (store) => {
      if (mapInstance.value) {
        mapInstance.value.setView([store.lat, store.lng], 15);
      }
    };

    onMounted(() => {
      mapInstance.value = L.map("map").setView([10.029, 105.7689], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstance.value);
      // Thêm marker cho từng cửa hàng
      stores.value.forEach((store) => {
        const marker = L.marker([store.lat, store.lng])
          .addTo(mapInstance.value)
          .bindPopup(`<b>${store.name}</b><br>${store.address}`);
        markers.value.push(marker);
      });
    });

    return {
      stores,
      selectStore,
    };
  },
};
</script>

<style scoped>
.page-container {
  width: 95%;
  margin: 0 auto;
  padding: 20px;
  margin-bottom: 50px;
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

.page-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.intro-section {
  text-align: center;
  margin-bottom: 40px;
  font-size: 1.1em;
  color: #666;
}

.store-container {
  display: flex;
  gap: 30px;
  min-height: 600px;
}

.store-list {
  flex: 1;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 8px;
}

.store-list h2 {
  margin-bottom: 20px;
  color: #333;
}

.store-item {
  padding: 15px;
  margin-bottom: 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.store-item:hover {
  transform: translateY(-2px);
}

.store-item h3 {
  color: #ff0000;
  margin-bottom: 10px;
}

.store-item p {
  margin: 5px 0;
  color: #666;
}

.store-item i {
  margin-right: 8px;
  color: #ff0000;
}

.map-container {
  flex: 2;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

#map {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

@media (max-width: 768px) {
  .store-container {
    flex-direction: column;
  }

  .map-container {
    height: 400px;
  }
}
</style>
