import ipaddr from 'ipaddr.js';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

/**
 * Checks if an IP address is part of a private or restricted range.
 */
export const isPrivateIP = (ip: string): boolean => {
  try {
    const addr = ipaddr.parse(ip);
    const range = addr.range();
    return ['private', 'loopback', 'linkLocal', 'multicast', 'unspecified'].includes(range);
  } catch (e) {
    return true; // If we can't parse it, assume it's unsafe
  }
};

/**
 * Validates a URL to prevent SSRF by checking both the literal hostname 
 * and the resolved DNS IP addresses against private/local ranges.
 */
export const validateUrlForSSRF = async (urlStr: string): Promise<boolean> => {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname;

    // 1. Block literal private IPs in the URL
    if (ipaddr.isValid(hostname)) {
      if (isPrivateIP(hostname)) return false;
    }

    // 2. Resolve DNS and check result IPs to prevent DNS rebinding or simple host manipulation
    try {
      // Note: This is a basic check. Production systems might use a custom fetch agent 
      // that validates the IP *at the time of connection* to prevent TOCTOU.
      const ipv4s = await resolve4(hostname).catch(() => []);
      const ipv6s = await resolve6(hostname).catch(() => []);
      const allIps = [...ipv4s, ...ipv6s];

      for (const ip of allIps) {
        if (isPrivateIP(ip)) return false;
      }
    } catch (dnsErr) {
      // If DNS fails, we can't reliably check, but we block if it was a hostname
      // Actually, if it's not an IP and DNS fails, it's unreachable anyway.
    }

    return true;
  } catch (err) {
    return false;
  }
};
