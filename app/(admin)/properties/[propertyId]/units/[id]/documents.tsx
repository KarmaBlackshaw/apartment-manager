import React from 'react'
import { View, FlatList, TouchableOpacity, Text, Alert } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import dayjs from 'dayjs'
import { useDocuments } from '../../../../../../hooks/useDocuments'
import { useUnit } from '../../../../../../hooks/useUnits'
import { FilterChipBar, LoadingSpinner } from '../../../../../../components/ui'
import { DocumentRow } from '../../../../../../components/documents/DocumentRow'
import type { DocCategory } from '../../../../../../components/documents/DocumentRow'
import { ScreenLayout } from '../../../../../../layouts/ScreenLayout'
import { colors } from '../../../../../../constants/theme'

const CATEGORY_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Contract', value: 'contract' },
  { label: 'Photos', value: 'photo' },
  { label: 'Permits', value: 'permit' },
]

export default function UnitDocumentsScreen() {
  const { propertyId, id } = useLocalSearchParams<{ propertyId: string; id: string }>()
  const { data: unit } = useUnit(id)
  const { documents, addDocument } = useDocuments(id, 'UNIT')
  const [filter, setFilter] = React.useState('all')

  const filtered = filter === 'all' ? documents : documents.filter((d) => d.category === filter)

  const title = unit ? `${unit.unit_number} — Docs` : 'Documents'

  const filterOptions = CATEGORY_FILTERS.map((opt) => ({
    ...opt,
    label: opt.value === 'all' ? `All (${documents.length})` : opt.label,
  }))

  async function handleAddDocument() {
    Alert.alert('Add Document', 'Choose source', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          })
          if (!result.canceled && result.assets[0]) {
            await addDocument({
              ref_type: 'UNIT',
              ref_id: id,
              title: `Photo ${dayjs().format('MMM D, YYYY')}`,
              category: 'photo',
              uri: result.assets[0].uri,
            })
          }
        },
      },
      {
        text: 'Library',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          })
          if (!result.canceled && result.assets[0]) {
            await addDocument({
              ref_type: 'UNIT',
              ref_id: id,
              title: `Document ${dayjs().format('MMM D, YYYY')}`,
              category: 'photo',
              uri: result.assets[0].uri,
            })
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  return (
    <ScreenLayout title={title}>
      <FilterChipBar
        options={filterOptions}
        selected={filter}
        onChange={setFilter}
      />

      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <DocumentRow
            title={item.title}
            category={item.category as DocCategory}
            date={dayjs(item.created_at).format('MMM D, YYYY')}
            onPress={() => {}}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-12 px-4">
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>
              No {filter === 'all' ? '' : filter} documents yet
            </Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            onPress={handleAddDocument}
            className="mx-4 mt-3 rounded-xl items-center justify-center py-4"
            style={{
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: colors.border,
            }}
            accessibilityRole="button"
          >
            <Text style={{ color: colors.textMuted }} className="text-sm">
              + Add document or photo
            </Text>
          </TouchableOpacity>
        }
      />
    </ScreenLayout>
  )
}
