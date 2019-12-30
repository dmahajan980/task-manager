const express = require('express');
require('./mongoose-test.js');

const User = require('../models/user.js')

const app = express();
const port = global.process.env.PORT || 3000;

app.use(express.json());

// app.get('', (req, res) => {
//     res.send('This is working!')
// })

app.post('/users', (req, res) => {
    // res.send('This works!')
    // res.send(req.body)
    const newUser = new User(req.body);
    newUser.save()
    .then(resp => {
        res.send(resp);
    })
    .catch(error => {
        res.send(error);
    })
})

app.listen(port, () => {
    console.log('Server is up and running on PORT ' + port);
})