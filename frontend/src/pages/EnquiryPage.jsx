import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, FileUp, Trash2, Upload } from 'lucide-react'
import { api } from '../services/api'
import Button from '../components/Button'
import Input from '../components/forms/Input'
import Textarea from '../components/forms/Textarea'
import Select from '../components/forms/Select'
import { useAuth } from '../context/AuthContext'

const MAX_SIZE = 10 * 1024 * 1024
const ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf'

const EMPTY = {
  name: '', email: '', phone: '', company_name: '',
  product_category: '', dimensions: '', material_preference: '',
  quantity: '', printing_requirements: '', delivery_location: '',
  subject: '', message: '',
}

export default function EnquiryPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const logoInput = useRef(null)
  const refInput = useRef(null)

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    company_name: user?.profile?.company_name || '',
    product_category: params.get('category') || '',
    subject: params.get('product') ? `Quote: ${params.get('product')}` : '',
    message: params.get('product')
      ? `Interested in ${params.get('product')} (qty ${params.get('qty') || 'TBD'}).\n\nAdditional details:`
      : '',
  }))
  const [logo, setLogo] = useState(null)
  const [reference, setReference] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null) // { reference }

  useEffect(() => {
    api.get('/categories/', { params: { page_size: 50 } })
      .then(({ data }) => setCategories(data.results || data))
      .catch(() => {})
  }, [])

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setFieldErrors((fe) => ({ ...fe, [k]: undefined }))
  }

  const pickFile = (setter) => (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!/\.(jpe?g|png|webp|pdf)$/i.test(f.name)) {
      setFormError('Only JPG, PNG, WebP or PDF files are allowed.')
      return
    }
    if (f.size > MAX_SIZE) {
      setFormError('File must be under 10MB.')
      return
    }
    setFormError('')
    setter(f)
  }

  const submit = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    setFormError('')

    const required = ['name', 'email', 'subject', 'message']
    const missing = required.filter((k) => !form[k].trim())
    if (missing.length) {
      setFieldErrors(Object.fromEntries(missing.map((k) => [k, 'Required'])))
      setFormError('Please complete the required fields.')
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') fd.append(k, v)
      })
      if (logo) fd.append('logo', logo)
      if (reference) fd.append('reference_design', reference)
      const { data } = await api.post('/enquiries/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult({ reference: data.reference })
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const fieldErrs = {}
        let generic = ''
        Object.entries(data).forEach(([k, v]) => {
          const msg = Array.isArray(v) ? v.join(' ') : String(v)
          if (['name', 'email', 'phone', 'company_name', 'subject', 'message',
               'product_category', 'dimensions', 'material_preference',
               'quantity', 'printing_requirements', 'delivery_location',
               'logo', 'reference_design'].includes(k)) {
            fieldErrs[k] = msg
          } else {
            generic += msg + ' '
          }
        })
        setFieldErrors(fieldErrs)
        setFormError(generic.trim() || 'Submission failed. Please try again.')
      } else {
        setFormError('Network error. Please check your connection and retry.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <CheckCircle2 className="h-16 w-16 text-olive" strokeWidth={1.5} />
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">Enquiry received</h1>
        <p className="mt-3 font-body text-charcoal/60">
          Your reference number is
        </p>
        <p className="mt-2 rounded-xl bg-cream px-6 py-3 font-display text-xl font-extrabold tracking-wide text-kraft">
          {result.reference}
        </p>
        <p className="mt-4 font-body text-sm text-charcoal/60">
          Save this for tracking. Our team will reply to {form.email} within 24 hours.
        </p>
        <div className="mt-8 flex gap-3">
          <Button onClick={() => window.location.href = '/'}>Back to home</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>New enquiry</Button>
        </div>
      </div>
    )
  }

  const fileChip = (file, onRemove) => (
    <div className="mt-3 flex items-center justify-between rounded-lg bg-cream/70 px-4 py-2.5">
      <span className="flex items-center gap-2 font-body text-sm text-charcoal/80">
        <Upload className="h-4 w-4 text-olive" /> {file.name}
        <span className="text-xs text-charcoal/40">{(file.size / 1024).toFixed(0)} KB</span>
      </span>
      <button type="button" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-charcoal/40 hover:text-red-700" />
      </button>
    </div>
  )

  const uploadZone = (label, hint, inputRef, file, setFile) => (
    <div>
      <span className="mb-1.5 block font-display text-sm font-semibold text-charcoal">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={pickFile(setFile)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-charcoal/15 bg-cream/50 px-6 py-6 text-center transition-colors hover:border-kraft/60"
      >
        <FileUp className="h-6 w-6 text-olive" />
        <span className="font-body text-sm text-charcoal/60">
          {hint} <span className="font-semibold text-kraft">browse</span>
        </span>
      </button>
      {file && fileChip(file, () => setFile(null))}
      {fieldErrors[setFile === setLogo ? 'logo' : 'reference_design'] && (
        <p className="mt-1 text-xs text-red-700">
          {fieldErrors[setFile === setLogo ? 'logo' : 'reference_design']}
        </p>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="mb-10 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-kraft">Get a quote</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Custom packaging enquiry</h1>
        <p className="mt-3 font-body text-charcoal/60">
          Tell us what you're packaging. No account needed — we reply within 24 hours.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-charcoal/8 bg-white p-6 shadow-card sm:p-10">
        {/* Contact */}
        <SectionTitle>Contact details</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Full name *" value={form.name} onChange={set('name')} error={fieldErrors.name} />
          <Input label="Business name" value={form.company_name} onChange={set('company_name')} />
          <Input label="Email *" type="email" value={form.email} onChange={set('email')} error={fieldErrors.email} />
          <Input label="Phone number" value={form.phone} onChange={set('phone')} placeholder="+91 …" error={fieldErrors.phone} />
        </div>

        {/* Requirement */}
        <SectionTitle className="mt-9">Packaging requirement</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Product category" value={form.product_category} onChange={set('product_category')} error={fieldErrors.product_category}>
            <option value="">Select a category…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label="Required dimensions" value={form.dimensions} onChange={set('dimensions')} placeholder="e.g. 300x200x100 mm" error={fieldErrors.dimensions} />
          <Input label="Material preference" value={form.material_preference} onChange={set('material_preference')} placeholder="e.g. Kraft corrugated, rigid board" error={fieldErrors.material_preference} />
          <Input label="Quantity" type="number" min="1" value={form.quantity} onChange={set('quantity')} placeholder="e.g. 500" error={fieldErrors.quantity} />
        </div>
        <Textarea
          label="Printing requirements"
          value={form.printing_requirements}
          onChange={set('printing_requirements')}
          className="mt-5"
          placeholder="Colours, lamination, foil stamping, finish…"
          error={fieldErrors.printing_requirements}
        />
        <Input
          label="Delivery location"
          value={form.delivery_location}
          onChange={set('delivery_location')}
          className="mt-5"
          placeholder="City, state, pincode"
          error={fieldErrors.delivery_location}
        />

        {/* Uploads */}
        <SectionTitle className="mt-9">Artwork</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          {uploadZone('Company logo', 'Upload your logo', logoInput, logo, setLogo)}
          {uploadZone('Reference design', 'Mockup or reference image', refInput, reference, setReference)}
        </div>

        {/* Message */}
        <SectionTitle className="mt-9">Details</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Subject *" value={form.subject} onChange={set('subject')} error={fieldErrors.subject} />
        </div>
        <Textarea
          label="Additional instructions *"
          value={form.message}
          onChange={set('message')}
          className="mt-5"
          placeholder="Deadline, special requirements, anything else we should know…"
          error={fieldErrors.message}
        />

        {formError && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 font-body text-sm text-red-700">{formError}</p>
        )}

        <Button type="submit" size="lg" loading={submitting} className="mt-8 w-full">
          {submitting ? 'Submitting…' : 'Submit enquiry'}
        </Button>
        <p className="mt-4 text-center font-body text-xs text-charcoal/45">
          No account needed — your enquiry goes straight to our team.
        </p>
      </form>
    </div>
  )
}

function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`font-display text-sm font-extrabold uppercase tracking-widest text-charcoal/50 ${className}`}>
      {children}
    </h2>
  )
}
