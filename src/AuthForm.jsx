import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from './firebase'

const provider = new GoogleAuthProvider()

export default function AuthForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    if (loading) return
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      setError("Connexion impossible : " + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="card auth-card">
      <h2>T'es un vrai Guinéen ? 🇬🇳</h2>
      <p className="auth-sub">150 questions, 10 niveaux, et des vies limitées. On va voir ce que tu as dans le ventre 😏</p>
      {error && <p className="auth-error">{error}</p>}
      <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter avec Google'}
      </button>
    </div>
  )
}
