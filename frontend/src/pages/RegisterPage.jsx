import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/forms/Input'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', email: '', password: '', password_confirm: '',
    first_name: '', last_name: '', phone: '', company_name: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (form.password !== form.password_confirm) {
      setErrors({ password_confirm: 'Passwords do not match.' })
      return
    }
    setLoading(true)
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        password_confirm: form.password_confirm,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        profile: { company_name: form.company_name },
      })
      navigate('/')
    } catch (err) {
      const data = err.response?.data || {}
      const flat = {}
      Object.entries(data).forEach(([k, v]) => {
        flat[k] = Array.isArray(v) ? v.join(' ') : typeof v === 'object' ? JSON.stringify(v) : v
      })
      setErrors(flat)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-3xl border border-charcoal/8 bg-white p-8 shadow-card sm:p-10">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Create your account</h1>
        <p className="mt-1 font-body text-sm text-charcoal/60">
          Track enquiries, quotations and orders in one place.
        </p>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label="Username *" value={form.username} onChange={set('username')} error={errors.username} autoComplete="username" />
          <Input label="Email *" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
          <Input label="First name" value={form.first_name} onChange={set('first_name')} />
          <Input label="Last name" value={form.last_name} onChange={set('last_name')} />
          <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+91 …" />
          <Input label="Company" value={form.company_name} onChange={set('company_name')} />
          <Input label="Password *" type="password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" />
          <Input label="Confirm password *" type="password" value={form.password_confirm} onChange={set('password_confirm')} error={errors.password_confirm} autoComplete="new-password" />
          {errors.non_field_errors && (
            <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-sm text-red-700 sm:col-span-2">
              {errors.non_field_errors}
            </p>
          )}
          <Button type="submit" className="mt-2 sm:col-span-2" loading={loading}>Create account</Button>
        </form>
        <p className="mt-5 text-center font-body text-sm text-charcoal/60">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-kraft hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
