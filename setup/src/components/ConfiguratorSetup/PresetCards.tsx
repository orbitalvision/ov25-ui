import { useId } from 'react';
import { Check } from 'lucide-react';
import { getSetupPresets, type SetupPresetId } from './presets';
import type { PreviewLayoutType } from './types';
import './preset-cards.css';

function PresetIllustration({ id }: { id: SetupPresetId }) {
  return <div className={`ov25-card-illustration ov25-card-${id}`} aria-hidden="true"><div className="ov25-card-browser"><div className="ov25-card-browser-bar"><i /><i /><i /></div><div className="ov25-card-scene"><div className="ov25-card-object"><div /><span /></div><div className="ov25-card-panel"><b /><i /><i /><i /><em /></div>{id === 'guided' && <div className="ov25-card-dialog"><b /><i /><i /><i /><em /></div>}{id === 'overview' && <div className="ov25-card-overview-grid"><i /><i /><i /><i /></div>}</div></div></div>;
}

/** Layout choices only; the host owns headings, navigation and applying the choice. */
export function PresetCards({ layout, selected, onSelect }: {
  layout: PreviewLayoutType;
  selected: SetupPresetId | '';
  onSelect: (id: SetupPresetId) => void;
}) {
  const radioGroup = useId();
  return <div className="ov25-cards-container"><fieldset className="ov25-cards-grid">
    <legend className="ov25-cards-sr-only">Configurator layout</legend>
    {getSetupPresets(layout).map(preset => <label key={preset.id} className="ov25-card-option">
      <input className="ov25-cards-sr-only ov25-card-radio" type="radio" name={radioGroup} value={preset.id} checked={selected === preset.id} onChange={() => onSelect(preset.id)} />
      <span className="ov25-card"><PresetIllustration id={preset.id} /><span className="ov25-card-copy"><span className="ov25-card-mark" aria-hidden="true">{selected === preset.id && <Check size={15} />}</span><strong>{preset.name}</strong><span className="ov25-card-description">{preset.description}</span></span></span>
    </label>)}
  </fieldset></div>;
}
