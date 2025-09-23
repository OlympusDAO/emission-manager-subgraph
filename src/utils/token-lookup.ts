import { Address } from "@graphprotocol/graph-ts";

import { ERC20 } from "../../generated/EmissionManager/ERC20";
import { Token } from "../../generated/schema";

// OHM token address on mainnet
export const OHM_ADDRESS = Address.fromString("0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5");
// gOHM token address on mainnet
export const GOHM_ADDRESS = Address.fromString("0x0ab87046fBb341D058F17CBC4c1133F25a20a52b");

// Get or create token entity
export function getOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHexString());

  if (token == null) {
    token = new Token(address.toHexString());
    const contract = ERC20.bind(address);

    // Try to get token info
    const nameResult = contract.try_name();
    const symbolResult = contract.try_symbol();
    const decimalsResult = contract.try_decimals();

    token.name = nameResult.reverted ? "Unknown" : nameResult.value;
    token.symbol = symbolResult.reverted ? "UNKNOWN" : symbolResult.value;
    token.decimals = decimalsResult.reverted ? 18 : decimalsResult.value;
    token.address = address;

    token.save();
  }

  return token as Token;
}

// Get OHM token
export function getOHMToken(): Token {
  return getOrCreateToken(OHM_ADDRESS);
}

// Get gOHM token
export function getGOHMToken(): Token {
  return getOrCreateToken(GOHM_ADDRESS);
}
