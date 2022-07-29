import { Finding, FindingSeverity, FindingType } from "forta-agent";
const U3pool = "0x735a26a57A0A0069dfABd41595A970faF5E1ee8b";
export function createFinding(): Finding {
  return Finding.fromObject({
    name: "Uniswap Swap",
    description: "Swap in pool",
    alertId: "FORTA-1",
    severity: FindingSeverity.Low,
    type: FindingType.Info,
    protocol: "UniswapV3",
    metadata: {
      sender: "0x0000000000000000000000000000000000000001",
      recipient: "0x0000000000000000000000000000000000000002",
      token0: "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8",
      amount0: "200000000",
      token1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      amount1: "400000000",
      poolAddress: U3pool.toLowerCase(),
    },
  });
}
