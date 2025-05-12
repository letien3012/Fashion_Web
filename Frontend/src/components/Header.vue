<template>
  <header class="header">
    <div class="logo">JUNO</div>
    <nav class="nav-menu">
      <router-link to="/hang-moi" class="nav-item">HÀNG MỚI</router-link>
      <router-link to="/san-pham" class="nav-item">SẢN PHẨM</router-link>
      <router-link to="/bst-he-nonstop" class="nav-item">BST HÈ NONSTOP</router-link>
      <router-link to="/sale-happy-friday" class="nav-item">SALE HAPPY FRIDAY</router-link>
      <router-link to="/sale-quan-ao" class="nav-item">SALE QUẦN ÁO</router-link>
      <router-link to="/showroom" class="nav-item">SHOWROOM</router-link>
    </nav>
    <div class="search-bar">
      <input v-model="searchQuery" type="text" placeholder="Tìm kiếm" @keyup.enter="handleSearch" />
    </div>
    <div class="user-icons">
      <router-link to="/user" class="icon"><i class="fas fa-user"></i></router-link>
      <router-link to="/login" class="icon"><i class="fas fa-lock"></i></router-link>
    </div>
  </header>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const searchQuery = ref('');
    const router = useRouter();

    const handleSearch = () => {
      if (searchQuery.value) {
        router.push({ path: '/search', query: { q: searchQuery.value } });
        searchQuery.value = '';
      }
    };

    return { searchQuery, handleSearch };
  },
};
</script>

<style scoped>
.header {
  display: flex;
  width: 100vw;
  flex-direction: row;
  align-items: center;
  padding: 20px;
  margin-bottom: 10px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.logo {
  font-size: 24px;
  font-weight: bold;
  color: #ff0000;
  margin-right: 20px;
}
.nav-menu {
  display: flex;
  flex-grow: 1;
}
.nav-item {
  margin: 0 15px;
  text-decoration: none;
  color: #000;
  font-weight: 500;
  font-size: 15px;
}
.nav-item.router-link-active {
  color: #ff0000;
}
.search-bar input {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.user-icons {
  display: flex;
  margin-left: 20px;
}
.icon {
  margin-left: 15px;
  font-size: 18px;
  color: #000;
  text-decoration: none;
}
</style>