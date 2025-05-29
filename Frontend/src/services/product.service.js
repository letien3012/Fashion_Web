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

const productService = {
  backendUrl,

  async getNewArrivals() {
    try {
      const response = await axios.get(`${backendUrl}/api/products`, {
        params: { sort: "createdAt", order: "desc" },
        ...getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
      throw error;
    }
  },

  async getProductsByCategory(categoryId) {
    try {
      const response = await axios.get(
        `${backendUrl}/api/products/category/${categoryId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },

  async getProductById(id) {
    try {
      const response = await axios.get(`${backendUrl}/api/products/${id}`);
      console.log("Product response:", response); // Debug log
      if (response.data && response.data.data) {
        return response.data;
      } else if (response.data) {
        return { data: response.data };
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  async getProductVariants(productId, size, color) {
    try {
      const response = await axios.get(
        `${backendUrl}/api/products/${productId}/variants`,
        {
          params: { size, color },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProductVariantDetails(productId, size, color) {
    try {
      const response = await axios.get(
        `${backendUrl}/api/products/${productId}/variant-details`,
        {
          params: { size, color },
        }
      );
      console.log("Variant response:", response); // Debug log
      if (response.data && response.data.data) {
        return response.data;
      } else if (response.data) {
        return { data: response.data };
      } else {
        throw new Error("Invalid variant response format");
      }
    } catch (error) {
      console.error("Error fetching variant details:", error);
      throw error;
    }
  },

  async searchProducts(query) {
    try {
      const response = await axios.get(`${backendUrl}/api/products/search`, {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  },

  async getProductPromotions(productId, variantId) {
    try {
      const response = await axios.get(`${backendUrl}/api/promotions/active`);
      if (response.data && response.data.data) {
        const promotions = response.data.data;
        const now = new Date();

        console.log("All promotions:", promotions);
        console.log(
          "Checking for productId:",
          productId,
          "variantId:",
          variantId
        );

        const filteredPromotions = promotions.filter((promotion) => {
          // Kiểm tra loại promotion và trạng thái
          if (promotion.type !== "product") {
            console.log("Filtered out - wrong type:", promotion.type);
            return false;
          }
          if (promotion.publish !== "active") {
            console.log("Filtered out - not active:", promotion.publish);
            return false;
          }

          // Kiểm tra thời gian hiệu lực
          const startDate = promotion.start_date
            ? new Date(promotion.start_date)
            : null;
          const endDate = promotion.end_date
            ? new Date(promotion.end_date)
            : null;

          if (startDate && startDate > now) {
            console.log(
              "Filtered out - not started yet:",
              promotion.start_date
            );
            return false;
          }
          if (endDate && endDate < now) {
            console.log("Filtered out - expired:", promotion.end_date);
            return false;
          }

          // Kiểm tra sản phẩm và variant
          if (!promotion.productId || !Array.isArray(promotion.productId)) {
            console.log("Filtered out - invalid productId array");
            return false;
          }

          const matches = promotion.productId.some((item) => {
            if (!item.productId || !item.variantId) {
              console.log(
                "Filtered out - missing productId or variantId in item"
              );
              return false;
            }
            const productMatch = item.productId._id === productId;
            const variantMatch = item.variantId === variantId;
            console.log("Checking item:", {
              itemProductId: item.productId._id,
              itemVariantId: item.variantId,
              productMatch,
              variantMatch,
            });
            return productMatch && variantMatch;
          });

          if (matches) {
            console.log("Found matching promotion:", promotion);
          } else {
            console.log("No matching product/variant found in promotion");
          }

          return matches;
        });

        console.log("Filtered promotions:", filteredPromotions);
        return filteredPromotions;
      }
      return [];
    } catch (error) {
      console.error("Error fetching product promotions:", error);
      return [];
    }
  },

  async getVariantConsignment(variantId) {
    try {
      const response = await axios.get(
        `${backendUrl}/api/variants/${variantId}/consignment`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getVariantStock(productId, variantId) {
    try {
      const response = await axios.get(
        `${backendUrl}/api/consignments/product/${productId}/variant/${variantId}/stock`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching variant stock:", error);
      throw error;
    }
  },

  async getAttributeById(id) {
    try {
      const response = await axios.get(`${backendUrl}/api/attributes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getAttributeCatalogueById(id) {
    try {
      const response = await axios.get(
        `${backendUrl}/api/attributeCatalogues/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getAttributeWithCatalogue(id) {
    try {
      const attribute = await this.getAttributeById(id);
      if (attribute && attribute.data) {
        const catalogue = await this.getAttributeCatalogueById(
          attribute.data.attributeCatalogueId
        );
        return {
          ...attribute.data,
          group: catalogue,
        };
      }
      return null;
    } catch (error) {
      throw error;
    }
  },
};

export const getVariantPrice = async (productId, variantId) => {
  const res = await axios.get(
    `${backendUrl}/api/products/variant-price/${productId}/${variantId}`
  );
  return res.data; // { price, priceSale }
};

export { productService };
