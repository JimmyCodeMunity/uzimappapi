const Stripe = require("stripe");
const mongoose = require("mongoose");
const User = require("../models/User");

if (process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: "../.env" });
}
const STRIPE_SECRET_KEY =
  "sk_test_51Oc4wRJE5eZbfcv0cFDOguSg9YFS8Bswru6JaXimoGk6NbBuBy2fUi8CKTjsaHPV7dlS1cTXJrd2mmPfrJg8WjEo00fuiP5l84";
// const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripe = Stripe(STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res, userSocketMap, io) => {
  //   console.log("stripe key", STRIPE_SECRET_KEY);
  try {
    const { amount, currency, userId, planId } = req.body;
    console.log("amount", amount);
    console.log("currency", currency);
    console.log("userid", userId);
    console.log("planid", planId);

    // Create a customer
    const customer = await stripe.customers.create();

    // Create an ephemeral key for the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-11-15" }
    );

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in smallest unit, for example 5000 means $50.00
      currency: currency || "usd",
      customer: customer.id,
      automatic_payment_methods: { enabled: true }, // Enable automatic payment methods
    });

    // send request

    res.send({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (error) {
    console.log("error while initializing", error);
    res.status(400).send({ error: error });
  }
};

const updatedUserPlan = async (userId, planId) => {
  try {
    console.log("customerId", userId);
    console.log("planId", planId);
    const user = await User.findByIdAndUpdate(
      userId,
      { planId: planId },
      { new: true }
    ).populate("planId","name");
    console.log("user updated", user);
    // res.send(user)
  } catch (error) {
    console.log("error updating user plan", error);
  }
};



module.exports = {
  createPaymentIntent,
  updatedUserPlan
};
