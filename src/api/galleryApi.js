import { buildApiUrl } from "../config/apiUrlConfig";

export const galleryApi = {
    createGallery: async (formData) => {
        const token = localStorage.getItem('token');
    
        const response = await fetch(buildApiUrl('/gallery/create-gallery'), {
            method: 'POST',
            headers: {'Authorization' : `Bearer ${token}` },
            body: formData,
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

    getGalleries: async () => {
        const response = await fetch(buildApiUrl('/gallery/get-all-galleries'));

        const contentType = response.headers.get('content-type') || ''
        const payload = contentType.includes('application/json')
            ? await response.json().catch(() => null)
            : await response.text().then((text) => (text ? { message: text } : null)).catch(() => null)

        if (!response.ok) {
            throw new Error(payload?.message || `Request failed with status ${response.status}.`)
        }

        return payload;
    },

    updateGallery: async (id, formData) => {
        const token = localStorage.getItem('token');

        const response = await fetch(buildApiUrl(`/gallery/update-gallery-info/${id}`), {
            method: 'PATCH',
            headers: {'Authorization' : `Bearer ${token}` },
            body: formData,
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

    temporaryDeleteGallery: async (id, data) => {
        const token = localStorage.getItem('token');

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
    }
};