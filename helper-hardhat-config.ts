export interface networkConfigItem {
    ethUsdPriceFeed?: string
    blockConfirmations?: number
}
export interface networkConfigInfo {
    [key: string]: networkConfigItem
}
// NETWORKS
export const developmentChains = ["hardhat", "dashboard", "localhost", "ganache"]
export const networkConfig: networkConfigInfo = {
    localhost: {},
    hardhat: {},
    goerli: {
        blockConfirmations: 6,
    },
}

// PARAMS
export const NEW_STORE_VALUE = 77