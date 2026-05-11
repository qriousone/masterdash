import { createClient } from '@supabase/supabase-js'
import type { Topic, NewsItem } from '@/types/insights'
import { ExternalLink, BookOpen, Newspaper } from 'lucide-react'
import { Suspense } from 'react'
import DateFilter from '@/components/DateFilter'

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

async function getNews(date?: string): Promise<NewsItem[]> {
  let query = supabase
    .from('news')
    .select('*, topics(name)')
    .order('published_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (date) query = query.eq('published_date', date)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getDate() {
  return new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', weekday: 'long'
  })
}

function groupNewsByTopic(news: NewsItem[]) {
  return news.reduce((acc, item) => {
    const topic = item.topics?.name ?? 'Uncategorized'
    if (!acc[topic]) acc[topic] = []
    acc[topic].push(item)
    return acc
  }, {} as Record<string, NewsItem[]>)
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  const [topics, news] = await Promise.all([getInsights(), getNews(date)])
  const groupedNews = groupNewsByTopic(news)

  return (
    <div className="min-h-full flex flex-col">

      {/* Today's Signal */}
      <div className="border-b border-zinc-800 px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-amber-500 uppercase mb-2">Today's Signal</p>
            <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
              Protect energy. Push leverage. Build ownership.
            </h1>
            <p className="text-zinc-400 mt-1.5 text-sm">Focus on the few things that move everything forward.</p>
          </div>
          <div className="text-right shrink-0 ml-8">
            <p className="text-sm text-zinc-300">{getDate()}</p>
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              <p className="text-xs text-zinc-400">{getGreeting()}.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="p-8 space-y-6">

        {/* News Feed */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-zinc-400" />
              <div>
                <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">News Feed</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Latest highlights from tracked sources</p>
              </div>
            </div>
            <Suspense fallback={null}>
              <DateFilter />
            </Suspense>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-16 text-zinc-600">
              <Newspaper className="mx-auto mb-3 w-8 h-8 opacity-40" />
              <p className="text-sm">No news yet.</p>
              <p className="text-xs mt-1">Ask Claude to pull highlights from your sources.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(groupedNews).map(([topic, items]) => (
                <div key={topic} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest">{topic}</p>
                    <span className="text-[10px] text-zinc-600">{items.length} items</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="border-t border-zinc-800 pt-3 first:border-0 first:pt-0">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-white hover:text-blue-400 flex items-start gap-1"
                          >
                            {item.title}
                            <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 opacity-50" />
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-white">{item.title}</p>
                        )}
                        {item.summary && (
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.summary}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          {item.source && (
                            <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                              {item.source}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-600">{formatDate(item.published_date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <div>
              <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">Insights</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Topics and resources curated by AI</p>
            </div>
          </div>

          {topics.length === 0 ? (
            <div className="text-center py-16 text-zinc-600">
              <BookOpen className="mx-auto mb-3 w-8 h-8 opacity-40" />
              <p className="text-sm">No insights yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic: Topic) => (
                <div key={topic.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">{topic.name}</h3>
                    <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                      {topic.resources?.length ?? 0}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {topic.resources?.map((resource) => (
                      <li key={resource.id}>
                        {resource.url ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            {resource.title}
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400">{resource.title}</span>
                        )}
                        {resource.description && (
                          <p className="text-[10px] text-zinc-600 mt-0.5 ml-3.5">{resource.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
