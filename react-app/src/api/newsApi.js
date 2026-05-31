import { buildApiUrl } from "../config/apiUrlConfig";

export const newsApi = {
    getNews: async () => {
        const response = await fetch(buildApiUrl('/news/get-all-news'));

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