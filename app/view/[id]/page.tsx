'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { decryptSecret, importKey } from '@/lib/encryption'
import { ThemeToggle } from '@/components/theme-toggle'
import { Eye, AlertTriangle, CheckCircle, XCircle, Trash2, Copy, Check } from 'lucide-react'

export default function ViewSecret() {
    const params = useParams()
    const id = params.id as string

    const [secret, setSecret] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [revealed, setRevealed] = useState(false)
    const [copied, setCopied] = useState(false)

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

            setSecret(decryptedSecret)
            setRevealed(true)
        } catch (err) {
            console.error('Error revealing secret:', err)
            setError(err instanceof Error ? err.message : 'Failed to reveal secret')
        } finally {
            setLoading(false)
        }
    }

    const copySecret = () => {
        navigator.clipboard.writeText(secret)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <header className="border-b border-border/40">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground text-background">
                            <Eye className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-lg">SecretShare</span>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-2xl mx-auto">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                            <Eye className="w-8 h-8 text-foreground" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">
                            View Secret
                        </h1>
                        <p className="text-muted-foreground">
                            Encrypted message waiting to be revealed
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8">
                            {!revealed && !error && (
                                <>
                                    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 mb-6">
                                        <div className="flex gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                                                    One-time view only
                                                </p>
                                                <p className="text-xs text-amber-800 dark:text-amber-300">
                                                    This secret can only be viewed once. After you reveal it, the link will be permanently destroyed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={revealSecret}
                                        disabled={loading}
                                        className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-base font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                                Decrypting...
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-4 h-4" />
                                                Reveal Secret
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            {error && (
                                <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-5">
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-base font-semibold text-red-900 dark:text-red-200 mb-1">{error}</p>
                                            <p className="text-sm text-red-800 dark:text-red-300">
                                                This secret may have already been viewed or has expired after 5 minutes.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {revealed && secret && (
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-4">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                                            <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                                                Secret Revealed Successfully
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Decrypted Message
                                        </label>
                                        <div className="relative">
                      <textarea
                          value={secret}
                          readOnly
                          className="w-full h-48 px-4 py-3 border border-input bg-background text-foreground rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                      />
                                            <button
                                                onClick={copySecret}
                                                className="absolute top-3 right-3 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4">
                                        <div className="flex items-start gap-2">
                                            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-800 dark:text-red-300">
                                                This secret has been permanently destroyed. The link no longer works.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
