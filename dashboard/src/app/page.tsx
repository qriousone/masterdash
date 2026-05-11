import { createClient } from '@supabase/supabase-js'
import type { NewsItem } from '@/types/insights'
import SignalFeed from '@/components/SignalFeed'

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
    month: 'long', day: 'numeric', year: 'numeric', weekday: 'long',
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

      {/* Header */}
      <div className="border-b border-zinc-800/60 px-10 py-7">
        <div className="flex items-start justify-between">
          <div className="max-w-2xl">
            <p className="text-[9px] font-semibold tracking-[0.24em] text-amber-500/80 uppercase mb-3">
              Today's Signal
            </p>
            <h1
              className="text-[2rem] leading-[1.15] font-bold text-white"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontStyle: "italic" }}
            >
              Protect energy. Push leverage.<br />Build ownership.
            </h1>
            <p className="text-zinc-500 mt-3 text-[13px] leading-relaxed tracking-wide">
              Focus on the few things that move everything forward.
            </p>
          </div>
          <div className="text-right shrink-0 ml-12 pt-1">
            <p className="text-[12px] text-zinc-400 tracking-wide">{getDate()}</p>
            <div className="flex items-center justify-end gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/80 inline-block" />
              <p className="text-[11px] text-zinc-600">{getGreeting()}.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-10 space-y-8 flex-1">

        {/* Signal Feed — single card, client component */}
        <SignalFeed news={news} groupedNews={groupedNews} topics={topics} />


      </div>
    </div>
  )
}
