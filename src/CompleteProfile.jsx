import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const REGIONS = ['Basse-Guinée', 'Moyenne-Guinée', 'Haute-Guinée', 'Guinée forestière']

export default function CompleteProfile({ user }) {
  const [pseudo, setPseudo] = useState('')
  const [region, setRegion] = useState(REGIONS[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (!pseudo.trim()) {
      setError('Choisis un pseudo.')
      return
    }
    setLoading(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        pseudo: pseudo.trim(),
        region,
        email: user.email || '',
        bestScore: 0,
        createdAt: Date.now(),
      }, { merge: true })
    } catch (err) {
      setError('Erreur : ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="card auth-card">
      <h2>Complète ton profil</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input placeholder="Pseudo / surnom" value={pseudo} onChange={e => setPseudo(e.target.value)} />
        <select value={region} onChange={e => setRegion(e.target.value)}>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? '...' : 'Valider'}</button>
      </form>
    </div>
  )
}
