import { useCallback, useEffect, useRef, useState } from 'react'
import AreaList from './pages/AreaList'
import AreaDetail from './pages/AreaDetail'
import Icon from './components/icons'
import MeshCanvas from './components/MeshCanvas'
import {
  createArea,
  fetchArea,
  fetchAreas,
  fetchRefSites,
  getNextAreaId,
  saveArea,
} from './services/areaService'
import { emptyArea } from './data/areaFields'

export default function App() {
  const [areas, setAreas] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState({ name: 'list' })
  const [detail, setDetail] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    Promise.all([fetchAreas(), fetchRefSites()]).then(([a, s]) => {
      setAreas(a)
      setSites(s)
      setLoading(false)
    })
    const params = new URLSearchParams(window.location.search)
    const areaId = params.get('area')
    if (areaId) openArea(areaId, params.get('mode') === 'edit' ? 'edit' : 'read')
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

  const openArea = async (areaId, mode) => {
    const [area, refs] = await Promise.all([fetchArea(areaId), fetchRefSites()])
    if (!area) return
    setSites(refs)
    setDetail({ area, mode })
    setRoute({ name: 'detail' })
    window.scrollTo({ top: 0 })
  }

  const openCreate = () => {
    setDetail({ area: emptyArea(getNextAreaId()), mode: 'create' })
    setRoute({ name: 'detail' })
    window.scrollTo({ top: 0 })
  }

  const goList = () => {
    setRoute({ name: 'list' })
    setDetail(null)
    window.scrollTo({ top: 0 })
  }

  const handleSave = async (areaId, values, isNew = false) => {
    let result
    if (isNew) {
      result = await createArea(values)
      if (result) {
        setAreas((prev) => [result, ...prev])
        notify(`Developed area ${result.areaId} created`)
        goList()
      }
    } else {
      result = await saveArea(areaId, values)
      if (result) {
        setAreas((prev) => prev.map((a) => (a.areaId === areaId ? result : a)))
        notify(`Developed area ${areaId} saved`)
        goList()
      }
    }
    return result
  }

  return (
    <div className="app">
      <MeshCanvas variant="light" className="mesh-bg" />
      <div className="route" key={route.name === 'detail' ? `d-${detail?.area.areaId}-${detail?.mode}` : 'list'}>
        {route.name === 'list' && (
          <AreaList areas={areas} sites={sites} loading={loading} onOpen={openArea} onCreate={openCreate} />
        )}
        {route.name === 'detail' && detail && (
          <AreaDetail
            key={detail.area.areaId}
            area={detail.area}
            sites={sites}
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
