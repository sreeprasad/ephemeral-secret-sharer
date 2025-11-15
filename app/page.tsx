'use client'

import { useState } from 'react'
import { generateKey, encryptSecret, exportKey } from '@/lib/encryption'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Lock, Clock, Copy, Check, Shield, Zap } from 'lucide-react'

export default function Home() {
    const [secret, setSecret] = useState('')
    const ttl = 300 // Fixed: 5 minutes only
    const [generatedLink, setGeneratedLink] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setGeneratedLink('')

        try {
            if (!secret.trim()) {
                alert('Please enter a secret message')
                return
            }

            const key = await generateKey()
            const { ciphertext, iv } = await encryptSecret(secret, key)
            const keyString = await exportKey(key)

            const response = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ciphertext,
                    iv,
                    ttl: parseInt(ttl.toString()),
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create secret')
            }

            const { id } = data
            const link = `${window.location.origin}/view/${id}#${keyString}`
            setGeneratedLink(link)
            setSecret('')
        } catch (error) {
            console.error('Error creating secret:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to create secret. Please try again.'
            alert(`Error: ${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(generatedLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Header */}
            <header className="border-b border-border/40">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground text-background">
                            <Lock className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-lg">SecretShare</span>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-3xl mx-auto">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                            Share secrets securely
                        </h1>
                        <p className="text-lg text-muted-foreground text-balance">
                            End-to-end encrypted messages that self-destruct after one view or 5 minutes
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6 md:p-8">
                            {/* Secret Input */}
                            <div className="mb-6">
                                <label htmlFor="secret" className="block text-sm font-medium mb-3">
                                    Your secret message
                                </label>
                                <textarea
                                    id="secret"
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    placeholder="Enter your sensitive information here..."
                                    className="w-full h-40 px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
                                    required
                                />
                            </div>

                            {/* Info Banner */}
                            <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium mb-1">Auto-expiration: 5 minutes</p>
                                        <p className="text-xs text-muted-foreground">
                                            Secret will be permanently deleted after the first view or when time expires
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 text-base font-medium"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                                        Creating secure link...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4 mr-2" />
                                        Create secure link
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Generated Link Section */}
                        {generatedLink && (
                            <div className="border-t border-border bg-muted/20 p-6 md:p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Check className="w-5 h-5 text-green-600 dark:text-green-500" />
                                    <p className="font-medium">Secure link created</p>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={generatedLink}
                                        readOnly
                                        className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    <Button
                                        onClick={copyToClipboard}
                                        variant="secondary"
                                        className="px-6"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3">
                                    <p className="text-xs text-amber-900 dark:text-amber-200">
                                        <strong>Important:</strong> Share this link carefully. It will only work once and expires in 5 minutes.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mt-16">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
                                <Lock className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="font-semibold mb-2">End-to-end encrypted</h3>
                            <p className="text-sm text-muted-foreground">
                                AES-256-GCM encryption ensures your secrets stay private
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
                                <Zap className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="font-semibold mb-2">One-time view</h3>
                            <p className="text-sm text-muted-foreground">
                                Secrets automatically delete after being viewed once
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
                                <Clock className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="font-semibold mb-2">5-minute expiry</h3>
                            <p className="text-sm text-muted-foreground">
                                Even if not viewed, secrets disappear after 5 minutes
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/40 mt-16">
                <div className="container mx-auto px-4 py-8">
                    <p className="text-center text-sm text-muted-foreground">
                        Zero-knowledge architecture • Encryption keys never leave your browser
                    </p>
                </div>
            </footer>
        </div>
    )
}
