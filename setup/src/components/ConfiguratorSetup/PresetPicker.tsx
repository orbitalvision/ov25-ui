import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import type { SetupPresetId } from './presets';
import { PresetCards } from './PresetCards';
import type { PreviewLayoutType } from './types';
import './preset-picker.css';

export function PresetPicker({ layout, selected, onSelect, onApply, onCancel, unavailable }: {
  layout: PreviewLayoutType;
  selected: SetupPresetId;
  onSelect: (id: SetupPresetId) => void;
  onApply: () => void;
  onCancel?: () => void;
  unavailable?: string;
}) {
  return <div className="ov25-preset-picker">
    <div className="ov25-preset-scroll">
      <header className="ov25-preset-header">
        <p className="ov25-preset-eyebrow">A starting point for your store</p>
        <h2>Choose a preset</h2>
        <p className="ov25-preset-intro">Choose how shoppers configure their product. You can adjust every setting afterwards.</p>
      </header>
      <PresetCards layout={layout} selected={selected} onSelect={onSelect} />
      {unavailable && <p role="alert" className="mt-4 text-sm text-destructive">{unavailable}</p>}
    </div>
    <div className="ov25-preset-footer">
      {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
      <Button className="ov25-preset-apply" size="lg" disabled={!!unavailable} onClick={onApply}>Use preset<ArrowRight className="h-4 w-4" /></Button>
    </div>
  </div>;
}
