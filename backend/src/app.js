const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const medicineRoutes = require('./routes/medicine.routes');
const notificationRoutes = require('./routes/notification.routes');
const documentRoutes = require('./routes/document.routes');
const policyRoutes = require('./routes/policy.routes');
const billRoutes = require('./routes/bill.routes');
const pantryRoutes = require('./routes/pantryItem.routes');
const applianceRoutes = require('./routes/appliance.routes');
const familyPulseRoutes = require('./routes/familyPulse.routes');
const aiRoutes = require('./routes/ai.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const pushRoutes = require('./routes/push.routes');
const app = express();


// =========================
// MIDDLEWARE
// =========================

app.use(express.json());

app.use(
    cors({
        origin: 'http://localhost:8443',
        credentials: true
    })
);

app.use(cookieParser());


// =========================
// ROUTES
// =========================

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/appliances', applianceRoutes);
app.use('/api/familypulse', familyPulseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/push', pushRoutes);
// =========================
// TEST ROUTE
// =========================

app.get('/', (req, res) => {
    res.json({
        message: 'ExpiryIQ API is running'
    });
});


// =========================
// 404 HANDLER
// =========================

app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found.'
    });
});


// =========================
// ERROR HANDLER
// =========================

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        message: 'Internal server error.'
    });
});


const { startAlertScheduler } = require('./jobs/alertScheduler');
startAlertScheduler();


module.exports = app;