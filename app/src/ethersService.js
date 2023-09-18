import { ethers } from "ethers";
import { store } from "./main"; // Assuming you have a store for state management
import { abi } from "./abi"; // Make sure to update this ABI to your new contract's ABI

const contractAddress = "0x9A4169AEE84d196Fd85765A710dA1437EBEbfbC4";

const contractABI = abi;

let provider;
let signer;
let contract;
let writableContract;

export async function initializeEthers() {
  console.log("Initializing Ethers");

  if (typeof window.ethereum !== "undefined") {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = await provider.getSigner();
  } else {
    provider = ethers.getDefaultProvider("sepolia");
  }

  if (!provider || !contractAddress || !contractABI) {
    throw new Error("Essential contract details missing");
  }

  contract = new ethers.Contract(contractAddress, contractABI, provider);
  store.smartContractAddress =
    "https://sepolia.etherscan.io/address/" + contractAddress;

  if (signer) {
    writableContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
  }
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("Ethereum provider is not available");
  }
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return accounts[0];
}

export async function callContractFunction(funcName, ...args) {
  if (!writableContract || !writableContract[funcName]) {
    throw new Error(
      "Function is not available on the contract or signer is not initialized"
    );
  }
  const transactionResponse = await writableContract[funcName](...args);
  await transactionResponse.wait();
  return {
    transactionResponse,
    txHash: transactionResponse.hash,
  };
}

export async function verifyCertificateOnChain(tokenId, uiDetails) {
  const certificate = await contract.certificates(tokenId);

  if (
    certificate.uri === uiDetails.uri &&
    certificate.ipfsHash === uiDetails.ipfsHash &&
    certificate.universityName === uiDetails.universityName &&
    certificate.certificateType === uiDetails.certificateType &&
    certificate.certificateDate === uiDetails.certificateDate
  ) {
    return true;
  } else {
    return false;
  }
}

export async function fetchAllMintedNFTs() {
  const contract = getContract();
  const totalCertificates = await contract.totalCertificates();
  const allNFTs = [];

  for (let i = 0; i < totalCertificates; i++) {
    const certificate = await contract.certificates(i);

    allNFTs.push({
      id: i,
      uri: certificate.uri,
      ipfsHash: certificate.ipfsHash,
      universityName: certificate.universityName,
      certificateType: certificate.certificateType,
      certificateDate: certificate.certificateDate,
    });
  }

  return allNFTs;
}

export async function fetchMintedNFTsForUser(account) {
  const totalCertificates = await contract.totalCertificates();
  const userNFTs = [];

  for (let i = 0; i < totalCertificates; i++) {
    const owner = await contract.getOwnerOfToken(i);
    if (owner.toLowerCase() === account.toLowerCase()) {
      const certificate = await contract.certificates(i);
      userNFTs.push({
        id: i,
        uri: certificate.uri,
        ipfsHash: certificate.ipfsHash,
        universityName: certificate.universityName,
        certificateType: certificate.certificateType,
        certificateDate: certificate.certificateDate,
      });
    }
  }

  return userNFTs;
}

export function getContract() {
  if (!contract) {
    throw new Error("Contract is not initialized");
  }
  return contract;
}

export function getWritableContract() {
  if (!writableContract) {
    throw new Error("Contract is not initialized");
  }
  return writableContract;
}

export async function getOwnerAddress(tokenId) {
  return await contract.getOwnerOfToken(tokenId);
}
