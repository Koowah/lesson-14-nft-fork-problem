import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { networkConfig, developmentChains } from "../../helper-hardhat-config"
import { assert, expect } from "chai"
import { Box } from "../../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit Tests", () => {
          let deployer: string
          let box: Box
          const currentNetwork = networkConfig[network.name]

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              box = await ethers.getContract("Box")
          })
          describe("Constructor", () => {
              it("properly sets all parameters", async () => {
                  assert.equal((await box.retrieve()).toString(), "0")
              })
          })
          describe("Store", () => {
              const newValue = 42
              it("properly sets the input value", async () => {
                  await box.store(newValue)
                  const newValueFromCall = await box.retrieve()
                  assert.equal(newValue.toString(), newValueFromCall.toString())
              })
              it("emits a ValueChanged event with newValue as argument", async () => {
                  await expect(box.store(newValue)).to.emit(box, "ValueChanged").withArgs(newValue)
              })
          })
      })
