import { useCallback, useEffect, useRef, useState } from 'react'
import AgreementList from './pages/AgreementList'
import AgreementDetail from './pages/AgreementDetail'
import AgreementApproval from './pages/AgreementApproval'
import Icon from './components/icons'
import MeshCanvas from './components/MeshCanvas'
import {
  createAgreement,
  fetchAgreement,
  fetchAgreements,
  fetchCustomers,
  getNextContractId,
  saveAgreement,
  setAgreementStatus,
} from './services/agreementService'
import { emptyAgreement } from './data/agreementFields'

export default function App() {
  const [agreements, setAgreements] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState({ name: 'list' }) // list | detail | approve
  const [detail, setDetail] = useState(null)
  const [approveId, setApproveId] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    Promise.all([fetchAgreements(), fetchCustomers()]).then(([a, c]) => {
      setAgreements(a)
      setCustomers(c)
      setLoading(false)
    })
    const params = new URLSearchParams(window.location.search)
    const id = params.get('contract')
    const mode = params.get('mode')
    if (mode === 'approve') {
      setApproveId(id)
      setRoute({ name: 'approve' })
    } else if (id) openAgreement(id, mode === 'edit' ? 'edit' : 'read')
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

  const openAgreement = async (id, mode) => {
    if (mode === 'approve') {
      setApproveId(id)
      setRoute({ name: 'approve' })
      window.scrollTo({ top: 0 })
      return
    }
    const [record, c] = await Promise.all([fetchAgreement(id), fetchCustomers()])
    if (!record) return
    setCustomers(c)
    setDetail({ record, mode })
    setRoute({ name: 'detail' })
    window.scrollTo({ top: 0 })
  }

  const openCreate = () => {
    setDetail({ record: emptyAgreement(getNextContractId()), mode: 'create' })
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
      result = await createAgreement(values)
      if (result) {
        setAgreements((prev) => [result, ...prev])
        notify(`Agreement ${result.contractId} created`)
        goList()
      }
    } else {
      result = await saveAgreement(id, values)
      if (result) {
        setAgreements((prev) => prev.map((a) => (a.contractId === id ? result : a)))
        notify(`Agreement ${id} saved`)
        goList()
      }
    }
    return result
  }

  // Approval screen: the decided agreement leaves the pending list, the next one opens
  const handleStatus = async (id, status) => {
    const result = await setAgreementStatus(id, status)
    if (result) {
      setAgreements((prev) => prev.map((a) => (a.contractId === id ? result : a)))
      setApproveId(null)
      notify(`Agreement ${id} ${status === 'Approved' ? 'approved' : 'rejected'}`)
    }
    return result
  }

  const routeKey = route.name === 'detail' ? `d-${detail?.record.contractId}-${detail?.mode}` : route.name

  return (
    <div className="app">
      <MeshCanvas variant="light" className="mesh-bg" />
      <div className="route" key={routeKey}>
        {route.name === 'list' && (
          <AgreementList agreements={agreements} customers={customers} loading={loading} onOpen={openAgreement} onCreate={openCreate} />
        )}
        {route.name === 'detail' && detail && (
          <AgreementDetail
            key={detail.record.contractId}
            record={detail.record}
            agreements={agreements}
            customers={customers}
            initialMode={detail.mode}
            onBack={goList}
            onSave={handleSave}
            notify={notify}
          />
        )}
        {route.name === 'approve' && !loading && (
          <AgreementApproval
            agreements={agreements}
            customers={customers}
            selectedId={approveId}
            onSelect={setApproveId}
            onBack={goList}
            onStatus={handleStatus}
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
