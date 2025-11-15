import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const key = `secret:${id}`

        console.log('Fetching secret with key:', key) // Debug log


        const data = await kv.get(key)

        console.log('Data found:', data ? 'Yes' : 'No') // Debug log

        if (!data) {
            return NextResponse.json(
                { error: 'Secret not found' },
                { status: 404 }
            )
        }


        await kv.del(key)


        const { ciphertext, iv } = JSON.parse(data)

        return NextResponse.json({ ciphertext, iv })
    } catch (error) {
        console.error('Error retrieving secret:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
