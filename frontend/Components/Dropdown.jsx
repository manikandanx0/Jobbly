import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Reusable, accessible custom dropdown that mirrors <select> API: value, onChange
export default function Dropdown({ value, onChange, options = [], placeholder = 'Select...', className = '', label, id }){
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const internalId = useId();
  const dropdownId = id || `dd-${internalId}`;

  const items = useMemo(()=> options.map((opt)=> (
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )), [options]);

  const selectedIndex = items.findIndex((o)=> o.value === value);
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null;

  function toggle(){ setOpen((o)=>!o); }
  function close(){ setOpen(false); setHoverIndex(-1); }
  function commit(index){
    const item = items[index];
    if (!item) return;
    onChange?.({ target: { value: item.value } });
    close();
    // Return focus to button for accessibility
    requestAnimationFrame(()=> buttonRef.current?.focus());
  }

  function onKeyDown(e){
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter')){
      e.preventDefault();
      setOpen(true);
      setHoverIndex(Math.max(0, selectedIndex));
      return;
    }
    if (!open) return;
    if (e.key === 'Escape'){ e.preventDefault(); close(); return; }
    if (e.key === 'ArrowDown'){
      e.preventDefault(); setHoverIndex((i)=> (i+1) % items.length);
    } else if (e.key === 'ArrowUp'){
      e.preventDefault(); setHoverIndex((i)=> (i-1+items.length) % items.length);
    } else if (e.key === 'Enter'){
      e.preventDefault(); commit(hoverIndex >= 0 ? hoverIndex : Math.max(0, selectedIndex));
    }
  }

  useEffect(()=>{
    function onDocKey(e){ if (e.key === 'Escape') close(); }
    function onDocClick(e){ if (!listRef.current && !buttonRef.current) return; if (!listRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) close(); }
    if (open){
      document.addEventListener('keydown', onDocKey);
      document.addEventListener('mousedown', onDocClick);
    }
    return ()=>{
      document.removeEventListener('keydown', onDocKey);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label htmlFor={dropdownId} className="block text-sm mb-1 text-textSecondary">{label}</label>
      )}
      <button
        ref={buttonRef}
        id={dropdownId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${dropdownId}-list`}
        aria-haspopup="listbox"
        onClick={toggle}
        onKeyDown={onKeyDown}
        className="w-full text-left rounded-xl border border-border bg-white dark:bg-gray-900 text-textPrimary px-3 py-2 md:py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6C00FF]/40 transition"
      >
        <span className="block truncate">{selected?.label || placeholder}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={`${dropdownId}-list`}
            role="listbox"
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-white dark:bg-gray-900 shadow-lg overflow-hidden"
          >
            {items.map((opt, idx)=>{
              const isSelected = value === opt.value;
              const isHover = hoverIndex === idx;
              return (
                <li
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={()=> setHoverIndex(idx)}
                  onMouseDown={(e)=> e.preventDefault()}
                  onClick={()=> commit(idx)}
                  className={`px-3 py-2 text-sm cursor-pointer select-none ${isHover ? 'bg-[#6C00FF]/10' : ''} ${isSelected ? 'text-[#6C00FF] font-medium' : 'text-textPrimary'}`}
                >
                  {opt.label}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}


