import 'dotenv/config'
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const server = new McpServer({
  name: "master-dash-mcp",
  version: "1.0.0",
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

const transport = new StdioServerTransport();
await server.connect(transport);
