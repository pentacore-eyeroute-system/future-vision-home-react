/**
 * Admin API Service (Mock)
 * These functions act as a bridge between the frontend and backend.
 * Backend developers can replace the resolve data with real fetch/axios calls.
 */

const mockDelay = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 500))

export const adminApi = {
  // Visionistas
  getVisionistas: () => mockDelay([
    { id: 1, vis_fullname: 'Jessa Mae', vis_age: 18, vis_story: '...', vis_is_archived: false },
  ]),
  createVisionista: (data) => mockDelay({ id: Date.now(), ...data }),
  updateVisionista: (id, data) => mockDelay({ id, ...data }),
  deleteVisionista: (id) => mockDelay({ success: true }),

  // Partners
  getPartners: () => mockDelay([
    { id: 1, par_fullname: 'Save the Children', par_type: 'NGO' },
  ]),
  createPartner: (data) => mockDelay({ id: Date.now(), ...data }),
  updatePartner: (id, data) => mockDelay({ id, ...data }),
  deletePartner: (id) => mockDelay({ success: true }),

  // News
  getNews: () => mockDelay([
    { id: 1, news_title: '11th Anniversary', news_description: '...', news_date: '2025-03-27' },
  ]),
  createNews: (data) => mockDelay({ id: Date.now(), ...data }),
  updateNews: (id, data) => mockDelay({ id, ...data }),
  deleteNews: (id) => mockDelay({ success: true }),

  // Gallery
  getGallery: () => mockDelay([
    { id: 1, gal_title: 'Braille Day', gal_description: '...', gal_date: '2025-01-11' },
  ]),
  createGallery: (data) => mockDelay({ id: Date.now(), ...data }),
  updateGallery: (id, data) => mockDelay({ id, ...data }),
  deleteGallery: (id) => mockDelay({ success: true }),
}
