'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import AuthGuard from '@/components/AuthGuard'
import { migrateCampaignEmails } from '@/scripts/migrate-campaign-emails-client'

export default function MigrateEmailsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ updated: number; skipped: number; errors: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMigrate = async () => {
    if (!confirm('Are you sure you want to run the email migration? This will update all campaigns without createdByEmail.')) {
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const migrationResult = await migrateCampaignEmails()
      setResult(migrationResult)
    } catch (err: any) {
      setError(err.message || 'Migration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">Campaign Email Migration</h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Admin Tool</h2>
            <p className="text-yellow-700 text-sm">
              This tool will update all campaigns that don't have a createdByEmail field.
              It will fetch the email from the user's profile and add it to the campaign.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-green-800 mb-3">Migration Complete!</h2>
              <div className="space-y-2 text-sm text-green-700">
                <p>✅ Updated: {result.updated} campaigns</p>
                <p>⏭️ Skipped: {result.skipped} campaigns (already had email)</p>
                <p>❌ Errors: {result.errors} campaigns</p>
              </div>
            </div>
          )}

          <button
            onClick={handleMigrate}
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/90 text-primary px-6 py-4 rounded-xl text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                Running Migration...
              </span>
            ) : (
              'Run Migration'
            )}
          </button>
        </div>
      </div>
    </AuthGuard>
  )
}
