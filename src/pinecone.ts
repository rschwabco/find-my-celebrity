import { PineconeClient, QueryRequest } from "@pinecone-database/pinecone";
import { ScoredVector } from "@pinecone-database/pinecone/dist/pinecone-generated-ts";


let pineconeClient: PineconeClient = new PineconeClient();
let initialized = false;

const indexName = process.env.PINECONE_INDEX_NAME || "celebrity-match"
const apiKey = process.env.PINECONE_API_KEY!
const environment = process.env.PINECONE_ENVIRONMENT!

async function getClient() {
  if (!initialized) {
    initialized = true;
    await pineconeClient.init({
      apiKey,
      environment,
    });
    return pineconeClient
  } else {
    return pineconeClient
  }
}

const queryEmbedding = async ({ values, namespace }: { values: number[], namespace: string }) => {
  const client = await getClient()
  const index = client.Index(indexName);
  const queryRequest: QueryRequest = {
    topK: 3,
    vector: values,
    includeMetadata: true,
    namespace,
  };
  try {
    const response = await index.query(queryRequest);
    const matches = response.data?.matches && response.data?.matches as ScoredVector[];
    return matches;
  } catch (e) {
    //@ts-ignore
    console.log("failed", e.response.data);
  }
};

export {
  queryEmbedding
}