import 'dotenv/config';
import { VercelRequest, VercelResponse } from "@vercel/node";
import { ApiPromise, WsProvider } from "@polkadot/api";

/**
 * Measures block production speed over a short time window.
 * 
 * @param {VercelRequest} _req - The request object (not used in this function).
 * @param {VercelResponse} res - The response object to send the block speed status.
 * @returns Block production speed in blocks per second.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        const provider = new WsProvider(process.env.WSS_RPC_URL);
        const secondsToWaitBeforeSecondRequest = Number(process.env.BLOCK_SPEED_SECONDS_TO_WAIT_BEFORE_SECOND_REQUEST);
        const api = await ApiPromise.create({ provider });

        const initialBlockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
        const startTime = Date.now();

        await new Promise(resolve => setTimeout(resolve, secondsToWaitBeforeSecondRequest * 1000));

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
