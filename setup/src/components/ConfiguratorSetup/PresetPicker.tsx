import { useId } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { getSetupPresets, type SetupPresetId } from './presets';
import type { PreviewLayoutType } from './types';
import './preset-picker.css';

function PresetThumbnail({ id }: { id: SetupPresetId }) {
  return <svg viewBox="0 0 180 88" aria-hidden="true" className="ov25-preset-thumbnail">
    <rect x="9" y="9" width="162" height="70" rx="5" fill="white" stroke="#e7e5e4" />
    <path d="M9 21h162" stroke="#e7e5e4" />
    <circle cx="17" cy="15" r="1.5" fill="#a8a29e" /><circle cx="22" cy="15" r="1.5" fill="#d6d3d1" />
    <rect x="19" y="28" width="88" height="41" rx="4" fill="#f5f5f4" />
    <path d="M37 48v12h50V48M42 48V38h40v10M39 50h46M43 60v4m38-4v4" stroke="#a8a29e" fill="none" strokeWidth="3" strokeLinejoin="round" />
    {id === 'classic' && <><rect x="116" y="30" width="45" height="4" rx="2" fill="#d6d3d1" /><rect x="116" y="40" width="33" height="3" rx="1" fill="#e7e5e4" /><rect x="116" y="54" width="45" height="13" rx="3" fill="#9b1d58" /></>}
    {id === 'in-page' && [30, 44, 58].map((y) => <g key={y}><rect x="116" y={y} width="45" height="10" rx="2" fill="#f5f5f4" /><path d={`M122 ${y + 5}h21m8-2v4m-2-2h4`} stroke="#a8a29e" /></g>)}
    {id === 'guided' && <><rect x="40" y="25" width="100" height="48" rx="4" fill="white" stroke="#d6d3d1" /><path d="M53 35h60" stroke="#9b1d58" strokeWidth="3" /><circle cx="55" cy="51" r="6" fill="#e7e5e4" /><circle cx="73" cy="51" r="6" fill="#a8a29e" /><circle cx="91" cy="51" r="6" fill="#d6d3d1" /><rect x="110" y="60" width="20" height="5" rx="2" fill="#9b1d58" /></>}
    {id === 'overview' && [0, 1, 2, 3].map((i) => <g key={i}><rect x={116 + i % 2 * 24} y={30 + Math.floor(i / 2) * 22} width="20" height="17" rx="3" fill="#f5f5f4" /><circle cx={126 + i % 2 * 24} cy={37 + Math.floor(i / 2) * 22} r="3" fill="#a8a29e" /></g>)}
  </svg>;
}

export function PresetPicker({ layout, selected, onSelect, onApply, onCancel, unavailable }: {
  layout: PreviewLayoutType;
  selected: SetupPresetId;
  onSelect: (id: SetupPresetId) => void;
  onApply: () => void;
  onCancel?: () => void;
  unavailable?: string;
}) {
  const radioGroup = useId();
  return <div className="ov25-preset-picker">
    <div className="ov25-preset-scroll">
      <header className="ov25-preset-header">
        <p className="ov25-preset-eyebrow">A starting point for your store</p>
        <h2>Choose a preset</h2>
        <p className="ov25-preset-intro">Choose how shoppers configure their product. You can adjust every setting afterwards.</p>
      </header>
      <fieldset className="ov25-preset-grid">
        <legend className="sr-only">Configurator preset</legend>
        {getSetupPresets(layout).map((preset) => <label key={preset.id} className="ov25-preset-option">
          <input type="radio" name={radioGroup} value={preset.id} checked={selected === preset.id} onChange={() => onSelect(preset.id)} className="ov25-preset-radio sr-only" />
          <span className="ov25-preset-card">
            <span className="ov25-preset-media"><PresetThumbnail id={preset.id} /></span>
            <span className="ov25-preset-copy">
              <span className="ov25-preset-name">{preset.name}<span className="ov25-preset-check" aria-hidden="true">{selected === preset.id && <Check size={16} />}</span></span>
              <span className="ov25-preset-description">{preset.description}</span>
            </span>
          </span>
        </label>)}
      </fieldset>
      {unavailable && <p role="alert" className="mt-4 text-sm text-destructive">{unavailable}</p>}
    </div>
    <div className="ov25-preset-footer">
      {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
      <Button className="ov25-preset-apply" size="lg" disabled={!!unavailable} onClick={onApply}>Use preset<ArrowRight className="h-4 w-4" /></Button>
    </div>
  </div>;
}
