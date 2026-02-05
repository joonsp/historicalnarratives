export interface Happening {
  title: string;
  year: number;
  significance: string;
  location: [number, number];
  eventType: string;
}

export async function fetchPlaceHappenings(
  place: string,
  mode: 'history' | 'popculture',
  offset: number,
  exclude: string[] = []
): Promise<Happening[]> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');

  const response = await fetch(`${backendUrl}/api/place-happenings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ place, mode, offset, exclude }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Request failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.happenings || !Array.isArray(data.happenings)) {
    throw new Error('Invalid response from server');
  }

  return data.happenings;
}
