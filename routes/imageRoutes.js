const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Request = require('../models/request');
const imageQueue = require('../workers/imageWorker');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), (req, res) => {
    const requestId = uuidv4();
    const products = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            products.push({
                productName: data['Product Name'],
                inputImageUrls: data['Input Image Urls'].split(',')
            });
        })
        .on('end', async () => {
            const newRequest = new Request({ requestId, products });
            await newRequest.save();
            // Add job to queue for image processing
            imageQueue.add({ requestId });

            res.json({ requestId });
        });
});

router.get('/status/:requestId', async (req, res) => {
    const request = await Request.findOne({ requestId: req.params.requestId });
    if (!request) {
        return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ requestId: request.requestId, status: request.status });
});

module.exports = router;
