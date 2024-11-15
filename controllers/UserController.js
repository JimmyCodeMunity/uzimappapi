const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticator } = require("otplib");
const speakeasy = require("speakeasy");

const jwttoken =
  "ac8147f18afbfd4e751a5b21d46b5a609ea313da3ef7edcd275fb833fdb6c7a854c59f42497ac1a47407eacea5d135a3d28f30a5485df291b90784182f39e7a4";
// const jwttoken = process.env.JWT_SECRET;

const createUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Basic validation

  if (!firstName || !lastName || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "user with that email already exists" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const otpSecret = speakeasy.generateSecret().base32;

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        otpSecret,
        password: hashedPassword,
      });
      res
        .status(200)
        .json({ status: "ok", message: "user created successfully", newUser });
    }
  } catch (error) {
    console.log("error creating user", error);
    res.status(500).json({ message: "error creating user" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      // Update user's active status and last login time
      user.isActive = true;
      // user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign({ email: user.email }, jwttoken);
      if (res.status(200)) {
        console.log("successfull login");
        return res.send({ status: "ok", data: token });
      } else {
        return res.status(400).json({ message: "error loggin in", error });
      }
    }
  } catch (error) {
    console.log("error logging in", error);
    return res
      .status(500)
      .json({ message: "error while trying to login", error });
  }
};

// get user data
const getUserData = async (req, res) => {
  const { token } = req.body;
  try {
    // console.log("token",token)
    // console.log("jwt",jwttoken)
    const user = await jwt.verify(token, jwttoken);
    const useremail = user.email;
    // console.log("useremail",useremail);
    const userData = await User.findOne({ email: useremail }).populate("planId","name");

    if (!userData) {
      return res.status(400).json({ message: "user not found" });
    } else {
      console.log("successfull getting user data");
      return res.send({ status: "ok", data: userData });
    }
  } catch (error) {
    console.log("error getting user data", error);
    return res
      .status(500)
      .json({ message: "error while trying to get user data", error });
    // res.status(401).json({message:"unauthorized"})
  }
};

// update user moods
const updateUserMood = async (req, res) => {
  const { userId, mood } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const today = new Date().toISOString().split("T")[0];
    const existingRecord = user.moods.find((record) => record.date === today);

    if (existingRecord) {
      existingRecord.mood = mood;
    } else {
      user.moods.push({ date: today, mood });
    }

    await user.save();

    res
      .status(200)
      .json({ message: "Mood updated successfully.", moods: user.moods });
  } catch (error) {
    console.error("Error updating mood:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// update user profile
const updateUser = async (req, res) => {
  const { id } = req.params; // Get user ID from URL parameters
  const { firstName, lastName, email } = req.body;

  try {
    // Find and update the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    await user.save();

    res
      .status(200)
      .json({ message: "User details updated successfully.", user });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Server error." });
  }
};
module.exports = {
  createUser,
  userLogin,
  getUserData,
  updateUserMood,
  updateUser
};
