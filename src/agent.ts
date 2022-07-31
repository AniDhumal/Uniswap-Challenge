import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  ethers,
  getJsonRpcUrl,
} from "forta-agent";
import { SWAP_EVENT, POOL_ABI, UNISWAP_FACTORY } from "./constants";
import { getData, getCreate2Address } from "./utils";
import LRUCache from "lru-cache";

let provider: ethers.providers.JsonRpcProvider =
  new ethers.providers.JsonRpcProvider(getJsonRpcUrl());

export const cache: LRUCache<string, string[]> = new LRUCache<string, string[]>(
  {
    max: 10000,
  }
); //maps pool address to tokenA,tokenB,fee

//function to check if the pool is a uniswap pool
const addressIsUniswap = async (argPoolAddress: string) => {
  //this function will be called when a transaction is being handled and will return true or false based on whether the argument pool address equals to calculated create2 address
  const poolContract = new ethers.Contract(argPoolAddress, POOL_ABI, provider);
  try {
    var [tokenA, tokenB, fee] = await getData(poolContract, argPoolAddress);
  } catch (error) {
    return [false, "", ""];
  }
  let poolAddress = getCreate2Address(UNISWAP_FACTORY, tokenA, tokenB, fee);
  if (poolAddress.toLowerCase() == argPoolAddress.toLowerCase()) {
    return [true, tokenA, tokenB];
  } else return [false, "", ""];
};
export const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];
  const uniswapTxEvents = txEvent.filterLog(SWAP_EVENT);
  for (const swapEvent of uniswapTxEvents) {
    const { sender, recipient, amount0, amount1 } = swapEvent.args;
    const [success, tokenA, tokenB] = await addressIsUniswap(swapEvent.address);
    if (success) {
      findings.push(
        Finding.fromObject({
          name: "Uniswap Swap",
          description: "Swap in pool",
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "UniswapV3",
          metadata: {
            sender,
            recipient,
            token0: tokenA,
            amount0: amount0.toString(),
            token1: tokenB,
            amount1: amount1.toString(),
            poolAddress: swapEvent.address,
          },
        })
      );
    }
  }
  return findings;
};
export default {
  handleTransaction,
};
