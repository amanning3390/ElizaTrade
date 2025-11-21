# Treasury Wallet Setup Guide

This guide explains how to configure the treasury wallet for automatic USDC fee collection.

## Overview

All transaction fees collected from users are automatically transferred in USDC to a treasury wallet that only you control. The system supports multiple blockchain networks and includes automatic batch transfers.

## Configuration

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Blockchain Network (mainnet, sepolia, base, optimism, arbitrum)
BLOCKCHAIN_NETWORK=mainnet

# RPC Provider URL (Alchemy, Infura, etc.)
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Your Treasury Wallet Address (where fees will be sent)
TREASURY_WALLET_ADDRESS=0xYourTreasuryWalletAddress

# Private Key for Fee Collection Wallet
# This wallet receives fees from users and transfers them to treasury
# IMPORTANT: Keep this secure! Never commit to git.
FEE_COLLECTION_PRIVATE_KEY=your-private-key-here
```

### 2. Wallet Setup

#### Treasury Wallet
- This is your personal wallet where all fees will be deposited
- You have full control over this wallet
- Recommended: Use a hardware wallet or secure cold storage
- Set `TREASURY_WALLET_ADDRESS` to this wallet's address

#### Fee Collection Wallet
- This is a hot wallet used by the platform to collect fees
- It automatically transfers collected fees to the treasury wallet
- Fund this wallet with enough ETH for gas fees
- Set `FEE_COLLECTION_PRIVATE_KEY` to this wallet's private key
- **Keep this private key secure!**

### 3. Supported Networks

The system supports these networks:

- **Mainnet** (Ethereum) - USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **Base** - USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Optimism** - USDC: `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`
- **Arbitrum** - USDC: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- **Sepolia** (Testnet) - For testing only

### 4. RPC Provider Setup

You need an RPC provider for blockchain interactions:

#### Option 1: Alchemy
1. Sign up at https://www.alchemy.com/
2. Create an app for your network
3. Copy the API key
4. Set `RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY`

#### Option 2: Infura
1. Sign up at https://www.infura.io/
2. Create a project
3. Copy the endpoint URL
4. Set `RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID`

## How It Works

### Automatic Transfer Flow

1. **Fee Collection**: When a trade is executed, a fee is calculated (0.1% of trade value)
2. **Fee Recording**: The fee is recorded in the database with status `collected`
3. **USDC Transfer**: The system automatically transfers USDC from the fee collection wallet to your treasury wallet
4. **Status Update**: The fee record is updated with:
   - Status: `transferred`
   - Transaction hash
   - Transfer timestamp

### Batch Transfers

- A cron job runs every 6 hours to batch transfer any fees that weren't automatically transferred
- Manual batch transfer is available in the Fees page
- Batch transfers are more gas-efficient for multiple small fees

### Transfer Status

Fees can have these statuses:
- `pending` - Fee calculated but not yet collected
- `collected` - Fee collected, ready for transfer
- `transferred` - Successfully transferred to treasury wallet
- `failed` - Transfer failed (can be retried)

## Security Considerations

### Private Key Security

⚠️ **CRITICAL**: The `FEE_COLLECTION_PRIVATE_KEY` must be kept secure:

1. **Never commit to git** - Already in `.gitignore`
2. **Use environment variables** - Never hardcode in source code
3. **Use Vercel Secrets** - For production deployments
4. **Rotate regularly** - Change the private key periodically
5. **Limit funds** - Only keep enough ETH for gas in the fee collection wallet

### Treasury Wallet Security

- Use a hardware wallet for the treasury wallet
- Enable 2FA on any wallet management tools
- Regularly audit treasury wallet balance
- Monitor for unauthorized transfers

### Best Practices

1. **Test on Sepolia first** - Verify everything works on testnet
2. **Start with small amounts** - Test with minimal fees initially
3. **Monitor gas costs** - Ensure fee collection wallet has enough ETH
4. **Set up alerts** - Monitor treasury wallet for deposits
5. **Regular audits** - Verify all fees are being transferred correctly

## Monitoring

### View Transfer Status

1. Go to the **Fees** page in the dashboard
2. View individual fee transfer status
3. Click transaction hash to view on Etherscan
4. Use "Transfer to Treasury" button for manual batch transfers

### Transaction Tracking

All transfers include:
- Transaction hash (clickable link to Etherscan)
- Transfer timestamp
- Status (transferred/failed)
- Fee amount in USDC

## Troubleshooting

### Transfer Failures

If transfers fail:
1. Check fee collection wallet has enough ETH for gas
2. Verify RPC URL is correct and accessible
3. Check treasury wallet address is valid
4. Review error messages in fee metadata
5. Retry failed transfers manually from Fees page

### Gas Issues

- Ensure fee collection wallet has sufficient ETH
- Monitor gas prices and adjust batch transfer frequency if needed
- Consider using Layer 2 networks (Base, Optimism, Arbitrum) for lower gas costs

## Support

For issues or questions:
1. Check transaction status on Etherscan
2. Review application logs
3. Verify environment variables are set correctly
4. Test on Sepolia testnet first

