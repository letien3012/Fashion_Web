<template>
  <div class="otp-container">
    <h2>Xác thực</h2>
    <p>Mã OTP đã được gửi qua email của bạn</p>

    <div class="otp-inputs">
      <input
        v-for="(digit, index) in otp"
        :key="index"
        type="text"
        maxlength="1"
        v-model="otp[index]"
        @input="handleInput(index, $event)"
        @keydown="handleKeydown(index, $event)"
        @paste="handlePaste"
      />
    </div>

    <button class="verify-btn" @click="verifyOtp">Tiếp tục</button>

    <p class="resend-text">
      Bạn không nhận được mã?
      <span v-if="countdown > 0" style="color: gray">
        Gửi lại sau {{ countdown }}s
      </span>
      <a v-else href="#" @click="resendOtp">Gửi lại</a>
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      otp: ["", "", "", "", "", ""],
      countdown: 60,
      timer: null,
    };
  },
  mounted() {
    this.startCountdown();
  },
  methods: {
    startCountdown() {
      this.countdown = 60;
      if (this.timer) clearInterval(this.timer);

      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, 1000);
    },
    resendOtp() {
      if (this.countdown > 0) return;

      const email = localStorage.getItem("signup_email");

      fetch("http://localhost:3005/api/mail/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      })
        .then((res) => res.json())
        .then((data) => {
          this.startCountdown();
        })
        .catch((err) => {
          console.error(err);
        });
    },

    validateKey(event) {
      const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab"];
      if (!/^[0-9]$/.test(event.key) && !allowedKeys.includes(event.key)) {
        event.preventDefault(); // Chặn ký tự không hợp lệ
      }
    },
    focusNext(index, event) {
      const value = event.target.value;

      // Nếu người dùng nhập 1 số, chuyển focus sang ô tiếp theo
      if (value.length === 1 && index < this.otp.length - 1) {
        const nextInput = event.target.nextElementSibling;
        if (nextInput) nextInput.focus();
      }

      // Nếu người dùng nhấn Backspace và ô hiện tại đang trống, quay về ô trước
      if (event.key === "Backspace" && !value && index > 0) {
        const prevInput = event.target.previousElementSibling;
        if (prevInput) prevInput.focus();
      }
    },
    handleInput(index, event) {
      const value = event.target.value;

      // Chỉ cho phép số
      if (!/^[0-9]$/.test(value)) {
        this.otp[index] = "";
        return;
      }

      if (value.length === 1 && index < this.otp.length - 1) {
        const nextInput = event.target.nextElementSibling;
        if (nextInput) nextInput.focus();
      }
    },
    handlePaste(event) {
      event.preventDefault();
      const pasteData = event.clipboardData.getData("text").trim();

      if (!/^\d{6}$/.test(pasteData)) {
        alert("Mã OTP phải gồm 6 chữ số.");
        return;
      }

      // Cập nhật các ô OTP
      for (let i = 0; i < this.otp.length; i++) {
        this.otp[i] = pasteData[i];
      }

      // Tự động focus vào ô cuối cùng
      this.$nextTick(() => {
        const inputs = event.target.parentElement.querySelectorAll("input");
        if (inputs.length) {
          inputs[this.otp.length - 1].focus();
        }
      });
    },
    handleKeydown(index, event) {
      const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab"];
      // ✅ Nếu là Ctrl+V hoặc Cmd+V
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
        event.preventDefault(); // Ngăn dán mặc định nếu muốn xử lý riêng

        navigator.clipboard
          .readText()
          .then((text) => {
            const pasteData = text.trim();
            if (!/^\d{6}$/.test(pasteData)) {
              alert("Mã OTP phải gồm 6 chữ số.");
              return;
            }

            for (let i = 0; i < this.otp.length; i++) {
              this.otp[i] = pasteData[i];
            }

            // Focus vào ô cuối cùng
            this.$nextTick(() => {
              const inputs =
                event.target.parentElement.querySelectorAll("input");
              if (inputs.length) {
                inputs[this.otp.length - 1].focus();
              }
            });
          })
          .catch((err) => {
            console.error("Không đọc được clipboard:", err);
          });

        return;
      }
      if (!/^[0-9]$/.test(event.key) && !allowedKeys.includes(event.key)) {
        event.preventDefault(); // Chặn ký tự không hợp lệ
      }

      // Khi Backspace trên ô trống → lùi về ô trước
      if (event.key === "Backspace" && this.otp[index] === "" && index > 0) {
        const prevInput = event.target.previousElementSibling;
        if (prevInput) prevInput.focus();
      }
    },
    verifyOtp() {
      const code = this.otp.join("").trim();

      if (code.length !== 6 || this.otp.includes("")) {
        alert("Vui lòng nhập đầy đủ 6 chữ số.");
        return;
      }

      const payload = {
        email: localStorage.getItem("signup_email"),
        code: code,
      };

      fetch("http://localhost:3005/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          if (!res.ok) {
            // Nếu status không 200-299, có thể đọc json để lấy message lỗi
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `Lỗi server: ${res.status}`);
          }
          return res.json(); // parse JSON từ response
        })
        .then((data) => {
          if (data.success) {
            alert("✅ Xác thực thành công!");
            this.$router.push({ name: "CreatePW" });
          } else {
            alert(`❌ ${data.message}`);
          }
        })
        .catch((err) => {
          console.error("Lỗi xác thực:", err);
          alert(`Đã xảy ra lỗi: ${err.message || "Vui lòng thử lại."}`);
        });
    },
  },
};
</script>

<style scoped>
.otp-container {
  width: 50vw;
  height: auto;
  margin: 40px auto;
  padding: 30px;
  text-align: center;
  border: 2px solid #ddd;
  background: #f7f7f7;
  border-radius: 10px;
  font-family: "Open Sans", sans-serif;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.otp-inputs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.otp-inputs input {
  width: 40px;
  height: 40px;
  text-align: center;
  font-size: 20px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.verify-btn {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  background-color: #2366d1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.resend-text {
  margin-top: 15px;
  font-size: 14px;
}

.resend-text a {
  color: #2366d1;
  text-decoration: none;
  font-weight: 600;
}
</style>
