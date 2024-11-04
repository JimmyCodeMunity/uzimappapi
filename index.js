const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }))


// socket connection
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: ["http://localhost:3000", "http://localhost:3001","https://cbfe-41-139-202-31.ngrok-free.app"], // Add multiple origins here
    origin: "*",
    methods: ["GET", "POST"],
  },
});



//   env variables
// const serverport = process.env.PORT;
// const dbconnectionurl = process.env.DB_CONNECTION_URL;


// routes





if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({
      path: "./.env",
    });
  }

app.get('/',(req,res)=>{
    res.send('API is working');
})
const MONGO_URI="mongodb+srv://collins:collins77@uzima.ruqlk48.mongodb.net/?retryWrites=true&w=majority&appName=uzima"
const port=5000



// environment varaibales
const PORT = process.env.PORT;
const dbconnection = process.env.MONGO_URI;

// console.log("connecton string",dbconnection)

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

// database connection
mongoose.connect(dbconnection,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>{
    console.log("Database connected");
})
.catch((error)=>{
    console.log("Error connecting to database");
    console.error(error);
})


const userSocketMap = {};
// const driverSocketMap = {}
// Track driver's location
io.on("connection", (socket) => {
  console.log("user connected successfully", socket.id);
  const userId = socket.handshake.query.userId;
  console.log("userid", userId);

  if (userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }
  console.log("user socket map", userSocketMap);
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    console.log("user socket map after disconnect", userSocketMap);
  });


  socket.on("plan-paid", async (data) => {
    console.log("plan has been paid");
    console.log("user paying",data)
    const receiverId = userSocketMap[data.userId];
    const userId = data?.userId;
    const planId = data?.planId;
    if (!receiverId) {
      console.log("User not found");
      return;
    }
    // return
    
    await updatedUserPlan(userId,planId);
  });
})

//routes
const pesapalpaymentRouter = require("./routes/PesapalRoutes")(userSocketMap,io);
const stripepaymentRouter = require("./routes/StripeRoutes")(userSocketMap,io);
const sasapayRouter = require('./routes/SasapayRoutes')(userSocketMap,io);


const planRoutes = require("./routes/PlanRoutes");
const userRouter = require("./routes/UserRoutes");
const { updatedUserPlan } = require("./controllers/StripePaymentController");


// utlise routes
app.use("/api/v1/payments/pesapal", pesapalpaymentRouter);
app.use("/api/v1/payments/stripe", stripepaymentRouter);
app.use("/api/v1/payments/sasapay",sasapayRouter);
app.use("/api/v1/plans", planRoutes);
app.use("/api/v1/users", userRouter);

// app.use('/api/v1/users',userRoutes);