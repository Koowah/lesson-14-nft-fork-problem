import { ethers } from "hardhat"

export interface networkConfigItem {
    ethUsdPriceFeed?: string
    blockConfirmations?: number
    [key: string]: any
}
export interface networkConfigInfo {
    [key: string]: networkConfigItem
}
// NETWORKS
export const networkConfig: networkConfigInfo = {
    hardhat: {
        // goerli fork
        linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D", // VRF coordinator address
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000",
        mintFee: ethers.utils.parseEther("0.01"),
    },
}
export const developmentChains = ["hardhat", "dashboard", "localhost", "ganache"]

// PARAMS
export const DECIMALS = "18"
export const INITIAL_PRICE = ethers.utils.parseEther("200")
