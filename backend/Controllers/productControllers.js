
const Product = require('../database/productSchema')
const ApiFeatures = require('../Utils/apifeatures')
const ErrorHandler = require('../Utils/errorHandling')
const cloudinary = require("cloudinary")
const productService = require('../service/productService')
const path = require("path"); // To handle file paths

const fs = require("fs");

//Admin route
function Upload(buffer) {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
            {
                resource_type: "image",
                folder: "Ecommerce"
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        ).end(buffer); 
    });
}




//Update One with image
exports.UpdateWithImage = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        product.images.map((e) => {
            cloudinary.uploader
                .destroy(e.public_id)
                .then(result => console.log(result));
        })
        product.images = []
        if (req.files.File[0] === undefined) {
            console.log(req.files.File.data)
            try {
                const result = await Upload(req.files.File.data)
                const Re = {
                    public_id: result.public_id,
                    url: result.url
                }
                product.images.push(Re)
                product.save({
                    validateBeforeSave: false
                }).then((e) => {
                    Product.updateOne({_id: req.params.id}, req.body).then((doc) => {
                        res.status(200).json({
                            success: true,
                            details: doc
                        })
                    }).catch((e) => {
                        res.status(500).json({
                            message: "Failed",
                            error: e.message
                        })
                    })
                }).catch(e => {
                    res.status(500).json({
                        message: "Failed",
                        error: e.message
                    })
                })
            } catch (e) {
                console.log("UpdateWithImage() failed to upload single image")
                console.log(e.message)
                res.status(500).json({
                    success: false,
                    message: "Something Went Wrong"
                })
            }
        } else {
            let i = 0
            for (i; i < req.files.File.length; i++) {
                try {
                    const result = await Upload(req.files.File[i].data)
                    const Re = {
                        public_id: result.public_id,
                        url: result.url
                    }
                    product.images.push(Re)
                } catch (e) {
                    console.log("UpdateWithImage() failed to upload multiple image")
                    console.log(e.message)
                    res.status(500).json({
                        success: false,
                        message: "Something Went Wrong"
                    })
                }
            }
            product.save({
                validateBeforeSave: false
            }).then((_) => {
                Product.updateOne({_id: req.params.id}, req.body).then((doc) => {
                    res.status(200).json({
                        success: true,
                        details: doc
                    })
                }).catch((e) => {
                    res.status(500).json({
                        message: "Failed",
                        error: e.message
                    })
                })
            }).catch(e => {
                res.status(500).json({
                    message: "Failed",
                    error: e.message
                })
            })
        }
    } catch (e) {
        console.log("UpdateWithImage() failed findById")
        console.log(e.message)
        res.status(500).json({
            success: false,
            message: "Something Went Wrong"
        })
    }
}

//Admin route
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        product.images.map((e) => {
            cloudinary.uploader
                .destroy(e.public_id)
                .then(result => console.log(result));
        })
        Product.deleteOne({_id: req.params.id}).then((e) => {
            res.status(200).json({
                success: true,
                details: e
            })
        }).catch((e) => {
            console.log("deleteProduct() failed to deleteOne")
            console.log(e.message)
            res.status(500).json({
                success: false,
                message: "Something Went Wrong"
            })
        })
    } catch (e) {
        console.log("deleteProduct() failed to findById")
        console.log(e.message)
        res.status(500).json({
            success: false,
            message: "Something Went Wrong"
        })
    }
}

// //Admin route
// exports.updateProduct = async (req, res) => {
//     Product.updateOne({_id: req.params.id}, req.body).then((doc) => {
//         res.status(200).json({
//             success: true,
//             details: doc
//         })
//     }).catch((e) => {
//         return next(new ErrorHandler("Product Not Found", 404))
//     })
// }

exports.getSingleProduct = (req, res, next) => {
    console.log('Request received to fetch single product.');
    console.log('req.params.id ===>>>', req.params.id);

    Product.findOne({ _id: req.params.id })
        .populate("reviews.user", "avatar")
        .then((doc) => {
            if (!doc) {
                console.error('Product not found for ID:', req.params.id);
                return next(new ErrorHandler("Product Not Found", 404));
            }
            console.log('Product fetched successfully:', doc);
            res.status(200).json({
                success: true,
                product: doc,
            });
        })
        .catch((e) => {
            console.error('Error fetching product:', e.message);
            return next(new ErrorHandler("Product Not Found", 404));
        });
};


exports.getAllProductsAdmin = async (req, res) => {
    Product.find().select("name price Stock category description discount").then((e) => {
        res.status(200).json({
            products: e
        })
    }).catch(e => {
        res.status(400).json({
            error: e.message
        })
    })
}


exports.getAllProducts = async (req, res, next) => {
    const resultPerPage = 10;
    console.log("Received request for getAllProducts");

    try {
        // Count total products
        const productCount = await Product.countDocuments();
        console.log(`Total number of products in the database: ${productCount}`);

        // Apply filters, search, and pagination
        const apifeature = new ApiFeatures(Product.find(), req.query)
            .search()
            .filter()
            .pagination(resultPerPage);

        console.log("API features applied:", req.query);

        const k = new ApiFeatures(Product.find(), req.query).filter();
        console.log("Filter query initialized");

        try {
            // Fetch filtered products
            const Result = await k.query;
            console.log(`Total products after filtering: ${Result.length}`);

            // Log each product's images
            Result.forEach((product, index) => {
                console.log(`Product ${index + 1} - Name: ${product.name}`);
                if (product.images && product.images.length > 0) {
                    product.images.forEach((image, imgIndex) => {
                        console.log(`  Image ${imgIndex + 1}: ${image.url}`);
                    });
                } else {
                    console.log("  No images available for this product.");
                }
            });

            // Execute final query with pagination
            apifeature.query
                .then((e) => {
                    console.log(`Total products returned by pagination: ${e.length}`);

                    // Log image paths for paginated results
                    e.forEach((product, index) => {
                        console.log(`Paginated Product ${index + 1} - Name: ${product.name}`);
                    });

                    res.status(200).json({
                        success: true,
                        Total_Product: productCount,
                        TotalReturned: Result.length,
                        ResultPerPage: resultPerPage,
                        Products: e,
                    });
                })
                .catch((e) => {
                    console.error("Error in apifeature.query execution:", e.message);
                    return next(new ErrorHandler("Product Not Found", 404));
                });
        } catch (e) {
            console.error("Error executing filtered query (k.query):", e.message);
            res.status(500).json({
                success: false,
                message: "Something Went Wrong",
            });
        }
    } catch (e) {
        console.error("Error in counting documents:", e.message);
        res.status(500).json({
            success: false,
            message: "Something Went Wrong",
        });
    }
};



exports.searchProduct = async (req, res, next) => {
    console.log(req.query.keyword)
    Product.find({
        category: {
            $regex: req.query.keyword.toString(),
            $options: "xi"
        }
    }).select("name images.url Stock price").then((e) => {
        res.status(200).json({
            products: e
        })
    }).catch((e) => {
        res.status(200).json({
            error: e.message
        })
    })

}

//Create review or update review
exports.createProductReview = async (req, res) => {
    const {rating, comment, productId} = req.body
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }
    try {
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }
        const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString())
        if (isReviewed) {
            product.reviews.forEach((rev) => {
                if (rev.user.toString() === req.user._id.toString()) {
                    rev.rating = rating
                    rev.comment = comment
                }
            })
        } else {
            product.reviews.push(review)
            product.numOfReviews = product.reviews.length
        }
        let avg = 0
        product.reviews.forEach((rev) => {
            avg += rev.rating
        })
        product.ratings = avg / product.reviews.length
        try {
            await product.save({
                validateBeforeSave: false
            })
            res.status(200).json({
                success: true
            })
        } catch (e) {
            console.log("createProductReview() failed to save")
            console.log(e.message)
            res.status(500).json({
                success: false,
                message: "Something Went Wrong"
            })
        }
    } catch (e) {
        console.log("createProductReview() failed to findById")
        console.log(e.message)
        res.status(500).json({
            success: false,
            message: "Something Went Wrong"
        })
    }

}

//Get reviews for product
exports.getProductReview = async (req, res) => {
    Product.findById(req.query.id).select("reviews").then((doc) => {
        if (!doc) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        res.status(200).json({
            success: true,
            reviews: doc
        })
    }).catch((e) => {
        res.status(500).json({
            success: false,
            message: e.message
        })
    })
}

//Delete review
exports.deleteProductReview = async (req, res) => {
    try {
        const product = await Product.findById(req.query.productId)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        const reviews = product.reviews.filter((rev) => {
            return rev._id.toString() !== req.query.id.toString();
        })

        let avg = 0
        reviews.forEach((rev) => {
            avg += rev.rating
        })
        const ratings = avg / reviews.length
        const numOfReviews = reviews.length

        try {
            await Product.findByIdAndUpdate(req.query.productId, {
                reviews,
                ratings,
                numOfReviews
            }, {
                new: true,
                runValidators: true,
                useFindAndModify: false
            })

            res.status(200).json({
                success: true,
            })
        }catch (e) {
            console.log("deleteProductReview() failed to findByIdAndUpdate")
            console.log(e.message)
            res.status(500).json({
                success: false,
                message: "Something Went Wrong"
            })
        }
    } catch (e) {
        console.log("deleteProductReview() failed to findById")
        console.log(e.message)
        res.status(500).json({
            success: false,
            message: "Something Went Wrong"
        })
    }
}






// controller fro create product
exports.insertNewProduct = async (req, res) => {
    console.log("Data received:", req.body);

    const { name, description, price, discount, category, Stock } = req.body;

    // Ensure 'images' exists in req.files
    if (!req.files || !req.files.images) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    // Handle single or multiple files
    const uploadedFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

    const images = [];

    for (const file of uploadedFiles) {
        // Define the path where the file should be saved temporarily
        const tempPath = path.join(__dirname, "../uploads", file.name);

        // Move the file to the temporary location
        await file.mv(tempPath);

        // Read the file and convert it to base64
        const fileData = fs.readFileSync(tempPath);
        const base64String = `data:${file.mimetype};base64,${fileData.toString("base64")}`;

        // Add base64 data to images array
        images.push({
            public_id: file.name, 
            url: base64String,
        });

        // Delete the temporary file after conversion
        fs.unlinkSync(tempPath);
    }

    console.log("Uploaded images (Base64):", images);

    const userId = req.user.id;
    console.log("userId:", userId);

    const productData = { name, description, price, discount, category, Stock, images, userId };
    console.log("productData:", productData);

    try {
        const data = await productService.createProductService(productData);
        console.log("Data response:", data);

        res.status(data.status).json(data);
    } catch (err) {
        console.error("Error saving product:", err);
        res.status(500).json({ success: false, message: "Failed to save product" });
    }
};

// update product controller 
exports.updateProduct = async (req, res) => {
    console.log("Data received:", req.body);
    console.log('req.params.id ===>>>', req.params.id);
    const productId = req.params.id;
    console.log('productId ===>>>', productId);

    const { name, description, price, discount, category, Stock } = req.body;

    // Ensure 'images' exists in req.files
    if (!req.files || !req.files.images) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    // Handle single or multiple files
    const uploadedFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

    const images = [];

    for (const file of uploadedFiles) {
        // Define the path where the file should be saved temporarily
        const tempPath = path.join(__dirname, "../uploads", file.name);

        // Move the file to the temporary location
        await file.mv(tempPath);

        // Read the file and convert it to base64
        const fileData = fs.readFileSync(tempPath);
        const base64String = `data:${file.mimetype};base64,${fileData.toString("base64")}`;

        // Add base64 data to images array
        images.push({
            public_id: file.name, 
            url: base64String,
        });

        // Delete the temporary file after conversion
        fs.unlinkSync(tempPath);
    }

    console.log("Uploaded images (Base64):", images);

    const userId = req.user.id;
    console.log("userId:", userId);

    const updateData = { name, description, price, discount, category, Stock, images, userId };
    console.log("updateData in controller ===<<>>>", updateData);

    try {
        const data = await productService.updateProductService(productId, updateData);
        console.log("Data response:", data);

        res.status(data.status).json(data);
    } catch (err) {
        console.error("Error saving product:", err);
        res.status(500).json({ success: false, message: "Failed to save product" });
    }
};


