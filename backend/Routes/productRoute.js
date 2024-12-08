const express = require("express");
const upload = require("../multer");
const {
    getAllProducts,
    deleteProduct,
    getSingleProduct,
    createProductReview,
    getProductReview,
    deleteProductReview,
    searchProduct,
    getAllProductsAdmin,
    insertNewProduct,
    UpdateWithImage,
    uploadMiddleware,
    updateProduct
} = require("../Controllers/productControllers");
const { isAuthenticatedUser, authorizeRoles } = require("../Middleware/auth");

const Router = express.Router();

Router.route("/products").get(getAllProducts);
Router.route("/search").get(searchProduct);
Router.route("/products/get-all/admin").get(getAllProductsAdmin);
Router.route("/products/:id").get(getSingleProduct);

// Admin routes
// Router.route("/admin/products/new").post(
//     isAuthenticatedUser,
//     authorizeRoles("admin"),
//     upload.array("File", 5),
//     createProduct
// );
// Router.route("/admin/products/:id").patch(
//     isAuthenticatedUser,
//     authorizeRoles("admin"),
//     updateProduct
// );
Router.route("/admin/productsWithImage/:id").patch(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    upload.array("File", 5), // Adjust if the update needs files
    UpdateWithImage
);
Router.route("/admin/products/:id").delete(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    deleteProduct
);

Router.route("/review").put(isAuthenticatedUser, createProductReview);
Router.route("/reviews")
    .get(getProductReview)
    .delete(isAuthenticatedUser, deleteProductReview);

// New product creation
Router.post(
    "/products/create",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    // upload.array("images", 5), 
    insertNewProduct
);

// update routes 
Router.post("/products/update/:id", isAuthenticatedUser,authorizeRoles("admin"), 
    updateProduct
); 




module.exports = Router;
