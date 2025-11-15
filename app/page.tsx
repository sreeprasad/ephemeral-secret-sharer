'use client'

import { useState } from 'react'
import { generateKey, encryptSecret, exportKey } from '@/lib/encryption'

export default function Home() {
    const [secret, setSecret] = useState('')
    const ttl = 300 // Fixed: 5 minutes
    const [generatedLink, setGeneratedLink] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {

            const key = await generateKey()
            const { ciphertext, iv } = await encryptSecret(secret, key)
            const keyString = await exportKey(key)
            const response = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ciphertext,
                    iv,
                    ttl: parseInt(ttl),
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create secret')
            }

            const { id } = await response.json()
            const link = `${window.location.origin}/view/${id}#${keyString}`
            setGeneratedLink(link)
            setSecret('')
        } catch (error) {
            console.error('Error creating secret:', error)
            alert('Failed to create secret. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink)
        alert('Link copied to clipboard!')
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Ephemeral Secret Sharer
                </h1>
                <p className="text-gray-600 mb-6">
                    Share sensitive information securely. Secrets are encrypted and can only be viewed once.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="secret" className="block text-sm font-medium text-gray-700 mb-2">
                            Your Secret
                        </label>
                        <textarea
                            id="secret"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            placeholder="Enter your secret message here..."
                            className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            required
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <strong>⏱️ Auto-expires in 5 minutes</strong> or after first view
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Generating...' : 'Generate Secure Link'}
                    </button>
                </form>

                {generatedLink && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-2">
                            ✓ Secret link generated!
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={generatedLink}
                                readOnly
                                className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                            >
                                Copy
                            </button>
                        </div>
                        <p className="text-xs text-green-700 mt-2">
                            ⚠️ This link will only work once. After viewing, the secret will be destroyed.
                        </p>
                    </div>
                )}
            </div>
        </main>
    )
}