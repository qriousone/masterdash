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
