import { useState } from 'react'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { api } from '../services/api'
import Button from '../components/Button'
import Input from '../components/forms/Input'
import Textarea from '../components/forms/Textarea'

const INFO = [
  { icon: Mail, label: 'Email', value: 'hello@packora.in' },
  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
  { icon: MapPin, label: 'Studio', value: 'Andheri East, Mumbai 400069' },
  { icon: Clock, label: 'Hours', value: 'Mon–Sat, 10am–7pm IST' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General enquiry', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      await api.post('/enquiries/', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      })
      setStatus('sent')
      setForm({ name: '', email: '', subject: 'General enquiry', message: '' })
    } catch {
      setStatus('error')
      setError('Could not send your message. Please email us directly.')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 max-w-2xl">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-kraft">Contact</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Talk to a packaging human</h1>
        <p className="mt-3 font-body text-charcoal/60">
          Questions about materials, MOQ or timelines? Drop us a line — a real person replies.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {INFO.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 rounded-2xl border border-charcoal/8 bg-white p-5 shadow-card">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kraft/15 text-kraft">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-wider text-charcoal/50">{label}</p>
                <p className="mt-1 font-body text-sm font-medium text-charcoal">{value}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-charcoal p-6 text-cream">
            <p className="font-display text-sm font-bold">Need a formal quote?</p>
            <p className="mt-1 font-body text-sm text-cream/70">
              Use the enquiry form with artwork uploads for faster pricing.
            </p>
            <a href="/enquire" className="mt-3 inline-block font-display text-sm font-bold text-kraft hover:underline">
              Go to quote form →
            </a>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-charcoal/8 bg-white p-6 shadow-card sm:p-8 lg:col-span-3">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Name *" value={form.name} onChange={set('name')} required />
            <Input label="Email *" type="email" value={form.email} onChange={set('email')} required />
          </div>
          <Input label="Subject" value={form.subject} onChange={set('subject')} className="mt-5" />
          <Textarea label="Message *" value={form.message} onChange={set('message')} className="mt-5" required />
          {status === 'sent' && (
            <p className="mt-5 rounded-xl bg-olive/15 px-4 py-3 font-body text-sm text-olive">
              Message sent — we'll reply within 24 hours.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 font-body text-sm text-red-700">{error}</p>
          )}
          <Button type="submit" className="mt-6" loading={status === 'sending'}>Send message</Button>
        </form>
      </div>
    </div>
  )
}
