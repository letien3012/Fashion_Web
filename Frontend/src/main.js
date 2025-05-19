import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/css/all.css";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

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

// Toast configuration
app.use(toast, {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
  transition: "bounce",
  limit: 3,
  rtl: false,
  closeButton: true,
  newestOnTop: true,
  pauseOnFocusLoss: true,
  preventDuplicates: true,
});

app.use(router);
// app.use(BootstrapVueNext);
app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
