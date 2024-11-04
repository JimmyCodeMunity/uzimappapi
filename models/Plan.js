const mongoose = require("mongoose");
const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
  },
  period: {
    type: String,
    required: true,
  },

  isActive: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});
const Plan = mongoose.model("Plan", PlanSchema);
module.exports = Plan;
