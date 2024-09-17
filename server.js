const mongoose = require('mongoose');
const express = require('express');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://srisudhanshu1:2002@SUdh@cluster0.yneb1.mongodb.net//image-processing?retryWrites=true&w=majority');


app.use('/api', imageRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
