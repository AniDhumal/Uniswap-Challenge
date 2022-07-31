import { ethers } from "forta-agent";
import { INITCODE_HASH } from "./constants";
import { cache } from "./agent";

export async function getData(
  poolContract: ethers.Contract,
  argPoolAddress: string
) {
  if (cache.has(argPoolAddress)) {
    const tokenA = cache.get(argPoolAddress)[0];
    const tokenB = cache.get(argPoolAddress)[1];
    const fee = cache.get(argPoolAddress)[2];
    return [tokenA, tokenB, fee];
  } else {
    const tokenA = await poolContract.token0();
    const tokenB = await poolContract.token1();
    const fee = await poolContract.fee();
    cache.set(argPoolAddress, [tokenA, tokenB, fee]);
    return [tokenA, tokenB, fee];
  }
}
export function getCreate2Address(
  factoryAddress: string,
  token0: string,
  token1: string,
  fee: number
) {
  const abiCoder = new ethers.utils.AbiCoder();
  let salt = ethers.utils.keccak256(
    abiCoder.encode(["address", "address", "uint24"], [token0, token1, fee])
  );
  return ethers.utils.getCreate2Address(factoryAddress, salt, INITCODE_HASH);
}
