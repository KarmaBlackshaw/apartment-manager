import React, { useState, useMemo } from 'react'
import { View, FlatList, Pressable, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import dayjs from 'dayjs'
import { useTenant } from '../../../../hooks/useTenants'
import { useDocuments } from '../../../../hooks/useDocuments'
import {
  ScreenHeader,
  FilterChipBar,
  DocumentRow,
  AppText,
} from '../../../../components/ui'
import type { DocCategory } from '../../../../components/ui'
import { colors } from '../../../../constants/theme'

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
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title={tenant ? `${tenant.full_name.split(' ').pop()} — Docs` : 'Documents'}
        left="back"
      />

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
          <Pressable onPress={handleAddDocument} style={styles.addRow}>
            <AppText style={{ color: colors.textLink }}>+ Add document or photo</AppText>
          </Pressable>
        }
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <AppText color="muted">No documents yet</AppText>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  addRow: {
    padding: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
})
