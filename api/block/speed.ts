import { VercelRequest, VercelResponse } from "@vercel/node";
import { ApiPromise, WsProvider } from "@polkadot/api";

const RPC_URL = "wss://zenchain-testnet.api.onfinality.io/public-ws";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const provider = new WsProvider(RPC_URL);
        const api = await ApiPromise.create({ provider });

        const initialBlockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
        const startTime = Date.now();

        await new Promise(resolve => setTimeout(resolve, 5000));

        const finalBlockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
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
};
