import axios from "axios";

const backendUrl = "http://localhost:3005";
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const promotionService = {
  backendUrl,

  // Lấy danh sách promotion đang active
  async getActivePromotions() {
    try {
      const response = await axios.get(
        `${backendUrl}/api/promotions/active`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching active promotions:", error);
      throw error;
    }
  },

  // Lấy danh sách sản phẩm đang được giảm giá
  async getDiscountedProducts() {
    try {
      const response = await axios.get(
        `${backendUrl}/api/promotions/discounted-products`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching discounted products:", error);
      throw error;
    }
  },

  // Lấy promotion theo code
  async getByCode(code) {
    try {
      const response = await axios.get(
        `${backendUrl}/api/promotions/code/${code}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching promotion by code:", error);
      throw error;
    }
  },

  // Lấy tất cả promotion (cho admin)
  async getAll() {
    try {
      const response = await axios.get(
        `${backendUrl}/api/promotions`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all promotions:", error);
      throw error;
    }
  },

  // Lấy promotion theo ID
  async getById(id) {
    try {
      const response = await axios.get(
        `${backendUrl}/api/promotions/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching promotion by id:", error);
      throw error;
    }
  },

  // Thêm promotion mới
  async add(data) {
    try {
      const response = await axios.post(
        `${backendUrl}/api/promotions`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error adding promotion:", error);
      throw error;
    }
  },

  // Cập nhật promotion
  async update(id, data) {
    try {
      const response = await axios.put(
        `${backendUrl}/api/promotions/${id}`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error updating promotion:", error);
      throw error;
    }
  },

  // Xóa promotion
  async delete(id) {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/promotions/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting promotion:", error);
      throw error;
    }
  },

  // Khôi phục promotion đã xóa
  async restore(id) {
    try {
      const response = await axios.post(
        `${backendUrl}/api/promotions/${id}/restore`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error restoring promotion:", error);
      throw error;
    }
  },

  // Kiểm tra voucher có hợp lệ không
  async validateVoucher(code, orderValue) {
    try {
      const response = await axios.get(
        `${backendUrl}/api/promotions/code/${code}`,
        getAuthHeaders()
      );

      if (response.data && response.data.data) {
        const voucher = response.data.data;

        // Kiểm tra loại promotion
        if (voucher.type !== "voucher") {
          throw new Error("Mã không phải là voucher giảm giá");
        }

        // Kiểm tra trạng thái
        if (voucher.publish !== "active") {
          throw new Error("Voucher không còn hiệu lực");
        }

        // Kiểm tra thời gian hiệu lực
        const now = new Date();
        const startDate = voucher.start_date
          ? new Date(voucher.start_date)
          : null;
        const endDate = voucher.end_date ? new Date(voucher.end_date) : null;

        if (startDate && startDate > now) {
          throw new Error("Voucher chưa đến thời gian sử dụng");
        }
        if (endDate && endDate < now) {
          throw new Error("Voucher đã hết hạn");
        }

        // Kiểm tra điều kiện giá trị đơn hàng
        if (
          voucher.voucher_condition?.min_order_value &&
          orderValue < voucher.voucher_condition.min_order_value
        ) {
          throw new Error(
            `Đơn hàng tối thiểu phải là ₫${voucher.voucher_condition.min_order_value.toLocaleString()}`
          );
        }

        return voucher;
      }
      throw new Error("Không tìm thấy voucher");
    } catch (error) {
      console.error("Error validating voucher:", error);
      throw error;
    }
  },

  // Tính toán giá sau khi áp dụng voucher
  calculateDiscount(orderValue, voucher) {
    if (!voucher) return { discount: 0, finalPrice: orderValue };

    const discount = (orderValue * voucher.discount) / 100;
    const maxDiscount = voucher.voucher_condition?.max_discount || Infinity;
    const finalDiscount = Math.min(discount, maxDiscount);

    return {
      discount: finalDiscount,
      finalPrice: orderValue - finalDiscount,
    };
  },
};

export { promotionService };
