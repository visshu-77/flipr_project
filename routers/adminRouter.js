const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/adminController");

router.patch("/updateproduct/:productId",adminController.updateProduct);
router.delete("/deleteproduct/:productId",adminController.deletData);

module.exports = router;