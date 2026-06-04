import { useState, useEffect } from 'react'
import { getAllFroffers, saveFroffer, deleteFroffer } from '../../lib/dataService'

export default function FroffersTab({ venue }) {
  const [froffers, setFroffers] = useState([])
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    getAllFroffers(venue.id).then(setFroffers)
  }, [venue.id])

  async function handleSave(data) {
    await saveFroffer(venue.id, data)
    setFroffers(await getAllFroffers(venue.id))
    setEditing(null)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this Froffer?')) return
    await deleteFroffer(id)
    setFroffers(froffers.filter(f => f.id !== id))
  }

  if (editing !== null) {
    return (
      <FrofferForm
        initial={editing === 'new' ? {} : editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
        brandColor={venue.brandColor}
      />
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setEditing('new')}
        className="frother-button w-full text-white text-sm"
        style={{ backgroundColor: venue.brandColor }}
      >
        + New Froffer
      </button>
      {froffers.map(f => (
        <div key={f.id} className="frother-card p-4 flex items-center gap-3">
          <span className="text-2xl w-11 h-11 rounded-2xl bg-[#F7F3EA] border-2 border-gray-900 flex items-center justify-center shadow-[2px_2px_0_#111827]">{f.emoji || '🎁'}</span>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm truncate">{f.title}</p>
            <p className="text-xs text-gray-400 truncate">{f.description}</p>
            <span className={`text-xs font-medium ${f.active ? 'text-green-600' : 'text-gray-400'}`}>
              {f.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(f)} className="text-xs text-gray-500 px-2 py-1 rounded-lg bg-gray-50">Edit</button>
            <button onClick={() => handleDelete(f.id)} className="text-xs text-red-400 px-2 py-1 rounded-lg bg-red-50">Delete</button>
          </div>
        </div>
      ))}
      {froffers.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No Froffers yet</p>}
    </div>
  )
}

function FrofferForm({ initial, onSave, onCancel, brandColor }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    emoji: initial.emoji || '🎁',
    expiresAt: initial.expiresAt || '',
    active: initial.active !== false,
    ...(initial.id ? { id: initial.id } : {}),
  })

  return (
    <div className="frother-card p-5 space-y-4">
      <h3 className="font-black text-2xl tracking-tight">{form.id ? 'Edit Froffer' : 'New Froffer'}</h3>
      {[
        { key: 'emoji', label: 'Emoji', placeholder: '🎁' },
        { key: 'title', label: 'Title', placeholder: '2-for-1 Steak Night' },
        { key: 'description', label: 'Description', placeholder: 'Every Tuesday from 6pm' },
        { key: 'expiresAt', label: 'Expires', type: 'date' },
      ].map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <label htmlFor={`froffer-${key}`} className="text-sm font-semibold text-gray-700 mb-1.5 block">{label}</label>
          <input
            id={`froffer-${key}`}
            type={type || 'text'}
            placeholder={placeholder}
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className="frother-input px-4 py-3 text-sm"
          />
        </div>
      ))}
      <label htmlFor="froffer-active" className="flex items-center gap-3 cursor-pointer">
        <input id="froffer-active" type="checkbox" checked={form.active}
          onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
          className="w-5 h-5 rounded" />
        <span className="text-sm font-semibold text-gray-700">Active</span>
      </label>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600">
          Cancel
        </button>
        <button onClick={() => onSave(form)} className="frother-button flex-1 text-white text-sm"
          style={{ backgroundColor: brandColor }}>
          Save
        </button>
      </div>
    </div>
  )
}
