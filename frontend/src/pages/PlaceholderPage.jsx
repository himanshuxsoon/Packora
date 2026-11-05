import { Link } from 'react-router-dom'

export default function PlaceholderPage({ title }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-3 font-body text-charcoal/60">
        This page is coming soon.
      </p>
      <Link
        to="/"
        className="mt-6 font-display text-sm font-semibold text-kraft hover:underline"
      >
        ← Back to home
      </Link>
    </div>
  )
}
