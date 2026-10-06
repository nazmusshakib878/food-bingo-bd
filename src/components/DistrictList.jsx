import React, { useMemo, useState } from 'react';
import { Search, RefreshCcw, Check, ChevronDown } from 'lucide-react';
import { DIVISIONS, districts, TOTAL } from '../data/districts';

const norm = (s) => s.toLowerCase().trim();

export default function DistrictList({ selected, onToggle, onSetMany, onClear, onHover, activeId, lang = 'bn' }) {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState({});
  const q = norm(query);

  const groups = useMemo(
    () =>
      DIVISIONS.map((div) => {
        const all = districts.filter((d) => d.divisionKey === div.key);
        const shown = q
          ? all.filter((d) =>
              [d.districtBn, d.districtEn, d.foodBn, d.foodEn].some((t) => norm(t).includes(q))
            )
          : all;
        return { div, all, shown };
      }).filter((g) => g.shown.length),
    [q]
  );

  return (
    <div className="bg-white rounded-[28px] border border-[#eadfc4] shadow-soft overflow-hidden flex flex-col lg:h-[calc(100vh-7rem)] lg:min-h-[560px]">
      <div className="p-5 md:p-6 border-b border-[#f0e8d2] bg-gradient-to-b from-[#fffdf7] to-white">
        <h2 className="text-xl md:text-2xl font-bold text-brand-green leading-snug">
          {lang === 'bn' ? 'যেসব জেলার বিখ্যাত খাবার খেয়েছি' : 'Famous Foods I Have Eaten'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{lang === 'bn' ? 'জেলা বা খাবারে ট্যাপ করে চিহ্নিত করুন' : 'Tap a district or food to mark it'}</p>

        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="district-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'bn' ? "জেলা বা খাবার খুঁজুন… (রসমালাই, Cumilla)" : "Search district or food..."}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#eadfc4] bg-[#fdfaf2] focus:bg-white focus:border-brand-green focus:ring-2 focus:ring-brand-green/15 outline-none text-base"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm font-semibold text-brand-green">
            <span className="text-2xl font-bold">{selected.size}</span>
            <span className="text-brand-red font-bold"> / {TOTAL}</span>
            <span className="text-gray-500 font-medium">{lang === 'bn' ? ' জেলা' : ' Districts'}</span>
          </div>
          <button
            id="clear-all"
            onClick={() => {
              if (selected.size && window.confirm('আপনি কি সব বাছাই মুছে ফেলতে চান?')) onClear();
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-red px-3 py-1.5 rounded-full border border-transparent hover:border-red-100 hover:bg-red-50 transition"
          >
            <RefreshCcw size={14} /> {lang === 'bn' ? 'সব মুছুন' : 'Clear All'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 max-h-[70vh] lg:max-h-none">
        {groups.length === 0 && (
          <div className="text-center text-gray-500 py-12">{lang === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি।' : 'No results found.'}</div>
        )}
        {groups.map(({ div, all, shown }) => {
          const done = all.filter((d) => selected.has(d.id)).length;
          const allDone = done === all.length;
          const isOpen = q ? true : !collapsed[div.key];
          return (
            <section key={div.key} className="rounded-2xl border border-[#f0e8d2] overflow-hidden">
              <header className="flex items-center gap-2 px-3 py-2.5 bg-[#fdfaf2]">
                <button
                  className="flex items-center gap-2 flex-1 text-left"
                  onClick={() => setCollapsed((c) => ({ ...c, [div.key]: !c[div.key] }))}
                  aria-expanded={isOpen}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: div.color }} />
                  <span className="font-bold text-brand-green">{lang === 'bn' ? div.bn : div.en}</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: done ? div.color : '#b9b19b' }}
                  >
                    {done}/{all.length}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <button
                  onClick={() => onSetMany(all.map((d) => d.id), !allDone)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border border-[#eadfc4] text-brand-green hover:bg-brand-green hover:text-white transition"
                >
                  {lang === 'bn' ? (allDone ? 'সব বাদ' : 'সব বাছাই') : (allDone ? 'Unselect All' : 'Select All')}
                </button>
              </header>

              {isOpen && (
                <ul className="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                  {shown.map((d) => {
                    const on = selected.has(d.id);
                    return (
                      <li key={d.id}>
                        <button
                          onClick={() => onToggle(d.id)}
                          onMouseEnter={() => onHover(d.id)}
                          onMouseLeave={() => onHover(null)}
                          aria-pressed={on}
                          className="w-full flex items-center gap-3 text-left rounded-xl border px-2.5 py-2 transition active:scale-[0.98] min-h-[4.5rem]"
                          style={{
                            borderColor: on ? div.color : activeId === d.id ? '#0b3d2c' : '#ece4cf',
                            background: on ? `${div.color}14` : '#fff',
                          }}
                        >
                          <span
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition"
                            style={{
                              borderColor: on ? div.color : '#d6cdb5',
                              background: on ? div.color : 'transparent',
                            }}
                          >
                            {on && <Check size={14} strokeWidth={4} className="text-white" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-bold text-[15px] leading-tight text-brand-dark">
                              {lang === 'bn' ? d.districtBn : d.districtEn}
                            </span>
                            <span className="block text-[13px] leading-tight text-gray-500 line-clamp-2 mt-0.5">
                              {lang === 'bn' ? d.foodBn : d.foodEn}
                            </span>
                          </span>                          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f2ecdd] text-lg" aria-hidden="true">
                            <span>🍲</span>
                            {d.image && (
                              <img
                                src={d.image}
                                alt=""
                                loading="lazy"
                                onError={(e) => e.currentTarget.remove()}
                                className={`absolute inset-0 h-full w-full object-cover transition ${on ? '' : 'grayscale opacity-60'}`}
                              />
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
