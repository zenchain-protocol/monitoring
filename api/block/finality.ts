import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createApi, retryWithBackoff } from "../../utils";

/**
 * Checks if block finality is lagging beyond a defined threshold.
 *
 * @param {VercelRequest} _req - The request object (not used in this function).
 * @param {VercelResponse} res - The response object to send the finality status.
 * @returns Finality status with block details.
 */
export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  try {
    const THRESHOLD = Number(
      process.env.BLOCK_FINALITY_LAG_THRESHOLD_IN_BLOCKS
    );
    const api = await createApi();

    const { finalizedBlockNumber, bestBlockNumber } = await retryWithBackoff(
      async () => {
        const finalizedHeader = await api.rpc.chain.getFinalizedHead();
        const finalizedBlock = await api.rpc.chain.getHeader(finalizedHeader);
        const bestBlock = await api.rpc.chain.getHeader();

        return {
          finalizedBlockNumber: finalizedBlock.number.toNumber(),
          bestBlockNumber: bestBlock.number.toNumber(),
        };
      }
    );

    const lag = bestBlockNumber - finalizedBlockNumber;

    res.status(lag > THRESHOLD ? 500 : 200).json({
      status: lag > THRESHOLD ? "error" : "ok",
      message: lag > THRESHOLD ? "Finality is stalled!" : "Finality is healthy",
      finalizedBlock: finalizedBlockNumber,
      bestBlock: bestBlockNumber,
      lag: lag,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
}
