import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/gates/', '/analytics/', '/settings/'] },
    sitemap: 'https://upgradekit.threestack.io/sitemap.xml',
  };
}
