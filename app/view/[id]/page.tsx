'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { decryptSecret, importKey } from '@/lib/encryption'

export default function ViewSecret() {
    const params = useParams()
    const id = params.id as string

    const [secret, setSecret] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [revealed, setRevealed] = useState(false)

    const revealSecret = async () => {
        setLoading(true)
        setError('')

        try {
            const hash = window.location.hash.substring(1)
            if (!hash) {
                throw new Error('Encryption key not found in URL')
            }

            const response = await fetch(`/api/get/${id}`)

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Secret not found or already viewed')
                }
                throw new Error('Failed to retrieve secret')
            }

            const { ciphertext, iv } = await response.json()

            const key = await importKey(hash)
            const decryptedSecret = await decryptSecret(ciphertext, iv, key)

            setSecret(decryptedSecret)  // Remove duplicate
            setRevealed(true)
        } catch (err) {
            console.error('Error revealing secret:', err)
            setSecret('')
            setRevealed(false)
            setError(err instanceof Error ? err.message : 'Failed to reveal secret')  // Remove duplicate
        } finally {
            setLoading(false)
        }
    }

    const copySecret = () => {
        navigator.clipboard.writeText(secret)
        alert('Secret copied to clipboard!')
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    View Secret
                </h1>

                {!revealed && !error && (
                    <>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Warning:</strong> This secret can only be viewed once. After you click the button below, it will be permanently destroyed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={revealSecret}
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Revealing...' : 'Reveal Secret'}
                        </button>
                    </>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-medium">❌ {error}</p>
                        <p className="text-sm text-red-600 mt-2">
                            This secret may have already been viewed or has expired.
                        </p>
                    </div>
                )}

                {revealed && secret && (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-green-800 mb-2">
                                ✓ Secret revealed successfully
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Secret Message
                            </label>
                            <div className="relative">
                <textarea
                    value={secret}
                    readOnly
                    className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none"
                />
                                <button
                                    onClick={copySecret}
                                    className="absolute top-2 right-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                            <p className="text-sm text-red-700">
                                ⚠️ This secret has been destroyed and the link no longer works.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}