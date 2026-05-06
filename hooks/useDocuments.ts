import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '../db'
import { documents as documentsTable } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid/non-secure'

export interface Document {
  id: string
  ref_type: string
  ref_id: string
  title: string
  category: string
  uri: string | null
  created_at: string
}

export interface AddDocumentInput {
  ref_type: string
  ref_id: string
  title: string
  category: string
  uri?: string
}

export function useDocuments(refId: string, refType = 'TENANT') {
  const qc = useQueryClient()

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', refType, refId],
    queryFn: async () => {
      const rows = await db
        .select()
        .from(documentsTable)
        .where(and(eq(documentsTable.ref_type, refType), eq(documentsTable.ref_id, refId)))
      return rows as Document[]
    },
    enabled: !!refId,
  })

  const { mutateAsync: addDocument } = useMutation({
    mutationFn: async (input: AddDocumentInput) => {
      const id = nanoid()
      const now = new Date().toISOString()
      await db.insert(documentsTable).values({
        id,
        ref_type: input.ref_type,
        ref_id: input.ref_id,
        title: input.title,
        category: input.category,
        uri: input.uri ?? null,
        created_at: now,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents', refType, refId] }),
  })

  return { documents, addDocument }
}
