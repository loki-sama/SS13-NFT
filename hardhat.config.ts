require("dotenv").config();
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";

import { TASK_VERIFY } from "@nomiclabs/hardhat-etherscan/dist/src/constants";
import { HardhatUserConfig } from "hardhat/types";
import { task } from "hardhat/config";
import { deployContract } from "ethereum-waffle";
import { SS13 } from "./types";

import SS13Artifact from "./artifacts/contracts/SS13.sol/SS13.json";

export default {
  solidity: "0.8.6",
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
  mocha: {
    timeout: 300000,
  },
  networks: {
    hardhat: {
      Mnemonic:
        "finger blur tag alpha whisper avoid forum dove shadow boost ancient fiscal",
      gasPrice: 0,
      blockGasLimit: 10000000,
      network_id: 123,
      chainId: 123,
    },
    eth: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      network_id: 1,
      gasPrice: 49000000000,
      accounts: [process.env.PRIVATE_KEY],
      timeout: 200000000,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID || ""}`,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
    matic: {
      url: `https://polygon-mainnet.infura.io/v3/${
        process.env.INFURA_PROJECT_ID || ""
      }`,
      chainId: 137,
      gasMultiplier: 2,
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
    externalArtifacts: ["externalArtifacts/*.json"], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
  },
} as HardhatUserConfig;

task("deploy-ss13").setAction(async (taskArgs, { run, ethers }) => {
  const signers = await ethers.getSigners();

  const name = "SS13 Space Pirates";
  const symbol = "SS13 Space Pirates";
  const maxNftSupply = 10000;
  const saleStart = Date.now() + 24 * 60 * 60;

  const constructorArgsParams = [name, symbol, maxNftSupply, saleStart];
  const ss13Contact = (await deployContract(
    signers[0],
    SS13Artifact,
    constructorArgsParams,
    { gasLimit: 5000000 }
  )) as SS13;
  await ss13Contact.deployTransaction.wait(3);
  await run(TASK_VERIFY, {
    address: ss13Contact.address,
    constructorArgsParams,
  });
  console.log("SS13 NFT address:", ss13Contact.address);
  return ss13Contact;
});
