require("dotenv").config();
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";

import { TASK_VERIFY } from "@nomiclabs/hardhat-etherscan/dist/src/constants";
import { HardhatUserConfig } from "hardhat/types";
import { task } from "hardhat/config";



export default {
  solidity: "0.8.4",
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
      chainId: 97,
      gasMultiplier: 2,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${
        process.env.INFURA_PROJECT_ID || ""
      }`,
      chainId: 80001,
      gasMultiplier: 2,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
    // bsc: {},
    // matic: {},
    // avalanche: {},
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
    externalArtifacts: ["externalArtifacts/*.json"], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
  },
};

task("deploy-child-portal").setAction(async (taskArgs, { run, ethers, config }) => {
  const signers = await ethers.getSigners();
  config.etherscan.apiKey = process.env.POLYSCAN_KEY

  const underlyingToken = "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1";
  const mumbaiChildChainManagerProxy =
    "0xb5505a6d998549090530911180f38aC5130101c6";

  const constructorArgsParams = [
    "WETH Portal Token",
    "WPT",
    underlyingToken,
    mumbaiChildChainManagerProxy,
  ];
  const childTokenPortal = (await deployContract(
    signers[0] as any,
    ChildTokenPortalArtifact,
    constructorArgsParams,
    { gasLimit: 5000000 }
  )) as ChildTokenPortal;
  await run(TASK_VERIFY, {
    address: childTokenPortal.address,
    constructorArgsParams,
  });
  console.log("Wrapper address:", childTokenPortal.address);
  return childTokenPortal;
});

task("deploy-root-portal").setAction(async (taskArgs, { run, ethers }) => {
  const signers = await ethers.getSigners();

  const underlyingToken = "0x655F2166b0709cd575202630952D71E2bB0d61Af";
  const predicateProxy = "0x37c3bfC05d5ebF9EBb3FF80ce0bd0133Bf221BC8";

  const constructorArgsParams = [
    "WETH Portal Token",
    "WPT",
    underlyingToken,
    predicateProxy,
  ];
  const rootTokenPortal = (await deployContract(
    signers[0] as any,
    RootTokenPortalArtifact,
    constructorArgsParams,
    { gasLimit: 5000000 }
  )) as RootTokenPortal;
  await run(TASK_VERIFY, {
    address: rootTokenPortal.address,
    constructorArgsParams,
  });
  console.log("Wrapper address:", rootTokenPortal.address);
  return rootTokenPortal;
});
