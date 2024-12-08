import React, {useContext, useState} from "react";
import Rating from "react-rating";
import {LiaStarSolid} from "react-icons/lia";
import {InputNumber} from 'antd';
import {Spinner, Textarea} from "@nextui-org/react";
import {motion} from "framer-motion"
import Review from "./Reviews";
import {RiSendPlane2Fill} from "react-icons/ri";
import Context from "../../Context/Context";
import {useNavigate} from "react-router-dom";

const ProductDetail = ({
                           images,
                           title,
                           averageReview,
                           maxStock,
                           Loading,
                           Star,
                           discountedPrice,
                           totalPrice,
                           discription,
                           onQuntityChange,
                           onReviewTextChange,
                           productId,
                           getReviewStar,
                           reviews,
                           onAddToCart,
                           onPostReviewPress,
                       }) => {
    const [selectedImage, changeSelected] = useState(images[0].url)
    const {User} = useContext(Context)
    const navigate = useNavigate()

    // Add handlers for Delete and Update
    const handleDelete = async () => {
        const confirmation = window.confirm("Are you sure you want to delete this product?");
        if (confirmation) {
            // Make an API call to delete the product
            try {
                const response = await fetch(`/api/products/${productId}`, {
                    method: "DELETE",
                    credentials: "include",
                });
                const data = await response.json();
                if (data.success) {
                    alert("Product deleted successfully.");
                    navigate('/products'); // Redirect to the product list page
                } else {
                    alert("Failed to delete the product.");
                }
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("An error occurred while deleting the product.");
            }
        }
    };

    const handleUpdate = () => {
        // Redirect to an update page or open a modal for product update
        navigate(`/update-product/${productId}`);
    };

    return (
        <>
            <div className="md:flex items-start justify-center py-12 2xl:px-20 md:px-6 px-4">
                <div
                    className="xl:w-[600px] xl:h-[600px] lg:w-[50vw] lg:h-[50vw] md:block md:w-[50vw] md:h-[50vw] hidden">
                    <motion.img
                        key={selectedImage}
                        initial={{
                            x: 50,
                            opacity: 0
                        }}
                        animate={{
                            x: 0,
                            opacity: 1
                        }}
                        transition={{duration: 0.5}}
                        className="xl:w-[600px] xl:h-[600px] lg:w-[50vw] lg:h-[50vw]" style={{
                        objectFit: "cover",
                        width: "600px",
                        height: "550px",
                        borderRadius: "10px"
                    }} alt="product" src={selectedImage}/>
                    <div
                        className="flex items-center justify-start mt-3 space-x-4 md:space-x-0 w-full overflow-x-scroll gap-4">
                        {images.map((e, i) => <div
                            key={i}
                            style={{
                                height: "50px",
                                width: "50px",
                                objectFit: "cover",
                                overflow: "hidden",
                            }}>
                            <img alt="img-tag-one"
                                 style={{
                                     border: "1px solid black",
                                     objectFit: "cover",
                                     width: "50px",
                                     height: "50px",
                                     borderRadius: "10000px"
                                 }}
                                 src={e.url} key={i} onClick={() => {
                                changeSelected(e.url)
                            }}/>
                        </div>)}
                    </div>
                </div>
                <div className="md:hidden">
                    <motion.img
                        key={selectedImage}
                        initial={{
                            x: 50,
                            opacity: 0
                        }}
                        animate={{
                            x: 0,
                            opacity: 1
                        }}
                        transition={{duration: 0.5}}
                        className="w-full h-96" style={{
                        objectFit: "cover",
                        borderRadius: "10px",
                    }} alt="product" src={selectedImage}/>
                    <div
                        className="flex items-center justify-start mt-3 space-x-4 md:space-x-0 w-full overflow-x-scroll">
                        {images.map((e, i) => <div
                            key={i}
                            style={{
                                height: "50px",
                                width: "50px",
                                objectFit: "cover",
                                overflow: "hidden"
                            }}>
                            <img alt="img-tag-one"
                                 style={{
                                     objectFit: "cover",
                                     width: "50px",
                                     height: "50px",
                                     border: "1px solid black",
                                     borderRadius: "10000px"
                                 }}
                                 src={e.url} key={i} onClick={() => {
                                changeSelected(e.url)
                            }}/>
                        </div>)}
                    </div>
                </div>
                <div className="xl:w-2/5 md:w-1/2 lg:ml-8 md:ml-6 md:mt-0 mt-6">
                    <div className="border-b border-gray-200 pb-6">
                        <h1
                            className="
							lg:text-2xl
							text-xl
							font-semibold
							lg:leading-6
							leading-7
							text-gray-800
							mt-2
						"
                        >
                            {title}
                        </h1>
                        <p className="text-sm leading-none text-gray-600 mt-1.5">{`Product:#${productId}`}</p>
                    </div>

                    {/* Add Admin Buttons */}
                    {User.Role === 'admin' && (
                        <div className="flex space-x-4 mt-4">
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Update Product
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                Delete Product
                            </button>
                        </div>
                    )}

                    {/* Rest of the product details */}
                    <div className="flex justify-start items-center">
                        <Rating
                            initialRating={averageReview}
                            quiet={true}
                            readonly={true}
                            fullSymbol={<LiaStarSolid style={{
                                color: "black",
                                fontSize: "30px"
                            }}/>}
                            emptySymbol={<LiaStarSolid style={{
                                color: "gray",
                                fontSize: "30px"
                            }}/>}
                        />
                    </div>
                    <div className="text-4xl mt-2">
                        <h1 style={{
                            display: "inline",
                            textDecoration: "line-through",
                            fontSize: "35px",
                            marginRight: "10px",
                            color: "red"
                        }}>{`₹${totalPrice}`}</h1>{`₹${discountedPrice}`}
                    </div>
                    {/* Other components like reviews, etc. */}
                </div>
            </div>
            <Review reviews={reviews}/>
        </>
    );
};

export default ProductDetail;
