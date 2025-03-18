import "dotenv/config";
import { WsProvider, ApiPromise } from "@polkadot/api";

/**
 * Utility function to retry an asynchronous function with exponential backoff.
 *
 * @param {Function} fn - The async function to execute.
 * @param {number} retries - Number of retries.
 * @param {number} delay - Initial delay in milliseconds.
 * @returns {Promise<any>} - The result of the function execution.
 */
export async function retryWithBackoff(
  fn: Function,
  retries: number = 5,
  delay: number = 1000
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error; // If last attempt, throw error
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      ); // Exponential backoff
    }
  }
}

/**
 * Attempts to connect to multiple WebSocket endpoints and returns the first successful connection.
 * @returns {Promise<ApiPromise>} - The API instance from the first successful provider.
 */
export async function createApi(): Promise<ApiPromise> {
  if (!process.env.WSS_RPC_URLS) {
    throw new Error("No WebSocket endpoints specified in WSS_RPC_URLS.");
  }
  const urls = process.env.WSS_RPC_URLS.split(",").map((url) => url.trim());

  const providers = urls.map((url) => {
    return retryWithBackoff(async () => {
      const provider = new WsProvider(url);
      const api = await ApiPromise.create({ provider });
      await api.isReady;
      console.log(`Connected to RPC: ${url}`);
      return api;
    });
  });

  const results = await Promise.allSettled(providers);

  const successfulApi = results.find((result) => result.status === "fulfilled");

  if (!successfulApi) {
    throw new Error("All WebSocket endpoints failed to connect.");
  }

  return successfulApi.value;
}
