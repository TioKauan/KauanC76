// Pequeno motor isométrico para desenhar os ambientes ilustrados dos mockups.
const ISO = (() => {
  const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
  function make(svg, { scale = 22, ox = 360, oy = 150 } = {}) {
    const ns = 'http://www.w3.org/2000/svg';
    const layers = {};
    const layer = (name) => {
      if (!layers[name]) { layers[name] = document.createElementNS(ns, 'g'); svg.appendChild(layers[name]); }
      return layers[name];
    };
    ['ground', 'cones', 'build', 'lines', 'nodes'].forEach(layer);
    const p = (x, y, z = 0) => [ox + (x - y) * C * scale, oy + (x + y) * S * scale - z * scale];
    const pts = (arr) => arr.map((a) => p(...a).map((v) => v.toFixed(1)).join(',')).join(' ');
    const el = (tag, attrs, parent = 'build') => {
      const e = document.createElementNS(ns, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      layer(parent).appendChild(e);
      return e;
    };
    const poly = (arr, attrs, parent) => el('polygon', { points: pts(arr), ...attrs }, parent);
    // Caixa: faces visíveis (topo, frente-esquerda y+d, frente-direita x+w).
    const box = (x, y, z, w, d, h, c = {}, parent = 'build') => {
      const top = c.top || '#132437', left = c.left || '#0c1826', right = c.right || '#0f1f31', edge = c.edge || '#2a4560';
      const sw = c.sw ?? 0.8;
      poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], { fill: left, stroke: edge, 'stroke-width': sw, 'stroke-linejoin': 'round' }, parent);
      poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], { fill: right, stroke: edge, 'stroke-width': sw, 'stroke-linejoin': 'round' }, parent);
      poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], { fill: top, stroke: edge, 'stroke-width': sw, 'stroke-linejoin': 'round' }, parent);
    };
    // Janela na face y = const (frente-esquerda).
    const winY = (y, x0, z0, w, h, fill = '#ffb86b', op = 0.55) =>
      poly([[x0, y, z0], [x0 + w, y, z0], [x0 + w, y, z0 + h], [x0, y, z0 + h]], { fill, opacity: op, stroke: '#ffd29a', 'stroke-width': 0.5, 'stroke-opacity': 0.6 });
    // Janela na face x = const (frente-direita).
    const winX = (x, y0, z0, d, h, fill = '#ffb86b', op = 0.55) =>
      poly([[x, y0, z0], [x, y0 + d, z0], [x, y0 + d, z0 + h], [x, y0, z0 + h]], { fill, opacity: op, stroke: '#ffd29a', 'stroke-width': 0.5, 'stroke-opacity': 0.6 });
    const tree = (x, y, z = 0.3, r = 0.9, h = 2.2) => {
      box(x - 0.12, y - 0.12, z, 0.24, 0.24, h * 0.55, { top: '#3a2a1c', left: '#2a1d12', right: '#33241a', edge: '#3a2a1c', sw: 0.3 });
      const [cx, cy] = p(x, y, z + h);
      el('ellipse', { cx, cy, rx: r * scale * 0.95, ry: r * scale * 0.85, fill: '#0f3a33', stroke: '#1d5a4c', 'stroke-width': 0.8 });
      el('ellipse', { cx: cx - r * 5, cy: cy - r * 5, rx: r * scale * 0.45, ry: r * scale * 0.35, fill: '#1c5a4b', opacity: 0.7 });
    };
    // Cone de visão da câmera no chão.
    const cone = (x, y, ang, spread, len, color = '#6de9f6') => {
      const a1 = ang - spread / 2, a2 = ang + spread / 2;
      const pa = [x + Math.cos(a1) * len, y + Math.sin(a1) * len, 0.32];
      const pb = [x + Math.cos(a2) * len, y + Math.sin(a2) * len, 0.32];
      poly([[x, y, 0.32], pa, pb], { fill: `url(#coneGrad)`, opacity: 0.9 }, 'cones');
    };
    // Linha de conexão em "L" pelo chão/paredes, com brilho.
    const wire = (path, { color = 'url(#wireGrad)', width = 2.2, dash = null } = {}) => {
      const d = path.map((q, i) => (i ? 'L' : 'M') + p(...q).map((v) => v.toFixed(1)).join(' ')).join(' ');
      el('path', { d, fill: 'none', stroke: color, 'stroke-width': width * 3.5, opacity: 0.14, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, 'lines');
      el('path', { d, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...(dash ? { 'stroke-dasharray': dash } : {}) }, 'lines');
    };
    const node = (x, y, z, color = '#6de9f6', r = 6) => {
      const [cx, cy] = p(x, y, z);
      el('circle', { cx, cy, r: r * 3.2, fill: color, opacity: 0.13 }, 'nodes');
      el('circle', { cx, cy, r: r * 1.8, fill: color, opacity: 0.22 }, 'nodes');
      el('circle', { cx, cy, r, fill: color, stroke: '#ffffffaa', 'stroke-width': 1.2 }, 'nodes');
      return [cx, cy];
    };
    return { p, box, winY, winX, tree, cone, wire, node, poly, el };
  }
  return { make };
})();
