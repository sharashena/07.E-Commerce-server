import { cloudinary } from "../configs/cloudinary.js";

export const uploadToCloudinary = async file => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "images" }, (err, result) => {
        if (err) reject(err);
        resolve(result);
      })
      .end(file.buffer);
  });
};

export const uploadAvatarsToCloudinary = async file => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "avatars",
          transformation: [
            { width: 400, height: 400, crop: "limit" },
            { gravity: "face", crop: "thumb" },
          ],
        },
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      )
      .end(file.buffer);
  });
};
