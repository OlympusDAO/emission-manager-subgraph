import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

// Convert from raw BigInt to BigDecimal considering decimals
export function toDecimal(value: BigInt, decimals: i32): BigDecimal {
  return value.toBigDecimal().div(
    BigInt.fromI32(10)
      .pow(decimals as u8)
      .toBigDecimal()
  );
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

// Convert reserve token values (using token's decimal count)
export function toReserveDecimal(value: BigInt, decimals: i32): BigDecimal {
  return toDecimal(value, decimals);
}
