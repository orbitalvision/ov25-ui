import React, { useEffect, useState } from 'react';
import type { CompatibleModule, Snap2VariableDimensionAxisConfig } from '../../utils/configurator-utils.js';
import { cn } from '../../lib/utils.js';

type AxisKey = 'x' | 'y' | 'z';

const AXIS_LABELS: Record<AxisKey, string> = { x: 'Width', y: 'Height', z: 'Depth' };
const AXIS_PRODUCT_KEYS: Record<AxisKey, 'dimensionX' | 'dimensionY' | 'dimensionZ'> = {
  x: 'dimensionX',
  y: 'dimensionY',
  z: 'dimensionZ',
};

function clampToStep(value: number, min: number, max: number, step: number): number {
  const clamped = Math.max(min, Math.min(max, value));
  if (step <= 0) return clamped;
  const steps = Math.round((clamped - min) / step);
  return min + steps * step;
}

export function Snap2CustomDimensionForm({
  module,
  onConfirm,
  onCancel,
}: {
  module: CompatibleModule;
  onConfirm: (dims: { x?: number; y?: number; z?: number }) => void;
  onCancel: () => void;
}) {
  const variableDimensions = module.variableDimensions;
  const product = module.product;

  const getDefaultMm = (axis: AxisKey): number => {
    const k = AXIS_PRODUCT_KEYS[axis];
    const v = product[k as keyof typeof product] as number | null | undefined;
    return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
  };

  const initialValues = (): { x?: number; y?: number; z?: number } => {
    const out: { x?: number; y?: number; z?: number } = {};
    (['x', 'y', 'z'] as AxisKey[]).forEach((axis) => {
      const cfg = variableDimensions?.[axis] as Snap2VariableDimensionAxisConfig | undefined;
      if (cfg) {
        const def = getDefaultMm(axis);
        out[axis] = clampToStep(def, cfg.min, cfg.max, cfg.increment);
      }
    });
    return out;
  };

  const [values, setValues] = useState<{ x?: number; y?: number; z?: number }>(initialValues);

  useEffect(() => {
    setValues(initialValues());
  }, [module]);

  const setAxis = (axis: AxisKey, raw: number) => {
    const cfg = variableDimensions?.[axis];
    if (!cfg) return;
    if (Number.isNaN(raw)) return;
    const clamped = clampToStep(raw, cfg.min, cfg.max, cfg.increment);
    setValues((prev) => ({ ...prev, [axis]: clamped }));
  };

  const axes = (['x', 'y', 'z'] as AxisKey[]).filter((a) => variableDimensions?.[a]);
  const canSubmit =
    axes.length > 0 && axes.every((a) => values[a] != null && (values[a] as number) > 0);

  const handleConfirm = () => {
    if (!canSubmit) return;
    const out: { x?: number; y?: number; z?: number } = {};
    axes.forEach((a) => {
      out[a] = values[a];
    });
    onConfirm(out);
  };

  if (axes.length === 0) return null;

  return (
    <div
      className={cn(
        'ov25-snap2-custom-dimension-form',
        'ov:w-full ov:overflow-x-hidden',
        'ov:rounded-lg ov:border ov:border-(--ov25-border-color) ov:bg-(--ov25-background-color) ov:p-2 ov:shadow-md'
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="ov:mb-2 ov:text-center ov:text-xs ov:font-medium ov:text-(--ov25-text-color)">Custom size (cm)</p>
      <p className="ov:mb-2 ov:text-center ov:text-[10px] ov:text-(--ov25-secondary-text-color)">{product.name}</p>
      {axes.map((axis) => {
        const cfg = variableDimensions![axis] as Snap2VariableDimensionAxisConfig;
        const value = values[axis] ?? getDefaultMm(axis);
        return (
          <div key={axis} className="ov:mb-2">
            <label className="ov:mb-0.5 ov:block ov:text-[10px] ov:text-(--ov25-secondary-text-color)">
              {AXIS_LABELS[axis]}
            </label>
            <input
              type="number"
              min={cfg.min}
              max={cfg.max}
              step={cfg.increment}
              value={value}
              onChange={(e) => setAxis(axis, e.target.valueAsNumber)}
              className="ov:w-full ov:rounded ov:border ov:border-(--ov25-border-color) ov:px-1 ov:py-0.5 ov:text-xs"
            />
            <p className="ov:mt-0.5 ov:text-[9px] ov:text-(--ov25-secondary-text-color)">
              Min {cfg.min} · Max {cfg.max} · Step {cfg.increment}
            </p>
          </div>
        );
      })}
      <div className="ov:flex ov:gap-1 ov:pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="ov:flex-1 ov:rounded ov:border ov:border-(--ov25-border-color) ov:bg-(--ov25-secondary-background-color) ov:px-2 ov:py-1 ov:text-xs"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleConfirm}
          className={cn(
            'ov:flex-1 ov:rounded ov:px-2 ov:py-1 ov:text-xs',
            canSubmit
              ? 'ov:bg-(--ov25-text-color) ov:text-(--ov25-background-color)'
              : 'ov:cursor-not-allowed ov:opacity-50'
          )}
        >
          Add
        </button>
      </div>
    </div>
  );
}
