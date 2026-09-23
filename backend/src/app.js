const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');

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



module.exports = app;