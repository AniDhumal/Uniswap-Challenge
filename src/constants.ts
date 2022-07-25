export const UNISWAP_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
export const FACTORY_ABI = 
[
    "function getPool(address,address,uint24) external view returns(address)"
]
export const POOL_ABI=[
  "function token0() public view returns(address)",
  "function token1() public view returns(address)",
  "function fee() public view returns(uint24)",
];
export const SWAP_EVENT="event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)";
