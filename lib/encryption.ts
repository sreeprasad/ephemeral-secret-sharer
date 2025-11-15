/**
 * Client-side encryption utilities using Web Crypto API
 * AES-256-GCM encryption for secure secret sharing
 */

/**
 * Generates a new AES-GCM encryption key
 */
export async function generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true, // extractable
        ['encrypt', 'decrypt']
    )
}

/**
 * Encrypts a secret message using AES-GCM
 */
export async function encryptSecret(
    secret: string,
    key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
    // Generate a random initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Convert secret to ArrayBuffer
    const encoder = new TextEncoder()
    const data = encoder.encode(secret)

    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        data
    )

    // Convert to base64 for transmission
    return {
        ciphertext: arrayBufferToBase64(encryptedData),
        iv: arrayBufferToBase64(iv.buffer),
    }
}

/**
 * Exports a CryptoKey to a base64 string for URL inclusion
 */
export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key)
    return arrayBufferToBase64(exported)
}

/**
 * Imports a key from a base64 string
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
    const keyData = base64ToArrayBuffer(keyString)
    return await crypto.subtle.importKey(
        'raw',
        keyData,
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    )
}

/**
 * Decrypts a secret message using AES-GCM
 */
export async function decryptSecret(
    ciphertext: string,
    iv: string,
    key: CryptoKey
): Promise<string> {
    const encryptedData = base64ToArrayBuffer(ciphertext)
    const ivData = base64ToArrayBuffer(iv)

    const decryptedData = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: ivData,
        },
        key,
        encryptedData
    )

    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
}

/**
 * Helper: Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

/**
 * Helper: Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
}
