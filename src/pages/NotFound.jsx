import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl mb-4">☕</p>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-gray-500 text-sm mb-6">This page doesn't exist or has moved.</p>
      <Link to="/venue/demo-cafe" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm">
        Go to Demo Cafe
      </Link>
    </div>
  )
}
