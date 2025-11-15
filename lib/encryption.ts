
export async function generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    )
}

export async function encryptSecret(
    secret: string,
    key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
    const encoder = new TextEncoder()
    const data = encoder.encode(secret)

    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encryptedData = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        data
    )

    return {
        ciphertext: arrayBufferToBase64(encryptedData),
        iv: arrayBufferToBase64(iv),
    }
}

export async function decryptSecret(
    ciphertext: string,
    iv: string,
    key: CryptoKey
): Promise<string> {
    const encryptedData = base64ToArrayBuffer(ciphertext)
    const ivArray = base64ToArrayBuffer(iv)

    const decryptedData = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: ivArray,
        },
        key,
        encryptedData
    )

    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
}

export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key)
    return arrayBufferToBase64(exported)
}

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


function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    let bytes: Uint8Array
    if (buffer instanceof ArrayBuffer) {
        bytes = new Uint8Array(buffer)
    } else {
        bytes = buffer
    }

    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
}