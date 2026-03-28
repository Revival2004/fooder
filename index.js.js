const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ======================
// SUPABASE 💾
// ======================
const supabase = createClient(
    'https://yzyqowjjaitxllqkhode.supabase.co',
    'YOUR_ANON_KEY_HERE'
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ======================
// 💾 SAVE ORDER
// ======================
async function saveOrder(phone, item) {
    const { data, error } = await supabase
        .from('orders')
        .insert([{ phone, item, status: "Pending" }])
        .select();

    if (error) {
        console.log("❌ DB ERROR:", error.message);
        return null;
    }

    console.log("✅ ORDER SAVED:", data[0]);
    return data[0]; // contains id
}

// ======================
// 🧠 USSD ROUTE
// ======================
app.post('/ussd', async (req, res) => {
    const { phoneNumber, text } = req.body;

    console.log("🔥 USSD REQUEST", phoneNumber, text);

    let response = '';

    // HOME
    if (text === '') {
        response = `CON 🍔 FOODER
1. My Account
2. Order Food
3. Exit`;
    }

    // ACCOUNT
    else if (text === '1') {
        response = `CON 👤 My Account
1. My Number
2. Last Order`;
    }

    else if (text === '1*1') {
        response = `END 📱 ${phoneNumber}`;
    }

    else if (text === '1*2') {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('phone', phoneNumber)
            .order('id', { ascending: false })
            .limit(1);

        if (data.length > 0) {
            response = `END 🧾 Last order: ${data[0].item} (${data[0].status})`;
        } else {
            response = `END ❌ No orders yet`;
        }
    }

    // FOOD MENU
    else if (text === '2') {
        response = `CON 🍽️ Choose Food
1. Burger 🍔
2. Pizza 🍕`;
    }

    // ORDER BURGER
    else if (text === '2*1') {
        const order = await saveOrder(phoneNumber, "Burger");

        response = `END 🍔 Order placed!
ID: ${order.id}
Status: Pending`;
    }

    // ORDER PIZZA
    else if (text === '2*2') {
        const order = await saveOrder(phoneNumber, "Pizza");

        response = `END 🍕 Order placed!
ID: ${order.id}
Status: Pending`;
    }

    // EXIT
    else if (text === '3') {
        response = `END 🙏 Thank you for using FOODER`;
    }

    else {
        response = `END ❌ Invalid input`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

// ======================
// 📊 GET ALL ORDERS (API)
// ======================
app.get('/orders', async (req, res) => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false });

    if (error) return res.json({ error });

    res.json(data);
});

// ======================
// 🔄 UPDATE ORDER STATUS
// ======================
app.post('/update-status', async (req, res) => {
    const { id, status } = req.body;

    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

    if (error) return res.json({ error });

    res.json({ success: true });
});

// ======================
// 🌐 TEST
// ======================
app.get('/', (req, res) => {
    res.send('🍔 FOODER LIVE');
});

// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('🚀 FOODER running on ' + PORT);
});