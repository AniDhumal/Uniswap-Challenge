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
  UNISWAP_FACTORY,
  INITCODE_HASH,
} from "./constants";

let provider: ethers.providers.JsonRpcProvider =
  new ethers.providers.JsonRpcProvider(getJsonRpcUrl());

const getCreate2Address = async (
  factoryAddress: string,
  token0: string,
  token1: string,
  fee: number
) => {
  const abiCoder = new ethers.utils.AbiCoder();
  let salt = ethers.utils.keccak256(
    abiCoder.encode(["address", "address", "uint24"], [token0, token1, fee])
  );
  return ethers.utils.getCreate2Address(factoryAddress, salt, INITCODE_HASH);
};

//function to check if the pool is a uniswap pool
const addressIsUniswap = async (argPoolAddress: string) => {
  //this function will be called when a transaction is being handled and will return true or false based on whether the argument pool address equals to calculated create2 address
  const poolContract = new ethers.Contract(argPoolAddress, POOL_ABI, provider);
  try {
    var tokenA = await poolContract.token0();
    var tokenB = await poolContract.token1();
    var fee = await poolContract.fee();
  } catch (error) {
    return [false, "", ""];
  }
  let poolAddress = await getCreate2Address(
    UNISWAP_FACTORY,
    tokenA,
    tokenB,
    fee
  );
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
