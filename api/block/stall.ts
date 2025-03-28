import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createApi, retryWithBackoff } from "../../utils";

/**
 * Detects if block production is stalled by checking the latest block's timestamp.
 *
 * @param {VercelRequest} _req - The request object (not used in this function).
 * @param {VercelResponse} res - The response object to send the stall status.
 * @returns Block stall status with time delay details.
 */
export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  try {
    const threshold = Number(
      process.env.BLOCK_PRODUCTION_DELAY_THRESHOLD_IN_SECONDS
    );
    const api = await createApi();

    const { signedBlock } = await retryWithBackoff(async () => {
      const latestBlockHash = await api.rpc.chain.getBlockHash();
      const signedBlock = await api.rpc.chain.getBlock(latestBlockHash);
      return { signedBlock };
    });

    let latestBlockTime: number | null = null;

    for (const extrinsic of signedBlock.block.extrinsics) {
      if (
        extrinsic.method.section === "timestamp" &&
        extrinsic.method.method === "set"
      ) {
        latestBlockTime = Number(extrinsic.method.args[0].toString());
        break;
      }
    }

    if (!latestBlockTime) {
      throw new Error("Failed to decode timestamp from extrinsics.");
    }

    const currentTime = Date.now();
    const delay = Math.max(0, (currentTime - latestBlockTime) / 1000);

    res.status(delay > threshold ? 500 : 200).json({
      status: delay > threshold ? "error" : "ok",
      message:
        delay > threshold
          ? "Block production stalled!"
          : "Block production is healthy",
      latestBlockTime,
      currentTime,
      delay: `${delay}s`,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
}
