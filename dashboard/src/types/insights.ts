export type Resource = {
  id: string
  topic_id: string
  title: string
  url: string | null
  description: string | null
  created_at: string
}

export type Topic = {
  id: string
  name: string
  created_at: string
  resources: Resource[]
}

export type NewsItem = {
  id: string
  topic_id: string | null
  title: string
  summary: string | null
  url: string | null
  source: string | null
  published_date: string
  created_at: string
  topics: { name: string } | null
}
