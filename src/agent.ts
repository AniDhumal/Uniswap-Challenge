import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  ethers,
  getJsonRpcUrl,
} from "forta-agent";
import {
  SWAP_EVENT,
  POOL_ABI,
  FACTORY_ABI,
  UNISWAP_FACTORY,
} from "./constants";

let findingsCount = 0;

let provider: ethers.providers.JsonRpcProvider =
  new ethers.providers.JsonRpcProvider(getJsonRpcUrl());

//function to check if the pool is a uniswap pool
const addressIsUniswap = async (argPoolAddress: string) => {
  //check if address is from a uniswap account by calling the factory getPool account
  //this function will be called when a transaction is being handled and will return true or false based on whether the address is present in the getPool mapping
  const factoryContract = new ethers.Contract(
    UNISWAP_FACTORY,
    FACTORY_ABI,
    provider
  );
  const poolContract = new ethers.Contract(argPoolAddress, POOL_ABI, provider);
  let tokenA = await poolContract.token0();
  let tokenB = await poolContract.token1();
  let fee = await poolContract.fee();
  let poolAddress = await factoryContract.getPool(tokenA, tokenB, fee);
  poolAddress = String(poolAddress).toLowerCase();

  if (poolAddress.toLowerCase() == argPoolAddress.toLowerCase()) {
    return [true, tokenA, tokenB];
  } else return [false, "", ""];
};
const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];
  const uniswapTxEvents = txEvent.filterLog(SWAP_EVENT);
  for (const swapEvent of uniswapTxEvents) {
    const { sender, recipient, amount0, amount1 } = swapEvent.args;
    if (findingsCount >= 5) return findings;
    const [success, tokenA, tokenB] = await addressIsUniswap(swapEvent.address);
    if (success) {
      findings.push(
        Finding.fromObject({
          name: "Uniswap Swap",
          description: "Swap in pool " + swapEvent.address,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            sender,
            recipient,
            token0: tokenA,
            amount0: amount0.toString(),
            token1: tokenB,
            amount1: amount1.toString(),
          },
        })
      );
      findingsCount++;
    }
  }
  return findings;
};
export default {
  handleTransaction,
};
