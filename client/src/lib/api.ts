export function getAuthHeaders(userId: string | undefined): HeadersInit {
  if (!userId) {
    return {};
  }
  
  return {
    'x-user-id': userId,
  };
}

export async function adminFetch(url: string, userId: string | undefined, options: RequestInit = {}) {
  const headers = {
    ...getAuthHeaders(userId),
    ...options.headers,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}
