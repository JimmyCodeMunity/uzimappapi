const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }))


// routes
const userRoutes = require('./routes/UserRoute');



if(process.env.NODE_ENV === 'production'){
    require('dotenv').config({
        path:'./.env'
    })
}

app.get('/api',(req,res)=>{
    res.send('API is working');
})
const MONGO_URI="mongodb+srv://collins:collins77@uzima.ruqlk48.mongodb.net/?retryWrites=true&w=majority&appName=uzima"
const port=5000



// environment varaibales
const PORT = process.env.PORT || port;
const dbconnection = process.env.MONGO_URI|| MONGO_URI;

// console.log("connecton string",dbconnection)

app.listen(PORT,(req,res)=>{
    console.log(`Server is running on port ${PORT}`);
})

// database connection
mongoose.connect(dbconnection,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>{
    console.log("Database connected");
})
.catch((error)=>{
    console.log("Error connecting to database");
    console.error(error);
})


// utlise routes
app.use('/api/v1/users',userRoutes);