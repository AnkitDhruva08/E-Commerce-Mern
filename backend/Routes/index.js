
const express = require("express")

const product = require("./userRoute")
const user = require("./productRoute")
const order = require("./orderRoute")

const Router = express.Router() 


Router.use("", product)
Router.use("", user)
Router.use("", order)

module.exports = Router