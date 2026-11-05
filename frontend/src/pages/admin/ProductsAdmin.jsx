import { useEffect, useState } from 'react'
import { Pencil, Trash2, Upload, X } from 'lucide-react'
import { api } from '../../services/api'
import Button from '../../components/Button'
import Input from '../../components/forms/Input'
import Select from '../../components/forms/Select'
import Loading from '../../components/Loading'
import ProductVisual from '../../components/ProductVisual'
import { formatINR } from '../../utils/format'

const EMPTY = { name: '', category: '', material: '', dimensions: '', unit: 'pc', price: '', min_order_quantity: 1, description: '', is_featured: false }

export default function ProductsAdmin() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | 'new' | product
  const [form, setForm] = useState(EMPTY)
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/products/', { params: { page_size: 100 } }),
      api.get('/categories/', { params: { page_size: 50 } }),
    ]).then(([p, c]) => {
      setProducts(p.data.results || [])
      setCategories(c.data.results || c.data)
    }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openNew = () => { setEditing('new'); setForm(EMPTY); setImage(null); setError('') }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, category: p.category, material: p.material, dimensions: p.dimensions, unit: p.unit, price: p.price, min_order_quantity: p.min_order_quantity, description: p.description || '', is_featured: p.is_featured })
    setImage(null); setError('')
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = { ...form, price: parseFloat(form.price) }
      let saved
      if (editing === 'new') {
        const { data } = await api.post('/products/', payload)
        saved = data
      } else {
        const { data } = await api.patch(`/products/${editing.slug}/`, payload)
        saved = data
      }
      if (image && saved?.slug) {
        const fd = new FormData()
        fd.append('image', image)
        fd.append('alt_text', form.name)
        await api.post(`/products/${saved.slug}/images/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setEditing(null)
      load()
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Save failed')
    } finally { setSaving(false) }
  }

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return
    await api.delete(`/products/${p.slug}/`)
    load()
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Products</h1>
          <p className="mt-1 font-body text-sm text-charcoal/60">{products.length} items</p>
        </div>
        <Button onClick={openNew}>+ Add product</Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-charcoal/8 bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-charcoal/10 bg-cream/50 font-display text-xs uppercase tracking-wider text-charcoal/50">
            <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">MOQ</th><th className="px-4 py-3">Active</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-charcoal/6">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-cream/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-cream">
                      {p.image_url ? <img src={p.image_url} className="h-full w-full object-cover" alt="" /> : <ProductVisual seed={p.id} className="h-full w-full" />}
                    </div>
                    <div>
                      <p className="font-display font-bold">{p.name}</p>
                      <p className="font-body text-xs text-charcoal/40">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{p.category_name}</td>
                <td className="px-4 py-3 font-semibold">{formatINR(p.price)}</td>
                <td className="px-4 py-3">{p.min_order_quantity}</td>
                <td className="px-4 py-3">{p.is_active ? '✓' : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-charcoal/60 hover:bg-cream hover:text-charcoal"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(p)} className="rounded-lg p-2 text-charcoal/60 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-lift sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold">{editing === 'new' ? 'New product' : 'Edit product'}</h2>
              <button type="button" onClick={() => setEditing(null)}><X className="h-5 w-5 text-charcoal/50" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name *" value={form.name} onChange={set('name')} className="sm:col-span-2" />
              <Select label="Category *" value={form.category} onChange={set('category')}>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Input label="Price (₹) *" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} />
              <Input label="Material" value={form.material} onChange={set('material')} />
              <Input label="Dimensions" value={form.dimensions} onChange={set('dimensions')} placeholder="e.g. 10x10x5 cm" />
              <Input label="Unit" value={form.unit} onChange={set('unit')} />
              <Input label="Min. order qty" type="number" min="1" value={form.min_order_quantity} onChange={set('min_order_quantity')} />
              <label className="flex items-center gap-2 font-body text-sm text-charcoal/70 sm:col-span-2">
                <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} className="h-4 w-4 accent-[#b58b61]" /> Featured product
              </label>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block font-display text-sm font-semibold">Product image</label>
                <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setImage(e.target.files[0])} className="w-full font-body text-sm" />
                <p className="mt-1 font-body text-xs text-charcoal/40">JPG/PNG/WebP — shown on catalogue cards</p>
              </div>
            </div>
            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 font-body text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex gap-3">
              <Button type="submit" loading={saving} className="flex-1">{editing === 'new' ? 'Create' : 'Save'}</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
