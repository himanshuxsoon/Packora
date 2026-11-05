import { useEffect, useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { api } from '../../services/api'
import Button from '../../components/Button'
import Input from '../../components/forms/Input'
import Select from '../../components/forms/Select'
import Textarea from '../../components/forms/Textarea'
import Loading from '../../components/Loading'

const EMPTY = { name: '', parent: '', description: '', ordering: 0, is_active: true }

export default function CategoriesAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/categories/', { params: { page_size: 100 } })
      .then(({ data }) => setItems(data.results || data))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openNew = () => { setEditing('new'); setForm(EMPTY) }
  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name, parent: c.parent || '', description: c.description || '', ordering: c.ordering, is_active: c.is_active })
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, parent: form.parent || null }
      if (editing === 'new') await api.post('/categories/', payload)
      else await api.patch(`/categories/${editing.slug}/`, payload)
      setEditing(null); load()
    } finally { setSaving(false) }
  }

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return
    try { await api.delete(`/categories/${c.slug}/`); load() }
    catch { alert('Cannot delete — category has products or children.') }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Categories</h1>
          <p className="mt-1 font-body text-sm text-charcoal/60">{items.length} categories</p>
        </div>
        <Button onClick={openNew}>+ Add category</Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-charcoal/8 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-charcoal/10 bg-cream/50 font-display text-xs uppercase tracking-wider text-charcoal/50">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Parent</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Active</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-charcoal/6">
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-cream/40">
                <td className="px-4 py-3 font-display font-semibold">{c.name}</td>
                <td className="px-4 py-3 text-charcoal/60">{items.find((p) => p.id === c.parent)?.name || '—'}</td>
                <td className="px-4 py-3">{c.product_count ?? 0}</td>
                <td className="px-4 py-3">{c.ordering}</td>
                <td className="px-4 py-3">{c.is_active ? '✓' : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-charcoal/60 hover:bg-cream"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(c)} className="rounded-lg p-2 text-charcoal/60 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lift sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold">{editing === 'new' ? 'New category' : 'Edit category'}</h2>
              <button type="button" onClick={() => setEditing(null)}><X className="h-5 w-5 text-charcoal/50" /></button>
            </div>
            <div className="space-y-4">
              <Input label="Name *" value={form.name} onChange={set('name')} />
              <Select label="Parent category" value={form.parent} onChange={set('parent')}>
                <option value="">None (top level)</option>
                {items.filter((c) => c.id !== editing?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Textarea label="Description" value={form.description} onChange={set('description')} rows={3} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Sort order" type="number" value={form.ordering} onChange={set('ordering')} />
                <label className="mt-6 flex items-center gap-2 font-body text-sm text-charcoal/70">
                  <input type="checkbox" checked={form.is_active} onChange={set('is_active')} className="h-4 w-4 accent-[#b58b61]" /> Active
                </label>
              </div>
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
