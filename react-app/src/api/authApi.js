import { buildApiUrl } from "../config/apiUrlConfig";

export const authApi = {
    loginAdmin: async (credentials) => {
        const response = await fetch(buildApiUrl('/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type' : 'application/json' },
            body: JSON.stringify(credentials)
        });

        const contentType = response.headers.get('content-type') || ''
        const payload = contentType.includes('application/json')
            ? await response.json().catch(() => null)
            : await response.text().then((text) => (text ? { message: text } : null)).catch(() => null)

        if (!response.ok) {
            throw payload;
        }

        return payload;
    }
};