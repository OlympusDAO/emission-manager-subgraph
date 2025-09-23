import { Address, ethereum } from "@graphprotocol/graph-ts";

import {
  Activated as ActivatedEvent,
  BackingChanged as BackingChangedEvent,
  BackingUpdated as BackingUpdatedEvent,
  BaseRateChanged as BaseRateChangedEvent,
  BondContractsSet as BondContractsSetEvent,
  Deactivated as DeactivatedEvent,
  MinimumPremiumChanged as MinimumPremiumChangedEvent,
  RestartTimeframeChanged as RestartTimeframeChangedEvent,
  SaleCreated as SaleCreatedEvent,
  VestingPeriodChanged as VestingPeriodChangedEvent,
} from "../../generated/EmissionManager/EmissionManager";
import { EmissionManager } from "../../generated/EmissionManager/EmissionManager";
import {
  Activation,
  BackingChange,
  BackingUpdate,
  BaseRateChange,
  BondContractsSet,
  Contract,
  ContractState,
  Deactivation,
  MinimumPremiumChange,
  RestartTimeframeChange,
  SaleCreated,
  VestingPeriodChange,
} from "../../generated/schema";
import { getOrCreateContract } from "../utils/contract-lookup";
import {
  toBackingDecimal,
  toEmissionRateDecimal,
  toOHMDecimal,
  toPremiumDecimal,
  toReserveDecimal,
} from "../utils/decimal-conversion";
import { getOrCreateToken } from "../utils/token-lookup";

// Helper function to update the current state entity and return its ID
function updateContractState(contract: Contract, event: ethereum.Event): string {
  const stateId = contract.address.toHexString().concat("-").concat(event.block.number.toString());
  let contractState = ContractState.load(stateId);

  if (contractState == null) {
    contractState = new ContractState(stateId);
  }

  // Read current state from contract
  const emissionManager = EmissionManager.bind(event.address);

  contractState.contract = contract.id;
  contractState.isActive = emissionManager.isActive();
  contractState.isEnabled = emissionManager.locallyActive();
  contractState.baseEmissionRate = emissionManager.baseEmissionRate();
  contractState.baseEmissionRateDecimal = toEmissionRateDecimal(contractState.baseEmissionRate);
  contractState.minimumPremium = emissionManager.minimumPremium();
  contractState.minimumPremiumDecimal = toPremiumDecimal(contractState.minimumPremium);
  contractState.backing = emissionManager.backing();
  contractState.backingDecimal = toBackingDecimal(contractState.backing);
  contractState.vestingPeriod = emissionManager.vestingPeriod();
  contractState.restartTimeframe = emissionManager.restartTimeframe();
  contractState.shutdownTimestamp = emissionManager.shutdownTimestamp();
  contractState.activeMarketId = emissionManager.activeMarketId();
  contractState.beatCounter = emissionManager.beatCounter();
  contractState.bondAuctioneer = emissionManager.auctioneer();
  contractState.bondTeller = emissionManager.teller();
  contractState.transactionHash = event.transaction.hash;
  contractState.blockNumber = event.block.number;
  contractState.blockTimestamp = event.block.timestamp;

  contractState.save();
  return stateId;
}

export function handleActivated(event: ActivatedEvent): void {
  const contract = getOrCreateContract(event.address);
  const stateId = updateContractState(contract, event);

  const activation = new Activation(event.transaction.hash.concatI32(event.logIndex.toI32()));
  activation.contract = contract.id;
  activation.contractState = stateId;
  activation.blockNumber = event.block.number;
  activation.blockTimestamp = event.block.timestamp;
  activation.transactionHash = event.transaction.hash;
  activation.save();
}

export function handleDeactivated(event: DeactivatedEvent): void {
  const contract = getOrCreateContract(event.address);
  const stateId = updateContractState(contract, event);

  const deactivation = new Deactivation(event.transaction.hash.concatI32(event.logIndex.toI32()));
  deactivation.contract = contract.id;
  deactivation.contractState = stateId;
  deactivation.blockNumber = event.block.number;
  deactivation.blockTimestamp = event.block.timestamp;
  deactivation.transactionHash = event.transaction.hash;
  deactivation.save();
}

export function handleBackingChanged(event: BackingChangedEvent): void {
  const contract = getOrCreateContract(event.address);
  const stateId = updateContractState(contract, event);

  const backingChange = new BackingChange(event.transaction.hash.concatI32(event.logIndex.toI32()));
  backingChange.contract = contract.id;
  backingChange.contractState = stateId;
  backingChange.newBacking = event.params.newBacking;
  backingChange.blockNumber = event.block.number;
  backingChange.blockTimestamp = event.block.timestamp;
  backingChange.transactionHash = event.transaction.hash;
  backingChange.save();
}

export function handleBackingUpdated(event: BackingUpdatedEvent): void {
  const contract = getOrCreateContract(event.address);
  const stateId = updateContractState(contract, event);

  const backingUpdate = new BackingUpdate(event.transaction.hash.concatI32(event.logIndex.toI32()));
  backingUpdate.contract = contract.id;
  backingUpdate.contractState = stateId;
  backingUpdate.newBacking = event.params.newBacking;
  backingUpdate.newBackingDecimal = toBackingDecimal(event.params.newBacking);
  backingUpdate.supplyAdded = event.params.supplyAdded;
  backingUpdate.supplyAddedDecimal = toOHMDecimal(event.params.supplyAdded);
  backingUpdate.reservesAdded = event.params.reservesAdded;
  backingUpdate.reservesAddedDecimal = toReserveDecimal(
    event.params.reservesAdded,
    getOrCreateToken(Address.fromString(contract.reserveToken)).decimals
  );
  backingUpdate.blockNumber = event.block.number;
  backingUpdate.blockTimestamp = event.block.timestamp;
  backingUpdate.transactionHash = event.transaction.hash;
  backingUpdate.save();
}

export function handleBaseRateChanged(event: BaseRateChangedEvent): void {
  const contract = getOrCreateContract(event.address);
  const stateId = updateContractState(contract, event);

  const baseRateChange = new BaseRateChange(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  baseRateChange.contract = contract.id;
  baseRateChange.contractState = stateId;
  baseRateChange.changeBy = event.params.changeBy;
  baseRateChange.changeByDecimal = toEmissionRateDecimal(event.params.changeBy);
  baseRateChange.forNumBeats = event.params.forNumBeats;
  baseRateChange.add = event.params.add;
  baseRateChange.blockNumber = event.block.number;
  baseRateChange.blockTimestamp = event.block.timestamp;
  baseRateChange.transactionHash = event.transaction.hash;
  baseRateChange.save();
}

export function handleMinimumPremiumChanged(event: MinimumPremiumChangedEvent): void {
  const contract = getOrCreateContract(event.address);
  const stateId = updateContractState(contract, event);

  const minimumPremiumChange = new MinimumPremiumChange(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  minimumPremiumChange.contract = contract.id;
  minimumPremiumChange.contractState = stateId;
  minimumPremiumChange.newMinimumPremium = event.params.newMinimumPremium;
  minimumPremiumChange.newMinimumPremiumDecimal = toPremiumDecimal(event.params.newMinimumPremium);
  minimumPremiumChange.blockNumber = event.block.number;
  minimumPremiumChange.blockTimestamp = event.block.timestamp;
  minimumPremiumChange.transactionHash = event.transaction.hash;
  minimumPremiumChange.save();
}

export function handleBondContractsSet(event: BondContractsSetEvent): void {
  const contract = getOrCreateContract(event.address);
  const stateId = updateContractState(contract, event);

  const bondContractsSet = new BondContractsSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  bondContractsSet.contract = contract.id;
  bondContractsSet.contractState = stateId;
  bondContractsSet.auctioneer = event.params.auctioneer;
  bondContractsSet.teller = event.params.teller;
  bondContractsSet.blockNumber = event.block.number;
  bondContractsSet.blockTimestamp = event.block.timestamp;
  bondContractsSet.transactionHash = event.transaction.hash;
  bondContractsSet.save();
}

export function handleSaleCreated(event: SaleCreatedEvent): void {
  const contract = getOrCreateContract(event.address);
  const stateId = updateContractState(contract, event);

  const saleCreated = new SaleCreated(event.transaction.hash.concatI32(event.logIndex.toI32()));
  saleCreated.contract = contract.id;
  saleCreated.contractState = stateId;
  saleCreated.marketId = event.params.marketID;
  saleCreated.saleAmount = event.params.saleAmount;
  saleCreated.saleAmountDecimal = toOHMDecimal(event.params.saleAmount);
  saleCreated.blockNumber = event.block.number;
  saleCreated.blockTimestamp = event.block.timestamp;
  saleCreated.transactionHash = event.transaction.hash;
  saleCreated.save();
}

export function handleVestingPeriodChanged(event: VestingPeriodChangedEvent): void {
  const contract = getOrCreateContract(event.address);
  const stateId = updateContractState(contract, event);

  const vestingPeriodChange = new VestingPeriodChange(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  vestingPeriodChange.contract = contract.id;
  vestingPeriodChange.contractState = stateId;
  vestingPeriodChange.newVestingPeriod = event.params.newVestingPeriod;
  vestingPeriodChange.blockNumber = event.block.number;
  vestingPeriodChange.blockTimestamp = event.block.timestamp;
  vestingPeriodChange.transactionHash = event.transaction.hash;
  vestingPeriodChange.save();
}

export function handleRestartTimeframeChanged(event: RestartTimeframeChangedEvent): void {
  const contract = getOrCreateContract(event.address);
  const stateId = updateContractState(contract, event);

  const restartTimeframeChange = new RestartTimeframeChange(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  restartTimeframeChange.contract = contract.id;
  restartTimeframeChange.contractState = stateId;
  restartTimeframeChange.newRestartTimeframe = event.params.newRestartTimeframe;
  restartTimeframeChange.blockNumber = event.block.number;
  restartTimeframeChange.blockTimestamp = event.block.timestamp;
  restartTimeframeChange.transactionHash = event.transaction.hash;
  restartTimeframeChange.save();
}
