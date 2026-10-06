import React, { forwardRef } from 'react';
import BDMap from './BDMap';
import { DIVISIONS, districts, TOTAL, getLevel } from '../data/districts';

export const POSTER_W = 1080;
export const POSTER_H = 1350;

const GREEN = '#0b3d2c';
const GREEN_DEEP = '#072a1f';
const GOLD = '#d4af37';
const CREAM = '#fbf6ea';

/**
 * Fixed 1080×1350 poster. The very same component is used for the visible
 * (scaled) preview and for the off-screen export node, so they always match.
 * Avoid CSS features html2canvas can't render (backdrop-filter, bg-clip:text, line-clamp).
 */
const Poster = forwardRef(function Poster(
  { selected, name, photo, interactive = false, activeId = null, onToggle, onHover, lang = 'bn' },
  ref
) {
  const count = selected.size;
  const pct = TOTAL ? Math.round((count / TOTAL) * 100) : 0;
  const level = getLevel(count);
  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : 'F';

  const divStats = DIVISIONS.map((d) => {
    const all = districts.filter((x) => x.divisionKey === d.key);
    return { ...d, total: all.length, done: all.filter((x) => selected.has(x.id)).length };
  });

  return (
    <div
      ref={ref}
      className="font-bangla"
      style={{
        width: POSTER_W,
        height: POSTER_H,
        background: CREAM,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        color: GREEN,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: 250,
          background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DEEP} 100%)`,
          padding: '0 64px',
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          borderBottom: `8px solid ${GOLD}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 148,
            height: 148,
            borderRadius: '50%',
            border: `6px solid ${GOLD}`,
            overflow: 'hidden',
            background: '#145a43',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {photo ? (
            <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 72, fontWeight: 700, color: GOLD, lineHeight: 1 }}>{initial}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 58, fontWeight: 700, color: '#fff', lineHeight: 1.2, wordBreak: 'break-word' }}>
            {lang === 'bn' 
              ? (name?.trim() ? `${name.trim()} এর খাবারের মানচিত্র` : 'আমার খাবারের মানচিত্র')
              : (name?.trim() ? `${name.trim()}'s Food Map` : 'My Food Map')}
          </div>
          <div style={{ fontSize: 28, color: '#cfe3d9', marginTop: 10 }}>
            {lang === 'bn' ? 'বাংলাদেশের বিখ্যাত খাবারের ভ্রমণ' : 'A Culinary Journey Through Bangladesh'}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', gap: 28, padding: '36px 56px 24px', minHeight: 0 }}>
        {/* map */}
        <div
          style={{
            width: 650,
            background: '#fff',
            borderRadius: 36,
            border: '2px solid #eadfc4',
            padding: 20,
            boxShadow: '0 10px 30px rgba(11,61,44,0.08)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
            <BDMap
              lang={lang}
              selected={selected}
              interactive={interactive}
              activeId={activeId}
              onToggle={onToggle}
              onHover={onHover}
            />
          </div>
        </div>

        {/* stats */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
          <div
            style={{
              background: GREEN,
              borderRadius: 32,
              padding: '28px 24px',
              textAlign: 'center',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: 24, color: '#cfe3d9', marginBottom: 4 }}>{lang === 'bn' ? 'আমার স্কোর' : 'My Score'}</div>
            <div style={{ lineHeight: 1.05 }}>
              <span style={{ fontSize: 96, fontWeight: 700, color: GOLD }}>{lang === 'bn' ? String(count).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]) : count}</span>
              <span style={{ fontSize: 36, fontWeight: 600, opacity: 0.8 }}>/{lang === 'bn' ? String(TOTAL).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]) : TOTAL} {lang === 'bn' ? 'জেলা' : 'Districts'}</span>
            </div>
            <div style={{ marginTop: 14, height: 14, borderRadius: 999, background: 'rgba(255,255,255,0.18)' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${GOLD}, #f4d673)`,
                }}
              />
            </div>
            <div style={{ fontSize: 22, marginTop: 8, color: '#cfe3d9' }}>{lang === 'bn' ? String(pct).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]) : pct}% {lang === 'bn' ? 'সম্পন্ন' : 'Completed'}</div>
          </div>

          <div
            style={{
              background: '#fff',
              border: `3px solid ${GOLD}`,
              borderRadius: 28,
              padding: '16px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 20, color: '#8a7a4a', marginBottom: 4 }}>{lang === 'bn' ? 'আমার লেভেল' : 'My Level'}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#df2a38', lineHeight: 1.25 }}>{level}</div>
          </div>

          <div
            style={{
              flex: 1,
              background: '#fff',
              border: '2px solid #eadfc4',
              borderRadius: 28,
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {divStats.map((d) => (
              <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    background: d.color,
                    opacity: d.done ? 1 : 0.35,
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: 23, fontWeight: 600, color: GREEN }}>
                  {lang === 'bn' ? d.bn.replace(' বিভাগ', '') : d.en.replace(' Division', '')}
                </span>
                <span style={{ fontSize: 23, fontWeight: 700, color: d.done ? d.color : '#a39b86' }}>
                  {lang === 'bn' ? String(d.done).replace(/\d/g, n => '০১২৩৪৫৬৭৮৯'[n]) : d.done}/{lang === 'bn' ? String(d.total).replace(/\d/g, n => '০১২৩৪৫৬৭৮৯'[n]) : d.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          height: 96,
          background: GREEN_DEEP,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 64px',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 28, color: '#cfe3d9' }}>{lang === 'bn' ? 'আপনি কয়টা জেলার খাবার খেয়েছেন?' : 'How many district foods have you eaten?'}</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: GOLD, letterSpacing: 0.5 }}>Food Bingo BD</div>
      </div>
    </div>
  );
});

export default Poster;
