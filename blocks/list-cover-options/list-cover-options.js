// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Compulsory Third-Party Liability (CTPL)', description: 'Covers losses due to injury or death of another person, with no hidden fees and swift claim settlements.', image_url: 'https://myoona.ph/content/dam/oona/aem-images/all-products/ctpl-insurance.webp', price: 'from ₱290.00/year', category: 'Motor Insurance' },
  { name: 'Car Insurance', description: 'Comprehensive coverage for partial or total loss from collision, theft, fire, and acts of nature, plus complimentary roadside assistance.', image_url: 'https://myoona.ph/content/dam/oona/aem-images/all-products/car-insurance.webp', price: 'from ₱4,500.00/year', category: 'Motor Insurance' },
  { name: 'Motorcycle Insurance', description: 'Full coverage against collision, theft, fire, and acts of nature, with legal liability protection and roadside assistance.', image_url: 'https://myoona.ph/content/dam/oona/aem-images/all-products/motorcycle.webp', price: 'from ₱1,090.00/year', category: 'Motor Insurance' },
  { name: 'International Travel', description: 'Protection for international trips including Schengen, with up to ₱5 million medical cover and travel inconvenience benefits.', image_url: 'https://myoona.ph/content/dam/oona/aem-images/all-products/international-insurance.webp', price: 'from ₱299.00', category: 'Travel Insurance' },
  { name: 'Big 3 Critical Illness', description: 'Covers heart attack, stroke, and all stages of cancer with no medical pre-examination and up to ₱500,000 coverage.', image_url: 'https://myoona.ph/content/dam/oona/aem-images/all-products/big-3.webp', price: 'from ₱145/year', category: 'Critical Illness Insurance' },
  { name: 'Cancer', description: 'Covers all stages of cancer with no medical pre-examination and up to ₱500,000 coverage.', image_url: 'https://myoona.ph/content/dam/oona/aem-images/file-a-claim/webp/cancer-claims.webp', price: 'from ₱51/year', category: 'Critical Illness Insurance' },
  { name: 'Global Shield', description: 'Worldwide health plan with annual benefit limit up to US$2,000,000, comprehensive inpatient and outpatient coverage, and 90 days overseas travel coverage.', image_url: 'https://myoona.ph/content/dam/oona/aem-images/health-landing-page/global-shield-banner.webp', category: 'Health Insurance' },
  { name: 'Personal Accident', description: 'Flexible plans providing fixed benefits for accidental death, permanent disablement, and medical reimbursement.', image_url: 'https://myoona.ph/content/dam/oona/aem-images/file-a-claim/webp/personal-accident-claims.webp', price: 'from ₱350.00/year', category: 'Personal Accident Insurance' },
  { name: 'Property', description: 'Covers loss or damage to home and contents from fire, lightning, earthquake and other perils, with home assistance and liability coverage.', image_url: 'https://myoona.ph/content/dam/oona/aem-images/file-a-claim/webp/property-claims.webp', price: 'from ₱700.00/year', category: 'Property Insurance' },
  { name: 'OFW', description: 'Compulsory comprehensive insurance for Filipinos working overseas, with life coverage, repatriation assistance, and medical evacuation benefits.', image_url: 'https://myoona.ph/content/dam/oona/aem-images/file-a-claim/webp/ofw-claims.webp', price: 'from ₱950.00', category: 'OFW Insurance' },
];

// Brand palette from BuildWidgetRequest. Empty here — getThemedCardBg returns null and the
// card strip falls back to #1a1a1a.
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
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.cover_options — bare array outputSchema; key derived from actionName "list_cover_options"
      items = structuredContent?.cover_options || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

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

function renderItems(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-cover-options-wrapper';

  const track = document.createElement('div');
  track.className = 'list-cover-options-track';

  (items || []).slice(0, 10).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'list-cover-options-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'list-cover-options-image';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.loading = 'lazy';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }
    card.appendChild(imageBox);

    const info = document.createElement('div');
    info.className = 'list-cover-options-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'list-cover-options-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'list-cover-options-badge';
      badge.textContent = item.category;
      info.appendChild(badge);
    }

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'list-cover-options-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    if (item.price) {
      const price = document.createElement('div');
      price.className = 'list-cover-options-price';
      const label = document.createElement('span');
      label.className = 'list-cover-options-price-label';
      label.textContent = 'Starts from';
      const value = document.createElement('span');
      value.className = 'list-cover-options-price-value';
      value.textContent = item.price;
      price.appendChild(label);
      price.appendChild(value);
      info.appendChild(price);
    }

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'list-cover-options-cta';
    cta.textContent = 'Buy Now';
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  const fade = document.createElement('div');
  fade.className = 'list-cover-options-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;`;

  const leftBtn = document.createElement('button');
  leftBtn.type = 'button';
  leftBtn.className = 'list-cover-options-nav list-cover-options-nav-left';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';

  const rightBtn = document.createElement('button');
  rightBtn.type = 'button';
  rightBtn.className = 'list-cover-options-nav list-cover-options-nav-right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  const cardStep = 210 + 16;
  const scrollByStep = (dir) => track.scrollBy({ left: dir * cardStep, behavior: 'smooth' });
  leftBtn.addEventListener('click', () => scrollByStep(-1));
  rightBtn.addEventListener('click', () => scrollByStep(1));

  const updateNav = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    leftBtn.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    rightBtn.style.display = track.scrollLeft >= maxScroll ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateNav);

  wrapper.appendChild(track);
  wrapper.appendChild(fade);
  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);
  block.appendChild(wrapper);

  requestAnimationFrame(updateNav);
}
