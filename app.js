const express = require("express");
const app = express();

const bodyparser = require("body-parser");
const userRouter = require("./routers/userRouter");
const adminRouter = require("./routers/adminRouter");

app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.json());

app.use("/",userRouter);
app.use("/",adminRouter);

module.exports = app;