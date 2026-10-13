const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { protectAdmin } = require("../middleware/authMiddleware");

// All customer CRM routes are protected
router.use(protectAdmin);

router.get("/", customerController.getCustomers);
router.post("/", customerController.createCustomer);
router.get("/:id", customerController.getCustomerById);
router.patch("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
