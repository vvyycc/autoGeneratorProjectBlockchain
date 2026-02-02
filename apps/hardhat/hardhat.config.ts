import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

const rpcUrl = process.env.RPC_URL || "";
const privateKey = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: rpcUrl,
      accounts: privateKey ? [privateKey] : []
    },
    amoy: {
      url: rpcUrl,
      accounts: privateKey ? [privateKey] : []
    },
    bscTestnet: {
      url: rpcUrl,
      accounts: privateKey ? [privateKey] : []
    }
  }
};

export default config;
