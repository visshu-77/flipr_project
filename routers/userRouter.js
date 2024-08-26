const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");

router.post("/signup",userController.signupData);
router.post("/signin",userController.loginData);
router.post("/addproduct",userController.addproduct);
router.get("/product",userController.getAllProduct);
router.post("/cart/add",userController.addToCart);
router.delete("/cart/delete",userController.deleteFromCart);
router.patch("/cart/update",userController.updateTheCart);
router.get("/cart",userController.showTheCart);
router.post("/placeorder",userController.placeOrder);
router.get("/getallorders",userController.showAllOrder);
router.get("/orders/customer/:customerId",userController.getOrdersByCustomerId);

module.exports = router;