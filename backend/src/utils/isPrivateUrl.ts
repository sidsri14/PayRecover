import dns from 'dns/promises';
import net from 'net';

const PRIVATE_RANGES = [
  /^127\./,                        // loopback
  /^10\./,                         // RFC-1918
  /^172\.(1[6-9]|2\d|3[01])\./,   // RFC-1918
  /^192\.168\./,                   // RFC-1918
  /^169\.254\./,                   // link-local (AWS metadata etc.)
  /^::1$/,                         // IPv6 loopback
  /^fc00:/,                        // IPv6 unique-local
  /^fe80:/,                        // IPv6 link-local
];

export async function isPrivateUrl(rawUrl: string): Promise<boolean> {
  try {
    const { hostname, protocol } = new URL(rawUrl);

    if (protocol !== 'http:' && protocol !== 'https:') return true;

    if (net.isIP(hostname)) {
      return PRIVATE_RANGES.some(r => r.test(hostname));
    }

    const [v4, v6] = await Promise.all([
      dns.resolve4(hostname).catch(() => [] as string[]),
      dns.resolve6(hostname).catch(() => [] as string[]),
    ]);
    const ips = [...v4, ...v6];

    if (ips.length === 0) return true;

    return ips.some(ip => PRIVATE_RANGES.some(r => r.test(ip)));
  } catch {
    return true;
  }
}
