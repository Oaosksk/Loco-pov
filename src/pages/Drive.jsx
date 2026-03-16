import React, { useState, useCallback } from 'react'
import { RefreshCw, AlertCircle, HardDrive } from 'lucide-react'
import { Button } from '../components/ui/Button'

const MIME_ICONS = {
  'application/vnd.google-apps.document':     '📄',
  'application/vnd.google-apps.spreadsheet':  '📊',
  'application/vnd.google-apps.presentation': '📑',
  'application/pdf':                           '📕',
  'application/vnd.google-apps.folder':        '📁',
}

function getMimeIcon(mimeType) {
  if (MIME_ICONS[mimeType]) return MIME_ICONS[mimeType]
  if (mimeType?.startsWith('image/')) return '🖼️'
  if (mimeType?.startsWith('video/')) return '🎬'
  if (mimeType?.startsWith('audio/')) return '🎵'
  return '📎'
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  const b = Number(bytes)
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

function formatModified(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function FileRow({ file }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border-light dark:border-border-dark
                    bg-surface-light dark:bg-surface-dark
                    hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10
                    transition-all duration-200 group">
      <span className="text-2xl flex-shrink-0">{getMimeIcon(file.mimeType)}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-text-light dark:text-text-dark truncate group-hover:text-primary transition-colors">
          {file.name}
        </p>
        <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
          {formatModified(file.modifiedTime)}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-muted-light dark:text-muted-dark font-medium">
          {formatBytes(file.size)}
        </p>
      </div>
    </div>
  )
}

export function Drive({ session }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fetched, setFetched] = useState(false)

  const providerToken = session?.provider_token

  const fetchFiles = useCallback(async () => {
    if (!providerToken) return
    setLoading(true)
    setError(null)

    try {
      const url = new URL('https://www.googleapis.com/drive/v3/files')
      url.searchParams.set('pageSize', '30')
      url.searchParams.set('orderBy', 'modifiedTime desc')
      url.searchParams.set('fields', 'files(id,name,mimeType,modifiedTime,size)')

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${providerToken}` },
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `Drive API error: ${res.status}`)
      }

      const data = await res.json()
      setFiles(data.files || [])
      setFetched(true)
    } catch (err) {
      console.error('[Drive] Fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [providerToken])

  // No provider_token — show sign-in prompt
  if (!providerToken) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-serif text-text-light dark:text-text-dark">Drive</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            Browse your recent Google Drive files
          </p>
        </div>

        <div className="card p-10 text-center">
          <HardDrive size={40} className="text-primary/40 mx-auto mb-4" />
          <h2 className="text-lg font-bold font-serif text-text-light dark:text-text-dark mb-2">
            Drive access not available
          </h2>
          <p className="text-sm text-muted-light dark:text-muted-dark max-w-sm mx-auto mb-6 leading-relaxed">
            To browse your Drive files, you need to sign out and sign back in with Google —
            this grants the read-only Drive scope.
          </p>
          <AlertCircle size={18} className="text-accent inline mr-2" />
          <span className="text-sm text-accent font-semibold">
            Sign out → Sign back in with Google → Return here
          </span>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-4">
            In demo mode, Drive access is unavailable (no OAuth session).
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-text-light dark:text-text-dark">Drive</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {fetched ? `${files.length} recent files` : 'Browse your recent Google Drive files'}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={fetchFiles}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading…' : fetched ? 'Refresh' : 'Load Files'}
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Drive API Error</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{error}</p>
            <p className="text-xs text-red-500 dark:text-red-500 mt-1">
              If your token expired, sign out and sign back in with Google.
            </p>
          </div>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-border-light dark:bg-border-dark rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* File list */}
      {!loading && fetched && (
        <>
          {files.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">📂</span>
              <p className="text-muted-light dark:text-muted-dark font-medium">
                No files found in your Drive.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <FileRow key={file.id} file={file} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty state before first fetch */}
      {!loading && !fetched && !error && (
        <div className="text-center py-16">
          <HardDrive size={48} className="text-primary/30 mx-auto mb-4" />
          <p className="text-muted-light dark:text-muted-dark font-medium">
            Click "Load Files" to fetch your recent Drive files.
          </p>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
            Uses Google Drive REST API v3 — read-only access.
          </p>
        </div>
      )}
    </div>
  )
}
