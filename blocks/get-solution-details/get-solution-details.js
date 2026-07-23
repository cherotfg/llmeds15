// Sample data for standalone/preview mode.
// In production, the single item comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'SEO Strategy & Audit', description: 'A clear picture of where your organic presence stands and a prioritised roadmap to improve it, aligned to your broader marketing goals.', category: 'Strategy', image_url: 'https://holistiksearch.com/og-image.jpg' },
  { name: 'Content & Keyword Strategy', description: 'Topic clusters and keyword architecture that capture high-intent demand, the same demand your paid team is bidding on.', category: 'Content' },
  { name: 'Technical SEO', description: 'Site health, crawlability and Core Web Vitals, the foundation that makes every other channel perform better.', category: 'Technical' },
  { name: 'Organic & Paid Alignment', description: 'Sharing keyword data, search intent signals and landing page insights across your SEO and paid teams so neither operates blind.', category: 'Strategy' },
  { name: 'AI & Answer Engine Visibility', description: 'Optimising how your brand appears in AI-generated answers, SGE and generative search, the surfaces your paid ads cannot reach.', category: 'AI Search' },
  { name: 'Performance & Reporting', description: 'Monthly visibility reviews with clear insight on organic contribution, keyword movements and what to prioritise next.', category: 'Reporting' },
];

// Brand palette from BuildWidgetRequest — getThemedCardBg() darkens palette[0]
// to luminance <= 0.12 so white text has WCAG AA contrast.
const PALETTE = ['#2a5244', '#1c2b24', '#2f5c4e', '#1e3d32'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (r, g, b) => 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#2a5244', '#2f5c4e', '#1e3d32', '#1c2b24'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA[0];
    } else {
      // Detail concept — structuredContent IS the item (flat), not a wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_DATA[0];
  }

  block.textContent = '';
  renderDetail(block, item, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'detail-card';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'detail-image';
  const fallbackColor = CARD_COLORS[0];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }
  card.appendChild(imageContainer);

  const content = document.createElement('div');
  content.className = 'detail-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  if (item.category) {
    const chip = document.createElement('span');
    chip.className = 'detail-chip';
    chip.textContent = item.category;
    content.appendChild(chip);
  }

  const title = document.createElement('h3');
  title.className = 'detail-title';
  title.textContent = item.name || '';
  content.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = item.description || '';
  content.appendChild(desc);

  const btn = document.createElement('button');
  btn.className = 'detail-cta';
  btn.textContent = 'Get a Free Audit';
  if (bridge) {
    btn.addEventListener('click', () => {
      bridge.sendMessage('Get a Free Audit');
    });
  }
  content.appendChild(btn);

  card.appendChild(content);
  block.appendChild(card);
}
