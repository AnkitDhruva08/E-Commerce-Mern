
const userModels = require("../Models/userModel")

module.exports.registerService = async(registrationData) => {
    console.log('registrationData in service ==<<<>>>', registrationData);
    const data = await userModels.registerUser(registrationData);
    return data

}


module.exports.loginService = async(loginData) => {
    console.log('login Data in service ===<<<>>>', loginData);

    const data = userModels.loginUser(loginData);
    return data
}