import 'dotenv/config';
import { VercelRequest, VercelResponse } from "@vercel/node";
import { ApiPromise, WsProvider } from "@polkadot/api";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        const provider = new WsProvider(process.env.WSS_RPC_URL);
        const api = await ApiPromise.create({ provider });

        const initialBlockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
        const startTime = Date.now();

        await new Promise(resolve => setTimeout(resolve, 5000));

        const finalBlockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
        const endTime = Date.now();

        const timeElapsed = (endTime - startTime) / 1000;
        const blocksProduced = finalBlockNumber - initialBlockNumber;
        const speed = (blocksProduced / timeElapsed);

        res.status(speed <= 0 ? 500 : 200).json({
            status: speed <= 0 ? "error" : "ok",
            message: speed <= 0 ? "Block production is stalled!" : "Block production is healthy",
            initialBlock: initialBlockNumber,
            finalBlock: finalBlockNumber,
            speed: speed.toFixed(2) + " blocks/sec"
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
