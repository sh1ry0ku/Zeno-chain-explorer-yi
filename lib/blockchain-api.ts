export async function getBlockchainInfo() {
  try {
    console.log("[v0] Fetching blockchain info from Solana RPC...")

    // Use Solana RPC methods
    const [health, slot, epochInfo, supply] = await Promise.all([
      rpcCall("getHealth"),
      rpcCall("getSlot"),
      rpcCall("getEpochInfo"),
      rpcCall("getSupply").catch(() => null),
    ])

    console.log("[v0] RPC responses:", { health, slot, epochInfo, supply })

    if (slot === null) {
      return {
        totalSupply: "0.00B",
        circulatingSupply: "0.00B",
        currentEpoch: 0,
        currentSlot: 0,
        blockHeight: 0,
        isHealthy: false,
      }
    }

    const totalSupply = supply?.value?.total ? (supply.value.total / 1e9).toFixed(2) + "B" : "0.00B"
    const circulatingSupply = supply?.value?.circulating ? (supply.value.circulating / 1e9).toFixed(2) + "B" : "0.00B"

    return {
      totalSupply,
      circulatingSupply,
      currentEpoch: epochInfo?.epoch || 0,
      currentSlot: epochInfo?.absoluteSlot || slot || 0,
      blockHeight: slot || 0,
      isHealthy: health === "ok",
    }
  } catch (error) {
    console.log("[v0] Error fetching blockchain info:", error)
    return {
      totalSupply: "0.00B",
      circulatingSupply: "0.00B",
      currentEpoch: 0,
      currentSlot: 0,
      blockHeight: 0,
      isHealthy: false,
    }
  }
}

async function rpcCall(method: string, params: any[] = []) {
  try {
    const response = await fetch("/api/rpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method,
        params,
      }),
    })

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    return data.result
  } catch (error) {
    return null
  }
}

export async function getLatestTransactions(limit = 10) {
  try {
    const slot = await rpcCall("getSlot")
    if (!slot) return []

    // Get recent blocks
    const blocks = await Promise.all(
      Array.from({ length: Math.min(limit, 10) }, (_, i) =>
        rpcCall("getBlock", [
          slot - i,
          {
            encoding: "json",
            transactionDetails: "full",
            rewards: false,
          },
        ]).catch(() => null),
      ),
    )

    const transactions: any[] = []
    blocks.forEach((block) => {
      if (block?.transactions) {
        block.transactions.slice(0, limit - transactions.length).forEach((tx: any) => {
          transactions.push({
            signature: tx.transaction?.signatures?.[0] || "Unknown",
            slot: block.parentSlot + 1,
            timestamp: block.blockTime || Date.now() / 1000,
            success: tx.meta?.err === null,
          })
        })
      }
    })

    return transactions.slice(0, limit)
  } catch (error) {
    console.log("[v0] Error fetching transactions:", error)
    return []
  }
}

export async function getLatestBlocks(limit = 10) {
  try {
    const currentSlot = await rpcCall("getSlot")
    if (!currentSlot) return []

    const blocks = await Promise.all(
      Array.from({ length: Math.min(limit, 10) }, (_, i) =>
        rpcCall("getBlock", [
          currentSlot - i,
          {
            encoding: "json",
            transactionDetails: "signatures",
            rewards: false,
          },
        ]).catch(() => null),
      ),
    )

    return blocks
      .filter(Boolean)
      .map((block, i) => ({
        slot: currentSlot - i,
        hash: block?.blockhash || "Unknown",
        timestamp: block?.blockTime || Date.now() / 1000,
        transactions: block?.transactions?.length || 0,
      }))
      .slice(0, limit)
  } catch (error) {
    console.log("[v0] Error fetching blocks:", error)
    return []
  }
}

export async function getPriceInfo() {
  try {
    const [perfSamples, feeStats] = await Promise.all([
      rpcCall("getRecentPerformanceSamples", [1]).catch(() => null),
      rpcCall("getFeeForMessage").catch(() => null),
    ])

    console.log("[v0] Price info:", { perfSamples, feeStats })

    // For now, return zeros until we have a price oracle
    return {
      price: 0,
      priceChange: 0,
      avgFee: feeStats?.value ? feeStats.value / 1e9 : 0,
    }
  } catch (error) {
    return {
      price: 0,
      priceChange: 0,
      avgFee: 0,
    }
  }
}

export async function searchBlockchain(query: string) {
  if (!query || query.trim().length === 0) {
    return null
  }

  const trimmedQuery = query.trim()

  console.log("[v0] Searching for:", trimmedQuery)

  // Try to search as transaction signature (base58 string)
  if (trimmedQuery.length >= 80) {
    try {
      const tx = await rpcCall("getTransaction", [
        trimmedQuery,
        {
          encoding: "json",
          maxSupportedTransactionVersion: 0,
        },
      ])

      if (tx) {
        console.log("[v0] Found transaction:", tx)
        return {
          type: "transaction",
          data: {
            signature: trimmedQuery,
            slot: tx.slot,
            timestamp: tx.blockTime || Date.now() / 1000,
            success: tx.meta?.err === null,
            fee: tx.meta?.fee || 0,
            instructions: tx.transaction?.message?.instructions?.length || 0,
          },
        }
      }
    } catch (error) {
      console.log("[v0] Not a valid transaction")
    }
  }

  // Try to search as block number
  const blockNum = Number.parseInt(trimmedQuery)
  if (!isNaN(blockNum) && blockNum >= 0) {
    try {
      const block = await rpcCall("getBlock", [
        blockNum,
        {
          encoding: "json",
          transactionDetails: "signatures",
          rewards: false,
        },
      ])

      if (block) {
        console.log("[v0] Found block:", block)
        return {
          type: "block",
          data: {
            slot: blockNum,
            hash: block.blockhash,
            timestamp: block.blockTime || Date.now() / 1000,
            transactions: block.transactions?.length || 0,
            parentSlot: block.parentSlot,
          },
        }
      }
    } catch (error) {
      console.log("[v0] Not a valid block number")
    }
  }

  // Try to search as address (public key)
  if (trimmedQuery.length >= 32 && trimmedQuery.length <= 44) {
    try {
      const balance = await rpcCall("getBalance", [trimmedQuery])

      if (balance !== null) {
        console.log("[v0] Found address:", trimmedQuery)
        return {
          type: "address",
          data: {
            address: trimmedQuery,
            balance: balance / 1e9,
          },
        }
      }
    } catch (error) {
      console.log("[v0] Not a valid address")
    }
  }

  console.log("[v0] No results found for query:", trimmedQuery)
  return null
}

export async function getValidatorInfo() {
  try {
    console.log("[v0] Fetching validator info...")

    const [voteAccounts, perfSamples, epochInfo, supply] = await Promise.all([
      rpcCall("getVoteAccounts").catch(() => null),
      rpcCall("getRecentPerformanceSamples", [50]).catch(() => null),
      rpcCall("getEpochInfo").catch(() => null),
      rpcCall("getSupply").catch(() => null),
    ])

    console.log("[v0] Validator info:", { voteAccounts, perfSamples, epochInfo, supply })

    if (!voteAccounts) {
      return {
        totalValidators: 0,
        allActiveHealthy: false,
        totalStaked: 0,
        percentOfSupply: 0,
        currentUptime: 0,
        sloMet: false,
        sloTarget: 99.9,
        incidents: 0,
        avgResponse: 0,
        uptimeHistory: [],
      }
    }

    const totalValidators = (voteAccounts.current?.length || 0) + (voteAccounts.delinquent?.length || 0)
    const activeValidators = voteAccounts.current?.length || 0
    const totalStaked = voteAccounts.current?.reduce((sum: number, v: any) => sum + (v.activatedStake || 0), 0) || 0

    const totalSupply = supply?.value?.total || 0
    const percentOfSupply = totalSupply > 0 ? (totalStaked / totalSupply) * 100 : 0

    // Calculate average response time from performance samples
    const avgSampleTime =
      perfSamples?.length > 0
        ? perfSamples.reduce((sum: number, s: any) => sum + (s.samplePeriodSecs || 0), 0) / perfSamples.length
        : 0

    const uptimeHistory =
      perfSamples
        ?.map((s: any, index: number) => {
          const slotTime = 400 // milliseconds per slot
          const timeAgo = Date.now() - index * s.samplePeriodSecs * 1000
          const uptime = s.numSlots > 0 ? ((s.numSlots - (s.numNonVoteTransactions || 0)) / s.numSlots) * 100 : 100
          return {
            time: timeAgo,
            uptime: Math.max(95, Math.min(100, uptime)), // Clamp between 95-100 for visualization
          }
        })
        .reverse() || []

    const recentUptime =
      uptimeHistory.length > 0
        ? uptimeHistory.reduce((sum, h) => sum + h.uptime, 0) / uptimeHistory.length
        : totalValidators > 0
          ? 100
          : 0

    return {
      totalValidators,
      allActiveHealthy: activeValidators === totalValidators && totalValidators > 0,
      totalStaked: totalStaked / 1e9,
      percentOfSupply,
      currentUptime: recentUptime,
      sloMet: recentUptime >= 99.9,
      sloTarget: 99.9,
      incidents: voteAccounts.delinquent?.length || 0,
      avgResponse: avgSampleTime > 0 ? Math.round(avgSampleTime * 1000) : 0,
      uptimeHistory,
    }
  } catch (error) {
    console.log("[v0] Error fetching validator info:", error)
    return {
      totalValidators: 0,
      allActiveHealthy: false,
      totalStaked: 0,
      percentOfSupply: 0,
      currentUptime: 0,
      sloMet: false,
      sloTarget: 99.9,
      incidents: 0,
      avgResponse: 0,
      uptimeHistory: [],
    }
  }
}
