import { network } from "hardhat"

export function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
}
export async function mineBlocks(amount: number, sleepAmount = 0) {
    console.log(`Mining ${amount}  blocks ...`)
    for (let index = 0; index < amount; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
        if (sleepAmount) {
            await sleep(sleepAmount)
        }
    }
    console.log("Done")
}
