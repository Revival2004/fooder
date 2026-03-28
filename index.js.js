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
// 💾 SAVE ORDER (SAFE)
// ======================
async function saveOrder(phone, item) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([{ phone, item, status: "Pending" }])
            .select();

        if (error) {
            console.log("❌ DB ERROR:", error.message);
            return null;
        }

        console.log("✅ ORDER SAVED:", data?.[0]);
        return data?.[0] || null;

    } catch (err) {
        console.log("❌ SAVE ORDER CRASH:", err.message);
        return null;
    }
}

// ======================
// 🧠 USSD ROUTE (STABLE VERSION)
// ======================
app.post('/ussd', async (req, res) => {
    try {
        const { phoneNumber, text } = req.body;

        console.log("🔥 USSD REQUEST", phoneNumber, text);

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
        // ACCOUNT MENU
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
                    .select('*')
                    .eq('phone', phoneNumber)
                    .order('id', { ascending: false })
                    .limit(1);

                if (data && data.length > 0) {
                    response = `END 🧾 Last order: ${data[0].item} (${data[0].status})`;
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
            const order = await saveOrder(phoneNumber, "Burger");

            response = order
                ? `END 🍔 Order placed!\nID: ${order.id}\nStatus: Pending`
                : `END ❌ Failed to place order`;
        }

        // ======================
        // ORDER PIZZA
        // ======================
        else if (text === '2*2') {
            const order = await saveOrder(phoneNumber, "Pizza");

            response = order
                ? `END 🍕 Order placed!\nID: ${order.id}\nStatus: Pending`
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
// 📊 GET ALL ORDERS
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
// 🔄 UPDATE STATUS
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
// 🌐 TEST ROUTE
// ======================
app.get('/', (req, res) => {
    res.send('🍔 FOODER LIVE');
});

// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('🚀 FOODER running on ' + PORT);
});