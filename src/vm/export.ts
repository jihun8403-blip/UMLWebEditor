import { jsPDF } from 'jspdf';
import type { Project } from './types';
import { worldToScreen } from './viewport';

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportCanvasPng(canvas: HTMLCanvasElement) {
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) reject(new Error('PNG export failed'));
      else resolve(b);
    }, 'image/png');
  });

  const filename = `uml-canvas-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
  downloadBlob(filename, blob);
}

export function exportCanvasPdf(canvas: HTMLCanvasElement) {
  const dataUrl = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const img = new Image();
  img.src = dataUrl;

  const imgW = img.width || canvas.width;
  const imgH = img.height || canvas.height;

  const scale = Math.min(pageW / imgW, pageH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;

  pdf.addImage(dataUrl, 'PNG', (pageW - w) / 2, (pageH - h) / 2, w, h);

  const filename = `uml-canvas-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
  pdf.save(filename);
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function exportProjectSvg(project: Project, canvasCssSize: { width: number; height: number }) {
  const scale = project.viewport.scale;

  const els = project.elements.filter((e) => e.diagramType === project.diagramType);
  const rels = project.relationships.filter((r) => r.diagramType === project.diagramType);

  const w = Math.max(1, Math.floor(canvasCssSize.width));
  const h = Math.max(1, Math.floor(canvasCssSize.height));

  const parts: string[] = [];
  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
  );

  // relationships
  for (const rel of rels) {
    const routing = rel.routing;
    if (!routing || routing.points.length < 2) continue;
    const pts = routing.points
      .map((p) => {
        const sp = worldToScreen(project.viewport, p);
        return `${sp.x},${sp.y}`;
      })
      .join(' ');
    parts.push(`<polyline points="${pts}" fill="none" stroke="#334155" stroke-width="2" />`);

    if (rel.label) {
      const midIdx = Math.floor(routing.points.length / 2);
      const mp = worldToScreen(project.viewport, routing.points[midIdx]!);
      parts.push(
        `<text x="${mp.x + 6 * scale}" y="${mp.y - 6 * scale}" font-size="${12 * scale}" fill="#334155" font-family="system-ui">${escapeXml(rel.label)}</text>`,
      );
    }
  }

  // elements
  for (const el of els) {
    const p = worldToScreen(project.viewport, el.position);
    const ew = el.size.width * scale;
    const eh = el.size.height * scale;

    parts.push(
      `<rect x="${p.x}" y="${p.y}" width="${ew}" height="${eh}" rx="8" ry="8" fill="#ffffff" stroke="#64748b" stroke-width="2" />`,
    );

    const name = el.name ?? el.type;
    parts.push(
      `<text x="${p.x + 10 * scale}" y="${p.y + 22 * scale}" font-size="${14 * scale}" fill="#0f172a" font-family="system-ui">${escapeXml(name)}</text>`,
    );

    if (el.stereotype) {
      parts.push(
        `<text x="${p.x + 10 * scale}" y="${p.y + 40 * scale}" font-size="${12 * scale}" fill="#475569" font-family="system-ui">${escapeXml(`<<${el.stereotype}>>`)}</text>`,
      );
    }
  }

  parts.push(`</svg>`);
  const svg = parts.join('\n');

  const filename = `uml-canvas-${new Date().toISOString().replace(/[:.]/g, '-')}.svg`;
  downloadBlob(filename, new Blob([svg], { type: 'image/svg+xml' }));
}
