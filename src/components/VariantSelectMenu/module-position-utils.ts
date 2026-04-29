import type { CompatibleModule } from '../../utils/configurator-utils.js';

export type ModulePositionTabType = 'all' | 'middle' | 'corner' | 'end';

export type ModulePositionGroupLabel = 'Middle' | 'Corner' | 'End' | 'Other';

const positionLower = (m: CompatibleModule) => m.position.toLowerCase();

export function getAvailableModulePositionTabs(modules: CompatibleModule[]): ModulePositionTabType[] {
  if (!modules.length) return ['all'];
  const types: ModulePositionTabType[] = ['all'];
  if (modules.some((m) => positionLower(m).includes('middle'))) types.push('middle');
  if (modules.some((m) => positionLower(m).includes('corner'))) types.push('corner');
  if (modules.some((m) => positionLower(m).includes('end'))) types.push('end');
  return types;
}

export function filterModulesByPositionTab(
  modules: CompatibleModule[],
  tab: ModulePositionTabType
): CompatibleModule[] {
  if (tab === 'all') return modules;
  return modules.filter((m) => positionLower(m).includes(tab));
}

/** One primary bucket per module (same priority as tab labels). */
export function groupModulesByPositionCategory(
  modules: CompatibleModule[]
): { label: ModulePositionGroupLabel; modules: CompatibleModule[] }[] {
  const order: ModulePositionGroupLabel[] = ['Middle', 'Corner', 'End', 'Other'];
  const buckets: Record<ModulePositionGroupLabel, CompatibleModule[]> = {
    Middle: [],
    Corner: [],
    End: [],
    Other: [],
  };
  for (const m of modules) {
    const p = positionLower(m);
    let key: ModulePositionGroupLabel = 'Other';
    if (p.includes('middle')) key = 'Middle';
    else if (p.includes('corner')) key = 'Corner';
    else if (p.includes('end')) key = 'End';
    buckets[key].push(m);
  }
  return order.filter((k) => buckets[k].length > 0).map((label) => ({ label, modules: buckets[label] }));
}
