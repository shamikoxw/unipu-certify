// ipfsService.js
import ipfsClient from "ipfs-http-client";

const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

export async function uploadToIPFS(file) {
  const { path } = await ipfs.add(file);
  return path;
}
