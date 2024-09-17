const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: String,
    inputImageUrls: [String],
    outputImageUrls: [String]
});

const requestSchema = new mongoose.Schema({
    requestId: String,
    products: [productSchema],
    status: { type: String, default: 'processing' },
    webhookUrl: String
});

module.exports = mongoose.model('Request', requestSchema);
