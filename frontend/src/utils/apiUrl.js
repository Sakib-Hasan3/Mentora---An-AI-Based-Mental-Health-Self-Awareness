/**
 * Resolve API base URL at request time so LAN access (e.g. 192.168.x.x:3000)
 * talks to the backend on the same host (:8000), not a baked-in localhost.
 */
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (port === '3000') {
      return `${protocol}//${hostname}:8000/api`;
    }
    const portStr = port ? `:${port}` : '';
    return `${protocol}//${hostname}${portStr}/api`;
  }

  if (process.env.REACT_APP_API_URL) {
    return `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api`;
  }

  return 'http://localhost:8000/api';
};
