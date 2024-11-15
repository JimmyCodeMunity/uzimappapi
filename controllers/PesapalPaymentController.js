//credentials

const { default: axios } = require("axios");
const User = require("../models/User");
if(process.env.NODE_ENV === 'production'){
  require('dotenv').config({
      path:'./.env'
  })
}


const port = process.env.PORT;
const url = process.env.pesapal_auth_url;
const consumerKey = process.env.pesapal_consumer_key;
const consumerSecret = process.env.pesapal_consumer_secret;
const ipnurl = process.env.PESAPAL_DEMO_URL;
const callbackurl = process.env.pesapal_callback_url;

// io.emit()


console.log("callback return ed to", callbackurl);

let ipn_iD = "";

//get access token
const getToken = async (req, res) => {
  console.log("token has been requested");
  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const body = {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    };

    //handle request
    const response = await axios.post(url, body, { headers });

    const accessToken = response.data.token;
    console.log(response.data.token);
    return response.data.token;
  } catch (error) {
    console.log("error ocurred while getting token", error);
  }
};

//register ipn
const registerIPN = async (accessToken) => {
  //   const accessToken = await getToken();
  //   try {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const body = {
    url: callbackurl,
    ipn_notification_type: "POST",
  };
  const response = await axios.post(ipnurl, body, { headers });
  console.log("IPN registered successfully", response.data);

  //   const createddata = response.data.created_date;
  const ipn_id = response.data.ipn_id;

  //   const status = response.data.status;
  await getIpnLists(accessToken);
  return ipn_id;
  //   } catch (error) {
  //     console.log("error occurred while registering IPN", error);
  //   }
};

// Correcting the function to get IPN lists
const getIpnLists = async (accessToken) => {
  try {
    const ipnListUrl =
      "https://cybqa.pesapal.com/pesapalv3/api/URLSetup/GetIpnList";
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Send a GET request with headers, not with a body
    const response = await axios.get(ipnListUrl, { headers });

    console.log("IPN lists retrieved", response.data);
  } catch (error) {
    console.log("Error occurred while getting IPN lists", error);
  }
};

// const handleCallback = async (req, res, response) => {

//   const resquestOptions = {
//     method :"GET",
//     headers:{
//       Authorization:`Bearer ${accessToken}`,
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     }
//   }
//   const response = await axios.get(`https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=xxxxxxxxxxxx`)
//   const callbackData = response;
//   console.log("C2B Callback Data:", callbackData);
//   console.log(response.data);
//   res.send("callback active");
// };

const updateUserPlan = async(userId,planId)=>{
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

const handleCallback = async (req, res,userSocketMap,io) => {
  const orderTrackingId = req.query.OrderTrackingId; // Assuming orderTrackingId is passed as a query parameter
  const userId = req.query.userId; // Assuming orderTrackingId is passed as a query parameter
  const planId = req.query.planId; // Assuming orderTrackingId is passed as a query parameter
  
  if (!orderTrackingId || !userId) {
    res.status(400).send("Order Tracking ID is required");
    return;
  }

  const receiverId = userSocketMap[userId];

  try {
    const accessToken = await getToken(); // Get the access token
    const transactionStatus = await getTransactionStatus(
      accessToken,
      orderTrackingId
    );

    console.log("Transaction Status:", transactionStatus);

    // Process the transaction status here
    // e.g., update the order status in your database
    // res.json(transactionStatus)

    res.send("Callback processed successfully");
    io.to(receiverId).emit("transaction-status",transactionStatus);

    // update plan id for user having this userid
    await updateUserPlan(userId, planId);
  } catch (error) {
    console.error("Error processing callback:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getTransactionStatus = async (accessToken, orderTrackingId) => {
  try {
    const url = `https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const response = await axios.get(url, { headers });

    // The response contains the transaction status
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting transaction status:", error);
    throw error;
  }
};

const getRandomNumber = () => {
  return Math.floor(Math.random() * 1000000);
};

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//submit order request
const submitOrderRequest = async (req, res,userSocketMap,io) => {
  console.log("payment came with socket",userSocketMap);
  // io.emit()
  const { useremail, amount,userId,planId } = req.body;
  console.log("paying email", useremail,"and userid",userId);
  const receiverId = userSocketMap[userId];
  if (!receiverId) {
    
    res.status(400).send("User not found");
    return;
  }
  console.log("reqest is send to ",receiverId);
  
  const orderDetails = {
    id: getRandomNumber(), // Replace with your transaction ID
    currency: "KES", // Replace with your currency code
    amount: amount.toString(), // Replace with your amount
    description: "Order payment", // Replace with your description
    email: useremail, // Replace with customer's email
    phone: "254112163919", // Replace with customer's phone number
    countryCode: "KE", // Replace with customer's country code
    firstName: "", // Replace with customer's first name
    middleName: "", // Replace with customer's middle name
    lastName: "", // Replace with customer's last name
    addressLine1: "", // Replace with address line 1
    addressLine2: "", // Replace with address line 2 (if any)
    city: "Nairobi", // Replace with customer's city
    state: "", // Replace with customer's state (if any)
    postalCode: "00100", // Replace with customer's postal code
    zipCode: "00100", // Replace with customer's zip code
  };
  console.log(orderDetails);
  try {
    // Ensure you have the access token
    const accessToken = await getToken();
    //   console.log("token",accessToken)
    //   await registerIPN(accessToken);
    const myipn_id = await registerIPN(accessToken);
    //   console.log('generated',myipn_id)
    //   return

    // Define the endpoint URL for order submission
    const orderUrl =
      "https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest";

    // Set up the headers
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    console.log("callbackurl",callbackurl);
    const callbackWithUserId = `${callbackurl}?userId=${userId}&planId=${planId}`;

    // Prepare the body with order details
    const body = {
      // Populate these fields with actual data from your application
      id: orderDetails.id, // Unique identifier for the transaction
      currency: orderDetails.currency, // e.g., "KES"
      amount: orderDetails.amount, // e.g., "1000.00"
      description: orderDetails.description, // e.g., "Order payment"
      callback_url: callbackWithUserId, // Callback URL for notifications
      notification_id: myipn_id,
      billing_address: {
        email_address: useremail, // Customer's email address
        phone_number: orderDetails.phone, // Customer's phone number
        country_code: orderDetails.countryCode, // e.g., "KE"
        first_name: orderDetails.firstName, // Customer's first name
        middle_name: orderDetails.middleName, // Customer's middle name
        last_name: orderDetails.lastName, // Customer's last name
        line_1: orderDetails.addressLine1, // Address line 1
        line_2: orderDetails.addressLine2, // Address line 2 (optional)
        city: orderDetails.city, // Customer's city
        state: orderDetails.state, // Customer's state (optional)
        postal_code: orderDetails.postalCode, // Customer's postal code
        zip_code: orderDetails.zipCode, // Customer's zip code
      },
    };

    // Send the POST request
    const response = await axios.post(orderUrl, body, { headers });

    // Log the response data
    console.log("Order submitted successfully", response.data);
    // res.json(response.data);
    console.log("redirect url", response.data.redirect_url);
    // return response.data;
    const paymentresponse = response.data;
    io.to(receiverId).emit("payment-started",paymentresponse);
    return res.status(200).json(response.data);
  } catch (error) {
    console.log("Error occurred while submitting order", error);
  }
};

module.exports = {
  getToken,
  handleCallback,
  submitOrderRequest,

  registerIPN,
};
