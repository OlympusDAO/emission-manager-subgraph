# EmissionManager Subgraph Development Guide

## Overview

This subgraph tracks the OlympusDAO EmissionManager contract (0x50f441a3387625bDA8B8081cE3fd6C04CC48C0A2) and its emissions-related events. The subgraph provides comprehensive tracking of emission parameters, backing prices, bond market creation, and contract state changes.

## Key Features

- Tracks all major EmissionManager events
- Maintains current state of emission parameters
- Historical tracking of configuration changes
- Token metadata and decimal conversion utilities
- Consistent with existing OlympusDAO subgraph patterns
- Comprehensive decimal conversion system with proper token metadata handling

## Development Approach

### Project Structure

```text
emissionmanager-subgraph/
├── src/
│   ├── handlers/
│   │   └── emission-manager-handlers.ts    # Event handlers
│   └── utils/
│       ├── decimal-conversion.ts            # Decimal conversion utilities
│       ├── token-lookup.ts                  # Token metadata management
│       └── contract-lookup.ts               # Contract state management
├── abis/
│   ├── EmissionManager.json                 # EmissionManager contract ABI
│   └── ERC20.json                           # ERC20 token ABI
├── generated/                               # Auto-generated code (do not edit)
├── schema.graphql                           # Data model
├── subgraph.yaml                            # Subgraph configuration
└── package.json                             # Dependencies and scripts
```

### Key Entities

- **Contract**: Main EmissionManager contract state with token relationships
- **Token**: Token metadata including OHM, gOHM, reserve, and sReserve tokens
- **ContractState**: Mutable contract state that can be overwritten within same block
- Event entities: Activation, Deactivation, BackingChange, BackingUpdate, etc.

### Events Tracked

- `Activated` / `Deactivated` - Contract lifecycle
- `BackingChanged` / `BackingUpdated` - OHM backing price
- `BaseRateChanged` - Emission rate adjustments
- `MinimumPremiumChanged` - Premium threshold updates
- `BondContractsSet` - Contract configuration
- `SaleCreated` - Bond market creation
- `VestingPeriodChanged` - Vesting parameter updates
- `RestartTimeframeChanged` - Restart timeframe changes

## Development Commands

### Setup

```bash
# Install dependencies
yarn install

# Copy .env.example to .env and configure
cp .env.example .env
```

### Development

```bash
# Generate types from schema
yarn codegen

# Build the subgraph
yarn build

# Run tests
yarn test

# Lint code
yarn lint
```

### Important: Linting and Building

**Always run linting and building after making any changes to ensure code quality and compatibility:**

```bash
# After any code changes, run linting first
yarn lint

# Then build to verify everything compiles correctly
yarn build

# Generate code if schema changes were made
yarn codegen
```

This ensures that:

- Code follows project standards and formatting
- All TypeScript types are correctly generated
- The subgraph can be successfully compiled
- Changes don't introduce any syntax or compilation errors

### Deployment

```bash
# Create local subgraph
yarn create-local

# Deploy to local node
yarn deploy-local

# Deploy to Graph Studio (requires .env configuration)
yarn deploy
```

## Important Notes

### Token Addresses

- OHM: 0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5
- gOHM: 0x0ab87046fBb341D058F17CBC4c1133F25a20a52b

### Decimal Conversions

- OHM uses 9 decimals
- gOHM uses 18 decimals
- Reserve tokens may use different decimals
- Use decimal-conversion.ts utilities for proper handling
- Key utility functions:
  - `toDecimal(value, decimals)` - Generic conversion
  - `toBackingDecimal(value)` - 18 decimals
  - `toOHMDecimal(value)` - 9 decimals
  - `toEmissionRateDecimal(value)` - 9 decimals
  - `toPremiumDecimal(value)` - 18 decimals
  - `toReserveDecimal(value, decimals)` - Dynamic based on token decimals

### Contract Start Block

The subgraph starts at block 21,216,654, which is when the EmissionManager contract was deployed.

### Error Handling

The subgraph includes error handling for contract state reads to prevent crashes if view functions fail.

## Testing

Use matchstick-as for testing event handlers. Create test files in a `tests/` directory following the pattern:

```text
tests/
├── emission-manager-handlers.test.ts
└── utils/
    ├── decimal-conversion.test.ts
    └── token-lookup.test.ts
```

## Deployment Considerations

- Update startBlock if contract was deployed earlier
- Consider adding additional data sources if needed
- Monitor indexing performance and adjust pruning settings if needed
- Update .subgraph-version for each deployment

## Maintenance

- Regularly update Graph Protocol dependencies
- Monitor contract upgrades and update ABI if needed
- Add new event handlers if contract is upgraded
- Review and optimize queries periodically
- Use yarn in this repo

## Recent Development Session (2025-09-23)

### Completed Tasks

1. **Code Cleanup**: Removed unused code from decimal-conversion.ts and optimized imports
2. **Schema Validation**: Ensured all required fields have proper value assignments
3. **Documentation**: Created comprehensive README.md with setup instructions and query examples
4. **Schema Enhancement**: Added bidirectional relationships between Contract, ContractState, and Event entities
5. **Event Linking**: Linked all events to ContractState and added event lists to ContractState
6. **Decimal Fix**: Corrected saleAmount decimal conversion to use OHM's 9 decimals instead of reserve token decimals

### Key Improvements

- Fixed missing required decimal fields in BackingUpdate and SaleCreated entities
- Enhanced decimal conversion utilities with proper token metadata handling
- Improved code organization and removed unused dependencies
- Added comprehensive documentation for developers
- **Schema Relationships**:
  - Contract entity can now fetch all ContractState records via `states` field
  - Each event is linked to the ContractState in the same block via `contractState` field
  - ContractState entity has derived lists of all event types (activations, deactivations, etc.)
- **Decimal Accuracy**: Fixed SaleCreated.saleAmount to properly use OHM's 9 decimal places instead of reserve token decimals

### Build Validation

All changes have been validated through the build process:
```bash
yarn codegen && yarn build && yarn lint
```

The subgraph is now in a clean, production-ready state with complete documentation and enhanced relationship querying capabilities.
