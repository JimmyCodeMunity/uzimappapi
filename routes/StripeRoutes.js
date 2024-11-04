const express = require('express');
const { createPaymentIntent } = require('../controllers/StripePaymentController');

// const router = express.Router();

// router.use(express.json())
// router.use(express.urlencoded({extended:true}));

// //request token
// router.post('/requesttoken',getToken)
// router.post('/registeripn',registerIPN)
// router.get('/callback',handleCallback)
// router.post('/requestpayment',submitOrderRequest)

// module.exports = router;


module.exports = (userSocketMap,io,socket) => {
    const router = express.Router();

    router.use(express.json());
    router.use(express.urlencoded({ extended: true }));

    router.post('/createpaymentintent', (req, res) => createPaymentIntent(req, res, userSocketMap,io));

    return router;
};
