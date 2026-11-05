import { useEffect, useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { api } from '../../services/api'
import Button from '../../components/Button'
import Input from '../../components/forms/Input'
import Textarea from '../../components/forms/Textarea'
import Loading from '../../components/Loading'

const EMPTY = {
  company_name: '', contact_name: '', email: '', phone: '', address: '',
  city: '', state: '', country: 'India', supplies: '',
  lead_time_days: '', cost_notes: '', notes: '', is_active: true,
}

export default function SuppliersAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/suppliers/', { params: { page_size: 100 } })
      .then(({ data }) => setItems(data.results || []))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openNew = () => { setEditing('new'); setForm(EMPTY) }
  const openEdit = (s) => {
    setEditing(s)
    setForm({
      company_name: s.company_name, contact_name: s.contact_name, email: s.email,
      phone: s.phone, address: s.address, city: s.city, state: s.state,
      country: s.country, supplies: s.supplies,
      lead_time_days: s.lead_time_days ?? '', cost_notes: s.cost_notes,
      notes: s.notes, is_active: s.is_active,
    })
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, lead_time_days: form.lead_time_days === '' ? null : parseInt(form.lead_time_days) }
      if (editing === 'new') await api.post('/suppliers/', payload)
      else await api.patch(`/suppliers/${editing.id}/`, payload)
      setEditing(null); load()
    } finally { setSaving(false) }
  }

  const remove = async (s) => {
    if (!window.confirm(`Delete ${s.company_name}?`)) return
    await api.delete(`/suppliers/${s.id}/`); load()
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Suppliers</h1>
          <p className="mt-1 font-body text-sm text-charcoal/60">
            {items.length} vendors · <span className="text-amber-700">admin-only — costs hidden from customers</span>
          </p>
        </div>
        <Button onClick={openNew}>+ Add supplier</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((s) => (
          <div key={s.id} className="rounded-2xl border border-charcoal/8 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display font-bold">{s.company_name}</p>
                <p className="font-body text-xs text-charcoal/50">{s.contact_name} · {s.city}, {s.country}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-charcoal/60 hover:bg-cream"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(s)} className="rounded-lg p-1.5 text-charcoal/60 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-3 font-body text-sm text-charcoal/70">{s.supplies || '—'}</p>
            <div className="mt-3 flex gap-4 border-t border-charcoal/8 pt-3 font-body text-xs text-charcoal/50">
              <span>{s.email}</span>
              {s.lead_time_days && <span>Lead: {s.lead_time_days}d</span>}
              {!s.is_active && <span className="text-red-700">Inactive</span>}
            </div>
          </div>
        ))}
      </div>
      {!items.length && <div className="mt-6 rounded-2xl border border-dashed border-charcoal/15 bg-white/60 py-16 text-center font-body text-charcoal/50">No suppliers yet.</div>}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-lift sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold">{editing === 'new' ? 'New supplier' : 'Edit supplier'}</h2>
              <button type="button" onClick={() => setEditing(null)}><X className="h-5 w-5 text-charcoal/50" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Company name *" value={form.company_name} onChange={set('company_name')} />
              <Input label="Contact person" value={form.contact_name} onChange={set('contact_name')} />
              <Input label="Email *" type="email" value={form.email} onChange={set('email')} />
              <Input label="Phone" value={form.phone} onChange={set('phone')} />
              <Input label="City" value={form.city} onChange={set('city')} />
              <Input label="State" value={form.state} onChange={set('state')} />
              <Input label="Country" value={form.country} onChange={set('country')} />
              <Input label="Supplies" value={form.supplies} onChange={set('supplies')} placeholder="e.g. corrugated sheets" />
              <Input label="Lead time (days)" type="number" min="0" value={form.lead_time_days} onChange={set('lead_time_days')} />
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 sm:col-span-2">
                <p className="font-body text-xs font-bold uppercase tracking-wider text-amber-800">Admin-only fields</p>
                <Textarea label="Manufacturing costs / margins" value={form.cost_notes} onChange={set('cost_notes')} rows={3} className="mt-2" />
                <Textarea label="Internal notes" value={form.notes} onChange={set('notes')} rows={2} className="mt-3" />
              </div>
              <label className="flex items-center gap-2 font-body text-sm text-charcoal/70 sm:col-span-2">
                <input type="checkbox" checked={form.is_active} onChange={set('is_active')} className="h-4 w-4 accent-[#b58b61]" /> Active supplier
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <Button type="submit" loading={saving} className="flex-1">Save</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
