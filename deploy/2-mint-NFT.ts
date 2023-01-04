import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const mintNft = async ({ getNamedAccounts }: HardhatRuntimeEnvironment) => {
    const { deployer } = await getNamedAccounts()
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()

    await new Promise<void>(async (resolve, reject) => {
        setTimeout(reject, 300000)
        randomIpfsNft.once("NftMinted", () => {
            console.log("Nft Minted!")
            resolve()
        })
        const randomMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
        console.log("Pending NFT request ...")
        await randomMintTx.wait()
        console.log("NFT request sent")
    })

    console.log("Random IPFS NFT index 0 tokenURI : ", await randomIpfsNft.tokenURI(0))
}

export default mintNft
mintNft.tags = ["all", "mint"]
