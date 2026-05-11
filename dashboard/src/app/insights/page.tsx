import { createClient } from '@supabase/supabase-js'
import type { Topic } from '@/types/insights'
import { ExternalLink, BookOpen } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

async function getInsights(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*, resources(*)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export default async function InsightsPage() {
  const topics = await getInsights()

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-gray-400 mt-1">Topics and resources curated by AI</p>
        </div>

        {/* Empty state */}
        {topics.length === 0 && (
          <div className="text-center py-24 text-gray-500">
            <BookOpen className="mx-auto mb-4 w-10 h-10 opacity-40" />
            <p className="text-lg">No insights yet.</p>
            <p className="text-sm mt-1">Ask Claude to create topics and resources.</p>
          </div>
        )}

        {/* Topics */}
        <div className="space-y-8">
          {topics.map((topic) => (
            <div key={topic.id} className="border border-gray-800 rounded-xl p-6 bg-gray-900">

              {/* Topic header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{topic.name}</h2>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                  {topic.resources?.length ?? 0} resources
                </span>
              </div>

              {/* Resources */}
              {topic.resources?.length > 0 ? (
                <ul className="space-y-3">
                  {topic.resources.map((resource) => (
                    <li key={resource.id} className="flex items-start gap-3 group">
                      <div className="flex-1">
                        {resource.url ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            {resource.title}
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="font-medium text-gray-200">{resource.title}</span>
                        )}
                        {resource.description && (
                          <p className="text-sm text-gray-400 mt-0.5">{resource.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No resources yet.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
