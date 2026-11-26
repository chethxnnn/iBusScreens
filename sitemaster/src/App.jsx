import { useCallback, useEffect, useRef, useState } from 'react'
import SiteList from './pages/SiteList'
import SiteDetail from './pages/SiteDetail'
import Icon from './components/icons'
import { createSite, fetchSite, fetchSites, getNextSiteId, saveSite } from './services/siteService'
import { createEmptySiteTemplate } from './data/siteFields'

export default function App() {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState({ name: 'list' })
  const [detail, setDetail] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    fetchSites().then((data) => {
      setSites(data)
      setLoading(false)
    })
    const params = new URLSearchParams(window.location.search)
    const siteId = params.get('site')
    if (siteId) openSite(siteId, params.get('mode') === 'edit' ? 'edit' : 'read')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const notify = useCallback((message, kind = 'success') => {
    setToast({ message, kind, id: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast((t) => t && { ...t, leaving: true }), 3000)
  }, [])

  useEffect(() => {
    if (!toast?.leaving) return
    const t = setTimeout(() => setToast(null), 260)
    return () => clearTimeout(t)
  }, [toast])

  const openSite = async (siteId, mode) => {
    const site = await fetchSite(siteId)
    if (!site) return
    setDetail({ site, mode })
    setRoute({ name: 'detail' })
    window.scrollTo({ top: 0 })
  }

  const openCreate = () => {
    const newSite = createEmptySiteTemplate(getNextSiteId())
    setDetail({ site: newSite, mode: 'create' })
    setRoute({ name: 'detail' })
    window.scrollTo({ top: 0 })
  }

  const goList = () => {
    setRoute({ name: 'list' })
    setDetail(null)
    window.scrollTo({ top: 0 })
  }

  const handleSave = async (siteId, values, isNew = false) => {
    let result
    if (isNew) {
      result = await createSite(values)
      if (result) {
        setSites((prev) => [result, ...prev])
        notify(`Site ${result.siteId} created`)
        goList()
      }
    } else {
      result = await saveSite(siteId, values)
      if (result) {
        setSites((prev) => prev.map((s) => (s.siteId === siteId ? result : s)))
        notify(`Site ${siteId} saved`)
        goList()
      }
    }
    return result
  }

  return (
    <div className="app">
      <div className="route" key={route.name === 'detail' ? `d-${detail?.site.siteId}-${detail?.mode}` : 'list'}>
        {route.name === 'list' && (
          <SiteList sites={sites} loading={loading} onOpen={openSite} onCreate={openCreate} />
        )}
        {route.name === 'detail' && detail && (
          <SiteDetail
            key={detail.site.siteId || 'create-new'}
            site={detail.site}
            initialMode={detail.mode}
            onBack={goList}
            onSave={handleSave}
            notify={notify}
          />
        )}
      </div>
      <div className="toast-region" aria-live="polite">
        {toast && (
          <div
            key={toast.id}
            className={`toast toast-${toast.kind}${toast.leaving ? ' is-leaving' : ''}`}
            role="status"
          >
            <span className="toast-icon">
              <Icon name={toast.kind === 'error' ? 'alert' : 'check'} size={14} stroke={2.4} />
            </span>
            {toast.message}
            <button
              className="toast-close"
              onClick={() => setToast((t) => t && { ...t, leaving: true })}
              aria-label="Dismiss"
            >
              <Icon name="x" size={12} stroke={2.4} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
