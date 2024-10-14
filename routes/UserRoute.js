const express = require('express');
const { createUser, userLogin, getUserData, updateUserMood, updateUser } = require('../controllers/UserController');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended:true}))


// User routes
router.post('/createuser',createUser);
router.post('/userlogin',userLogin);
router.post('/userdata',getUserData);
router.post('/updatemood',updateUserMood);
router.put('/updateprofile/:id',updateUser)

module.exports = router;