import { VercelRequest, VercelResponse } from "@vercel/node";
import { ApiPromise, WsProvider } from "@polkadot/api";

const RPC_URL = "wss://zenchain-testnet.api.onfinality.io/public-ws";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const provider = new WsProvider(RPC_URL);
        const api = await ApiPromise.create({ provider });

        const finalizedHeader = await api.rpc.chain.getFinalizedHead();
        const finalizedBlock = await api.rpc.chain.getHeader(finalizedHeader);

        const bestBlock = await api.rpc.chain.getHeader();

        const finalizedBlockNumber = finalizedBlock.number.toNumber();
        const bestBlockNumber = bestBlock.number.toNumber();
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
};
