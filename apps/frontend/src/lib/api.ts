// API client for talking to the backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    next: { revalidate: 60 }, // ISR — revalidate every 60s
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error ${res.status}: ${error}`);
  }

  return res.json();
}

export type ContentItem = {
  id: string;
  type: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  body?: string;
  locale: string;
  publishedAt?: string;
  startsAt?: string;
  endsAt?: string;
  venue?: string;
  venueAddress?: string;
  price?: string;
  ticketPrice?: number;
  currency?: string;
  year?: number;
  make?: string;
  model?: string;
  category?: string;
  location?: string;
  projectStage?: string;
  metadata?: any;
  image?: {
    url: string;
    thumbnailUrl: string;
    blurhash?: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  media?: Array<{
    url: string;
    thumbnailUrl: string;
    blurhash?: string;
    altText?: string;
    width?: number;
    height?: number;
  }>;
};

export const api = {
  getContent: async (params: {
    type?: string;
    locale?: string;
    limit?: number;
    featured?: boolean;
  } = {}) => {
    const search = new URLSearchParams();
    if (params.type) search.set("type", params.type);
    if (params.locale) search.set("locale", params.locale);
    if (params.limit) search.set("limit", params.limit.toString());
    if (params.featured) search.set("featured", "true");
    return request<{ items: ContentItem[]; total: number }>(`/api/public/content?${search}`);
  },

  getContentBySlug: async (slug: string, locale = "en") => {
    return request<{ item: ContentItem }>(`/api/public/content/${slug}?locale=${locale}`);
  },

  submitInquiry: async (data: {
    division: "EVENTS" | "TRADING" | "REAL_ESTATE" | "GENERAL";
    name: string;
    organization?: string;
    email: string;
    phone?: string;
    message: string;
    metadata?: any;
    recaptchaToken?: string;
  }) => {
    return request<{ success: boolean; id: string }>(`/api/public/inquiry`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  googleOAuth: async (code: string, redirectUri: string) => {
    return request<{ success: boolean; user: any }>(`/api/public/oauth/google`, {
      method: "POST",
      body: JSON.stringify({ code, redirectUri }),
    });
  },

  bookEvent: async (data: {
    eventId: string;
    publicUserId: string;
    partySize: number;
    phoneNumber: string;
    notes?: string;
  }) => {
    return request<{ success: boolean; booking: any }>(`/api/public/bookings`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  submitOnDemand: async (data: {
    publicUserId: string;
    projectType: string;
    location: string;
    budget?: string;
    timeline?: string;
    description: string;
    contactPhone: string;
  }) => {
    return request<{ success: boolean; id: string }>(`/api/public/on-demand`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};