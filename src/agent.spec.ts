import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from "forta-agent";

import agent from "./agent";
import { SWAP_EVENT } from "./constants";

describe("Uniswap swap event agent", () => {
  let handleTransaction: HandleTransaction;
  const mockTxEvent = createTransactionEvent({} as any);
  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });
  describe("handleTransaction", () => {
    it("should return empty finding if it isnt a swap event", async () => {
      mockTxEvent.filterLog = jest.fn().mockReturnValue([]);
      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterLog).toHaveBeenCalledWith(SWAP_EVENT);
    });
    it("should return a finding if swap happens from Uniswap V3 pool", async () => {
      const mockSwapTxEvent = {
        args: {
          sender: "0xabc",
          recipient: "0xdef",
          amount0: ethers.BigNumber.from("20000000000"),
          amount1: ethers.BigNumber.from("4000000000"),
        },
        address: "0x735a26a57A0A0069dfABd41595A970faF5E1ee8b",
      };
      mockTxEvent.filterLog = jest.fn().mockReturnValue([mockSwapTxEvent]);
      const findings = await handleTransaction(mockTxEvent);
      const { sender, recipient, amount0, amount1 } = mockSwapTxEvent.args;
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Uniswap Swap",
          description: "Swap in pool " + mockSwapTxEvent.address,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            sender,
            recipient,
            token0: "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8",
            amount0: amount0.toString(),
            token1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            amount1: amount1.toString(),
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterLog).toHaveBeenCalledWith(SWAP_EVENT);
    });
  });
});
