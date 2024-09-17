const Queue = require('bull');
const sharp = require('sharp');
const Request = require('../models/request');
const axios = require('axios');
const redisClient = require('redis').createClient();

const imageQueue = new Queue('image processing', {
    redis: { host: '127.0.0.1', port: 6379 }
});

imageQueue.process(async (job, done) => {
    const { requestId } = job.data;
    const request = await Request.findOne({ requestId });

    if (!request) {
        return done(new Error('Request not found'));
    }

    const outputImageUrls = await Promise.all(request.products.map(async (product) => {
        return Promise.all(product.inputImageUrls.map(async (imageUrl) => {
            const inputBuffer = (await axios({ url: imageUrl, responseType: 'arraybuffer' })).data;
            const outputBuffer = await sharp(inputBuffer).jpeg({ quality: 50 }).toBuffer();
            // Save the compressed image (in real scenario, store in S3 or local storage)
            return `compressed_${imageUrl}`; // Replace with actual storage logic
        }));
    }));

    request.products.forEach((product, idx) => {
        product.outputImageUrls = outputImageUrls[idx];
    });
    request.status = 'completed';
    await request.save();

    // Optionally trigger a webhook
    if (request.webhookUrl) {
        axios.post(request.webhookUrl, { requestId, status: 'completed' });
    }

    done();
});

module.exports = imageQueue;
