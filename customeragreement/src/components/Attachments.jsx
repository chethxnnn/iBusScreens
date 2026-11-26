import { useRef, useState } from 'react'
import Icon from './icons'
import { formatBytes } from '../data/agreementFields'
import { getAttachmentBlob } from '../services/agreementService'

const fileKind = (name = '') => {
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'doc'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'].includes(ext)) return 'img'
  return 'other'
}

/* ------------------------------------------------------------- attachments */
export default function Attachments({ items, mode, onAdd, onRemove, rejected, onDismiss, changed }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const editing = mode !== 'read'

  const download = (a) => {
    const blob = getAttachmentBlob(a.id) || a.file
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = a.name
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="attachments">
      {editing && (
        <div
          className={`dropzone${drag ? ' is-drag' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            onAdd(e.dataTransfer.files)
          }}
        >
          <span className="dz-icon">
            <Icon name="upload" size={20} />
          </span>
          <p className="dz-title">
            Drop files here or{' '}
            <button type="button" className="dz-browse" onClick={() => inputRef.current?.click()}>
              browse
            </button>
          </p>
          <p className="dz-note">Multiple documents, each under 1 MB</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              onAdd(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
      )}

      {rejected.length > 0 && (
        <div className="att-error" role="alert">
          <Icon name="alert" size={14} />
          <div>
            <p>
              {rejected.length === 1 ? 'This file is' : 'These files are'} 1 MB or larger and {rejected.length === 1 ? 'was' : 'were'} not added:
            </p>
            <ul>
              {rejected.map((f) => (
                <li key={f.name}>
                  {f.name} <span>({formatBytes(f.size)})</span>
                </li>
              ))}
            </ul>
          </div>
          <button type="button" className="icon-btn" onClick={onDismiss} aria-label="Dismiss">
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      {items.length === 0 && !editing && (
        <div className="att-empty">
          <Icon name="paperclip" size={18} />
          <p>No attachments</p>
        </div>
      )}

      {items.length > 0 && (
        <ul className="att-list">
          {items.map((a) => {
            const canDownload = !!(getAttachmentBlob(a.id) || a.file)
            return (
              <li key={a.id} className={`att-row${a.file && changed ? ' is-new' : ''}`}>
                <span className={`att-icon kind-${fileKind(a.name)}`}>
                  <Icon name="file" size={16} />
                </span>
                <span className="att-meta">
                  <span className="att-name" title={a.name}>
                    {a.name}
                  </span>
                  <span className="att-size">{formatBytes(a.size)}</span>
                </span>
                {canDownload && (
                  <button type="button" className="icon-btn" onClick={() => download(a)} aria-label={`Download ${a.name}`} title="Download">
                    <Icon name="download" size={15} />
                  </button>
                )}
                {editing && (
                  <button type="button" className="icon-btn icon-btn-danger" onClick={() => onRemove(a.id)} aria-label={`Remove ${a.name}`} title="Remove">
                    <Icon name="trash" size={15} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

