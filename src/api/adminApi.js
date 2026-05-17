/**
 * Frontend-only Admin API
 * Stores admin content in localStorage so the dashboard behaves more like an MVP
 * while the real backend is still being built.
 */

const STORAGE_KEY = 'fvh-admin-dashboard-v2'

const createImage = (id, name, url) => ({ id, name, url })

const createDefaultState = () => ({
  nextId: 100,
  nextDeletedId: 1000,
  visionistas: [
    {
      id: 1,
      vis_fullname: 'Jessa Mae',
      vis_age: 18,
      vis_story: 'Learns braille, communication, and life skills with growing confidence.',
      vis_is_archived: false,
      vis_images: [createImage('vis-1', 'jessa.png', '/images/jessa.png')],
    },
  ],
  partners: [
    {
      id: 2,
      par_fullname: 'Save the Children',
      par_type: 'organization',
    },
  ],
  news: [
    {
      id: 3,
      news_title: '11th Anniversary',
      news_description: 'A celebration of milestones, stories, and community support.',
      news_date: '2025-03-27',
      news_images: [createImage('news-3', 'newsletter-1.png', '/images/newsletter-1.png')],
    },
  ],
  gallery: [
    {
      id: 4,
      gal_title: 'Braille Day',
      gal_description: 'Snapshots from a day focused on learning, reading, and inclusion.',
      gal_date: '2025-01-11',
      gal_images: [
        createImage('gal-4-1', 'braille-1.png', '/images/Braille%201.png'),
        createImage('gal-4-2', 'braille-2.png', '/images/Braille%202.png'),
      ],
    },
  ],
  deleted: [],
})

const mockDelay = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 250))

const cloneData = (data) => JSON.parse(JSON.stringify(data))

const isBrowser = typeof window !== 'undefined'

const normalizeImageEntries = (value) => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item, index) => {
        if (typeof item === 'string') {
          return createImage(`legacy-${index}`, `Image ${index + 1}`, item)
        }

        return createImage(
          item.id || `image-${Date.now()}-${index}`,
          item.name || `Image ${index + 1}`,
          item.url || item.previewUrl || ''
        )
      })
      .filter((item) => item.url)
  }

  if (typeof value === 'string') {
    return [createImage('legacy-0', 'Image 1', value)]
  }

  return []
}

const readState = () => {
  if (!isBrowser) {
    return createDefaultState()
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    const next = createDefaultState()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  }

  try {
    const parsed = JSON.parse(raw)

    return {
      ...createDefaultState(),
      ...parsed,
      visionistas: (parsed.visionistas || []).map((item) => ({
        ...item,
        vis_images: normalizeImageEntries(item.vis_images || item.vis_pic_path),
      })),
      partners: parsed.partners || [],
      news: (parsed.news || []).map((item) => ({
        ...item,
        news_images: normalizeImageEntries(item.news_images || item.news_pic_path),
      })),
      gallery: (parsed.gallery || []).map((item) => ({
        ...item,
        gal_images: normalizeImageEntries(item.gal_images || item.gal_pic_path),
      })),
      deleted: (parsed.deleted || []).map((item) => ({
        ...item,
        item: normalizeDeletedItemPayload(item),
      })),
    }
  } catch {
    const next = createDefaultState()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  }
}

const writeState = (state) => {
  if (isBrowser) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  return state
}

const updateState = (updater) => {
  const state = readState()
  const result = updater(state)
  writeState(state)
  return result
}

const buildDeletedTitle = (type, item) => {
  if (type === 'visionista') return item.vis_fullname
  if (type === 'partner') return item.par_fullname
  if (type === 'news') return item.news_title
  return item.gal_title
}

function normalizeDeletedItemPayload(record) {
  if (!record?.item) return record?.item || null

  if (record.type === 'visionista') {
    return {
      ...record.item,
      vis_images: normalizeImageEntries(record.item.vis_images || record.item.vis_pic_path),
    }
  }

  if (record.type === 'news') {
    return {
      ...record.item,
      news_images: normalizeImageEntries(record.item.news_images || record.item.news_pic_path),
    }
  }

  if (record.type === 'gallery') {
    return {
      ...record.item,
      gal_images: normalizeImageEntries(record.item.gal_images || record.item.gal_pic_path),
    }
  }

  return record.item
}

const createDeletedRecord = (state, sourceKey, type, item) => ({
  id: state.nextDeletedId++,
  sourceKey,
  type,
  displayTitle: buildDeletedTitle(type, item),
  deletedAt: new Date().toISOString().split('T')[0],
  item,
})

const normalizeVisionista = (data) => ({
  vis_fullname: data.vis_fullname || '',
  vis_age: data.vis_age || '',
  vis_story: data.vis_story || '',
  vis_is_archived: Boolean(data.vis_is_archived),
  vis_images: normalizeImageEntries(data.vis_images || data.vis_pic_path),
})

const normalizePartner = (data) => ({
  par_fullname: data.par_fullname || '',
  par_type: data.par_type || 'organization',
})

const normalizeNews = (data) => ({
  news_title: data.news_title || data.title || '',
  news_description: data.news_description || data.description || '',
  news_date: data.news_date || data.date || '',
  news_images: normalizeImageEntries(data.news_images || data.images || data.pic_path),
})

const normalizeGallery = (data) => ({
  gal_title: data.gal_title || data.title || '',
  gal_description: data.gal_description || data.description || '',
  gal_date: data.gal_date || data.date || '',
  gal_images: normalizeImageEntries(data.gal_images || data.images || data.pic_path),
})

const readCollection = (key) => mockDelay(cloneData(readState()[key]))

const createRecord = (key, normalizer) => async (data) =>
  mockDelay(
    updateState((state) => {
      const record = { id: state.nextId++, ...normalizer(data) }
      state[key].unshift(record)
      return cloneData(record)
    })
  )

const updateRecord = (key, normalizer) => async (id, data) =>
  mockDelay(
    updateState((state) => {
      const index = state[key].findIndex((item) => item.id === id)
      if (index === -1) return null

      state[key][index] = {
        ...state[key][index],
        ...normalizer(data),
      }

      return cloneData(state[key][index])
    })
  )

const softDeleteRecord = (key, type) => async (id) =>
  mockDelay(
    updateState((state) => {
      const index = state[key].findIndex((item) => item.id === id)
      if (index === -1) return { success: false }

      const [item] = state[key].splice(index, 1)
      state.deleted.unshift(createDeletedRecord(state, key, type, item))
      return { success: true }
    })
  )

export const adminApi = {
  getVisionistas: () => readCollection('visionistas'),
  createVisionista: createRecord('visionistas', normalizeVisionista),
  updateVisionista: updateRecord('visionistas', normalizeVisionista),
  deleteVisionista: softDeleteRecord('visionistas', 'visionista'),

  getPartners: () => readCollection('partners'),
  createPartner: createRecord('partners', normalizePartner),
  updatePartner: updateRecord('partners', normalizePartner),
  deletePartner: softDeleteRecord('partners', 'partner'),

  getNews: () => readCollection('news'),
  createNews: createRecord('news', normalizeNews),
  updateNews: updateRecord('news', normalizeNews),
  deleteNews: softDeleteRecord('news', 'news'),

  getGallery: () => readCollection('gallery'),
  createGallery: createRecord('gallery', normalizeGallery),
  updateGallery: updateRecord('gallery', normalizeGallery),
  deleteGallery: softDeleteRecord('gallery', 'gallery'),

  getDeletedItems: () => readCollection('deleted'),

  restoreDeletedItem: (deletedId) =>
    mockDelay(
      updateState((state) => {
        const index = state.deleted.findIndex((item) => item.id === deletedId)
        if (index === -1) return { success: false }

        const [record] = state.deleted.splice(index, 1)
        state[record.sourceKey].unshift(record.item)
        return { success: true, item: cloneData(record.item) }
      })
    ),

  permanentlyDeleteItem: (deletedId) =>
    mockDelay(
      updateState((state) => {
        state.deleted = state.deleted.filter((item) => item.id !== deletedId)
        return { success: true }
      })
    ),
}
