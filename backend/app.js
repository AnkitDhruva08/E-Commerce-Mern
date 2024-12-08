const express = require('express')
const app = express()
const errorMiddleware = require("./Middleware/error")
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");

const cors = require('cors')
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,            
    optionSuccessStatus: 200
}))

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json())
app.use(cookieParser())
app.use(express.json({}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());


const router = require("./Routes/index")


app.use("/api/v1/", router)


//Middleware for error
app.use(errorMiddleware)

module.exports = app
