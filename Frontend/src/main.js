import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/css/all.css";
import Vue3Toastify, { toast } from "vue3-toastify"; // ✅ Đúng

import "vue3-toastify/dist/index.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(fas, fab);

const app = createApp(App);

// ✅ Dùng đúng plugin
app.use(Vue3Toastify, {
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
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
