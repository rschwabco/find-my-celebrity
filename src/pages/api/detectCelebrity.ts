// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { queryEmbedding } from '../../pinecone'
import { getEmbeddings } from '../../huggingface'
import { ScoredVector } from '@pinecone-database/pinecone/dist/pinecone-generated-ts'

type Profile = {
  id: string,
  birthday: string,
  name: string,
  place_of_birth: string,
  popularity: number,
  profile_path: string,
} | undefined

type QueryResult = {
  metadata?: Profile,
  confidence?: number | undefined,
} | undefined

type Data = {
  results?: QueryResult[] | undefined,
  message?: string | undefined,
} | undefined


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { image } = JSON.parse(req.body)

    const embeddings = await getEmbeddings(image.replace("data:image/jpeg;base64,", ""))
    if (!embeddings) {
      res.status(500).json({
        message: "No face was detected"
      })
      return
    }
    const queryResult: ScoredVector[] | undefined = await queryEmbedding({ values: embeddings, namespace: "" })

    const results: QueryResult[] | undefined = queryResult && queryResult?.map((result) => {
      console.log("result.metadata", result)
      return {
        metadata: result.metadata as Profile,
        confidence: result.score
      }
    })

    res.status(200).json({
      results,
      message: "Success"
    })
  }
}
