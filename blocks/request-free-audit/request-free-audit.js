// Sample data for standalone EDS preview (no bridge).
// In production, the confirmation comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'SEO Strategy & Audit', description: 'A clear picture of where your organic presence stands and a prioritised roadmap to improve it, aligned to your broader marketing goals.', category: 'Strategy', image_url: 'https://holistiksearch.com/og-image.jpg' },
  { name: 'Content & Keyword Strategy', description: 'Topic clusters and keyword architecture that capture high-intent demand.', category: 'Content' },
  { name: 'Technical SEO', description: 'Site health, crawlability and Core Web Vitals.', category: 'Technical' },
  { name: 'Organic & Paid Alignment', description: 'Sharing keyword data across SEO and paid teams.', category: 'Strategy' },
  { name: 'AI & Answer Engine Visibility', description: 'Optimising how your brand appears in AI-generated answers.', category: 'AI Search' },
  { name: 'Performance & Reporting', description: 'Monthly visibility reviews with clear insight.', category: 'Reporting' },
];

// Brand palette from BuildWidgetRequest. getThemedCardBg() darkens palette[0]
// to luminance <= 0.12 so white text has WCAG AA contrast on the header block.
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
const ACCENT = PALETTE[0] || '#2a5244';

const FIELDS = [
  { key: 'name', label: 'Name', placeholder: 'Your name.', type: 'text', required: true },
  { key: 'email', label: 'Email', placeholder: 'Your email address.', type: 'email', required: true },
  { key: 'website', label: 'Website', placeholder: 'Your website URL.', type: 'text', required: true },
  { key: 'seo_challenge', label: 'SEO Challenge', placeholder: 'Your main SEO challenge, e.g. low traffic or not ranking for key terms.', type: 'text', required: false },
];

export default async function decorate(block, bridge) {
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      const _result = await bridge.toolResult;
      const structuredContent = (_result?.structuredContent || _result) || {};
      if (structuredContent && structuredContent.confirmation_id) confirmation = structuredContent;
    }
  }

  block.textContent = '';
  if (confirmation) {
    renderConfirmation(block, confirmation);
  } else {
    renderForm(block, bridge);
  }

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

function buildCard() {
  const card = document.createElement('div');
  card.className = 'audit-card';
  return card;
}

function buildHeader() {
  const hero = SAMPLE_DATA[0];
  const header = document.createElement('div');
  header.className = 'audit-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  if (hero.image_url) {
    const img = document.createElement('img');
    img.className = 'audit-hero';
    img.src = hero.image_url;
    img.alt = 'Free SEO audit';
    img.onerror = () => { img.style.display = 'none'; };
    header.appendChild(img);
  }

  const textWrap = document.createElement('div');
  textWrap.className = 'audit-header-text';

  const title = document.createElement('h3');
  title.className = 'audit-title';
  title.textContent = 'Request a Free SEO Audit';
  textWrap.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'audit-desc';
  desc.textContent = 'Tell us about your site and your main SEO challenge. We’ll get back to you with a prioritised roadmap.';
  textWrap.appendChild(desc);

  header.appendChild(textWrap);
  return header;
}

function renderForm(block, bridge) {
  const card = buildCard();
  card.appendChild(buildHeader());

  const form = document.createElement('form');
  form.className = 'audit-form';

  const inputs = {};
  FIELDS.forEach((f) => {
    const group = document.createElement('div');
    group.className = 'audit-field';

    const label = document.createElement('label');
    label.className = 'audit-label';
    label.textContent = f.required ? `${f.label} *` : f.label;
    label.setAttribute('for', `audit-${f.key}`);
    group.appendChild(label);

    const input = document.createElement('input');
    input.className = 'audit-input';
    input.id = `audit-${f.key}`;
    input.type = f.type;
    input.placeholder = f.placeholder;
    if (f.required) input.required = true;
    group.appendChild(input);

    inputs[f.key] = input;
    form.appendChild(group);
  });

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'audit-submit';
  btn.textContent = 'Send Audit Request';
  form.appendChild(btn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = {};
    FIELDS.forEach((f) => { values[f.key] = inputs[f.key].value.trim(); });
    if (!values.name || !values.email || !values.website) return;

    const parts = [
      `I'd like a free SEO audit.`,
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Website: ${values.website}`,
    ];
    if (values.seo_challenge) parts.push(`Main SEO challenge: ${values.seo_challenge}`);
    const message = parts.join(' ');

    if (bridge) {
      bridge.sendMessage(message);
      btn.disabled = true;
      btn.textContent = 'Request sent';
    }
  });

  card.appendChild(form);
  block.appendChild(card);
}

function renderConfirmation(block, confirmation) {
  const card = buildCard();
  card.appendChild(buildHeader());

  const body = document.createElement('div');
  body.className = 'audit-confirm';

  const check = document.createElement('div');
  check.className = 'audit-check';
  check.textContent = '✓';
  body.appendChild(check);

  const status = document.createElement('div');
  status.className = 'audit-status';
  status.textContent = confirmation.status || 'Request received';
  body.appendChild(status);

  if (confirmation.message) {
    const msg = document.createElement('p');
    msg.className = 'audit-message';
    msg.textContent = confirmation.message;
    body.appendChild(msg);
  }

  if (confirmation.confirmation_id) {
    const id = document.createElement('div');
    id.className = 'audit-id';
    id.textContent = `Reference: ${confirmation.confirmation_id}`;
    body.appendChild(id);
  }

  card.appendChild(body);
  block.appendChild(card);
}
