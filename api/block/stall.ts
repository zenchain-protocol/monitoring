import { VercelRequest, VercelResponse } from "@vercel/node";
import { ApiPromise, WsProvider } from "@polkadot/api";

const RPC_URL = "wss://zenchain-testnet.api.onfinality.io/public-ws";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const provider = new WsProvider(RPC_URL);
        const api = await ApiPromise.create({ provider });

        const latestBlockHash = await api.rpc.chain.getBlockHash();
        const signedBlock = await api.rpc.chain.getBlock(latestBlockHash);

        let latestBlockTime: number | null = null;

        for (const extrinsic of signedBlock.block.extrinsics) {
            if (extrinsic.method.section === "timestamp" && extrinsic.method.method === "set") {
                latestBlockTime = Number(extrinsic.method.args[0].toString());
                break;
            }
        }

        if (!latestBlockTime) {
            throw new Error("Failed to decode timestamp from extrinsics.");
        }

        const currentTime = Date.now();

        let delay = Math.max(0, (currentTime - latestBlockTime) / 1000);
        const threshold = 10;

        res.status(delay > threshold ? 500 : 200).json({
            status: delay > threshold ? "error" : "ok",
            message: delay > threshold ? "Block production stalled!" : "Block production is healthy",
            latestBlockTime,
            currentTime,
            delay: `${delay}s`
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
}
