const mongoose = require('mongoose');

const attributeCatalogueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Static method to get all active catalogues
attributeCatalogueSchema.statics.getAllCatalogues = function() {
  return this.find({ deletedAt: null });
};

// Static method to find active catalogue by ID
attributeCatalogueSchema.statics.findActiveById = function(id) {
  return this.findOne({ _id: id, deletedAt: null });
};

// Static method to soft delete catalogue
attributeCatalogueSchema.statics.softDelete = async function(id) {
  return this.findByIdAndUpdate(
    id,
    { deletedAt: new Date() },
    { new: true }
  );
};

const AttributeCatalogue = mongoose.model('AttributeCatalogue', attributeCatalogueSchema);

module.exports = AttributeCatalogue;
