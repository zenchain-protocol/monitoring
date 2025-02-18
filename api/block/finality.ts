import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const RPC_URL = "https://zenchain-testnet.api.onfinality.io/public";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const finalizedResponse = await axios.post(RPC_URL, {
            jsonrpc: "2.0",
            id: 1,
            method: "chain_getFinalizedHead",
            params: []
        });

        const finalizedHash = finalizedResponse.data.result;

        const finalizedBlockResponse = await axios.post(RPC_URL, {
            jsonrpc: "2.0",
            id: 1,
            method: "chain_getBlock",
            params: [finalizedHash]
        });

        const finalizedBlockNumber = parseInt(finalizedBlockResponse.data.result.block.header.number, 16);

        const bestBlockResponse = await axios.post(RPC_URL, {
            jsonrpc: "2.0",
            id: 1,
            method: "chain_getBlock",
            params: []
        });

        const bestBlockNumber = parseInt(bestBlockResponse.data.result.block.header.number, 16);

        const lag = bestBlockNumber - finalizedBlockNumber;
        const threshold = 100;

        res.status(lag > threshold ? 500 : 200).json({
            status: lag > threshold ? "error" : "ok",
            message: lag > threshold ? "Finality is stalled!" : "Finality is healthy",
            finalizedBlock: finalizedBlockNumber,
            bestBlock: bestBlockNumber,
            lag: lag
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
}
