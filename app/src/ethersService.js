import { ethers } from "ethers";
import { abi } from "./abi";

const defaultProvider = import.meta.env.VITE_DEFAULT_PROVIDER;
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractABI = abi;
let provider;
let signer;
let contract;
let writableContract;

export function initializeEthers() {
  if (typeof window.ethereum !== "undefined") {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
  } else {
    provider = new ethers.providers.getDefaultProvider(defaultProvider);
  }

  contract = new ethers.Contract(contractAddress, contractABI, provider);

  // If signer is available, we create a writable version of the contract
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
  const result = await writableContract[funcName](...args);
  return result;
}
