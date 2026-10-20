// Pages Function: haalt de nieuwste officiële bekendmakingen van een gemeente of de provincie op
// via de openbare SRU-API van KOOP (repository.overheid.nl) en geeft compacte JSON terug.
const DEC = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'" };
const dec = (s) => s.replace(/&(amp|lt|gt|quot|apos|#39);/g, (m) => DEC[m] || m);
const pick = (xml, tag) => { const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)); return m ? dec(m[1].trim()) : ''; };
const TYPE = { omgevingsvergunning: 'Vergunning', verkeersbesluit: 'Verkeer', 'beleidsregel': 'Beleid', verordening: 'Regels', 'ruimtelijk plan of omgevingsdocument': 'Plan', 'verkeersbesluit, gemeente': 'Verkeer' };

function label(t) {
  const l = t.toLowerCase();
  if (TYPE[l]) return TYPE[l];
  if (l.includes('verkeer')) return 'Verkeer';
  if (l.includes('vergunning')) return 'Vergunning';
  if (l.includes('beleid')) return 'Beleid';
  if (l.includes('verordening') || l.includes('regeling')) return 'Regels';
  if (l.includes('plan') || l.includes('omgevings')) return 'Plan';
  if (l.includes('subsidie')) return 'Subsidie';
  if (l.includes('benoeming') || l.includes('mandaat')) return 'Bestuur';
  return t ? t[0].toUpperCase() + t.slice(1, 24) : 'Bekendmaking';
}

export async function onRequestGet({ request }) {
  const u = new URL(request.url);
  const g = (u.searchParams.get('g') || 'Noord-Holland').replace(/["\\]/g, '').slice(0, 60);
  const n = Math.max(1, Math.min(50, parseInt(u.searchParams.get('n') || '10', 10)));
  const query = `c.product-area==officielepublicaties AND dt.creator="${g}" sortBy dt.available /sort.descending`;
  const api = `https://repository.overheid.nl/sru?query=${encodeURIComponent(query)}&maximumRecords=${n}`;
  try {
    const res = await fetch(api, { cf: { cacheTtl: 900, cacheEverything: true }, headers: { accept: 'application/xml' } });
    if (!res.ok) throw new Error('SRU ' + res.status);
    const xml = await res.text();
    const total = parseInt(pick(xml, 'sru:numberOfRecords') || '0', 10);
    const items = xml.split('<sru:record>').slice(1).map((r) => {
      const id = pick(r, 'dcterms:identifier');
      const rawType = pick(r, 'dcterms:type');
      return {
        id,
        title: pick(r, 'dcterms:title'),
        type: label(rawType),
        date: pick(r, 'dcterms:available') || pick(r, 'dcterms:modified'),
        subject: pick(r, 'dcterms:subject'),
        creator: pick(r, 'dcterms:creator'),
        url: id ? `https://zoek.officielebekendmakingen.nl/${id}.html` : '',
      };
    }).filter((i) => i.id && i.title);
    return new Response(JSON.stringify({ gemeente: g, total, items, bron: 'Officiële bekendmakingen (KOOP)' }), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=900' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ gemeente: g, total: 0, items: [], error: String(e.message || e) }), {
      status: 502, headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}
