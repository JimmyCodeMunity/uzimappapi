const express = require('express');
const { requestPayment, handleCallback } = require('../controllers/SasaPayPaymentController');
module.exports = (userSocketMap,io) => {
    const router = express.Router();

    router.use(express.json());
    router.use(express.urlencoded({ extended: true }));

    // Define routes and pass `userSocketMap` if needed in the controller functions
    // router.post('/requesttoken', (req, res) => getToken(req, res, userSocketMap,io));
    // router.post('/registeripn', (req, res) => registerIPN(req, res, userSocketMap,io));
    // router.get('/callback', (req, res) => handleCallback(req, res, userSocketMap,io));

    router.post('/c2b-callback-results', (req, res) => handleCallback(req, res, userSocketMap,io));
    router.post('/requestpayment', (req, res) => requestPayment(req, res, userSocketMap,io));

    return router;
};