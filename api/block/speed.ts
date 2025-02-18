import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const RPC_URL = "https://zenchain-testnet.api.onfinality.io/public";

async function getCurrentBlockNumber() {
    const response = await axios.post(RPC_URL, {
        jsonrpc: "2.0",
        id: 1,
        method: "chain_getBlock",
        params: []
    });

    return parseInt(response.data.result.block.header.number, 16);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const initialBlockNumber = await getCurrentBlockNumber();
        const startTime = Date.now();

        await new Promise(resolve => setTimeout(resolve, 5000));

        const finalBlockNumber = await getCurrentBlockNumber();
        const endTime = Date.now();

        const timeElapsed = (endTime - startTime) / 1000;
        const blocksProduced = finalBlockNumber - initialBlockNumber;
        const speed = (blocksProduced / timeElapsed).toFixed(2) + " blocks/sec";

        res.status(200).json({
            status: "ok",
            message: "Syncing speed calculated.",
            initialBlock: initialBlockNumber,
            finalBlock: finalBlockNumber,
            speed: speed
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
}
