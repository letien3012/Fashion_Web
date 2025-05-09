import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/css/all.css";

// Bootstrap
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
// import BootstrapVueNext from "bootstrap-vue-next";

// Font Awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Thêm icon vào thư viện
library.add(fas, fab);

const app = createApp(App);

app.use(router);
// app.use(BootstrapVueNext);
app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
