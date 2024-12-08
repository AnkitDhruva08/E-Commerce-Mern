import React, { useState } from "react";
import axios from "axios";
import { Button, Card, CardFooter, Chip, Input, Textarea } from "@nextui-org/react";
import {Tost} from "../Components/Tost";
import ApiInfo from "../ApiInfo/ApiInfo";
import { useNavigate } from "react-router-dom";


const AddNewProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    category: "",
    Stock: "",
  });
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async () => {
    const data = new FormData();

    for (const key in formData) {
      data.append(key, formData[key]);
    }
    for (const file of images) {
      data.append("images", file);
    }

    try {
      const response = await axios.post(ApiInfo + "/products/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      console.log(response.data);
      const responseDatA = response.data
      if(responseDatA.status === 200){
        
      Tost(responseDatA.message);
      navigate("/All-Products")
      }

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="max-w-3xl w-96 p-5 drop-shadow-md mt-5">
        <Input
          className={"mb-5"}
          label="Name"
          variant="bordered"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
        <Input
          type={"number"}
          className={"mb-5"}
          label="Price"
          variant="bordered"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
        />
        <Input
          type={"number"}
          className={"mb-5"}
          label="Discount"
          variant="bordered"
          name="discount"
          value={formData.discount}
          onChange={handleInputChange}
        />
        <Textarea
          className={"mb-5"}
          label="Description"
          variant="bordered"
          labelPlacement="outside"
          name="description"
          placeholder="Enter description"
          value={formData.description}
          onChange={handleInputChange}
        />
        <Input
          type={"number"}
          className={"mb-5"}
          label="Stock"
          variant="bordered"
          name="Stock"
          value={formData.Stock}
          onChange={handleInputChange}
        />
        <Input
          className={"mb-5"}
          label="Category"
          placeholder={"Enter Category Separated with space"}
          variant="bordered"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
        />
        <h1>Choose Images</h1>
        <Input
          type={"file"}
          multiple={true}
          accept=".png, .jpg, .jpeg"
          className={"mb-5"}
          variant="underlined"
          onChange={handleImageChange}
        />
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            width: "100%",
            overflowX: "scroll",
            height: "50px",
          }}
        >
          {Array.from(images).map((file, index) => (
            <Chip key={index} color="primary">
              {file.name}
            </Chip>
          ))}
        </div>
        <CardFooter>
          <Button
            color="primary"
            className={"w-full"}
            onClick={handleSubmit}
          >
            Create
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddNewProduct;
