const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1200);

  await page.getByText('MapReduce').click();
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 450));
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/pw-fanout.png', clip: { x: 50, y: 200, width: 1180, height: 500 } });

  const data = await page.evaluate(() => {
    const svgData = [];
    document.querySelectorAll('svg').forEach(svg => {
      const polylines = svg.querySelectorAll('polyline');
      if (!polylines.length) return;
      const sr = svg.getBoundingClientRect();
      const paths = Array.from(svg.querySelectorAll('path')).map(p => p.getAttribute('d')).filter(Boolean);
      const chevrons = Array.from(polylines).map(pl => {
        const r = pl.getBoundingClientRect();
        return { cx: Math.round((r.left+r.right)/2), cy: Math.round((r.top+r.bottom)/2) };
      });
      svgData.push({ bottom: Math.round(sr.bottom), top: Math.round(sr.top), width: Math.round(sr.width), left: Math.round(sr.left), paths: paths.slice(0,4), chevrons });
    });

    const splits = ['Split 1','Split 2','Split 3'].map(name => {
      const divs = Array.from(document.querySelectorAll('div'));
      const el = divs.find(d => d.children.length === 0 && d.textContent.trim() === name);
      if (!el) return null;
      let card = el.parentElement;
      for (let i = 0; i < 8; i++) {
        if (card && window.getComputedStyle(card).borderRadius !== '0px') break;
        card = card && card.parentElement;
      }
      const r = (card||el).getBoundingClientRect();
      return { name, top: Math.round(r.top), left: Math.round(r.left), centerX: Math.round((r.left+r.right)/2), width: Math.round(r.width) };
    });
    return { svgData, splits };
  });

  console.log('=== SVGs with chevrons ===');
  data.svgData.forEach((s, i) => {
    console.log(`SVG[${i}]: top=${s.top} bottom=${s.bottom} left=${s.left} width=${s.width}`);
    s.chevrons.forEach((c,j) => console.log(`  chevron[${j}]: cx=${c.cx} cy=${c.cy}  (${s.bottom-c.cy}px above svg bottom)`));
  });
  console.log('\n=== Split card tops ===');
  data.splits.forEach(s => s && console.log(`${s.name}: top=${s.top} centerX=${s.centerX}`));

  if (data.splits[0] && data.svgData.length) {
    const fanoutSvg = data.svgData.find(s => s.chevrons.length >= 2);
    if (fanoutSvg) {
      const cardTop = data.splits[0].top;
      console.log('\n=== Gap analysis ===');
      console.log(`SVG bottom: ${fanoutSvg.bottom}`);
      console.log(`Card top:   ${cardTop}`);
      console.log(`Wrapper gap (svg bottom → card top): ${cardTop - fanoutSvg.bottom}px`);
      fanoutSvg.chevrons.forEach((c, j) => {
        const split = data.splits[j];
        const hGap = split ? c.cx - split.centerX : 'N/A';
        const vGap = cardTop - c.cy;
        console.log(`  chevron[${j}]: cx=${c.cx}  ${split ? split.name+' centerX='+split.centerX : ''} hOffset=${hGap}px | vGap to card top=${vGap}px`);
      });
    }
  }

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
