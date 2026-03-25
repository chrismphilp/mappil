import type { MetadataRoute } from 'next';
import { SITEMAP_CONTENT, SITE_URL } from '../lib/landingContent';

export const dynamic = 'force-static';

const sitemap = (): MetadataRoute.Sitemap => {
  return SITEMAP_CONTENT.map((route) => ({
    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
    changeFrequency: 'weekly',
    priority: route.priority,
  }));
};

export default sitemap;
