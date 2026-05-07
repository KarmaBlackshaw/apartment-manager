import React, { useState, useMemo } from 'react'
import { View, FlatList, Pressable, Alert } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import dayjs from 'dayjs'
import { useTenant } from '~/hooks/useTenants'
import { useDocuments } from '~/hooks/useDocuments'
import { FilterChipBar } from '~/components/ui/FilterChipBar'
import { DocumentRow } from '~/components/documents/DocumentRow'
import { AppText } from '~/components/ui/AppText'
import type { DocCategory } from '~/components/documents/DocumentRow'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { colors } from '~/constants/theme'

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: tenant } = useTenant(id)
  const { documents, addDocument } = useDocuments(id)
  const [chipFilter, setChipFilter] = useState('all')

  const filteredDocs = useMemo(() => {
    if (chipFilter === 'all') return documents
    return documents.filter(d => d.category === chipFilter)
  }, [documents, chipFilter])

  async function handleAddDocument() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    })
    if (!result.canceled) {
      await addDocument({
        ref_type: 'TENANT',
        ref_id: id,
        title: `Document ${documents.length + 1}`,
        category: 'other',
        uri: result.assets[0].uri,
      })
    }
  }

  return (
    <ScreenLayout title={tenant ? `${tenant.full_name.split(' ').pop()} — Docs` : 'Documents'} backHref={`/(admin)/tenants/${id}`}>
      <FilterChipBar
        options={[
          { label: `All (${documents.length})`, value: 'all' },
          { label: 'Contract', value: 'contract' },
          { label: 'Gov ID', value: 'gov-id' },
          { label: 'Other', value: 'other' },
        ]}
        selected={chipFilter}
        onChange={setChipFilter}
      />

      <FlatList
        data={filteredDocs}
        keyExtractor={d => d.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item: doc }) => (
          <DocumentRow
            title={doc.title}
            category={doc.category as DocCategory}
            date={doc.created_at ? dayjs(doc.created_at).format('MMM D, YYYY') : '—'}
            onPress={() => Alert.alert('Document', doc.title)}
          />
        )}
        ListFooterComponent={
          <Pressable
            onPress={handleAddDocument}
            className="p-4 border border-border rounded-md mx-4 mt-2 items-center"
            style={{ borderStyle: 'dashed', borderWidth: 1.5 }}
          >
            <AppText style={{ color: colors.textLink }}>+ Add document or photo</AppText>
          </Pressable>
        }
        ListEmptyComponent={
          <View className="p-8 items-center">
            <AppText color="muted">No documents yet</AppText>
          </View>
        }
      />
    </ScreenLayout>
  )
}
