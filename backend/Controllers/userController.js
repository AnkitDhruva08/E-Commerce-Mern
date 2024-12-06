// noinspection JSUnresolvedReference
const User = require('../database/userSchema');
const userServices = require('../service/userService');
const bcrypt = require("bcryptjs")
const jwtToken = require('../Utils/jwtToken');
const  jwtAccesUtils  = require("../Utils/generateToken");
const nodeMailer = require("nodemailer");
const {SendVerificationMail, SendResetMail} = require("../Utils/Email");
//Register User
exports.registerUser = async (req, res) => {
    const registrationData = req.body;
    console.log('registrationData comming from backend ===<<>>>', registrationData)
    const data = await userServices.registerService(registrationData)
    console.log('data  response in controller ===<<<>>>>', data)
    const statusCode = data.status === 200 ? 200 : 403
    res.status(statusCode).send({
        status : data.status,
        message : data.message,

    })
   
}

//Verify User
exports.VerifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (user.isVerified) {
            res.status(200).json({
                success: false,
                details: "You are already verified!"
            })
            return
        }
        user.isVerified = true
        user.save().then((_) => {
            res.status(200).json({
                success: true,
                details: "Verified Successfully"
            })
        }).catch((e) => {
            res.status(500).json({
                success: false,
                details: e.message
            })
        })

    } catch (e) {
        res.status(500).json({
            success: false,
            details: "Wrong Verification"
        })
    }

}


//Login User

exports.loginUser = async (req, res) => {
    try {
        const loginData = req.body;
        console.log("loginDaata in Controller ===<<>>>", loginData);

        const data = await userServices.loginService(loginData);

        console.log("data response in controller ===<<>>>", data);
         // Send token and user data as response
        const token = await jwtAccesUtils.generateToken(res, data.user.id);
        console.log('token ===<<<>>>', token)
         

        if (!data.success) {
            res.status(data.status).json({
                success: false,
                details: data.details,
            });
        } 
        else{ 
            res.status(data.status).json({
                success: data.success,
                status : data.status,
                details : data.details,
                token,
                user : data.user
            })
        }

       
    } catch (error) {
        console.error("Error in loginUser controller:", error.message);
        res.status(500).json({
            success: false,
            details: "Internal Server Error",
        });
    }
};


//Logout User
exports.logout = async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged Out Successfully"
    })
}

//Forgot Password
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.find({email: req.body.email})
        if (user.length === 0) {
            res.status(200).json({
                success: false,
                message: "No user with this email"
            })
            return
        }
        await SendResetMail(user[0].email, user[0]._id)
        res.status(200).json({
            success: true,
            message: "Reset mail is sent to your e-mail"
        })
    } catch (e) {
        res.status(500).json({
            success: true,
            message: e.message
        })
    }
}

exports.resetPassword = async (req, res, next) => {
    const id = req.params.id
    const {password} = req.body
    try {
        const user = await User.findById(id)
        user.password = password
        user.save().then((_) => {
            res.status(200).json({
                success: true,
                message: "Password Updated Successfully"
            })
        }).catch((e) => {
            res.status(500).json({
                success: false,
                message: e.message
            })
        })
    } catch (e) {
        res.status(500).json({
            message: "Something Went Wrong"
        })
    }
}

// Get User Details
exports.getUserDetails = async (req, res) => {
    User.findById(req.user._id).then((user) => {
        res.status(200).json({
            success: true,
            user
        })
    }).catch((e) => {
        res.status(500).json({
            success: false,
            message: e.message
        })
    })
}

// Update Password
exports.updatePassword = async (req, res) => {
    const user = await User.findById(req.user._id).select("+password")
    const match = await bcrypt.compare(req.body.oldPassword, user.password)

    if (!match) {
        return res.status(400).json({
            success: false,
            message: "Old password doesn't match"
        })
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "New Password doesn't match confirm password"
        })
    }

    user.password = req.body.newPassword
    await user.save()
    sendToken(user, 200, res)
}

// Update Profile
exports.updateProfile = async (req, res) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }
    User.findByIdAndUpdate(req.user._id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    }).then((e) => {
        res.status(200).json({
            success: true,
            data: e,
        })
    }).catch((e) => {
        res.status(500).json({
            success: false,
            message: e.message
        })
    })
}


// Get all user admin
exports.getAllUser = async (req, res) => {
    User.find().then((users) => {
        res.status(200).json({
            success: true,
            users
        })
    }).catch((e) => {
        res.status(500).json({
            success: false,
            message: e.message
        })
    })
}

// Get single user admin
exports.getSingleUser = async (req, res) => {
    User.findById(req.params.id).then((user) => {
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }
        res.status(200).json({
            success: true,
            user
        })
    }).catch((e) => {
        res.status(500).json({
            success: false,
            message: e.message
        })
    })
}

// Update user role admin
exports.updateRole = async (req, res) => {
    User.updateOne({_id: req.params.id}, {role: req.body.role}).then((message) => {
        res.status(200).json({
            success: true,
            message
        })
    }).catch((e) => {
        res.status(500).json({
            success: false,
            message: e.message
        })
    })
}

//Delete user admin
exports.deleteUser = async (req, res) => {
    User.deleteOne({_id: req.params.id}).then((message) => {
        res.status(200).json({
            success: true,
            message
        })
    }).catch((e) => {
        res.status(500).json({
            success: false,
            message: e.message
        })
    })
}


exports.mailtest = async (req, res) => {
    const transporter = nodeMailer.createTransport({
        service: process.env.SMPT_SERVICE,
        secure: true,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD
        }
    })
    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: req.body.email,
        subject: req.body.subject,
        html: '<div style="height: 400px;background-color: white"><center><img src="https://cdn.dribbble.com/users/2879528/screenshots/11007898/media/02a3ee1367c85fbf8ee060614cb97fb0.jpeg?resize=400x0" style="height: 200px;width: 200px"/></center><h1 style="color: #00aced;text-align: center">Click Link Below To Reset Your Password</h1>' +
            '<center><a style="background-color: rgb(255, 165, 47);padding: 20px;padding-left: 50px;padding-right: 50px;color: #efefef; border-radius: 10px;margin-top: 20px;">Reset Password</a></center></div>'
    }

    await transporter.sendMail(mailOptions)
    res.status(200).json({
        message: "mail sent"
    })
}
