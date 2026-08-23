import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseServerClient } from "@/lib/database-server"

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("userId")
        if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

        const dbClient = await getDatabaseServerClient()

        // 1. Total Automations
        const { count: automationsCount } = await dbClient
            .from("automations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)

        // 2. Active Triggers
        const { count: activeTriggersCount } = await dbClient
            .from("automations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_active", true)

        // 3. Audience Reached (Total Conversations)
        const { count: audienceCount } = await dbClient
            .from("conversations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)

        // 4. Messages Sent (where is_from_instagram is false, implying bot/system sent it)
        const { count: messagesSentCount } = await dbClient
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_from_instagram", false)

        // 5. Recent Activity (Last 5 messages sent by bot)
        const { data: recentMessages } = await dbClient
            .from("messages")
            .select("id, content, created_at, sender_username, conversation_id, recipient:conversations(recipient_username)")
            .eq("user_id", userId)
            .eq("is_from_instagram", false)
            .order("created_at", { ascending: false })
            .limit(5)

        return NextResponse.json({
            metrics: {
                totalAutomations: automationsCount || 0,
                activeTriggers: activeTriggersCount || 0,
                audienceReached: audienceCount || 0,
                messagesSent: messagesSentCount || 0,
            },
            recentActivity: recentMessages || []
        })
    } catch (error) {
        console.error("[v0] Dashboard Stats error:", error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}
