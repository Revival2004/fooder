const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ======================
// 🔐 SUPABASE CONFIG
// ======================
const supabase = createClient(
    'https://yzyqowjjaitxllqkhode.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6eXFvd2pqYWl0eGxscWtob2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODgzOTIsImV4cCI6MjA5MDI2NDM5Mn0.56tG_ZYf-iPJpDnBUGpVbufPCf9Nk9RWHOYtadLGTRg // ⚠️ IMPORTANT: reset and paste new key
);

// ======================
// 🧱 MIDDLEWARE
// ======================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ======================
// 💾 SAVE ORDER (FAST + SAFE)
// ======================
async function saveOrder(phone, item) {
    try {
        console.log("🚀 INSERTING:", phone, item);

        const { error } = await supabase
            .from('orders')
            .insert([{ phone, item, status: "Pending" }]);

        if (error) {
            console.log("❌ DB ERROR:", error);
            return false;
        }

        console.log("✅ ORDER SAVED");
        return true;

    } catch (err) {
        console.log("❌ SAVE ORDER CRASH:", err.message);
        return false;
    }
}

// ======================
// 🧠 USSD ROUTE (OPTIMIZED)
// ======================
app.post('/ussd', async (req, res) => {
    try {
        const { phoneNumber, text } = req.body;

        console.log("🔥 USSD:", phoneNumber, text);

        let response = '';

        // ======================
        // HOME
        // ======================
        if (!text || text === '') {
            response = `CON 🍔 FOODER
1. My Account
2. Order Food
3. Exit`;
        }

        // ======================
        // ACCOUNT
        // ======================
        else if (text === '1') {
            response = `CON 👤 My Account
1. My Number
2. Last Order`;
        }

        else if (text === '1*1') {
            response = `END 📱 ${phoneNumber}`;
        }

        else if (text === '1*2') {
            try {
                const { data } = await supabase
                    .from('orders')
                    .select('item, status')
                    .eq('phone', phoneNumber)
                    .order('id', { ascending: false })
                    .limit(1);

                if (data && data.length > 0) {
                    response = `END 🧾 ${data[0].item} (${data[0].status})`;
                } else {
                    response = `END ❌ No orders yet`;
                }

            } catch (err) {
                console.log("❌ FETCH ERROR:", err.message);
                response = `END ❌ Error fetching order`;
            }
        }

        // ======================
        // FOOD MENU
        // ======================
        else if (text === '2') {
            response = `CON 🍽️ Choose Food
1. Burger 🍔
2. Pizza 🍕`;
        }

        // ======================
        // ORDER BURGER
        // ======================
        else if (text === '2*1') {
            const success = await saveOrder(phoneNumber, "Burger");

            response = success
                ? `END 🍔 Order placed successfully!`
                : `END ❌ Failed to place order`;
        }

        // ======================
        // ORDER PIZZA
        // ======================
        else if (text === '2*2') {
            const success = await saveOrder(phoneNumber, "Pizza");

            response = success
                ? `END 🍕 Order placed successfully!`
                : `END ❌ Failed to place order`;
        }

        // ======================
        // EXIT
        // ======================
        else if (text === '3') {
            response = `END 🙏 Thank you for using FOODER`;
        }

        // ======================
        // FALLBACK
        // ======================
        else {
            response = `END ❌ Invalid input`;
        }

        res.set('Content-Type', 'text/plain');
        res.send(response);

    } catch (error) {
        console.log("❌ USSD CRASH:", error);

        res.set('Content-Type', 'text/plain');
        res.send("END ❌ System error. Try again.");
    }
});

// ======================
// 📊 GET ALL ORDERS (DASHBOARD)
// ======================
app.get('/orders', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.log("❌ FETCH ALL ERROR:", error);
            return res.json({ error });
        }

        res.json(data);

    } catch (err) {
        res.json({ error: "Server error" });
    }
});

// ======================
// 🔄 UPDATE ORDER STATUS
// ======================
app.post('/update-status', async (req, res) => {
    try {
        const { id, status } = req.body;

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.log("❌ UPDATE ERROR:", error);
            return res.json({ error });
        }

        res.json({ success: true });

    } catch (err) {
        res.json({ error: "Server error" });
    }
});

// ======================
// 🌐 TEST ROUTE
// ======================
app.get('/', (req, res) => {
    res.send('🍔 FOODER LIVE');
});

// ======================
// 🚀 START SERVER
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('🚀 FOODER running on ' + PORT);
});