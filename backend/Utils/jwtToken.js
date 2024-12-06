//creating token and saving in cookie

module.exports.sendToken = async(user, statusCode, res) => {
    const token = user.getJWTToken()
    console.log('token in jwt ==<<>>', token)

    //options

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    }

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        user
    })
}

