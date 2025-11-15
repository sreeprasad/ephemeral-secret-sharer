import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const key = `secret:${id}`


        const data = await kv.get(key)

        if (!data) {
            return NextResponse.json(
                { error: 'Secret not found' },
                { status: 404 }
            )
        }


        await kv.del(key)


        let parsedData
        if (typeof data === 'string') {
            parsedData = JSON.parse(data)
        } else {
            parsedData = data
        }

        const { ciphertext, iv } = parsedData

        return NextResponse.json({ ciphertext, iv })
    } catch (error) {
        console.error('Error retrieving secret:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}