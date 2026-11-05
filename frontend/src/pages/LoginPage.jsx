import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/forms/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      navigate(user.is_admin ? '/admin' : '/')
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <div className="rounded-3xl border border-charcoal/8 bg-white p-8 shadow-card">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-1 font-body text-sm text-charcoal/60">Log in to your PACKORA account.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
            required
          />
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-sm text-red-700">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>Log in</Button>
        </form>
        <p className="mt-5 text-center font-body text-sm text-charcoal/60">
          New to PACKORA?{' '}
          <Link to="/register" className="font-semibold text-kraft hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
