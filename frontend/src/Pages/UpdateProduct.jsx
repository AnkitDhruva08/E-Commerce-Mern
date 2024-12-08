import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, CardFooter, Chip, Input, Textarea } from "@nextui-org/react";
import { Tost } from "../Components/Tost";
import ApiInfo from "../ApiInfo/ApiInfo";
import { useNavigate, useParams } from "react-router-dom";

const UpdateProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    category: "",
    Stock: "",
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]); 
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();
  const { productId } = useParams();

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('productId ===<<<>>>>', productId)
        const response = await axios.get(`${ApiInfo}/products/${productId}`, {
          withCredentials: true,
        });
        const product = response.data.product;

        if (product) {
          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            discount: product.discount || "",
            category: product.category || "",
            Stock: product.Stock || "",
          });
          setExistingImages(product.images || []);
        } else {
          console.error("Product data not found in response.");
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle input change for form fields
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle new image selection
  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  // Handle form submission
  const handleSubmit = async () => {
    const data = new FormData();

    for (const key in formData) {
      data.append(key, formData[key]);
    }
    for (const file of images) {
      data.append("images", file);
    }

    try {
      const response = await axios.post(`${ApiInfo}/products/update/${productId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const responseData = response.data;
      if (responseData.status === 200) {
        Tost(responseData.message);
        navigate("/All-Products");
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  if (loading) {
    return <div>Loading product details...</div>;
  }

  return (
    <div className="flex justify-center items-center">
      <Card className="max-w-3xl w-96 p-5 drop-shadow-md mt-5">
        <Input
          className="mb-5"
          label="Name"
          variant="bordered"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
        <Input
          type="number"
          className="mb-5"
          label="Price"
          variant="bordered"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
        />
        <Input
          type="number"
          className="mb-5"
          label="Discount"
          variant="bordered"
          name="discount"
          value={formData.discount}
          onChange={handleInputChange}
        />
        <Textarea
          className="mb-5"
          label="Description"
          variant="bordered"
          labelPlacement="outside"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
        />
        <Input
          type="number"
          className="mb-5"
          label="Stock"
          variant="bordered"
          name="Stock"
          value={formData.Stock}
          onChange={handleInputChange}
        />
        <Input
          className="mb-5"
          label="Category"
          placeholder="Enter categories separated with space"
          variant="bordered"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
        />
        <h1>Existing Images</h1>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: "100%" }}>
          {existingImages.map((url, index) => (
            <img key={index} src={url} alt={`Existing ${index}`} style={{ width: "50px", height: "50px", borderRadius: "5px" }} />
          ))}
        </div>
        <h1>Choose New Images (Optional)</h1>
        <Input
          type="file"
          multiple
          accept=".png, .jpg, .jpeg"
          className="mb-5"
          variant="underlined"
          onChange={handleImageChange}
        />
        <CardFooter>
          <Button color="primary" className="w-full" onClick={handleSubmit}>
            Update Product
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UpdateProduct;
