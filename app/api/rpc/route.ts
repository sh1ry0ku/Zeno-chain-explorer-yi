import { type NextRequest, NextResponse } from "next/server"

const RPC_URL = process.env.ZENO_RPC_ENDPOINT || "http://127.0.0.1:8899"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: body.id || 1,
        method: body.method,
        params: body.params || [],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "RPC call failed" }, { status: 500 })
    }

    const text = await response.text()

    let data
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid RPC response" }, { status: 500 })
    }

    if (data.error) {
      return NextResponse.json({ error: data.error.message || "RPC call failed" }, { status: 500 })
    }

    return NextResponse.json({ result: data.result })
  } catch (error) {
    return NextResponse.json({ error: "RPC unavailable" }, { status: 500 })
  }
}
