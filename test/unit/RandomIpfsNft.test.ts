const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { networkConfig, developmentChains } = require("../../hardhat-helper-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft Unit Tests", function () {
          let deployer
          let randomIpfsNft
          let vrfCoordinatorV2
          let requestId
          const chainId = network.config.chainId
          const currentNetwork = networkConfig[chainId]
          const { gasLane, callbackGasLimit, mintFee } = currentNetwork

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["mocks", "random"])
              randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
              vrfCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              const tx = await randomIpfsNft.requestNft({ value: mintFee })
              const txReceipt = await tx.wait(1)
              requestId = txReceipt.events[1].args.requestId
          })

          describe("Constructor", () => {
              it("properly sets all parameters", async () => {
                  const gasLaneFromCall = await randomIpfsNft.getGasLane()
                  const callbackGasLimitFromCall = await randomIpfsNft.getCallbackGasLimit()
                  const mintFeeFromCall = await randomIpfsNft.getMintFee()
                  const vrfAddressFromCall = await randomIpfsNft.getVRFCoordinatorV2Address()
                  assert.equal(gasLaneFromCall.toString(), gasLane.toString())
                  assert.equal(callbackGasLimitFromCall.toString(), callbackGasLimit.toString())
                  assert.equal(mintFeeFromCall.toString(), mintFee.toString())
                  assert.equal(vrfAddressFromCall, vrfCoordinatorV2.address)
              })
          })

          describe("RequestNft", () => {
              let userContract
              beforeEach(async () => {
                  const user = (await getNamedAccounts()).user
                  const userSigner = await ethers.getSigner(user)
                  userContract = await randomIpfsNft.connect(userSigner)
              })
              it("reverts with proper error if ETH sent bellow mint fee", async () => {
                  await expect(
                      userContract.requestNft({ value: mintFee.div(2) })
                  ).to.be.revertedWithCustomError(randomIpfsNft, "RandomIpfsNft__InsufficientFunds")
              })
              it("adds msg.sender to the requestIdToSender mapping", async () => {
                  const mappedAddress = await randomIpfsNft.requestIdToSender(requestId)
                  assert.equal(mappedAddress, deployer)
              })
              it("emits an NftRequested event", async () => {
                  await expect(randomIpfsNft.requestNft({ value: mintFee })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  )
              })
          })

          /**
           * fulfillRandomWords should use a promise with a listener on NftMinted event during staging
           * because the VRFCoordinatorV2 call isn't in our control ! We have to wait for it and make sure
           * we do not miss it
           */
          describe("fulfillRandomWords", () => {
              let initialBalance
              let tx
              beforeEach(async () => {
                  initialBalance = await randomIpfsNft.balanceOf(deployer)
                  tx = await vrfCoordinatorV2.fulfillRandomWords(requestId, randomIpfsNft.address)
              })
              it("increments the token counter", async () => {
                  const counterFromCall = await randomIpfsNft.getTokenCounter()
                  assert.equal(counterFromCall, 1)
              })
              it("mints a random nft to owner", async () => {
                  const ownerBalance = await randomIpfsNft.balanceOf(deployer)
                  assert.equal(initialBalance, 0)
                  assert.notEqual(ownerBalance, 0)
              })
              it("assigns proper URI to minted nft", async () => {
                  const tokenUris = [
                      "ipfs://QmQs4yASJakykKzcUYiJoQEFptCuufghNA3S5J2CkD47tp",
                      "ipfs://QmXry9jwWVKfbt6V87Gzd97WJ5LGAmtyWY7znSQXCRysv9",
                      "ipfs://QmX5V7Xc31vMfM8tYgrNefix1WCFmiMqpLzjDtk6PgTQd2",
                  ]
                  const tokenId = (await randomIpfsNft.getTokenCounter()) - 1
                  const tokenUri = await randomIpfsNft.tokenURI(tokenId)
                  await expect(tokenUri).to.be.oneOf(tokenUris)
              })
              it("emits an NftEmitted event", async () => {
                  await expect(tx).to.emit(randomIpfsNft, "NftMinted")
              })
          })

          describe("Withdraw", () => {
              let initialBalance
              let userContract
              let txReceipt
              beforeEach(async () => {
                  const user = (await getNamedAccounts()).user
                  const userSigner = await ethers.getSigner(user)
                  userContract = await randomIpfsNft.connect(userSigner)
                  await userContract.requestNft({ value: mintFee })

                  initialBalance = await ethers.provider.getBalance(deployer)
                  const tx = await randomIpfsNft.withdraw()
                  txReceipt = await tx.wait(1)
              })
              it("should send funds to the owner ONLY", async () => {
                  const endBalance = await ethers.provider.getBalance(deployer)
                  const gasPrice = txReceipt.effectiveGasPrice.mul(txReceipt.gasUsed)
                  await expect(userContract.withdraw()).to.be.reverted
                  assert.equal(
                      endBalance.add(gasPrice).toString(),
                      initialBalance.add(mintFee.mul(2)).toString()
                  )
              })
          })
      })
