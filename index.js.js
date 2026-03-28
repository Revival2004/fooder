const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ======================
// SUPABASE SETUP 💾
// ======================
const supabase = createClient(
    'https://yzyqowjjaitxllqkhode.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6eXFvd2pqYWl0eGxscWtob2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODgzOTIsImV4cCI6MjA5MDI2NDM5Mn0.56tG_ZYf-iPJpDnBUGpVbufPCf9Nk9RWHOYtadLGTRg'
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * 💾 SAVE ORDER FUNCTION
 */
async function saveOrder(phone, item) {
    const { error } = await supabase
        .from('orders')
        .insert([{ phone, item }]);

    if (error) {
        console.log("❌ DB ERROR:", error.message);
    } else {
        console.log("✅ ORDER SAVED:", phone, item);
    }
}

/**
 * 🧠 USSD ROUTE (FOODER CORE LOGIC)
 */
app.post('/ussd', (req, res) => {
    const { phoneNumber, text } = req.body;

    console.log("🔥 USSD REQUEST RECEIVED");
    console.log("Phone:", phoneNumber);
    console.log("Text:", text);

    let response = '';

    // FIRST SCREEN
    if (text === '') {
        response = `CON 🍔 FOODER MENU
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

    // FOOD MENU
    else if (text === '2') {
        response = `CON Order Food 🍔
1. Burger
2. Pizza`;
    }

    // ======================
    // SAVE TO DATABASE HERE 💾
    // ======================
    else if (text === '2*1') {
        saveOrder(phoneNumber, "Burger");
        response = `END 🍔 Burger ordered successfully!`;
    }

    else if (text === '2*2') {
        saveOrder(phoneNumber, "Pizza");
        response = `END 🍕 Pizza ordered successfully!`;
    }

    // EXIT
    else if (text === '3') {
        response = `END Thank you for using FOODER ❤️`;
    }

    // FALLBACK
    else {
        response = `END Invalid input. Please try again.`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

/**
 * 🌐 TEST ROUTE
 */
app.get('/', (req, res) => {
    res.send('FOODER is running 🍔🔥');
});

/**
 * 🚀 START SERVER
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('FOODER running 🍔 on port ' + PORT);
});