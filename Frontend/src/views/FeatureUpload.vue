<template>
  <div class="feature-upload-view">
    <div class="container">
      <div class="header">
        <h1>Image Feature Management</h1>
        <p class="description">
          Upload images to extract and store their features for similarity search.
          These features will be used to find similar products in our database.
        </p>
      </div>

      <div class="content">
        <ImageFeatureUpload 
          @features-saved="handleFeaturesSaved"
          class="upload-section"
        />

        <!-- Recent Uploads Section -->
        <div v-if="recentUploads.length > 0" class="recent-uploads">
          <h2>Recent Uploads</h2>
          <div class="uploads-grid">
            <div v-for="upload in recentUploads" :key="upload.featureId" class="upload-card">
              <img :src="upload.imagePath" :alt="'Uploaded image ' + upload.featureId" class="upload-thumbnail" />
              <div class="upload-info">
                <p class="upload-id">ID: {{ upload.featureId }}</p>
                <p class="upload-time">{{ formatDate(upload.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ImageFeatureUpload from '../components/ImageFeatureUpload.vue';

export default {
  name: 'FeatureUpload',
  components: {
    ImageFeatureUpload
  },
  data() {
    return {
      recentUploads: []
    };
  },
  methods: {
    handleFeaturesSaved(data) {
      // Add the new upload to recent uploads
      this.recentUploads.unshift({
        ...data,
        timestamp: new Date()
      });

      // Keep only the last 6 uploads
      if (this.recentUploads.length > 6) {
        this.recentUploads = this.recentUploads.slice(0, 6);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  }
};
</script>

<style scoped>
.feature-upload-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #333;
  font-size: 2.5em;
  margin-bottom: 15px;
}

.description {
  color: #666;
  font-size: 1.1em;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.upload-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.recent-uploads {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.recent-uploads h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.uploads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.upload-card {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.upload-card:hover {
  transform: translateY(-2px);
}

.upload-thumbnail {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.upload-info {
  padding: 12px;
}

.upload-id {
  font-size: 0.9em;
  color: #666;
  margin: 0;
  word-break: break-all;
}

.upload-time {
  font-size: 0.8em;
  color: #999;
  margin: 5px 0 0 0;
}

@media (max-width: 768px) {
  .feature-upload-view {
    padding: 20px 10px;
  }

  .header h1 {
    font-size: 2em;
  }

  .uploads-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style> 