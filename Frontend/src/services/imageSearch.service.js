import axios from "axios";

const backendUrl = import.meta.env.VITE_API_BASE_URL;
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const imageSearchService = {
  backendUrl,

  async uploadImage(base64Image, folder = "detect") {
    try {
      const response = await axios.post(
        `${backendUrl}/api/imageService/upload`,
        { base64Image, folder }
      );
      console.log("Image uploaded successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  async detectObjects(imagePath) {
    try {
      const response = await axios.post(
        `${backendUrl}/api/imageService/detect`,
        { imagePath }
      );
      return response.data;
    } catch (error) {
      console.error("Error detecting objects:", error);
      throw error;
    }
  },

  async cropImage(cropData) {
    try {
      const response = await axios.post(
        `${backendUrl}/api/imageService/crop`,
        cropData
      );
      return response.data;
    } catch (error) {
      console.error("Error cropping image:", error);
      throw error;
    }
  },

  async findSimilarImages(base64Image, limit = 8) {
    try {
      const response = await axios.post(
        `${backendUrl}/api/imageService/find-similar`,
        { base64Image, limit }
      );
      return response.data;
    } catch (error) {
      console.error("Error finding similar images:", error);
      throw error;
    }
  },

  async deleteImage(imagePath) {
    try {
      const response = await axios.post(
        `${backendUrl}/api/imageService/delete`,
        { imagePath }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },

  // Helper method to process search results and get product details
  async processSearchResults(similarImages) {
    try {
      if (!similarImages || similarImages.length === 0) {
        return { similarImages: [], products: [] };
      }

      // Extract product IDs from similar images
      const productIds = similarImages.map((img) => img.productId);

      // Get product details
      const products = await Promise.all(
        productIds.map(async (productId) => {
          try {
            const response = await axios.get(
              `${backendUrl}/api/products/${productId}`
            );
            const product = response.data.data;

            // Get default variant
            const defaultVariant = product.variants?.[0] || {};

            // Get promotions if variant exists
            let salePrice = null;
            let discountPercentage = null;
            if (defaultVariant._id) {
              const promotions = await this.getProductPromotions(
                product._id,
                defaultVariant._id
              );
              if (promotions && promotions.length > 0) {
                const bestPromotion = promotions.reduce((max, p) =>
                  p.discount > max.discount ? p : max
                );
                discountPercentage = bestPromotion.discount;
                salePrice =
                  Math.round(
                    (defaultVariant.price -
                      (defaultVariant.price * bestPromotion.discount) / 100) *
                      100
                  ) / 100;
              }
            }

            return {
              _id: product._id || "",
              name: product.name || "",
              image: this.getImageUrl(product.image),
              album: (product.album || []).map((img) => this.getImageUrl(img)),
              price: defaultVariant.price || 0,
              salePrice,
              discountPercentage,
              favorite_count: product.favorite_count || 0,
              variants: product.variants || [],
              catalogueId: product.catalogueId || null,
              publish: product.publish || false,
              description: product.description || "",
              content: product.content || "",
              view_count: product.view_count || 0,
              similarity:
                similarImages.find((img) => img.productId === product._id)
                  ?.similarity || 0,
            };
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed product fetches
      const validProducts = products.filter((product) => product !== null);

      return {
        similarImages,
        products: validProducts,
      };
    } catch (error) {
      console.error("Error processing search results:", error);
      throw error;
    }
  },

  // Helper method to get image URL
  getImageUrl(image) {
    if (!image) return "/images/placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `${this.backendUrl}/${image}`;
  },

  // Helper method to get product promotions
  async getProductPromotions(productId, variantId) {
    try {
      const response = await axios.get(`${backendUrl}/api/promotions/active`);
      if (response.data && response.data.data) {
        const promotions = response.data.data;
        const now = new Date();

        return promotions.filter((promotion) => {
          if (promotion.type !== "product" || promotion.publish !== "active") {
            return false;
          }

          const startDate = promotion.start_date
            ? new Date(promotion.start_date)
            : null;
          const endDate = promotion.end_date
            ? new Date(promotion.end_date)
            : null;

          if (startDate && startDate > now) return false;
          if (endDate && endDate < now) return false;

          if (!promotion.productId || !Array.isArray(promotion.productId)) {
            return false;
          }

          return promotion.productId.some((item) => {
            if (!item.productId || !item.variantId) return false;
            return (
              item.productId._id === productId && item.variantId === variantId
            );
          });
        });
      }
      return [];
    } catch (error) {
      console.error("Error fetching product promotions:", error);
      return [];
    }
  },
};

export { imageSearchService };
