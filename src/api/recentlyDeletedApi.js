import { buildApiUrl } from "../config/apiUrlConfig";

export const recentlyDeletedApi = {
    getDeletedVisionistas: async () => {
        const token = sessionStorage.getItem('token');

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
        const token = sessionStorage.getItem('token');

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
        const token = sessionStorage.getItem('token');

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
        const token = sessionStorage.getItem('token');

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

    restoreDeletedVisionista: async (id, data) => {
        const token = sessionStorage.getItem('token');

        const response = await fetch(buildApiUrl(`/visionistas/temporary-delete-visionista/${id}`), {
            method: 'PATCH',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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

    restoreDeletedNews: async (id, data) => {
        const token = sessionStorage.getItem('token');

        const response = await fetch(buildApiUrl(`/news/temporary-delete-news/${id}`), {
            method: 'PATCH',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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

    restoreDeletedGallery: async (id, data) => {
        const token = sessionStorage.getItem('token');

        const response = await fetch(buildApiUrl(`/gallery/temporary-delete-gallery/${id}`), {
            method: 'PATCH',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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

    restoreDeletedPartner: async (id, data) => {
        const token = sessionStorage.getItem('token');

        const response = await fetch(buildApiUrl(`/partners/temporary-delete-partner/${id}`), {
            method: 'PATCH',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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

    permanentDeleteVisionista: async (id) => {
        const token = sessionStorage.getItem('token');

        const response = await fetch(buildApiUrl(`/visionistas/soft-delete-visionista/${id}`), {
            method: 'PUT',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
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

    permanentDeleteNews: async (id) => {
        const token = sessionStorage.getItem('token');

        const response = await fetch(buildApiUrl(`/news/soft-delete-news/${id}`), {
            method: 'PUT',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
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

    permanentDeleteGallery: async (id) => {
        const token = sessionStorage.getItem('token');

        const response = await fetch(buildApiUrl(`/gallery/soft-delete-gallery/${id}`), {
            method: 'PUT',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
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

    permanentDeletePartner: async (id) => {
        const token = sessionStorage.getItem('token');

        const response = await fetch(buildApiUrl(`/partners/soft-delete-partner/${id}`), {
            method: 'PUT',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
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