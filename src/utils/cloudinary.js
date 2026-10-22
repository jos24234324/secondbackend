import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    throw new Error("A local file path is required for Cloudinary upload");
  }

  return cloudinary.uploader.upload(localFilePath, {
    resource_type: "auto",
  });
};
export default uploadOnCloudinary;
