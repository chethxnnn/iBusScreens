import { useCallback, useEffect, useRef, useState } from 'react'
import TenancyList from './pages/TenancyList'
import TenancyDetail from './pages/TenancyDetail'
import Icon from './components/icons'
import MeshCanvas from './components/MeshCanvas'
import {
  createTenancy,
  fetchMasters,
  fetchTenancies,
  fetchTenancy,
  getNextTenancyId,
  saveTenancy,
  setTenancyStatus,
} from './services/tenancyService'
import { emptyTenancy } from './data/tenancyFields'

const NO_MASTERS = { customers: [], sites: [], contracts: [] }

export default function App() {
  const [tenancies, setTenancies] = useState([])
  const [masters, setMasters] = useState(NO_MASTERS)
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState({ name: 'list' })
  const [detail, setDetail] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    Promise.all([fetchTenancies(), fetchMasters()]).then(([t, m]) => {
      setTenancies(t)
      setMasters(m)
      setLoading(false)
    })
    const params = new URLSearchParams(window.location.search)
    const id = params.get('tenancy')
    if (id) openTenancy(id, params.get('mode') === 'edit' ? 'edit' : 'read')
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

  const openTenancy = async (id, mode) => {
    const [record, m] = await Promise.all([fetchTenancy(id), fetchMasters()])
    if (!record) return
    setMasters(m)
    setDetail({ record, mode })
    setRoute({ name: 'detail' })
    window.scrollTo({ top: 0 })
  }

  const openCreate = async () => {
    const m = await fetchMasters()
    setMasters(m)
    setDetail({ record: emptyTenancy(getNextTenancyId()), mode: 'create' })
    setRoute({ name: 'detail' })
    window.scrollTo({ top: 0 })
  }

  const goList = () => {
    setRoute({ name: 'list' })
    setDetail(null)
    window.scrollTo({ top: 0 })
  }

  const handleSave = async (id, values, isNew = false) => {
    let result
    if (isNew) {
      result = await createTenancy(values)
      if (result) {
        setTenancies((prev) => [result, ...prev])
        notify(`Tenancy ${result.tenancyId} created`)
        goList()
      }
    } else {
      result = await saveTenancy(id, values)
      if (result) {
        setTenancies((prev) => prev.map((t) => (t.tenancyId === id ? result : t)))
        notify(`Tenancy ${id} saved`)
        goList()
      }
    }
    return result
  }

  // Approval screen: stays on the record and shows the new status
  const handleStatus = async (id, status) => {
    const result = await setTenancyStatus(id, status)
    if (result) {
      setTenancies((prev) => prev.map((t) => (t.tenancyId === id ? result : t)))
      setDetail({ record: result, mode: 'read' })
      notify(`Tenancy ${id} ${status === 'Approved' ? 'approved' : 'rejected'}`)
    }
    return result
  }

  return (
    <div className="app">
      <MeshCanvas variant="light" className="mesh-bg" />
      <div className="route" key={route.name === 'detail' ? `d-${detail?.record.tenancyId}-${detail?.mode}` : 'list'}>
        {route.name === 'list' && (
          <TenancyList tenancies={tenancies} masters={masters} loading={loading} onOpen={openTenancy} onCreate={openCreate} />
        )}
        {route.name === 'detail' && detail && (
          <TenancyDetail
            key={`${detail.record.tenancyId}-${detail.record.status}`}
            record={detail.record}
            masters={masters}
            initialMode={detail.mode}
            onBack={goList}
            onSave={handleSave}
            onStatus={handleStatus}
            notify={notify}
          />
        )}
      </div>
      <div className="toast-region" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`toast toast-${toast.kind}${toast.leaving ? ' is-leaving' : ''}`} role="status">
            <span className="toast-icon">
              <Icon name={toast.kind === 'error' ? 'alert' : 'check'} size={14} stroke={2.4} />
            </span>
            {toast.message}
            <button className="toast-close" onClick={() => setToast((t) => t && { ...t, leaving: true })} aria-label="Dismiss">
              <Icon name="x" size={12} stroke={2.4} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
