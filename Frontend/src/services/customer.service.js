import axios from "axios";

const API_URL = "http://localhost:3005/api";

export const customerService = {
  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để cập nhật thông tin");
      }

      const response = await axios.put(
        `${API_URL}/customers/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  async uploadProfileImage(imageFile) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để cập nhật ảnh đại diện");
      }

      // Convert image to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(imageFile);
      const base64Image = await base64Promise;

      // Log để kiểm tra dữ liệu
      console.log("Sending image data:", {
        imageSize: base64Image.length,
        imageType: imageFile.type,
      });

      const response = await axios.post(
        `${API_URL}/customers/upload-image`,
        { image: base64Image },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.image) {
        throw new Error("Không nhận được dữ liệu ảnh từ server");
      }

      return response.data;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },
};
