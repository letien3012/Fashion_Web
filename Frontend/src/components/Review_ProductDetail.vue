<template>
  <div class="product-review-section">
    <h2>ĐÁNH GIÁ SẢN PHẨM</h2>

    <div class="review-summary">
      <div class="average-rating">
        <span class="rating-number">{{
          Number(averageRating).toFixed(1)
        }}</span>
        trên 5
        <span v-if="totalReviews > 0" class="total-reviews"
          >({{ totalReviews }} đánh giá)</span
        >
        <span v-else class="total-reviews">(Chưa có đánh giá)</span>
        <div class="star-rating">
          <i
            class="fas fa-star"
            v-for="n in 5"
            :key="n"
            :class="{
              active: n <= Math.floor(averageRating),
              half: n === Math.ceil(averageRating) && averageRating % 1 !== 0,
            }"
          ></i>
        </div>
      </div>
      <div class="rating-filters">
        <button
          class="filter-btn"
          :class="{ active: currentFilter === 'all' }"
          @click="currentFilter = 'all'"
        >
          Tất Cả
        </button>
        <button
          class="filter-btn"
          :class="{ active: currentFilter === '5' }"
          @click="currentFilter = '5'"
        >
          5 Sao ({{ getRatingCount(5) }})
        </button>
        <button
          class="filter-btn"
          :class="{ active: currentFilter === '4' }"
          @click="currentFilter = '4'"
        >
          4 Sao ({{ getRatingCount(4) }})
        </button>
        <button
          class="filter-btn"
          :class="{ active: currentFilter === '3' }"
          @click="currentFilter = '3'"
        >
          3 Sao ({{ getRatingCount(3) }})
        </button>
        <button
          class="filter-btn"
          :class="{ active: currentFilter === '2' }"
          @click="currentFilter = '2'"
        >
          2 Sao ({{ getRatingCount(2) }})
        </button>
        <button
          class="filter-btn"
          :class="{ active: currentFilter === '1' }"
          @click="currentFilter = '1'"
        >
          1 Sao ({{ getRatingCount(1) }})
        </button>
        <button
          class="filter-btn"
          :class="{ active: currentFilter === 'withComment' }"
          @click="currentFilter = 'withComment'"
        >
          Có Bình Luận ({{ getCommentCount }})
        </button>
      </div>
    </div>

    <div v-if="reviews.length" class="review-list">
      <div
        class="review-item"
        v-for="(review, idx) in displayedReviews"
        :key="idx"
      >
        <div class="review-header">
          <img
            :src="
              review.customerId?.image
                ? `${baseUrl}${review.customerId.image}`
                : defaultAvatar
            "
            class="user-avatar"
          />
          <div class="header-info">
            <b>{{ review.customerId?.fullname || "Ẩn danh" }}</b>
            <span class="review-rating">
              <i
                class="fas fa-star"
                v-for="n in 5"
                :key="n"
                :class="{ active: n <= review.star }"
              ></i>
            </span>
            <div class="review-meta">
              {{ formatDate(review.createdAt) }}
            </div>
          </div>
        </div>
        <div class="review-content-area">
          <div class="review-text">
            <p>{{ review.content }}</p>
          </div>
          <div
            class="review-media"
            v-if="(review.images && review.images.length > 0) || review.video"
          >
            <img
              v-for="(image, imgIdx) in review.images"
              :key="imgIdx"
              :src="`${baseUrl}${image}`"
              alt="Review Image"
              class="review-image"
            />
          </div>
        </div>

        <div v-if="review.reply && review.reply.length > 0" class="admin-reply">
          <b>Phản Hồi Của Người Bán:</b> {{ review.reply[0].content }}
        </div>
      </div>
      <div v-if="hasMoreReviews" class="load-more-container">
        <button class="load-more-btn" @click="loadMore">
          Xem thêm đánh giá
        </button>
      </div>
    </div>
    <div v-else class="no-reviews">
      <i>Chưa có đánh giá nào cho sản phẩm này.</i>
    </div>
  </div>
</template>

<script>
import defaultAvatar from "../assets/images/avatar_default.jpg";

export default {
  name: "Review_ProductDetail",
  props: {
    product: { type: Object, required: true },
    reviews: { type: Array, default: () => [] },
    averageRating: { type: [Number, String], default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  data() {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    return {
      userAvatar: defaultAvatar, // Default avatar path
      currentFilter: "all",
      displayCount: 5,
      baseUrl,
    };
  },
  computed: {
    filteredReviews() {
      let filtered = this.reviews;
      if (this.currentFilter !== "all") {
        if (this.currentFilter === "withComment") {
          filtered = filtered.filter(
            (r) => r.content && r.content.trim() !== ""
          );
        } else {
          const rating = parseInt(this.currentFilter);
          filtered = filtered.filter((r) => r.star === rating);
        }
      }
      return filtered;
    },
    displayedReviews() {
      return this.filteredReviews.slice(0, this.displayCount);
    },
    hasMoreReviews() {
      return this.displayCount < this.filteredReviews.length;
    },
    getCommentCount() {
      return this.filteredReviews.filter(
        (r) => r.content && r.content.trim() !== ""
      ).length;
    },
    getRatingCount() {
      return (rating) =>
        this.filteredReviews.filter((r) => r.star === rating).length;
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    loadMore() {
      this.displayCount += 5;
    },
  },
};
</script>

<style scoped>
.product-review-section {
  margin: 32px auto 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 32px;
  font-family: "Segoe UI", Arial, sans-serif;
}

.product-review-section h2 {
  font-size: 1.5rem;
  margin-bottom: 24px;
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 16px;
}

.review-summary {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.6rem;
  color: #e74c3c;
  font-weight: 700;
  min-width: 120px;
}

.average-rating .rating-number {
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 8px;
}

.average-rating .star-rating {
  color: #ffd700;
  font-size: 1.4rem;
  letter-spacing: 2px;
}

.average-rating .star-rating i {
  color: #e0e0e0;
  transition: color 0.2s ease;
}

.average-rating .star-rating i.active {
  color: #ffd700;
  text-shadow: 0 0 2px rgba(255, 215, 0, 0.3);
}

.average-rating .filtered-rating {
  font-size: 0.9rem;
  color: #666;
  margin-top: 8px;
  font-style: italic;
}

.rating-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex: 1;
}

.filter-btn {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  color: #666;
}

.filter-btn:hover:not(.active) {
  border-color: #e74c3c;
  color: #e74c3c;
  transform: translateY(-1px);
}

.filter-btn.active {
  background: #e74c3c;
  color: #fff;
  border-color: #e74c3c;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.2);
}

.review-list {
  margin-top: 24px;
}

.review-item {
  border-bottom: 1px solid #f0f2f5;
  padding: 24px 0;
  transition: background-color 0.2s ease;
}

.review-item:hover {
  background-color: #f8f9fa;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-left: 40px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 16px;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-info b {
  font-size: 1.1rem;
  color: #2c3e50;
}

.header-info .review-rating {
  display: flex;
  gap: 2px;
}

.header-info .review-rating i {
  color: #e0e0e0;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.header-info .review-rating i.active {
  color: #ffd700;
}

.review-meta {
  font-size: 0.9rem;
  color: #95a5a6;
}

.review-content-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 64px;
}

.review-text {
  flex: 1;
  color: #34495e;
  line-height: 1.6;
}

.review-text p {
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.review-text p:last-child {
  margin-bottom: 0;
}

.review-media {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
  width: 100%;
}

.review-media img {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  aspect-ratio: 1;
}

.review-media img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.admin-reply {
  margin-top: 16px;
  margin-left: 64px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-left: 4px solid #e74c3c;
  border-radius: 8px;
  color: #2c3e50;
}

.admin-reply b {
  color: #e74c3c;
  margin-right: 8px;
}

.no-reviews {
  color: #7f8c8d;
  font-style: italic;
  text-align: center;
  padding: 40px 0;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 24px 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.no-reviews i {
  font-size: 1.1rem;
  line-height: 1.5;
  max-width: 80%;
}

.loading-state {
  color: #7f8c8d;
  text-align: center;
  padding: 40px 0;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 24px 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.error-state {
  color: #e74c3c;
  font-weight: 600;
  text-align: center;
  padding: 40px 0;
  background: #fdf3f2;
  border-radius: 12px;
  margin: 24px 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border: 1px solid #fadbd8;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 16px 0;
}

.load-more-btn {
  background: #fff;
  border: 2px solid #e74c3c;
  color: #e74c3c;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-btn:hover {
  background: #e74c3c;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
}

@media (max-width: 768px) {
  .product-review-section,
  .no-reviews,
  .loading-state,
  .error-state {
    width: 100%;
    padding: 20px;
    margin: 20px 10px;
  }

  .review-summary {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .rating-filters {
    justify-content: center;
  }

  .review-content-area {
    flex-direction: column;
    margin-left: 0;
  }

  .review-media {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .review-media img {
    height: 100px;
  }

  .admin-reply {
    margin-left: 0;
  }
}
</style>
