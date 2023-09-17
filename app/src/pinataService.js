import axios from "axios";
import FormData from "form-data";
import * as fs from "fs";

const JWT = import.meta.env.VITE_PINATA_JWT;

const pinFileToIPFS = async (file, metadata) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const pinataMetadata = JSON.stringify(metadata);
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${JWT}`,
        },
      }
    );
    console.log(res.data);
    if (res.data && res.data.IpfsHash) {
      return res.data.IpfsHash;
    }
    return null;
  } catch (error) {
    console.error("An error occurred while pinning the file to IPFS:", error);
  }
};

export { pinFileToIPFS };
