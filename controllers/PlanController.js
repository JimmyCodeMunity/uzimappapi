const mongoose = require("mongoose");
const express = require("express");
const Plan = require("../models/Plan");

const createPlan = async (req, res) => {
  const { name, period, price } = req.body;
  try {
    const existingPlan = await Plan.findOne({ name: name });
    if (existingPlan) {
      console.log("Plan Already existing");
      return res.status(400).json({ message: "Plan already exists" });
    } else {
      const plan = await Plan.create({
        name,
        period,
        price,
      });
      res.status(200).json(plan);
      console.log("Plan created", plan);


    }
  } catch (error) {
    console.log("error creating plan", error);
    res.status(500).json({ message: error.message });
  }
};

// fetch all active plans
const viewPlans = async (req, res) => {
  try {
    const activePlans = await Plan.find();
    res.status(200).json(activePlans);
  } catch (error) {
    console.log("error fetching plans", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
    createPlan,
    viewPlans,
}
