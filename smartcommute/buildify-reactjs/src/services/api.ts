const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(path: string, options: RequestInit = {}, getAccessToken: () => Promise<string | null>) {
    const token = await getAccessToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
    };
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || body.errors?.join(', ') || `Request failed: ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
}

export const api = {
    createSchedule(data: unknown, getAccessToken: () => Promise<string | null>) {
        return request('/schedules', { method: 'POST', body: JSON.stringify(data) }, getAccessToken);
    },
    getSchedules(getAccessToken: () => Promise<string | null>) {
        return request('/schedules', {}, getAccessToken);
    },
    deleteSchedule(id: string, getAccessToken: () => Promise<string | null>) {
        return request(`/schedules/${id}`, { method: 'DELETE' }, getAccessToken);
    },
    getRecommendation(scheduleId: string, getAccessToken: () => Promise<string | null>) {
        return request(`/recommendation/${scheduleId}`, {}, getAccessToken);
    },
};
