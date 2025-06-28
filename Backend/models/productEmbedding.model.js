const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductEmbeddingSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true
    },
    embedding: {
        type: [Number],
        required: true
    },
    sourceText: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'product_embeddings'
});

module.exports = mongoose.model('ProductEmbedding', ProductEmbeddingSchema); 