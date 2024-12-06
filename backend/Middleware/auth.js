const ErrorHandler = require("../Utils/errorHandling")
const JWT = require("jsonwebtoken")
const User = require('../database/userSchema');

exports.isAuthenticatedUser = async (req, res, next) => {
    const {token} = req.cookies
    console.log('token ===<<<<>>>>', token)
    if (!token) {
        return next(new ErrorHandler("Please Login To access this route", 401))
    } else {
        const decoded = await JWT.verify(token, process.env.JWT_SECRET)
        console.log('decode ===<<<>>>', decoded)
        req.user = await User.findById(decoded.userId)
        console.log('req.user ===<<<>>>>', req.user);
        next()
    }
}

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log('req.user.role ==<<>>>', req.user.role)
        if (!roles.includes(req.user.role)) {
            next(new ErrorHandler(`Role ${req.user.role} is not allowed`, 403))
        }
        next()
    }
}