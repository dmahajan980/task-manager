const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-test-api', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

