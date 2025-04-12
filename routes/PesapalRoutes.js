const express = require('express');
const { getToken, registerIPN, handleCallback, submitOrderRequest, checkTransactionStatus } = require('../controllers/PesapalPaymentController');

// const router = express.Router();

// router.use(express.json())
// router.use(express.urlencoded({extended:true}));

// //request token
// router.post('/requesttoken',getToken)
// router.post('/registeripn',registerIPN)
// router.get('/callback',handleCallback)
// router.post('/requestpayment',submitOrderRequest)

// module.exports = router;


module.exports = (userSocketMap,io) => {
    const router = express.Router();

    router.use(express.json());
    router.use(express.urlencoded({ extended: true }));

    // Define routes and pass `userSocketMap` if needed in the controller functions
    router.post('/requesttoken', (req, res) => getToken(req, res, userSocketMap,io));
    router.post('/registeripn', (req, res) => registerIPN(req, res, userSocketMap,io));
    router.get('/callback', (req, res) => handleCallback(req, res, userSocketMap,io));
    router.post('/requestpayment', (req, res) => submitOrderRequest(req, res, userSocketMap,io));
    router.post('/checkpayment', (req, res) => checkTransactionStatus(req, res, userSocketMap,io));

    return router;
};
