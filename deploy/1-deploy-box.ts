import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import { verify } from "../utils/verify"

const deployBox: DeployFunction = async ({
    getNamedAccounts,
    deployments,
    network,
}: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const args: any[] = []
    const box = await deploy("Box", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    if (!developmentChains.includes(network.name)) {
        verify(box.address, args)
    }
    log("Box deployed!")
    log("-".repeat(50))
}

export default deployBox
deployBox.tags = ["all", "box"]
