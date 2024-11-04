const { urlencoded } = require("body-parser");
const express = require("express");
const { createPlan, viewPlans } = require("../controllers/PlanController");
const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.post('/createplan',createPlan)
router.get('/viewplans',viewPlans)

module.exports = router;