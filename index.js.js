const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * USSD ROUTE
 */
app.post('/ussd', (req, res) => {
    const { phoneNumber, text } = req.body;

    let response = '';

    // FIRST SCREEN
    if (text === '') {
        response = `CON Welcome to FOODER 🍔
1. My Account
2. Order Food
3. Exit`;
    }

    // ACCOUNT MENU
    else if (text === '1') {
        response = `CON My Account
1. Account number
2. My phone number`;
    }

    else if (text === '1*1') {
        response = `END Your account number is ACC101`;
    }

    else if (text === '1*2') {
        response = `END Your phone number is ${phoneNumber}`;
    }

    // FOOD ORDER MENU
    else if (text === '2') {
        response = `CON Order Food 🍔
1. Burger
2. Pizza`;
    }

    else if (text === '2*1') {
        response = `END You ordered a Burger 🍔. We are preparing it!`;
    }

    else if (text === '2*2') {
        response = `END You ordered a Pizza 🍕. We are preparing it!`;
    }

    // EXIT
    else if (text === '3') {
        response = `END Thank you for using FOODER ❤️`;
    }

    // SAFETY FALLBACK
    else {
        response = `END Invalid input. Please try again.`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

/**
 * TEST ROUTE (for browser check)
 */
app.get('/', (req, res) => {
    res.send('FOODER is running 🍔🔥');
});

/**
 * SERVER START (RENDER SAFE)
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('FOODER running 🍔 on port ' + PORT);
});