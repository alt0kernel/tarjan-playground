import { useCallback, useState } from 'react';

export const FEATURES = [
  { key: 'play', label: 'Play button' }, { key: 'step', label: 'Step button' },
  { key: 'end', label: 'Run to end button' }, { key: 'reset', label: 'Reset button' },
  { key: 'speed', label: 'Speed' }, { key: 'preset', label: 'Which graph' },
  { key: 'random', label: 'Random graph' }, { key: 'edit', label: 'Edit tools' },
  { key: 'code', label: 'Pseudocode' }, { key: 'stacks', label: 'Stacks & SCCs' },
  { key: 'table', label: 'Node state table' }, { key: 'legend', label: 'Edge legend' },
] as const;
export type FeatureKey = typeof FEATURES[number]['key'];
export type Features = Record<FeatureKey, boolean>;

const read = (): Features => {
  const hidden = new Set((new URLSearchParams(location.search).get('hide') ?? '').split(',').filter(Boolean));
  return Object.fromEntries(FEATURES.map(f => [f.key, !hidden.has(f.key)])) as Features;
};
export const toUrl = (f: Features) => {
  const hide = FEATURES.filter(x => !f[x.key]).map(x => x.key).join(',');
  const u = new URL(location.href); u.search = hide ? `?hide=${hide}` : '';
  return u.toString();
};

export function useFeatures() {
  const [features, set] = useState<Features>(read);
  const toggle = useCallback((k: FeatureKey) => set(f => {
    const n = { ...f, [k]: !f[k] };
    history.replaceState(null, '', toUrl(n));
    return n;
  }), []);
  return { features, toggle };
}
