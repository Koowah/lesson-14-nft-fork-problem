import "@nomicfoundation/hardhat-chai-matchers"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-ethers"
import "hardhat-deploy"
import "solidity-coverage"
import "hardhat-gas-reporter"
import "hardhat-contract-sizer"
import "dotenv/config"
import "@typechain/hardhat"

import { HardhatUserConfig } from "hardhat/types"

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL!
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL!
const BSC_RPC_URL = process.env.BSC_RPC_URL!

const DEPLOYER = process.env.DEPLOYER_PRIVATE_KEY!
const USER = process.env.USER_PRIVATE_KEY!
const REPORT_GAS = process.env.REPORT_GAS || "false"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY!

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
    // defaultNetwork: "localhost",
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                settings: {},
                // optimizer: { enabled: true },
            },
        ],
    },
    networks: {
        hardhat: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
            // // If you want to do some forking, uncomment this
            // forking: {
            //   url: MAINNET_RPC_URL
            //   blockNumber: 16179108
            // }
        },
        localhost: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
        },
        dashboard: {
            url: "http://localhost:24012/rpc", // truffle dashboard - SECURE
        },
        bsc: {
            url: BSC_RPC_URL,
            chainId: 56,
            accounts: [DEPLOYER, USER],
            saveDeployments: true,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            chainId: 5,
            accounts: [DEPLOYER, USER],
            // accounts: {
            //     mnemonic: MNEMONIC
            // },
            saveDeployments: true,
        },
        ganache: {
            url: "http://127.0.0.1:7545",
            accounts: {
                mnemonic:
                    "crash envelope orbit crash actress debate improve borrow aunt twenty hero base",
                initialIndex: 0,
                count: 10,
            },
        },
    },
    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
            // bsc: "",
        },
        // customChains: [
        //     {
        //         network: "goerli",
        //         chainId: 5,
        //         urls: {
        //             apiURL: "https://api-goerli.etherscan.io/api",
        //             browserURL: "https://goerli.etherscan.io",
        //         },
        //     },
        // ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
            // 5: 1 // meaning for chainId 5, we want the deployer to be 1
        },
        user: {
            default: 1,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS === "true",
        // outputFile: "gas-report.txt",
        // noColors: true,
        // currency: "USD",
        // coinmarketcap: COINMARKETCAP_API_KEY,
        // token: "ETH", // choose chain - BNB, MATIC ...
    },
    contractSizer: {
        runOnCompile: false,
        only: ["Lottery"],
    },
    // abiExporter: {
    //     path: "./abi",
    //     runOnCompile: true,
    //     clear: true,
    //     only: [],
    //     except: [],
    // },
    mocha: {
        timeout: 500000, // 500 seconds
    },
}

export default config
