import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const RPC_URL = "https://zenchain-testnet.api.onfinality.io/public";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const response = await axios.post(RPC_URL, {
            jsonrpc: "2.0",
            id: 1,
            method: "chain_getBlock",
            params: []
        });

        const block = response.data.result.block;
        const timestampExtrinsic = block.extrinsics.find((ext: any) => ext.method === "timestamp.set");

        if (!timestampExtrinsic) {
            throw new Error("Timestamp not found in block.");
        }

        const latestBlockTime = parseInt(timestampExtrinsic.args[0]);
        const currentTime = Date.now();

        const delay = (currentTime - latestBlockTime) / 1000;
        const threshold = 10;

        res.status(delay > threshold ? 500 : 200).json({
            status: delay > threshold ? "error" : "ok",
            message: delay > threshold ? "Block production stalled!" : "Block production is healthy",
            delay: `${delay}s`
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
}
