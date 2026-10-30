import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char] ?? char));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return new NextResponse('Not found', { status: 404 });

  const url = new URL(_request.url);
  const view = url.searchParams.get('view') === 'detail' ? 'detail' : 'front';
  const title = escapeXml(product.name);
  const brand = escapeXml(product.brand);
  const category = escapeXml(product.category.replaceAll('_', ' '));
  const accent = view === 'detail' ? '#818cf8' : '#6366f1';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">Nexus catalog artwork for ${title} by ${brand}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#09090b"/>
      <stop offset="0.55" stop-color="#18181b"/>
      <stop offset="1" stop-color="#27272a"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3f3f46"/>
      <stop offset="1" stop-color="#18181b"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="30" flood-opacity=".45"/></filter>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)"/>
  <circle cx="1020" cy="130" r="220" fill="${accent}" opacity=".10"/>
  <circle cx="120" cy="780" r="260" fill="${accent}" opacity=".08"/>
  <rect x="92" y="92" width="1016" height="716" rx="42" fill="#09090b" stroke="#3f3f46" filter="url(#shadow)"/>
  <rect x="128" y="128" width="944" height="500" rx="30" fill="url(#card)" stroke="#52525b"/>
  <g transform="translate(220 210)" fill="none" stroke="${accent}" stroke-width="10" opacity=".92">
    <rect x="0" y="0" width="760" height="260" rx="36"/>
    <path d="M54 72h652M54 130h652M54 188h652"/>
    <circle cx="70" cy="72" r="10" fill="${accent}"/>
    <circle cx="70" cy="130" r="10" fill="${accent}"/>
    <circle cx="70" cy="188" r="10" fill="${accent}"/>
  </g>
  <text x="160" y="700" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="3">${brand.toUpperCase()} • ${category}</text>
  <text x="160" y="752" fill="#fafafa" font-family="Arial, sans-serif" font-size="42" font-weight="800">${title}</text>
  <text x="160" y="786" fill="#71717a" font-family="Arial, sans-serif" font-size="18">NEXUS CURATED GEAR CATALOG • ${view.toUpperCase()} VIEW</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
