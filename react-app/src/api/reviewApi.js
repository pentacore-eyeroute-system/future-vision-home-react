import { reviewAuthConfig } from '../config/reviewAuthConfig'
import { buildApiUrl } from '../config/apiUrlConfig';

const request = async (endpoint, { method = 'GET', body, token } = {}) => {
  const response = await fetch(reviewAuthConfig.buildApiUrl(endpoint), {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().then((text) => (text ? { message: text } : null)).catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}.`)
  }

  return payload
}

const normalizeUser = (source = {}) => ({
  id: source.id ?? source.userId ?? source.sub ?? source.googleId ?? source.email ?? 'google-user',
  name: source.name ?? source.fullName ?? source.displayName ?? source.email ?? 'Google User',
  email: source.email ?? '',
  picture: source.picture ?? source.avatarUrl ?? source.imageUrl ?? '',
})

const normalizeSession = (payload) => {
  const userSource =
    payload?.user ??
    payload?.profile ??
    (payload?.fullname || payload?.email ? payload : null)

  if (!userSource) {
    throw new Error('Your backend must return the signed-in user profile.')
  }

  const user = normalizeUser(userSource)

  return {
    token: payload?.token ?? payload?.sessionToken ?? payload?.accessToken ?? null,
    user,
  }
}

export const normalizeReview = (review = {}, fallbackUser = null) => {
  const author = review.user ?? review.author ?? fallbackUser ?? {}
  const reviewer = normalizeUser(author)

  return {
    id: review.id ?? review.reviewId ?? review.review_id ?? `${reviewer.id}-${review.createdAt ?? review.date ?? Date.now()}`,
    name: reviewer.name,
    picture: reviewer.picture,
    rating: Number(review.rating ?? review.stars ?? 5),
    comment: review.comment ?? review.review ?? review.message ?? '',
    date: review.createdAt ?? review.created_at ?? review.date ?? new Date().toISOString(),
  }
}

export const reviewApi = {
  canRestoreSession: () => Boolean(reviewAuthConfig.endpoints.authSession),

  authenticateWithGoogle: async (googleIdToken) => {
    const payload = await request('/reviewer-auth/login', {
      method: 'POST',
      body: { googleIdToken },
    })

    localStorage.setItem('token', payload.result.user.token);

    return normalizeSession(payload.result.user)
  },

  getCurrentSession: async () => {
    if (!reviewAuthConfig.endpoints.authSession) {
      return null
    }

    const payload = await request(reviewAuthConfig.endpoints.authSession)
    return payload ? normalizeSession(payload) : null
  },

  // signOut: async (session) => {
  //   if (!reviewAuthConfig.endpoints.signOut) {
  //     return
  //   }

  //   await request(reviewAuthConfig.endpoints.signOut, {
  //     method: 'POST',
  //     token: session?.token,
  //   })
  // },

  getReviews: async () => {
    const payload = await request('')
    const reviews = Array.isArray(payload) ? payload : payload?.reviews ?? payload?.data ?? []

    return reviews.map((review) => normalizeReview(review))
  },

  submitReview: async (session, review) => {
    const payload = await request('', {
      method: 'POST',
      token: session?.token,
      body: review,
    })

    return normalizeReview(
      payload ?? {
        ...review,
        createdAt: new Date().toISOString(),
      },
      session?.user,
    )
  },
}