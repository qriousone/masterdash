'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ExternalLink, Pencil, X, Plus, Trash2 } from 'lucide-react'
import DateFilter from './DateFilter'
import type { Topic, NewsItem } from '@/types/insights'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

type EditableResource = {
  id: string | null
  title: string
  url: string
  description: string
}

type EditState = {
  topicId: string
  topicName: string
  originalName: string
  resources: EditableResource[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

interface Props {
  news: NewsItem[]
  groupedNews: Record<string, NewsItem[]>
  topics: Topic[]
}

export default function SignalFeed({ news, groupedNews, topics }: Props) {
  const router = useRouter()
  const [editState, setEditState] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)

  function openEdit(topicName: string) {
    const topic = topics.find(t => t.name === topicName)
    if (!topic) return
    setEditState({
      topicId: topic.id,
      topicName: topic.name,
      originalName: topic.name,
      resources: (topic.resources ?? []).map(r => ({
        id: r.id,
        title: r.title,
        url: r.url ?? '',
        description: r.description ?? '',
      })),
    })
  }

  function addResource() {
    if (!editState) return
    setEditState({
      ...editState,
      resources: [...editState.resources, { id: null, title: '', url: '', description: '' }],
    })
  }

  function removeResource(index: number) {
    if (!editState) return
    setEditState({ ...editState, resources: editState.resources.filter((_, i) => i !== index) })
  }

  function updateResource(index: number, field: keyof EditableResource, value: string) {
    if (!editState) return
    const updated = [...editState.resources]
    updated[index] = { ...updated[index], [field]: value }
    setEditState({ ...editState, resources: updated })
  }

  async function save() {
    if (!editState) return
    setSaving(true)
    try {
      // Update topic name
      if (editState.topicName !== editState.originalName) {
        await supabase
          .from('topics')
          .update({ name: editState.topicName })
          .eq('id', editState.topicId)
      }

      const originalTopic = topics.find(t => t.id === editState.topicId)
      const originalIds = new Set((originalTopic?.resources ?? []).map(r => r.id))
      const keepIds = new Set(editState.resources.filter(r => r.id).map(r => r.id as string))

      // Delete removed resources
      for (const id of originalIds) {
        if (!keepIds.has(id)) {
          await supabase.from('resources').delete().eq('id', id)
        }
      }

      // Upsert remaining
      for (const r of editState.resources) {
        if (r.id) {
          await supabase.from('resources').update({
            title: r.title,
            url: r.url || null,
            description: r.description || null,
          }).eq('id', r.id)
        } else {
          await supabase.from('resources').insert({
            topic_id: editState.topicId,
            title: r.title,
            url: r.url || null,
            description: r.description || null,
          })
        }
      }

      setEditState(null)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Single card */}
      <div className="aspect-square flex flex-col border border-zinc-800/50 rounded-xl bg-zinc-900/30 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/40">
          <div>
            <p className="text-[9px] font-semibold tracking-[0.24em] text-zinc-500 uppercase mb-1">
              Signal Feed
            </p>
            <p className="text-[11px] text-zinc-600 tracking-wide">
              Intelligence from tracked sources
            </p>
          </div>
          <Suspense fallback={null}>
            <DateFilter />
          </Suspense>
        </div>

        {news.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-zinc-700">
            <p className="text-sm">No signals for this date.</p>
            <p className="text-xs mt-1 text-zinc-800">Ask Claude to pull highlights from your sources.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
            {Object.entries(groupedNews).map(([topicName, items]) => (
              <div key={topicName} className="px-6 py-5">
                {/* Topic header */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[9px] font-semibold tracking-[0.22em] text-zinc-400 uppercase">
                    {topicName}
                  </p>
                  <button
                    onClick={() => openEdit(topicName)}
                    className="p-1 rounded text-zinc-700 hover:text-zinc-400 hover:bg-zinc-800/60 transition-colors"
                    title="Edit topic & resources"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>

                {/* News items */}
                <div className="space-y-4">
                  {items.map((item, i) => (
                    <div key={item.id} className={i > 0 ? 'border-t border-zinc-800/30 pt-4' : ''}>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-1.5"
                        >
                          <span className="text-[13px] font-medium text-zinc-200 group-hover:text-white leading-snug transition-colors flex-1">
                            {item.title}
                          </span>
                          <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                        </a>
                      ) : (
                        <p className="text-[13px] font-medium text-zinc-200 leading-snug">{item.title}</p>
                      )}
                      {item.summary && (
                        <p className="text-[11px] text-zinc-600 mt-1.5 leading-relaxed">
                          <span className="text-zinc-700">Why it matters — </span>
                          {item.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {item.source && (
                          <span className="text-[9px] text-zinc-700 bg-zinc-800/50 px-2 py-0.5 rounded-full">
                            {item.source}
                          </span>
                        )}
                        <span className="text-[9px] text-zinc-800">{formatDate(item.published_date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditState(null)}
          />

          {/* Panel */}
          <div className="relative z-10 bg-[#111113] border border-zinc-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[85vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60 shrink-0">
              <p className="text-[9px] font-semibold tracking-[0.22em] text-zinc-500 uppercase">
                Edit Topic
              </p>
              <button
                onClick={() => setEditState(null)}
                className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Topic name */}
              <div>
                <label className="text-[9px] font-semibold tracking-[0.2em] text-zinc-600 uppercase block mb-2">
                  Topic Name
                </label>
                <input
                  type="text"
                  value={editState.topicName}
                  onChange={e => setEditState({ ...editState, topicName: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              {/* Resources */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[9px] font-semibold tracking-[0.2em] text-zinc-600 uppercase">
                    Resources
                  </label>
                  <button
                    onClick={addResource}
                    className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>

                {editState.resources.length === 0 ? (
                  <p className="text-[11px] text-zinc-700 italic py-3">No resources yet.</p>
                ) : (
                  <div className="space-y-3">
                    {editState.resources.map((r, i) => (
                      <div key={i} className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="text"
                            value={r.title}
                            onChange={e => updateResource(i, 'title', e.target.value)}
                            placeholder="Title"
                            className="flex-1 bg-transparent border-b border-zinc-800 pb-1.5 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                          />
                          <button
                            onClick={() => removeResource(i)}
                            className="p-1 text-zinc-700 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="url"
                          value={r.url}
                          onChange={e => updateResource(i, 'url', e.target.value)}
                          placeholder="URL (optional)"
                          className="w-full bg-transparent border-b border-zinc-800/50 pb-1.5 text-[11px] text-zinc-500 placeholder-zinc-800 focus:outline-none focus:border-zinc-600 transition-colors"
                        />
                        <textarea
                          value={r.description}
                          onChange={e => updateResource(i, 'description', e.target.value)}
                          placeholder="Description (optional)"
                          rows={2}
                          className="w-full bg-transparent text-[11px] text-zinc-500 placeholder-zinc-800 focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800/60 shrink-0">
              <button
                onClick={() => setEditState(null)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 px-5 py-2 rounded-lg transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
