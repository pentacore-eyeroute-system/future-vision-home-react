import { buildApiUrl } from "../config/apiUrlConfig";

export const recentlyDeletedApi = {
    getDeletedVisionistas: async () => {
        const token = localStorage.getItem('token');

        const response = await fetch(buildApiUrl('/visionistas/temporary-deleted-visionistas'), {
            method: 'GET',
            headers: {'Authorization' : `Bearer ${token}` },
        });

        const contentType = response.headers.get('content-type') || ''
        const payload = contentType.includes('application/json')
            ? await response.json().catch(() => null)
            : await response.text().then((text) => (text ? { message: text } : null)).catch(() => null)

        if (!response.ok) {
            throw new Error(payload?.message || `Request failed with status ${response.status}.`)
        }

        return payload;
    },

    getDeletedNews: async () => {
        const token = localStorage.getItem('token');

        const response = await fetch(buildApiUrl('/news/temporary-deleted-news'), {
            method: 'GET',
            headers: {'Authorization' : `Bearer ${token}` },
        });

        const contentType = response.headers.get('content-type') || ''
        const payload = contentType.includes('application/json')
            ? await response.json().catch(() => null)
            : await response.text().then((text) => (text ? { message: text } : null)).catch(() => null)

        if (!response.ok) {
            throw new Error(payload?.message || `Request failed with status ${response.status}.`)
        }

        return payload;
    },

    getDeletedGalleries : async () => {
        const token = localStorage.getItem('token');

        const response = await fetch(buildApiUrl('/gallery/temporary-deleted-galleries'), {
            method: 'GET',
            headers: {'Authorization' : `Bearer ${token}` },
        });

        const contentType = response.headers.get('content-type') || ''
        const payload = contentType.includes('application/json')
            ? await response.json().catch(() => null)
            : await response.text().then((text) => (text ? { message: text } : null)).catch(() => null)

        if (!response.ok) {
            throw new Error(payload?.message || `Request failed with status ${response.status}.`)
        }

        return payload;
    },

    getDeletedPartners: async () => {
        const token = localStorage.getItem('token');

        const response = await fetch(buildApiUrl('/partners/temporary-deleted-partners'), {
            method: 'GET',
            headers: {'Authorization' : `Bearer ${token}` },
        });

        const contentType = response.headers.get('content-type') || ''
        const payload = contentType.includes('application/json')
            ? await response.json().catch(() => null)
            : await response.text().then((text) => (text ? { message: text } : null)).catch(() => null)

        if (!response.ok) {
            throw new Error(payload?.message || `Request failed with status ${response.status}.`)
        }

        return payload;
    },
};