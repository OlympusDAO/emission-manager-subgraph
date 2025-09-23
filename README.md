# EmissionManager Subgraph

This subgraph tracks events and state changes for the OlympusDAO EmissionManager contract located at `0x50f441a3387625bDA8B8081cE3fd6C04CC48C0A2` on Ethereum mainnet.

## Overview

The EmissionManager subgraph monitors all significant events emitted by the EmissionManager contract and maintains both historical event records and current contract state. It provides comprehensive tracking of:

- Contract activations and deactivations
- Backing changes and updates
- Base rate adjustments
- Minimum premium changes
- Bond contract updates
- Sales and vesting period modifications
- Restart timeframe changes

## Entities

### Contract

Immutable entity representing the EmissionManager contract with token relationships. Can fetch all ContractState records via the `states` field.

### ContractState

Mutable entity representing the current state of the contract at a specific block. Can be overwritten within the same block to provide the latest state. Contains derived lists of all events that occurred in that state.

### Event Entities

Immutable entities for each event type, each linked to the ContractState in the same block:

- `Activation` / `Deactivation`
- `BackingChange` / `BackingUpdate`
- `BaseRateChange`
- `MinimumPremiumChange`
- `BondContractsSet`
- `SaleCreated`
- `VestingPeriodChange`
- `RestartTimeframeChange`

## Schema

The schema includes decimal conversions for better readability:

- All monetary values include both raw BigInt and decimal representations
- Backing values: 18 decimals
- OHM supply values: 9 decimals
- Emission rates: 9 decimals
- Premium values: 18 decimals
- Sale amounts: 9 decimals (OHM scale)
- Reserve token values: use token's native decimals

### Entity Relationships

The schema now supports comprehensive relationship querying:

- **Contract → ContractState**: Fetch all historical states of a contract
- **ContractState → Events**: Query all events that occurred in a specific state
- **Event → ContractState**: Each event links to the contract state in that block
- **Bidirectional Navigation**: Seamless traversal between contracts, states, and events

## Deployment

### Prerequisites

- Node.js (v16+)
- Yarn package manager

### Setup

```bash
# Install dependencies
yarn install

# Generate code from schema and ABI
yarn codegen
```

### Build

```bash
# Build the subgraph
yarn build
```

### Development

```bash
# Run linting
yarn lint

# Author and deploy (requires Graph Studio access)
graph auth --studio
graph deploy --studio <subgraph-name>
```

## Event Handlers

The subgraph handles the following events:

### Contract Lifecycle

- `Activated`: Contract activation event
- `Deactivated`: Contract deactivation event

### Financial Parameters

- `BackingChanged`: Updates to the backing value
- `BackingUpdated`: Comprehensive backing updates including supply and reserve changes
- `BaseRateChanged`: Emission rate adjustments
- `MinimumPremiumChanged`: Minimum premium threshold updates

### Operational Changes

- `BondContractsSet`: Updates to bond market contracts
- `SaleCreated`: New bond sales
- `VestingPeriodChanged`: Vesting period modifications
- `RestartTimeframeChanged`: Restart window adjustments

## Decimal Conversions

The subgraph provides utilities for converting between raw blockchain values and human-readable decimals:

- `toBackingDecimal`: Converts raw backing values (18 decimals)
- `toOHMDecimal`: Converts OHM supply values (9 decimals)
- `toEmissionRateDecimal`: Converts emission rates (9 decimals)
- `toPremiumDecimal`: Converts premium values (18 decimals)
- `toReserveDecimal`: Converts reserve token values (variable decimals)

## Query Examples

### Get Current Contract State

```graphql
{
  contractStates(first: 1, orderBy: blockNumber, orderDirection: desc) {
    contract {
      id
      ohmToken {
        symbol
        decimals
      }
      reserveToken {
        symbol
        decimals
      }
    }
    isActive
    baseEmissionRateDecimal
    minimumPremiumDecimal
    backingDecimal
    blockNumber
    blockTimestamp
  }
}
```

### Get Recent Base Rate Changes

```graphql
{
  baseRateChanges(first: 10, orderBy: blockNumber, orderDirection: desc) {
    changeByDecimal
    forNumBeats
    add
    blockNumber
    blockTimestamp
  }
}
```

### Get Backing Updates with Supply Changes

```graphql
{
  backingUpdates(first: 10, orderBy: blockNumber, orderDirection: desc) {
    newBackingDecimal
    supplyAddedDecimal
    reservesAddedDecimal
    blockNumber
    blockTimestamp
  }
}
```

### Get Contract States with Related Events

```graphql
{
  contractStates(first: 5, orderBy: blockNumber, orderDirection: desc) {
    id
    isActive
    baseEmissionRateDecimal
    backingDecimal
    blockNumber
    activations {
      blockTimestamp
    }
    salesCreated {
      marketId
      saleAmountDecimal
    }
    baseRateChanges {
      changeByDecimal
      forNumBeats
    }
  }
}
```

### Get Events for a Specific Contract State

```graphql
{
  contractState(id: "0x50f441a3387625bDA8B8081cE3fd6C04CC48C0A2-21216654") {
    contract {
      id
      ohmToken {
        symbol
      }
    }
    isActive
    activations {
      transactionHash
      blockTimestamp
    }
    backingChanges {
      newBackingDecimal
      blockNumber
    }
    salesCreated {
      marketId
      saleAmountDecimal
      blockTimestamp
    }
  }
}
```

## Architecture

The subgraph follows The Graph Protocol's standard architecture:

- **Mappings**: AssemblyScript handlers that process events
- **Schema**: GraphQL entity definitions
- **Data Sources**: Contract ABIs and event configurations
- **Store**: Entity database for querying

## Development Notes

- All decimal fields are provided in both raw BigInt and converted BigDecimal formats
- Token metadata is fetched from ERC20 contracts where available
- Contract state is updated on every event to ensure fresh data
- Entity IDs use transaction hash + log index for uniqueness
- ContractState uses contract address + block number and can be overwritten within same block

## License

This project is part of the OlympusDAO ecosystem and follows the project's licensing terms.
