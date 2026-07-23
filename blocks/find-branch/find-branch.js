// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Oona Head Office - Muntinlupa City',
    address: '1220 Acacia Ave., Madrigal Business Park Ayala Alabang Muntinlupa City 1770, Philippines',
    phone: '(632) 8876 4400',
    hours: 'Monday-Friday 8:00AM-5:00PM',
    city: 'Muntinlupa City',
  },
  {
    name: 'Oona Sales Office - Cebu City',
    address: 'Unit 201-D, 2nd Floor, Insular Life Building, Mindanao Avenue Corner Biliran Road, Cebu Business Park, Cebu City',
    phone: '+639275312741',
    hours: 'Monday-Friday 8:00AM-5:00PM',
    city: 'Cebu City',
  },
];

// Brand palette from BuildWidgetRequest. Empty here → getThemedCardBg returns null and
// the fallback card background (#1a3a5c) is used.
const PALETTE = [];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const CARD_BG = theme?.bg ?? '#1a3a5c';
const CARD_FG = theme?.fg ?? '#ffffff';

export default async function decorate(block, bridge) {
  let branches;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      branches = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.branches — bare array outputSchema; key derived from actionName "find_branch"
      branches = structuredContent?.branches || [];
    }
  } else {
    branches = SAMPLE_DATA;
  }

  block.textContent = '';
  render(block, branches, bridge);

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

function pinIcon(color) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', color);
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p1.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
  const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c1.setAttribute('cx', '12'); c1.setAttribute('cy', '10'); c1.setAttribute('r', '3');
  svg.appendChild(p1); svg.appendChild(c1);
  return svg;
}

function render(block, branches, bridge) {
  if (!branches || branches.length === 0) {
    renderEmpty(block, bridge);
    return;
  }

  const row = document.createElement('div');
  row.className = 'find-branch-results';

  branches.slice(0, 2).forEach((b) => {
    const card = document.createElement('div');
    card.className = 'find-branch-card';
    card.style.cssText = `background:${CARD_BG};color:${CARD_FG}`;

    const pin = document.createElement('div');
    pin.className = 'find-branch-pin';
    pin.appendChild(pinIcon(CARD_FG));
    card.appendChild(pin);

    const name = document.createElement('h3');
    name.className = 'find-branch-name';
    name.textContent = b.name || '';
    card.appendChild(name);

    if (b.address) {
      const addr = document.createElement('p');
      addr.className = 'find-branch-address';
      addr.textContent = b.address;
      card.appendChild(addr);
    }

    if (b.phone) {
      const phone = document.createElement('p');
      phone.className = 'find-branch-phone';
      phone.textContent = b.phone;
      card.appendChild(phone);
    }

    if (b.hours) {
      const hours = document.createElement('p');
      hours.className = 'find-branch-hours';
      hours.textContent = b.hours;
      card.appendChild(hours);
    }

    const cta = document.createElement('button');
    cta.className = 'find-branch-cta';
    cta.type = 'button';
    cta.textContent = 'Get Directions';
    cta.addEventListener('click', () => {
      const query = b.address || b.name || '';
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      if (bridge) bridge.openLink(url);
    });
    card.appendChild(cta);

    row.appendChild(card);
  });

  block.appendChild(row);
}

function renderEmpty(block, bridge) {
  const card = document.createElement('div');
  card.className = 'find-branch-empty';
  card.style.cssText = `background:${CARD_BG};color:${CARD_FG}`;

  const pin = document.createElement('div');
  pin.className = 'find-branch-empty-pin';
  pin.appendChild(pinIcon(CARD_FG));
  card.appendChild(pin);

  const heading = document.createElement('h3');
  heading.className = 'find-branch-empty-heading';
  heading.textContent = 'Find a branch near you';
  card.appendChild(heading);

  const input = document.createElement('input');
  input.className = 'find-branch-input';
  input.type = 'text';
  input.placeholder = 'Enter city…';
  card.appendChild(input);

  const btn = document.createElement('button');
  btn.className = 'find-branch-search';
  btn.type = 'button';
  btn.textContent = 'Find Nearby';
  btn.addEventListener('click', () => {
    const city = input.value.trim();
    if (bridge) {
      bridge.sendMessage(city ? `Find Oona branches in ${city}` : 'Find Oona branches near me');
    }
  });
  card.appendChild(btn);

  block.appendChild(card);
}
