import { network, ethers } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { VRFCoordinatorV2 } from "../typechain-types/@chainlink/contracts/src/v0.8/VRFCoordinatorV2"
import { LinkTokenInterface } from "../typechain-types/@chainlink/contracts/src/v0.8/interfaces"
import { BigNumber } from "ethers"
import { RandomIpfsNft } from "./../typechain-types/contracts"

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30")
let tokenUris = [
    "ipfs://QmQs4yASJakykKzcUYiJoQEFptCuufghNA3S5J2CkD47tp",
    "ipfs://QmXry9jwWVKfbt6V87Gzd97WJ5LGAmtyWY7znSQXCRysv9",
    "ipfs://QmX5V7Xc31vMfM8tYgrNefix1WCFmiMqpLzjDtk6PgTQd2",
]

const deployRandomIPFS = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const networkName = network.name
    const currentConfig = networkConfig[networkName!]

    // get forked VRFCoordinatorV2 & LINK
    const vrfCoordinatorV2Address = currentConfig.vrfCoordinatorV2
    const vrfCoordinatorV2: VRFCoordinatorV2 = await ethers.getContractAt(
        "VRFCoordinatorV2",
        vrfCoordinatorV2Address,
        deployer
    )
    const linkTokenAddress = currentConfig.linkToken
    const linkToken: LinkTokenInterface = await ethers.getContractAt(
        "LinkTokenInterface",
        linkTokenAddress,
        deployer
    )

    // create subscription and get subscriptionId
    log("Current subId in contract : ", (await vrfCoordinatorV2.getCurrentSubId()).toString())
    log("Creating subscription...")
    const tx = await vrfCoordinatorV2.createSubscription()
    const txReceipt = await tx.wait(1)
    const subscriptionId: BigNumber = txReceipt.events![0].args!.subId
    log("Subscription ID : ", subscriptionId.toString())
    log("Current subId in contract : ", (await vrfCoordinatorV2.getCurrentSubId()).toString())
    log("Done")

    // ALREADY got LINK token on goerli - so info will be obtained in fork
    log(
        `Deployer already has ${ethers.utils.formatEther(await linkToken.balanceOf(deployer))} LINK`
    )

    // fund subscription
    log("Funding subscription...")
    const abiEncodedSubId = vrfCoordinatorV2.interface.encodeFunctionResult("createSubscription", [
        subscriptionId,
    ])
    await linkToken.transferAndCall(vrfCoordinatorV2Address, VRF_SUB_FUND_AMOUNT, abiEncodedSubId)
    log("Done")
    log(`Deployer now has ${ethers.utils.formatEther(await linkToken.balanceOf(deployer))} LINK`)
    log("-".repeat(50))

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        currentConfig.gasLane,
        currentConfig.callbackGasLimit,
        tokenUris,
        currentConfig.mintFee,
    ]
    await deploy("RandomIpfsNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: 1,
    })
    log("RandomIpfsNft deployed!")
    const randomIpfsNft: RandomIpfsNft = await ethers.getContract("RandomIpfsNft")
    log("-".repeat(50))
    // add consumer
    log("Adding consumer...")
    vrfCoordinatorV2.addConsumer(subscriptionId.toString(), randomIpfsNft.address)
    log("Done")
    log("-".repeat(50))
    log(await vrfCoordinatorV2.getSubscription(subscriptionId))
    const mintFee = await randomIpfsNft.getMintFee()
    const randomMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
    await randomMintTx.wait()
    log(await vrfCoordinatorV2.getSubscription(subscriptionId))
}

export default deployRandomIPFS
deployRandomIPFS.tags = ["all", "random", "main"]
