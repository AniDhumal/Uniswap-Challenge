import { Interface } from "ethers/lib/utils";
import { HandleTransaction, TransactionEvent, ethers } from "forta-agent";
import { createFinding } from "./createFinding";
import {
  createAddress,
  TestTransactionEvent,
} from "forta-agent-tools/lib/tests";
import { SWAP_EVENT } from "./constants";
import { handleTransaction } from "./agent";

describe("Uniswap swap event agent test suite", () => {
  const U3Pool = "0x735a26a57A0A0069dfABd41595A970faF5E1ee8b";
  const handler: HandleTransaction = handleTransaction;
  const Swap_IFACE = new Interface([SWAP_EVENT]);

  it("Should ignore any empty transactions", async () => {
    const tx: TransactionEvent = new TestTransactionEvent();
    const findings = await handler(tx);
    expect(findings).toStrictEqual([]);
  });

  it("Should detect a swap event on a Uniswap Pool v3 contract", async () => {
    const tx: TransactionEvent = new TestTransactionEvent()
      .setTo(createAddress("0xa1"))
      .addInterfaceEventLog(Swap_IFACE.getEvent("Swap"), U3Pool, [
        createAddress("0x1"), //address sender
        createAddress("0x2"), //address recepient
        ethers.BigNumber.from("200000000"), //amount0
        ethers.BigNumber.from("400000000"), //amount1
        25, //sqrtPriceX96
        25, //liquidity
        25, //tick
      ]);
    const findings = await handler(tx);
    expect(findings).toStrictEqual([createFinding()]);
  });
  it("Should not detect a Swap event from a non Uniswap Pool contract", async () => {
    const randomPool = createAddress("0x123");
    const tx: TransactionEvent = new TestTransactionEvent()
      .setTo(createAddress("0xa1"))
      .addInterfaceEventLog(Swap_IFACE.getEvent("Swap"), randomPool, [
        createAddress("0x1"), //address sender
        createAddress("0x2"), //address recepient
        ethers.BigNumber.from("200000000"), //amount0
        ethers.BigNumber.from("400000000"), //amount1
        25, //sqrtPriceX96
        25, //liquidity
        25, //tick
      ]);
    const findings = await handleTransaction(tx);
    expect(findings).toStrictEqual([]);
  });
  it("Should detect multiple swap events", async () => {
    const tx: TransactionEvent = new TestTransactionEvent()
      .setTo(createAddress("0xa1"))
      .addInterfaceEventLog(Swap_IFACE.getEvent("Swap"), U3Pool, [
        createAddress("0x1"), //address sender
        createAddress("0x2"), //address recepient
        ethers.BigNumber.from("200000000"), //amount0
        ethers.BigNumber.from("400000000"), //amount1
        25, //sqrtPriceX96
        25, //liquidity
        25, //tick
      ])
      //2nd swap event
      .addInterfaceEventLog(Swap_IFACE.getEvent("Swap"), U3Pool, [
        createAddress("0x1"), //address sender
        createAddress("0x2"), //address recepient
        ethers.BigNumber.from("200000000"), //amount0
        ethers.BigNumber.from("400000000"), //amount1
        25, //sqrtPriceX96
        25, //liquidity
        25, //tick);
      ]);
    const findings = await handler(tx);
    expect(findings).toStrictEqual([createFinding(), createFinding()]);
  });
  it("Should not detect any other event than Swap", async () => {
    const WRONG_EVENT_IFACE = new Interface([
      "event CollectProtocol(address indexed sender, address indexed recipient, uint128 amount0, uint128 amount1)",
    ]);
    const tx: TransactionEvent =
      new TestTransactionEvent().addInterfaceEventLog(
        WRONG_EVENT_IFACE.getEvent("CollectProtocol"),
        U3Pool,
        [
          createAddress("0x1"), //address sender
          createAddress("0x2"), //address recepient
          ethers.BigNumber.from("200000000"), //amount0
          ethers.BigNumber.from("400000000"), //amount1
        ]
      );
    const findings = await handler(tx);
    expect(findings).toStrictEqual([]);
  });
});
