import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'  // Changed this line
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
    try {
        const { ciphertext, iv, ttl } = await request.json()

        if (!ciphertext || !iv || !ttl) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }


        if (ciphertext.length > 10240) {
            return NextResponse.json(
                { error: 'Secret too large' },
                { status: 400 }
            )
        }


        const id = nanoid(12)


        await kv.setex(`secret:${id}`, ttl, JSON.stringify({ ciphertext, iv }))

        return NextResponse.json({ id })
    } catch (error) {
        console.error('Error creating secret:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
