import axios from 'axios';
import { VITE_API_BASE_URL } from '../config/apiUrlConfig';
import { reviewAuthConfig } from '../config/reviewAuthConfig';

const API = axios.create({
  baseURL: getReviewBaseUrl(),
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
      localStorage.setItem('token', token);
    }

    return normalizeSession(payload.result?.user || payload.result || {});
  },

  getCurrentSession: async () => {
    if (!reviewAuthConfig.endpoints.authSession) {
      return null;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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
