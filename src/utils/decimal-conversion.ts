import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

import { getOrCreateToken } from "./token-lookup";

// Convert from raw BigInt to BigDecimal considering decimals
export function toDecimal(value: BigInt, decimals: i32): BigDecimal {
  return value.toBigDecimal().div(
    BigInt.fromI32(10)
      .pow(decimals as u8)
      .toBigDecimal()
  );
}

// Convert from BigDecimal to raw BigInt considering decimals
export function fromDecimal(value: BigDecimal, decimals: i32): BigInt {
  return value
    .times(
      BigInt.fromI32(10)
        .pow(decimals as u8)
        .toBigDecimal()
    )
    .truncate(0)
    .toBigInt();
}

// Convert percentage basis points to decimal (e.g., 1e18 = 100%)
export function fromBasisPoints(value: BigInt): BigDecimal {
  return value.toBigDecimal().div(BigDecimal.fromString("1e18"));
}

// Convert decimal to percentage basis points (e.g., 100% = 1e18)
export function toBasisPoints(value: BigDecimal): BigInt {
  return value.times(BigDecimal.fromString("1e18")).truncate(0).toBigInt();
}

// Convert backing value (18 decimals)
export function toBackingDecimal(value: BigInt): BigDecimal {
  return toDecimal(value, 18);
}

// Convert OHM supply values (9 decimals)
export function toOHMDecimal(value: BigInt): BigDecimal {
  return toDecimal(value, 9);
}

// Convert emission rate values (9 decimals for OHM scale)
export function toEmissionRateDecimal(value: BigInt): BigDecimal {
  return toDecimal(value, 9);
}

// Convert premium values (18 decimals)
export function toPremiumDecimal(value: BigInt): BigDecimal {
  return toDecimal(value, 18);
}

// Convert reserve token values (looks up token decimals)
export function toReserveDecimal(value: BigInt, tokenAddress: string): BigDecimal {
  const token = getOrCreateToken(Address.fromString(tokenAddress));
  return toDecimal(value, token.decimals);
}
