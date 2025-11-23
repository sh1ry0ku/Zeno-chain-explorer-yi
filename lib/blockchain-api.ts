const MOCK_DATA = {
  blockHeight: 145789,
  currentEpoch: 342,
  currentSlot: 12456,
  totalSupply: "21.00B",
  circulatingSupply: "8.45B",
  price: 0.010658,
  priceChange: 1.9,
  avgFee: 0.000005,
}

export async function getBlockchainInfo() {
  try {
    // Make RPC calls to get blockchain info
    const [blockCount, blockchainInfo] = await Promise.all([rpcCall("getblockcount"), rpcCall("getblockchaininfo")])

    if (blockCount === null && blockchainInfo === null) {
      return {
        totalSupply: "0.00B",
        circulatingSupply: "0.00B",
        currentEpoch: 0,
        currentSlot: 0,
        blockHeight: 0,
        isHealthy: false,
      }
    }

    return {
      totalSupply: "0.00B",
      circulatingSupply: "0.00B",
      currentEpoch: 0,
      currentSlot: 0,
      blockHeight: blockCount || 0,
      isHealthy: true,
    }
  } catch (error) {
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
  // TODO: Implement transaction fetching
  return []
}

export async function getLatestBlocks(limit = 10) {
  // TODO: Implement block fetching
  return []
}

export async function getPriceInfo() {
  try {
    const networkInfo = await rpcCall("getnetworkinfo")

    if (networkInfo === null) {
      return {
        price: 0,
        priceChange: 0,
        avgFee: 0,
      }
    }

    // You may need to adjust these RPC methods based on your blockchain's API
    // Common methods: getmininginfo, getnetworkinfo, estimatefee
    const [estimatedFee, miningInfo] = await Promise.all([
      rpcCall("estimatefee", [1]).catch(() => null),
      rpcCall("getmininginfo").catch(() => null),
    ])

    return {
      price: networkInfo?.price || 0,
      priceChange: networkInfo?.priceChange || 0,
      avgFee: estimatedFee || 0,
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
  // TODO: Implement search functionality
  return null
}

export async function getValidatorInfo() {
  try {
    // Make RPC calls to get validator info
    const [validatorInfo, stakingInfo] = await Promise.all([
      rpcCall("getvalidatorinfo").catch(() => null),
      rpcCall("getstakinginfo").catch(() => null),
    ])

    if (validatorInfo === null && stakingInfo === null) {
      return {
        totalValidators: 0,
        allActiveHealthy: false,
        totalStaked: "0.00",
        percentOfSupply: 0,
        currentUptime: 0,
        sloMet: false,
        sloTarget: 99.9,
        incidents: 0,
        avgResponse: 0,
        uptimeHistory: [],
      }
    }

    // Parse validator data from RPC response
    // Adjust these fields based on your actual RPC response structure
    return {
      totalValidators: validatorInfo?.total || 0,
      allActiveHealthy: validatorInfo?.allHealthy || false,
      totalStaked: stakingInfo?.totalStaked || "0.00",
      percentOfSupply: stakingInfo?.percentOfSupply || 0,
      currentUptime: validatorInfo?.uptime || 0,
      sloMet: (validatorInfo?.uptime || 0) >= 99.9,
      sloTarget: 99.9,
      incidents: validatorInfo?.incidents || 0,
      avgResponse: validatorInfo?.avgResponseTime || 0,
      uptimeHistory: validatorInfo?.uptimeHistory || [],
    }
  } catch (error) {
    return {
      totalValidators: 0,
      allActiveHealthy: false,
      totalStaked: "0.00",
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
