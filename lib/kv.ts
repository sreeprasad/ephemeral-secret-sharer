import { createClient } from 'redis'


const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redis.on('error', (err) => console.error('Redis Client Error', err))


let isConnected = false
async function ensureConnected() {
    if (!isConnected) {
        await redis.connect()
        isConnected = true
    }
}

export const kv = {
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