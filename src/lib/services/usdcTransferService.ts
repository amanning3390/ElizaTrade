import { createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, sepolia, base, optimism, arbitrum } from 'viem/chains';
import type { Chain } from 'viem';
import { db } from '@/lib/db';
import { transactionFees } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// USDC contract addresses on different chains
const USDC_CONTRACTS: Record<string, `0x${string}`> = {
  mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Testnet USDC
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
};

// ERC20 ABI for transfer function
const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

export interface TransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Get the chain configuration based on environment
 */
function getChain(): Chain {
  const chainName = process.env.BLOCKCHAIN_NETWORK || 'mainnet';
  const chains: Record<string, Chain> = {
    mainnet,
    sepolia,
    base,
    optimism,
    arbitrum,
  };
  return chains[chainName] || mainnet;
}

/**
 * Get treasury wallet address from environment
 */
export function getTreasuryWallet(): `0x${string}` {
  const wallet = process.env.TREASURY_WALLET_ADDRESS;
  if (!wallet) {
    throw new Error('TREASURY_WALLET_ADDRESS environment variable is required');
  }
  if (!wallet.startsWith('0x')) {
    throw new Error('TREASURY_WALLET_ADDRESS must be a valid Ethereum address');
  }
  return wallet as `0x${string}`;
}

/**
 * Get the private key for the fee collection wallet
 */
function getFeeCollectionPrivateKey(): `0x${string}` {
  const privateKey = process.env.FEE_COLLECTION_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('FEE_COLLECTION_PRIVATE_KEY environment variable is required');
  }
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}` as `0x${string}`;
  }
  return privateKey as `0x${string}`;
}

/**
 * Get USDC contract address for the current chain
 */
function getUSDCContract(): `0x${string}` {
  const chainName = process.env.BLOCKCHAIN_NETWORK || 'mainnet';
  const contract = USDC_CONTRACTS[chainName];
  if (!contract) {
    throw new Error(`USDC contract not configured for chain: ${chainName}`);
  }
  return contract;
}

/**
 * Transfer USDC to treasury wallet
 */
export async function transferUSDCToTreasury(
  amountUSD: number,
  feeId: string
): Promise<TransferResult> {
  try {
    const chain = getChain();
    const treasuryWallet = getTreasuryWallet();
    const usdcContract = getUSDCContract();
    const privateKey = getFeeCollectionPrivateKey();

    // Create wallet client
    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({
      account,
      chain,
      transport: http(process.env.RPC_URL || undefined),
    });

    // USDC has 6 decimals
    const amountInWei = parseUnits(amountUSD.toFixed(6), 6);

    // Transfer USDC
    const hash = await client.writeContract({
      address: usdcContract,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [treasuryWallet, amountInWei],
    });

    // Wait for transaction confirmation
    const receipt = await client.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      // Update fee record with transfer info
      await db
        .update(transactionFees)
        .set({
          status: 'transferred',
          transferredAt: new Date(),
          transferTxHash: hash,
        })
        .where(eq(transactionFees.id, feeId));

      return {
        success: true,
        txHash: hash,
      };
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    console.error('Error transferring USDC:', error);

    // Update fee record with error
    await db
      .update(transactionFees)
      .set({
        status: 'failed',
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        } as any,
      })
      .where(eq(transactionFees.id, feeId));

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Batch transfer multiple fees to treasury
 * This is more gas-efficient for multiple small transfers
 */
export async function batchTransferUSDCToTreasury(
  fees: Array<{ id: string; amountUSD: number }>
): Promise<TransferResult[]> {
  const results: TransferResult[] = [];

  // For now, transfer individually
  // In production, you might want to batch these into a single transaction
  for (const fee of fees) {
    const result = await transferUSDCToTreasury(fee.amountUSD, fee.id);
    results.push(result);
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Get USDC balance of the fee collection wallet
 */
export async function getFeeCollectionBalance(): Promise<number> {
  try {
    const chain = getChain();
    const usdcContract = getUSDCContract();
    const privateKey = getFeeCollectionPrivateKey();

    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({
      account,
      chain,
      transport: http(process.env.RPC_URL || undefined),
    });

    // Read USDC balance
    const balance = await client.readContract({
      address: usdcContract,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });

    // In a real implementation, you'd read the balance here
    // For now, return 0 as placeholder
    return 0;
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
}

