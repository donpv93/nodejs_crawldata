const mongoose = require('mongoose');

const connectionDatabase = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connect to database successfully');
}

module.exports = connectionDatabase;