import { Address } from "@graphprotocol/graph-ts";

import { EmissionManager } from "../../generated/EmissionManager/EmissionManager";
import { Contract } from "../../generated/schema";
import { getOrCreateToken } from "./token-lookup";

export function getOrCreateContract(contractAddress: Address): Contract {
  let contract = Contract.load(contractAddress.toHexString());

  if (contract == null) {
    contract = new Contract(contractAddress.toHexString());

    // Read values directly from the contract
    const emissionManager = EmissionManager.bind(contractAddress);

    // Get token addresses from contract
    const ohmTokenAddress = emissionManager.ohm();
    const gohmTokenAddress = emissionManager.gohm();
    const reserveTokenAddress = emissionManager.reserve();
    const sReserveTokenAddress = emissionManager.sReserve();

    // Get or create token entities
    const ohmToken = getOrCreateToken(ohmTokenAddress);
    const gohmToken = getOrCreateToken(gohmTokenAddress);
    const reserveToken = getOrCreateToken(reserveTokenAddress);
    const sReserveToken = getOrCreateToken(sReserveTokenAddress);

    contract.address = contractAddress;
    contract.version = "1.0.0"; // Default version
    contract.majorVersion = 1;
    contract.minorVersion = 0;
    contract.ohmToken = ohmToken.id;
    contract.gohmToken = gohmToken.id;
    contract.reserveToken = reserveToken.id;
    contract.sReserveToken = sReserveToken.id;

    contract.save();
  }

  return contract as Contract;
}
