import { ethers } from "ethers";

import { abi } from "./abi";

const contractAddress = "0x823f9743588f7cdaa0c698a8bd531d54fb7fc533";

console.log(contractAddress);

const contractABI = abi;

let provider;
let signer;
let contract;
let writableContract;

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
  const result = await writableContract[funcName](...args);
  return result;
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
