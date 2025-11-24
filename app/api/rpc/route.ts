import { type NextRequest, NextResponse } from "next/server"

const RPC_URL = process.env.ZENO_RPC_ENDPOINT || "http://127.0.0.1:8899"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] RPC URL:", RPC_URL)
    console.log("[v0] RPC method:", body.method)
    console.log("[v0] RPC params:", body.params)

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

    console.log("[v0] RPC response status:", response.status)
    console.log("[v0] RPC response ok:", response.ok)

    if (!response.ok) {
      console.log("[v0] RPC response not ok, status text:", response.statusText)
      return NextResponse.json({ error: "RPC call failed" }, { status: 500 })
    }

    const text = await response.text()
    console.log("[v0] RPC raw response:", text.substring(0, 500))

    let data
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.log("[v0] Failed to parse RPC response:", parseError)
      return NextResponse.json({ error: "Invalid RPC response" }, { status: 500 })
    }

    console.log("[v0] RPC parsed result:", data)

    if (data.error) {
      console.log("[v0] RPC returned error:", data.error)
      return NextResponse.json({ error: data.error.message || "RPC call failed" }, { status: 500 })
    }

    return NextResponse.json({ result: data.result })
  } catch (error) {
    console.log("[v0] RPC exception:", error)
    return NextResponse.json({ error: "RPC unavailable" }, { status: 500 })
  }
}
