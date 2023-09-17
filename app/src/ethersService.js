import { ethers } from "ethers";
import { store } from "./main";
import { abi } from "./abi";

const contractAddress = "0xbdb36402b0BFa7E5ccDa0E826E1De80bb8fcd1F7";

console.log(contractAddress);

const contractABI = abi;

let provider;
let signer;
let contract;
let writableContract;

let key = import.meta.env.VITE_PINATA_API_KEY;

export async function initializeEthers() {
  // Made it asynchronous
  console.log("Initializing Ethers");

  if (typeof window.ethereum !== "undefined") {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = await provider.getSigner(); // Awaited the async method
  } else {
    var provider = ethers.getDefaultProvider("sepolia");
  }

  if (!provider || !contractAddress || !contractABI) {
    throw new Error("Essential contract details missing"); // Error check
  }

  contract = new ethers.Contract(contractAddress, contractABI, provider);

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

export function getAccounts() {
  if (!signer) {
    throw new Error("Signer is not initialized");
  }
  return signer.listAccounts();
}

export async function callContractFunction(funcName, ...args) {
  if (!writableContract || !writableContract[funcName]) {
    throw new Error(
      "Function is not available on the contract or signer is not initialized"
    );
  }
  const transactionResponse = await writableContract[funcName](...args);
  console.log(transactionResponse.hash);
  await transactionResponse.wait(); // Wait for the transaction to be mined
  return {
    transactionResponse,
    txHash: transactionResponse.hash,
  };
}

export async function verifyCertificateOnChain(tokenId, uiDetails) {
  const certificate = await contract.certificates(tokenId);
  console.log(certificate);
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

export async function fetchMintedNFTsForUser(account) {
  const contract = getContract();
  const totalCertificates = await contract.totalCertificates();
  const userNFTs = [];

  for (let i = 0; i < totalCertificates; i++) {
    const certificate = await contract.certificates(i);
    const ownerAddress = await contract.certificateOwners(i);

    if (ownerAddress.toLowerCase() === account.toLowerCase()) {
      const txHash = store.setTxHash(certificate.ipfsHash);

      userNFTs.push({
        id: i,
        uri: certificate.uri,
        ipfsHash: certificate.ipfsHash,
        universityName: certificate.universityName,
        certificateType: certificate.certificateType,
        certificateDate: certificate.certificateDate,
        ownerAddress: ownerAddress,
        transactionHash: txHash,
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
