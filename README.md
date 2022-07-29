# Uniswap Swap event Agent

## Description

This Bot detects a swap from Uniswap pools

## Supported Chains

- Ethereum

## Alerts

Describe each of the type of alerts fired by this agent

- FORTA-1
  - Fired when a swap is detected from a Uniswap Pool
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata:
    - `recipient`:Adress of the recipient
    - `token0`: Address of token swapped from
    - `amount0`: Amount of token0 swapped
    - `token1`: Address of token swapped to,
    - `amount1`: Amount of token1 swapped,
    - `poolAddress`: Address of the Uniswap pool where swap event was detected

## Test Data

The agent behaviour can be verified with the following transactions:
0xf0245dbcf59e294ac7d8234a5320b84ace280340f29f25aad372aadf6ef406b7
