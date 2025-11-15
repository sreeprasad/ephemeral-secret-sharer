// Check if we're in production (Vercel) or local development
const isProduction = process.env.VERCEL || process.env.KV_REST_API_URL

let kv: any

if (isProduction) {
    // Use Vercel KV in production
    const { kv: vercelKv } = require('@vercel/kv')
    kv = vercelKv
} else {
    // Use local Redis in development
    const { createClient } = require('redis')

    const redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    })

    redis.on('error', (err: any) => console.error('Redis Client Error', err))

    let isConnected = false
    async function ensureConnected() {
        if (!isConnected) {
            await redis.connect()
            isConnected = true
        }
    }

    kv = {
        async setex(key: string, ttl: number, value: string) {
            await ensureConnected()
            return await redis.setEx(key, ttl, value)
        },

        async get(key: string) {
            await ensureConnected()
            return await redis.get(key)
        },

        async del(key: string) {
            await ensureConnected()
            return await redis.del(key)
        }
    }
}

export { kv }