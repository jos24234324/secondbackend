import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
//node js has fs by default;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
//now it has been setup for cloudinary ops
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded succesfully
    console.log("FIle has been uploaded succesfully", response.url);
    
    return response;
  } catch (error) {
    //we will unlink
    fs.unlinkSync(localFilePath);
    //remove the locaaly saved file as it may be corrupted
    return null;
  }
};
export default uploadOnCloudinary;
