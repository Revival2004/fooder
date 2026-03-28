const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/ussd', (req, res) => {
    const { phoneNumber, text } = req.body;

    let response = '';

    if (text === '') {
        response = `CON Welcome to FOODER 🍔
1. My Account
2. My Phone Number`;
    }

    else if (text === '1') {
        response = `CON Choose account info
1. Account number
2. Account balance`;
    }

    else if (text === '1*1') {
        response = `END Your account number is ACC101`;
    }

    else if (text === '2') {
        response = `END Your phone number is ${phoneNumber}`;
    }

    else {
        response = `CON Invalid option
1. Try again`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('FOODER running 🍔 on port ' + PORT);
});