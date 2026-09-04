import axios from 'axios';
import { VITE_API_BASE_URL } from '../config/apiUrlConfig';
import { reviewAuthConfig } from '../config/reviewAuthConfig';

const API = axios.create({
  baseURL: `${VITE_API_BASE_URL}/reviews`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const normalizeUser = (source = {}) => ({
  id: source.id ?? source.userId ?? source.sub ?? source.googleId ?? source.email ?? 'google-user',
  name: source.name ?? source.fullName ?? source.displayName ?? source.email ?? 'Google User',
  email: source.email ?? '',
  picture: source.picture ?? source.avatarUrl ?? source.imageUrl ?? '',
});

const normalizeSession = (payload) => {
  const userSource =
    payload?.user ??
    payload?.profile ??
    (payload?.fullname || payload?.email ? payload : null);

  if (!userSource) {
    throw new Error('Your backend must return the signed-in user profile.');
  }

  const user = normalizeUser(userSource);

  return {
    token: payload?.token ?? payload?.sessionToken ?? payload?.accessToken ?? null,
    user,
  };
};

export const reviewApi = {
  canRestoreSession: () => Boolean(reviewAuthConfig.endpoints.authSession),

  authenticateWithGoogle: async (googleIdToken) => {
    const response = await axios.post(`${VITE_API_BASE_URL}/reviewer-auth/login`, { googleIdToken });
    const payload = response.data;

    // Save token if returned in response
    const token = payload.result?.token || payload.result?.user?.token;
    if (token) {
      sessionStorage.setItem('token', token);
    }

    return normalizeSession(payload.result?.user || payload.result || {});
  },

  getCurrentSession: async () => {
    if (!reviewAuthConfig.endpoints.authSession) {
      return null;
    }

    const token = sessionStorage.getItem('token');
    const response = await axios.get(reviewAuthConfig.buildApiUrl(reviewAuthConfig.endpoints.authSession), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const payload = response.data;
    return payload ? normalizeSession(payload) : null;
  },

  getReviews: async () => {
    const response = await API.get('/get-reviews');
    return response.data.result || response.data || [];
  },

  submitReview: async (session, formData) => {
    const token = typeof session === 'object' && session !== null ? session.token : session;
    const response = await API.post('/add-review', formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.result || response.data;
  },

  updateReview: async (session, id, formData) => {
    const token = typeof session === 'object' && session !== null ? session.token : session;
    const response = await API.patch(`/update-review/${id}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.result || response.data;
  },

  deleteReview: async (session, id) => {
    const token = typeof session === 'object' && session !== null ? session.token : session;
    const response = await API.put(`/soft-delete-review/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export const normalizeReview = (item) => {
  if (!item) return null;

  // Shape 1: { user, review }
  if (item.review && typeof item.review === 'object') {
    const userEmail = item.user?.usr_email || '';
    const fallbackName = userEmail ? userEmail.split('@')[0] : 'Anonymous User';
    return {
      id: item.review.id,
      name: item.user?.usr_fullname || item.user?.name || fallbackName,
      picture: item.user?.usr_pic_url || item.user?.picture || '',
      rating: Number(item.review.rev_rating || 5),
      comment: item.review.rev_feedback || '',
      date: item.review.rev_date || null,
      userId: item.user?.id || null,
      email: userEmail,
    };
  }

  // Shape 2: { id, rev_linked_reviewer_id, rev_rating, rev_feedback, ... }
  if (item.rev_linked_reviewer_id !== undefined || item.rev_rating !== undefined) {
    return {
      id: item.id,
      name: item.name || 'Anonymous User',
      picture: item.picture || '',
      rating: Number(item.rev_rating || 5),
      comment: item.rev_feedback || '',
      date: item.createdAt || item.updatedAt || null,
      userId: item.rev_linked_reviewer_id || null,
      email: item.email || '',
    };
  }

  // Shape 3: original normalized shape
  return {
    id: item.id,
    name: item.name || 'Anonymous User',
    picture: item.picture || '',
    rating: Number(item.rating || 5),
    comment: item.comment || '',
    date: item.date || null,
    userId: item.userId || null,
    email: item.email || '',
  };
};

export const getApiErrorMessage = (error, defaultMessage = 'An unexpected error occurred.') => {
  if (!error) return defaultMessage;

  const data = error.response?.data;

  if (typeof data === 'string' && data.trim() && !data.includes('<!DOCTYPE') && !data.includes('<html')) {
    return data.trim();
  }

  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message.trim();
    }
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error.trim();
    }
    if (typeof data.error?.message === 'string' && data.error.message.trim()) {
      return data.error.message.trim();
    }
    if (typeof data.msg === 'string' && data.msg.trim()) {
      return data.msg.trim();
    }
    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail.trim();
    }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (typeof first === 'string' && first.trim()) return first.trim();
      if (first && typeof first.message === 'string' && first.message.trim()) return first.message.trim();
      if (first && typeof first.msg === 'string' && first.msg.trim()) return first.msg.trim();
    }
    if (data.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors)
        .flat()
        .filter((val) => typeof val === 'string' && val.trim());
      if (messages.length > 0) {
        return messages.join('. ');
      }
    }
    if (typeof data.result === 'string' && data.result.trim()) {
      return data.result.trim();
    }
    if (typeof data.result?.message === 'string' && data.result.message.trim()) {
      return data.result.message.trim();
    }
  }

  if (
    typeof error.message === 'string' &&
    error.message.trim() &&
    !error.message.toLowerCase().includes('request failed with status code')
  ) {
    return error.message.trim();
  }

  return defaultMessage;
};
