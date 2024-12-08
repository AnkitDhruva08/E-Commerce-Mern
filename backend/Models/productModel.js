const Product = require('../database/productSchema');




module.exports.createProduct = async (productData) => {
    try {
        console.log("Product data received:", productData);

        // Destructure necessary fields from productData
        const {
            name,
            description,
            price,
            discount,
            category,
            Stock,
            images,
            userId 
        } = productData;

        // Create a new product document in the database
        const product = await Product.create({
            name,
            description,
            price,
            discount,
            category,
            Stock,
            images,
            user: userId,
        });

        // Return success response
        return {
            status: 200,
            message: "Product inserted successfully",
            productId: product._id,
        };
    } catch (error) {
        console.error("Error inserting product:", error.message);

        // Return error response
        return {
            status: 500,
            message: "Failed to insert product",
            error: error.message,
        };
    }
};  

module.exports.updateProduct = async (productId, updateData) => {
    try {
        console.log("Update request received for product ID:", productId);
        console.log("Update data in models ===<<<<>>>>>", updateData);

        // Find the product by ID and update it with the provided data
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,         
            updateData,        
            { new: true }      
        );

        // Check if the product was found and updated
        if (!updatedProduct) {
            return {
                status: 404,
                message: "Product not found",
            };
        }

        // Return success response with the updated product
        return {
            status: 200,
            message: "Product updated successfully",
            product: updatedProduct,
        };
    } catch (error) {
        console.error("Error updating product:", error.message);

        // Return error response
        return {
            status: 500,
            message: "Failed to update product",
            error: error.message,
        };
    }
};





