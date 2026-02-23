import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/'],
        crawlDelay: 0,
      },
    ],
    sitemap: 'https://phrames.cleffon.com/sitemap.xml',
  }
}
