import React, { memo } from 'react';
import mapData from '../data/bdMap.json';
import { districtById, divisionColor } from '../data/districts';

const MUTED = '#e4ddcc';
const STROKE = '#fbf6ea';

/**
 * Pure SVG Bangladesh district map.
 * Uses plain fill/stroke attributes (not CSS classes) so html2canvas exports it faithfully.
 */
function BDMap({ selected, activeId = null, interactive = false, onToggle, onHover }) {
  // paint order: muted -> eaten -> active (so active stroke is never covered)
  const ordered = [...mapData.districts].sort((a, b) => {
    const score = (d) => (d.id === activeId ? 2 : selected.has(d.id) ? 1 : 0);
    return score(a) - score(b);
  });

  return (
    <svg
      viewBox={`0 0 ${mapData.width} ${mapData.height}`}
      width="100%"
      height="100%"
      role={interactive ? 'group' : 'img'}
      aria-label="বাংলাদেশের জেলাভিত্তিক খাবারের ম্যাপ"
      style={{ display: 'block' }}
    >
      {ordered.map((d) => {
        const info = districtById[d.id];
        const eaten = selected.has(d.id);
        const isActive = d.id === activeId;
        const common = {
          d: d.d,
          fill: eaten ? divisionColor(info.divisionKey) : MUTED,
          stroke: isActive ? '#0b3d2c' : STROKE,
          strokeWidth: isActive ? 2.6 : 1.1,
          strokeLinejoin: 'round',
        };
        if (!interactive) return <path key={d.id} {...common} />;
        return (
          <path
            key={d.id}
            {...common}
            className="bd-district"
            tabIndex={0}
            role="button"
            aria-pressed={eaten}
            aria-label={`${info.districtBn} — ${info.foodBn}`}
            onClick={() => onToggle?.(d.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle?.(d.id);
              }
            }}
            onMouseEnter={(e) => onHover?.(d.id, e)}
            onMouseMove={(e) => onHover?.(d.id, e)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(d.id)}
            onBlur={() => onHover?.(null)}
          />
        );
      })}
    </svg>
  );
}

export default memo(BDMap);
