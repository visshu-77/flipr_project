const bcrypt = require("bcryptjs");
const signupModel = require("../models/signup");
const productModel = require("../models/product");
const orderModel = require("../models/order");
const cartModel = require("../models/cart");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const signupData = async(req,res) => {
    try{
        const {
            name,
            email,
            address,
            password,
            confirm_password
        } = req.body;

        if(!(name && email && password && confirm_password)){
            return res.status(400).json({mesg:"name, email, password and confirm password is required"})
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if(!isValidEmail){
            return res.status(400).json({mesg:"Invalid Email format"});
        }

        const user = await signupModel.findOne({email})
        if(user){
            return res.status(400).json({mesg:"Email is already registered"});
        }
        
        if(password !== confirm_password){
            return res.status(400).json({mesg:"password and confirm password does not match"});
        }

        function validPassword(password){
            const minLength = 8;
            const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,}$/;

            if(password.length < minLength){
                return res.status(400).json({mesg:"Password length should be at least 8 character long"});
            }

            if(!regex.test(password)){
                return res.status(400).json({mesg:"Password must be strong - contain at least 1 uppercase, 1 special symbol, and 1 number, e.g., Jhon@1234"});
            }
            return { valid : true };
        }

        const passwordValidation = validPassword(password);
        if(!passwordValidation.valid){
            return res.status(400).json({mesg: passwordValidation.msg });

        }
        function generateCustomerId() {
            const newObjectId = new mongoose.Types.ObjectId();
            return newObjectId.toString();
          }
        const customerId = generateCustomerId();

        const securePass = await bcrypt.hash(password,10);
        const userData = new signupModel({
            customerId,
            name,
            email,
            address,
            password:securePass  
        });
        const data = await userData.save();
        if(!data){
            return res.status(400).json({mesg:"Signup unsucessfully please try again after some time"});
        }

        return res.status(200).json({mesg:"Signup sucessfully",customerID:customerId});

    }catch(err){
        console.log(err);
        res.status(500).json({result:false,msg:"Internal server error"});
    }
};

const loginData = async(req,res) => {
    try{
        const {
            email,
            password
        } = req.body;
        
        if(!(email && password)){
            return res.status(400).json({mesg:"email and password is required for login"});
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if(!isValidEmail){
            return res.status(400).json({mesg:"Invalid Email format"});
        }

        const user = await signupModel.findOne({email});
        if(!user){
            return res.status(400).json({mesg:"User is not found"});
        }
         
        const matchPassword = await bcrypt.compare(password,user.password);
        if(!matchPassword){
            return res.status(400).json({mesg:"password is incorrect"});
        }

        const SECRET_KEY = "qazwsxedcrfvtgbyhnujmikolp"
        const token = jwt.sign({
            email : user.email,
        }, 'SECRET_KEY', { expiresIn : "20d" } );

        return res.status(200).json({mesg:"Login Successfull ", token : token});

    }catch(err){
        console.log(err)
        return res.status(500).json({mesg:"Internal server error"});
    }
};

const addproduct = async(req,res) => {
    try{
        const {
            name,
            price,
            category,
            description
        } = req.body;

        if(!(name && price && category && description)){
            return res.status(400).json({mesg:"All detail are required - name, price, quantity, description"});    
        }

        if(price < 0){
            return res.status(400).json({mesg:"price should be greater than 0"});
        }

        function generateProductId() {
            const newObjectId = new mongoose.Types.ObjectId();
            return newObjectId.toString();
          }
        const productId = generateProductId();

        const productData = new productModel({
            productId,
            name,
            price,
            category,
            description
        });
        const data = await productData.save();
        if(!data){
            return res.status(400).json({mesg:"Product insert unsuccessfully"});
        }

        return res.status(200).json({mesg:"Product insert successfull",productId : productId});

    }catch(err){
        console.log(err)
        return res.status(500).json({mesg:"Internal server error"});
    }
};

const getAllProduct = async(req,res)=>{
    try{
        const show = await productModel.find();
        if(!show){
            return res.status(400).json({mesg:"No product available"});
        }
        return res.status(200).json(show);
    }catch(err){
        return res.status(500).json({mesg:"Internal server error"});
    }
};

const addToCart = async(req,res)=>{
    try{
        const {
            productId,
            quantity
        } = req.body;

        if(!(productId && quantity)){
            return res.status(400).json({mesg:"productId and quantity is required"})
        }

        const product = await productModel.findOne({productId});
        if(!product){
            return res.status(400).json({mesg:"product not found"});
       }

       if(quantity < 0){
            return res.status(400).json({mesg:"quantity should be greater than 0"})
       }

        let cart = await cartModel.findOne();
        if (!cart) {
            cart = new cartModel({ items: [] });
        }
        if (!cart.items) {
            cart.items = [];
        }
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }
        await cart.save();
        res.status(200).json({mesg:"Product added to cart"});
    }catch(err){    
        console.log(err)
        return res.status(500).json({mesg:"Internal server error"});
    }
}

const deleteFromCart = async(req,res)=>{
    try{
        const {
            productId,
        } = req.body;

        if(!productId){
            return res.status(400).json({mesg:"productId is required"});
        }

        const cart = await cartModel.findOne();
        if(!cart){
            return res.status(404).json({mesg:"product not found"});    
        }

        const itemIndex = cart.items.findIndex(item => cart.productId === productId);
        // if (itemIndex === -1) {
        //     return res.status(404).json({ mesg: "Product not found in cart" });
        // }

        cart.items.splice(itemIndex, 1);

        await cart.save();
        res.status(200).json({ mesg: "Product removed from cart" });
    }catch(err){
        console.log(err);
        return res.status(500).json({mesg:"Internal server error"});
    }
};

const updateTheCart = async(req,res)=>{
    try{
        const {
            productId,
            quantity
        } = req.body;

        if(!productId || quantity < 0){
            return res.status(400).json({mesg:"productId and quantity are required"});
        }

        const cart = await cartModel.findOne();
        if(!cart){
            return res.status(400).json({mesg:"cart not found"});
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
        if(itemIndex === -1){
            return res.status(400).json({mesg:"product not found in cart"});
        }

        if(quantity === 0){
            cart.items.splice(itemIndex, 1);
        }else{
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        res.status(200).json({mesg:"cart updated successfully"});
    }catch(err){
        res.status(500).json({mesg:"Internal server error"});
    }
};

const showTheCart = async(req,res)=>{
    try{
        const {
            userId
        } = req.params;

        const cart = await cartModel.findOne({userId}).populate("items.productId","name price");

        if(!cart || cart.items.length === 0){
            return res.status(404).json({mesg:"No product found in the cart"});
        }

        res.status(200).json({cartItems:cart.items});
    }catch(err){
        return res.status(500).json({mesg:"Internal server error"});
    }
};

const placeOrder = async(req,res)=>{
    try{
        const {
            userId,
            productId,
            shippingDetails
        } = req.body;

        if (!userId) {
            return res.status(400).json({ mesg: "User ID is required" });
          }
      
        if(!(productId && shippingDetails)){
            return res.status(400).json({mesg:"userId and shippingdetail are required"})
        }

        const cart = await cartModel.findOne({
           "items.productId": productId,
        });
        if(!cart || cart.items.length === 0){
            return res.status(400).json({mesg:"cart is empty"});
        }
    
        const orderId = `ORD_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
        console.log(orderId)
 
        const productInCart = cart.items.find(
            (item) => item.productId.toString() === productId.toString()
        );
        if (!productInCart) {
            return res.status(400).json({ mesg: "Product not found in cart." });
        }

        const productDetails = await productModel.findOne({productId});
        if (!productDetails) {
        return res.status(404).json({ mesg: "Product not found in the database." });
        }
    
        const productPrice = productDetails.price;
        if (typeof productPrice !== 'number' || isNaN(productPrice)) {
            return res.status(400).json({ mesg: "Product price is missing or invalid in the database." });
        }
        const totalAmount = productInCart.quantity * productPrice;
        if (isNaN(totalAmount)) {
            return res.status(400).json({ mesg: "Error calculating the total amount." });
          }      

        const orderData = {
            items: [
                {
                    productId: productInCart.productId,
                    quantity: productInCart.quantity,
                    productPrice: productPrice,
                },
            ],
            shippingDetails,
            orderId,
            totalAmount,
            userId,
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        cart.items = cart.items.filter((item) => item.productId !== productId);
        await cart.save();

        return res.status(200).json({mesg:"order placed successfully"});
    }catch(err){
        console.log(err)
        res.status(500).json({mesg:"Internal server error"});
    }
};

const showAllOrder = async(req,res)=>{
    try{
        const {
            userId           
        } = req.body;

        if (!userId) {
            return res.status(400).json({ mesg: "UserId is required" });
        }

        const orders = await orderModel.find({ userId });

        if (orders.length === 0) {
            return res.status(404).json({ mesg: "No orders found for this user." });
        }

        return res.status(200).json({mesg: "Orders fetched successfully",orders});
    }catch(err){
        res.status(500).json({mesg:"Internal server error"});
    }
};

const getOrdersByCustomerId = async (req, res) => {
    try {
      const { customerId } = req.params;
      if (!customerId) {
        return res.status(400).json({ mesg: "Customer ID is required" });
      }
  
      const orders = await orderModel
        .find({ userId: customerId })
        .populate('userId', 'name email')
        .populate('items.productId', 'productName productPrice')
        .sort({ createdAt: -1 });
  
      if (orders.length === 0) {
        return res.status(404).json({ mesg: "No orders found for this customer" });
      }
      res.status(200).json({
        customerId,
        orders,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ mesg: "Internal server error" });
    }
};
  

module.exports = {
    signupData,
    loginData,
    addproduct,
    getAllProduct,
    addToCart,
    deleteFromCart,
    updateTheCart,
    showTheCart,
    placeOrder,
    showAllOrder,
    getOrdersByCustomerId,
}