const User = require('../database/userSchema');
const bcrypt = require("bcryptjs")
const sendToken = require('../Utils/jwtToken')
const nodeMailer = require("nodemailer");
const {SendVerificationMail, SendResetMail} = require("../Utils/Email");

module.exports.registerUser = async (registrationData) => {
    console.log('registration_details in models ===<<>>>', registrationData)

  try {
    const {
      name,
      email,
      password
    } = registrationData;

  

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
    });

    console.log('newUser ===<<>>>', newUser)

    // Save the user record to the database
    const savedUser = await newUser.save();

    console.log("User registration successful:", savedUser);

    return {
      status: 200,
      message: "User Registered Successfully",
      userId: savedUser._id,
    };
  } catch (error) {
    console.error("Error in registerUser:", error.message);

    return {
      status: "Failed",
      message: error.message,
    };
  }
}; 



// login user 

module.exports.loginUser = async (loginDetails) => {
    try {
        const { email, password } = loginDetails;
        console.log("loginDetails in model s===<<>>", loginDetails);

        if (!email || !password) {
            return {
                success: false,
                status: 400,
                details: "Please provide email and password",
            };
        }

        // Retrieve the user with password field
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return {
                success: false,
                status: 404,
                details: "No user with the given email",
            };
        }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('isMatch ===<<>>>', isMatch)

        if (!isMatch) {
            return {
                success: false,
                status: 401,
                details: "Incorrect email or password",
            };
        }

        return {
            details: "User Loggedin success",
            success: true,
            status: 200,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    } catch (error) {
        console.error("Error in loginUser:", error.message);
        return {
            success: false,
            status: 500,
            details: "Server error. Please try again later.",
        };
    }
};


