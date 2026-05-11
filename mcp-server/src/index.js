import 'dotenv/config'
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const server = new McpServer({
  name: "master-dash-mcp",
  version: "1.0.0",
  instructions: `
You are connected to the Master Dash MCP server — a personal command center backed by Supabase.

## News Research — Freshness Rules

Apply these rules every time you research and populate news:

1. **24/48-hour window** — Only include stories published or updated within the last 24 hours. On Mondays, extend to 48 hours to cover the weekend.
2. **No padding** — Skip any topic with no new content. Do not fill slots with stale stories.
3. **No repeats without new development** — If a company or topic appeared in recent news, only re-include it if there is a genuinely new development: new funding round, product launch, partnership, acquisition, or meaningful update.
4. **Priority order:** breaking news → new product launches → new research/papers → fresh funding announcements → notable founder/operator insights.

## Workflow when asked to update news

1. Call \`get_insights\` to load current topics and their source URLs.
2. Research each topic using those sources as reference points.
3. Apply freshness rules — drop any topic with nothing new.
4. Call \`add_news_batch\` with all qualifying items in one shot.
5. Default date is today unless the user specifies otherwise.
6. After adding news, run a resource optimization pass:
   - Resources without URLs are research direction labels — they tell you what to look for within a topic. Do NOT suggest removing them just because they lack a URL.
   - Only suggest removing a resource if it is: a broken URL, fully duplicated by a better source already in the list, or genuinely outdated/irrelevant to the topic.
   - Suggest adding new URL-based sources when a topic lacks coverage or when a specific publication proved highly useful during this research run.
   - Call \`add_optimizations_batch\` with your suggestions.
   - Be specific in the reason field — explain exactly why you're recommending the change based on what you observed during research.
  `.trim(),
});

// Create a topic
server.tool(
  "create_topic",
  { name: z.string().describe("The topic name e.g. 'AI & Machine Learning'") },
  async ({ name }) => {
    const { data, error } = await supabase
      .from("topics")
      .insert({ name })
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };

    return {
      content: [{ type: "text", text: `Topic created: "${data.name}" (id: ${data.id})` }],
    };
  }
);

// Add a resource under a topic
server.tool(
  "add_resource",
  {
    topic_id: z.string().describe("The topic ID to add the resource to"),
    title: z.string().describe("Title of the resource"),
    url: z.string().url().optional().describe("URL of the resource"),
    description: z.string().optional().describe("Short description of the resource"),
  },
  async ({ topic_id, title, url, description }) => {
    const { data, error } = await supabase
      .from("resources")
      .insert({ topic_id, title, url, description })
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };

    return {
      content: [{ type: "text", text: `Resource added: "${data.title}" under topic ${topic_id}` }],
    };
  }
);

// Create a topic with resources in one shot
server.tool(
  "create_topic_with_resources",
  {
    name: z.string().describe("The topic name"),
    resources: z.array(
      z.object({
        title: z.string(),
        url: z.string().url().optional(),
        description: z.string().optional(),
      })
    ).describe("List of resources for this topic"),
  },
  async ({ name, resources }) => {
    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .insert({ name })
      .select()
      .single();

    if (topicError) return { content: [{ type: "text", text: `Error: ${topicError.message}` }] };

    const resourceRows = resources.map((r) => ({ ...r, topic_id: topic.id }));
    const { error: resError } = await supabase.from("resources").insert(resourceRows);

    if (resError) return { content: [{ type: "text", text: `Error: ${resError.message}` }] };

    return {
      content: [{
        type: "text",
        text: `Created topic "${topic.name}" with ${resources.length} resource(s). Topic ID: ${topic.id}`,
      }],
    };
  }
);

// Get all insights as JSON for the dashboard
server.tool(
  "get_insights",
  {},
  async () => {
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("*, resources(*)")
      .order("created_at", { ascending: false });

    if (topicsError) return { content: [{ type: "text", text: `Error: ${topicsError.message}` }] };

    return {
      content: [{ type: "text", text: JSON.stringify(topics, null, 2) }],
    };
  }
);

// Delete a topic
server.tool(
  "delete_topic",
  { topic_id: z.string().describe("The topic ID to delete") },
  async ({ topic_id }) => {
    const { error } = await supabase.from("topics").delete().eq("id", topic_id);
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Topic ${topic_id} deleted.` }] };
  }
);

// Add a news item
server.tool(
  "add_news",
  {
    topic_id: z.string().describe("The topic ID this news belongs to"),
    title: z.string().describe("Headline of the news item"),
    summary: z.string().optional().describe("Short summary of the news"),
    url: z.string().url().optional().describe("Link to the full article"),
    source: z.string().optional().describe("Source name e.g. 'TechCrunch'"),
    published_date: z.string().optional().describe("Date in YYYY-MM-DD format, defaults to today"),
  },
  async ({ topic_id, title, summary, url, source, published_date }) => {
    const { data, error } = await supabase
      .from("news")
      .insert({ topic_id, title, summary, url, source, published_date })
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };

    return {
      content: [{ type: "text", text: `News added: "${data.title}" (${data.published_date})` }],
    };
  }
);

// Add multiple news items at once
server.tool(
  "add_news_batch",
  {
    items: z.array(z.object({
      topic_id: z.string(),
      title: z.string(),
      summary: z.string().optional(),
      url: z.string().url().optional(),
      source: z.string().optional(),
      published_date: z.string().optional(),
    })).describe("List of news items to add"),
  },
  async ({ items }) => {
    const { error } = await supabase.from("news").insert(items);
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Added ${items.length} news item(s).` }] };
  }
);

// Get news — optionally filter by topic or date
server.tool(
  "get_news",
  {
    topic_id: z.string().optional().describe("Filter by topic ID"),
    date: z.string().optional().describe("Filter by date YYYY-MM-DD"),
    limit: z.number().optional().describe("Max number of results, default 20"),
  },
  async ({ topic_id, date, limit = 20 }) => {
    let query = supabase
      .from("news")
      .select("*, topics(name)")
      .order("published_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (topic_id) query = query.eq("topic_id", topic_id);
    if (date) query = query.eq("published_date", date);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// Add resource optimization suggestions in bulk
server.tool(
  "add_optimizations_batch",
  {
    items: z.array(z.object({
      type: z.enum(["add", "remove"]).describe("'add' to suggest a new resource, 'remove' to suggest removing one"),
      topic_id: z.string().describe("The topic this suggestion applies to"),
      resource_id: z.string().optional().describe("Required for 'remove' — the resource ID to remove"),
      title: z.string().describe("Resource title"),
      url: z.string().url().optional().describe("URL (required for 'add' suggestions)"),
      reason: z.string().describe("Why this resource should be added or removed"),
    })).describe("List of optimization suggestions"),
  },
  async ({ items }) => {
    const { error } = await supabase.from("resource_optimizations").insert(items);
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Added ${items.length} optimization suggestion(s).` }] };
  }
);

// Get all pending optimization suggestions
server.tool(
  "get_optimizations",
  {},
  async () => {
    const { data, error } = await supabase
      .from("resource_optimizations")
      .select("*, topics(name), resources(title)")
      .order("created_at", { ascending: false });
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// Dismiss an optimization suggestion
server.tool(
  "dismiss_optimization",
  { optimization_id: z.string().describe("The optimization ID to dismiss") },
  async ({ optimization_id }) => {
    const { error } = await supabase.from("resource_optimizations").delete().eq("id", optimization_id);
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Optimization ${optimization_id} dismissed.` }] };
  }
);

// Delete a news item
server.tool(
  "delete_news",
  { news_id: z.string().describe("The news item ID to delete") },
  async ({ news_id }) => {
    const { error } = await supabase.from("news").delete().eq("id", news_id);
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `News item ${news_id} deleted.` }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
