import { mineBlocks } from "../utils/mine-block"

const BLOCKS = 2
const SLEEP_AMOUNT = 1000

async function main() {
    mineBlocks(BLOCKS, SLEEP_AMOUNT)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
