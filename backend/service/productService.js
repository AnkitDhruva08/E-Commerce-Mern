const productModels = require("../Models/productModel")

module.exports.createProductService = async(productData) => {
    console.log('product data in service ===<<<<<>>>', productData)

    const data = await productModels.createProduct(productData);
    return data
} 

module.exports.updateProductService = async(productId, updateData) => {
    console.log('updateData data in service ===<<<<<>>>', updateData)

    const data = await productModels.updateProduct(productId, updateData);
    return data
}


