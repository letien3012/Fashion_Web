<template>
  <div class="image-feature-upload">
    <div class="upload-container">
      <h2>Upload Image and Extract Features</h2>
      
      <!-- Upload Area -->
      <div 
        class="upload-area"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
        :class="{ 'is-dragging': isDragging }"
      >
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          accept="image/*"
          class="file-input"
          hidden
        />
        <div class="upload-content">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Drag and drop an image here or click to select</p>
          <p class="upload-hint">Supported formats: JPG, PNG, JPEG (max 5MB)</p>
        </div>
      </div>

      <!-- Preview Area -->
      <div v-if="previewUrl" class="preview-container">
        <img :src="previewUrl" alt="Preview" class="preview-image" />
        <div class="preview-actions">
          <button 
            @click="uploadImage" 
            :disabled="isUploading"
            class="upload-button"
          >
            <span v-if="!isUploading">Extract & Save Features</span>
            <span v-else>Processing...</span>
          </button>
          <button 
            @click="clearPreview" 
            class="clear-button"
            :disabled="isUploading"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Status Messages -->
      <div v-if="statusMessage" :class="['status-message', statusType]">
        {{ statusMessage }}
      </div>

      <!-- Upload Progress -->
      <div v-if="isUploading" class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
        <span class="progress-text">{{ uploadProgress }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ImageFeatureUpload',
  data() {
    return {
      selectedFile: null,
      previewUrl: null,
      isDragging: false,
      isUploading: false,
      uploadProgress: 0,
      statusMessage: '',
      statusType: 'info', // 'info', 'success', 'error'
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.processFile(file);
      }
    },

    handleDrop(event) {
      this.isDragging = false;
      const file = event.dataTransfer.files[0];
      if (file) {
        this.processFile(file);
      }
    },

    processFile(file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showStatus('Please select an image file', 'error');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showStatus('File size must be less than 5MB', 'error');
        return;
      }

      this.selectedFile = file;
      this.createPreview(file);
      this.showStatus('Image selected. Click "Extract & Save Features" to process', 'info');
    },

    createPreview(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    async uploadImage() {
      if (!this.selectedFile) return;

      this.isUploading = true;
      this.uploadProgress = 0;
      this.showStatus('Uploading and processing image...', 'info');

      const formData = new FormData();
      formData.append('image', this.selectedFile);

      try {
        const response = await axios.post('http://localhost:3005/api/imageService/extract-features', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          }
        });
        console.log(response);
        if (response.data.success) {
          this.showStatus('Features extracted and saved successfully!', 'success');
          // Emit event for parent component
          this.$emit('features-saved', {
            imagePath: response.data.imagePath,
            featureId: response.data.featureId
          });
        } else {
          throw new Error(response.data.message || 'Upload failed');
        }
      } catch (error) {
        this.showStatus(
          error.response?.data?.error || error.message || 'Upload failed',
          'error'
        );
      } finally {
        this.isUploading = false;
      }
    },

    clearPreview() {
      this.selectedFile = null;
      this.previewUrl = null;
      this.uploadProgress = 0;
      this.statusMessage = '';
      this.$refs.fileInput.value = '';
    },

    showStatus(message, type = 'info') {
      this.statusMessage = message;
      this.statusType = type;
    }
  }
};
</script>

<style scoped>
.image-feature-upload {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.upload-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover,
.upload-area.is-dragging {
  border-color: #4CAF50;
  background: #f0f9f0;
}

.upload-content {
  color: #666;
}

.upload-content i {
  font-size: 48px;
  color: #4CAF50;
  margin-bottom: 10px;
}

.upload-hint {
  font-size: 0.9em;
  color: #999;
  margin-top: 5px;
}

.preview-container {
  margin-top: 20px;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preview-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.upload-button,
.clear-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.upload-button {
  background: #4CAF50;
  color: white;
}

.upload-button:hover:not(:disabled) {
  background: #45a049;
}

.clear-button {
  background: #f44336;
  color: white;
}

.clear-button:hover:not(:disabled) {
  background: #da190b;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.status-message.info {
  background: #e3f2fd;
  color: #1976d2;
}

.status-message.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-message.error {
  background: #ffebee;
  color: #c62828;
}

.progress-container {
  margin-top: 15px;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  text-align: center;
  margin-top: 5px;
  font-size: 0.9em;
  color: #666;
}
</style> 