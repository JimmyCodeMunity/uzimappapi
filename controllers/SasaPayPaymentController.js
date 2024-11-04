const { default: axios } = require("axios");
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
// const { getPlanbyId } = require('./planController');

// subscription
// monthly5000,daily250,yearly individual55000 yearly corporate5000/employee

//local
// const clientId = "wB0A457offQBTSlyGonIHPFZDC9Sg8E7qLysRirL";

//live
const clientId = "2chC11B1tMZ76U7N7FaxQbh6KKwVnWCwqe8m12hf";

//local
// const clientSecret = "X8uYzrhwAQ7S3VG6V0ltwDaRqnDGXTXbfJ3Lymfu3jf6wzzOmucHkAVEQBRPn9FhEfrdqIu2994VYE6AGBsf9kVHo7Za65iZ990KdhmfQQBHejUmFg7MHsXkrt7vNU4M";

//live
const clientSecret =
  "GKG58ZUgLe9h6D8fY9rBkwsddqK5yWgRComjdHqYWRZHJ0hEfLdIpklCPm8ZPQjyN5qiTRlvRVWIzMtAI3XYiFDHGhNwibb0S3MJOUx2Acb5VhZgObj1PjIdHcKBfpvM";
const tokenUrl =
  "https://sandbox.sasapay.app/api/v1/auth/token/?grant_type=client_credentials";
const confirmUrl = "https://7626-197-232-60-144.ngrok-free.app/confirm";
// const callbackurl = "https://a57b-197-232-60-144.ngrok-free.app/api/payment/c2b-callback-results";
const callbackurl =
  "https://a56f-105-163-158-160.ngrok-free.app/api/v1/payments/sasapay/c2b-callback-results";

// Convert the credentials
const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
  "base64"
);

// Request token before payment request
const getToken = async () => {
  try {
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    };

    const response = await axios.get(tokenUrl, requestOptions);
    console.log("Token obtained:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw error;
  }
};

// Send a payment request
// const requestPayment = async (req, res, userSocketMap, io) => {
//   try {
//     const token = await getToken();

//     const {
//       MerchantCode,
//       NetworkCode,
//       PhoneNumber,
//       TransactionDesc,
//       AccountReference,
//       Currency,
//       Amount,
//       userId,
//       email,
//       planid,
//     } = req.body;
//     const paymentrequestdetails = req.body.paymentData;
//     // const planType = await getPlanbyId(planid);
//     // console.log("The plan", planType)
//     // const planName=planType.name;
//     console.log("userid",paymentrequestdetails.userId)

//     console.log("Request body:", req.body);
//     const details = req.body;
//     // return;
//     // Validate your body
//     const paymentDetails = {
//       userId: paymentrequestdetails.userId,
//       email: paymentrequestdetails.email,
//       planid: paymentrequestdetails.planid,
//     };

//     const jsonString = JSON.stringify({ paymentDetails });
//     const urlEncodedPaymentData = encodeURIComponent(jsonString);
//     const CallBackURL = callbackurl;
//     console.log(urlEncodedPaymentData);

//     // const formattedCallbackUrl = `${CallBackURL}?paymentData=${urlEncodedPaymentData}`;
//     const formattedCallbackUrl = `${CallBackURL}?userId=${paymentDetails.userId}&planId=${paymentDetails.planid}`;

//     console.log("formatted callback", formattedCallbackUrl);
//     // return
//     const response = await axios.post(
//       "https://sandbox.sasapay.app/api/v1/payments/request-payment/",
//       {
//         MerchantCode,
//         NetworkCode,
//         PhoneNumber,
//         TransactionDesc,
//         AccountReference,
//         Currency,
//         Amount,
//         CallBackURL: formattedCallbackUrl,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     console.log("request sent");
//     res.json(response.data);
//     console.log("API response", response.data);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       message: "An error occurred",
//       error: error.response?.data || error.message,
//     });
//   }
// };
const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters from the phone number
  phoneNumber = phoneNumber.replace(/\D/g, "");

  // If the phone number starts with '254' and is valid, return it as is
  if (phoneNumber.startsWith("254") && phoneNumber.length === 12) {
    return phoneNumber;
  }

  // If the phone number has 9 digits, prefix it with '254'
  if (phoneNumber.length === 9) {
    return "254" + phoneNumber;
  }

  // If the phone number starts with '0' and has 10 digits (e.g., 0112132626)
  if (phoneNumber.startsWith("0") && phoneNumber.length === 10) {
    return "254" + phoneNumber.slice(1); // Remove the leading '0' and add '254'
  }

  // If the number doesn't match any expected format, return null or handle the error
  return null; // or throw an error or return a validation message
};

const requestPayment = async (req, res, userSocketMap, io) => {
  try {
    const token = await getToken();

    const paymentrequestdetails = req.body.paymentData;
    let phoneNumber = paymentrequestdetails?.PhoneNumber;

    // Format the phone number
    phoneNumber = formatPhoneNumber(phoneNumber);
    if (!phoneNumber) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    console.log("Formatted Phone Number:", phoneNumber);

    // Validate your body to ensure properties exist
    if (
      !paymentrequestdetails ||
      !paymentrequestdetails.userId ||
      !paymentrequestdetails.planId
    ) {
      console.log("Missing required payment details");
      return res
        .status(400)
        .json({ message: "Missing required payment details" });
    }

    const paymentDetails = {
      userId: paymentrequestdetails.userId,
      email: paymentrequestdetails.email,
      planId: paymentrequestdetails.planId, // Consistent casing
    };

    const jsonString = JSON.stringify({ paymentDetails });
    const urlEncodedPaymentData = encodeURIComponent(jsonString);
    const CallBackURL = callbackurl;

    const formattedCallbackUrl = `${CallBackURL}?userId=${paymentDetails.userId}&planId=${paymentDetails.planId}`;
    console.log("formatted callback", formattedCallbackUrl);

    const response = await axios.post(
      "https://sandbox.sasapay.app/api/v1/payments/request-payment/",
      {
        MerchantCode: paymentrequestdetails?.MerchantCode,
        NetworkCode: paymentrequestdetails?.NetworkCode,
        PhoneNumber: phoneNumber, // Use formatted phone number here
        TransactionDesc: paymentrequestdetails?.TransactionDesc,
        AccountReference: paymentrequestdetails?.AccountReference,
        Currency: paymentrequestdetails?.Currency,
        Amount: paymentrequestdetails?.Amount,
        CallBackURL: formattedCallbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("request sent");
    res.json(response.data);
    console.log("API response", response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred",
      error: error.response?.data || error.message,
    });
  }
};

const handleCallback = async (req, res,userSocketMap,io) => {
  const callbackData = req.body;
  console.log("C2B Callback Data:", callbackData);

  const userId = req.query.userId; // Assuming orderTrackingId is passed as a query parameter
  const planId = req.query.planId;
  console.log("plan", planId);
  console.log("decoded username", userId);

  if (callbackData.ResultCode == 0) {
    console.log("A successful transaction");
    try {
      const transactionId = callbackData.CheckoutRequestID;
      const receiverId = userSocketMap[userId];
      // const planType = "daily"; // Example: you can determine this from the transaction details or request
      await updateUserPlan(
        userId,
        planId
      );
      console.log("Transaction ID", transactionId);
      res.status(200).json("ok");
      io.to(receiverId).emit("transaction-status",callbackData);
    } catch (error) {
      console.error("Error updating user plan:", error);
      res.status(500).json({ message: "Error processing transaction" });
    }
  } else {
    console.log("A failed transaction");
    res.status(200).json("ok");
  }
};

// const updateUserPlan = async (userId, planid, planname) => {
//   console.log("my plan type", planid);
//   console.log("my plan name", planname);
//   try {
//     const user = await User.findById(userId);

//     if (!user) {
//       console.error(`User with ID ${userId} not found.`);
//       return;
//     }
//     console.log("selected user", user);

//     const currentDate = new Date();
//     console.log(currentDate);
//     console.log("user is paying for a plan called", planname);

//     let newEndDate = new Date(currentDate); // Create a copy of currentDate

//     switch (planname) {
//       case "Daily":
//         newEndDate.setDate(currentDate.getDate() + 1);
//         break;
//       case "yearly":
//         newEndDate.setFullYear(currentDate.getFullYear() + 1);
//         break;
//       case "monthly":
//         newEndDate.setMonth(currentDate.getMonth() + 1);
//         break;
//       default:
//         // Default plan: add 7 days from account creation date
//         newEndDate = new Date(user.created_at);
//         newEndDate.setDate(newEndDate.getDate() + 7);
//         break;
//     }

//     user.plan = planid;
//     user.subscriptionStartDate = currentDate;
//     user.subscriptionEndDate = newEndDate;
//     user.transactionStatus = true; // Assuming this is set to success upon payment

//     await user.save();

//     console.log(`User ${userId} updated with plan ${planname}.`);
//     console.log("userdata", user);
//   } catch (error) {
//     console.error("Error updating user plan:", error);
//   }
// };
const updateUserPlan = async(userId,planId)=>{
  console.log(
    "userId",userId
  )
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.planId = planId;
    await user.save();

    // res.send(user);
    console.log("subscribed user",user)
    // return res.status(200).json({message:"updated user",user})
    
  } catch (error) {
    console.log("error updating user plan", error);
    
  }
}

module.exports = {
  getToken,
  requestPayment,
  handleCallback,
};
