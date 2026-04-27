import {interpolate, spring} from 'remotion';

export const msToFrame = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

export const resolveToken = (value: any, spec: any): any => {
  if (typeof value !== 'string') return value;
  if (!value.startsWith('theme.')) return value;

  const parts = value.split('.');
  let current = spec;
  for (const part of parts) {
    if (current == null) return value;
    current = current[part];
  }
  return current ?? value;
};

export const resolveStyle = (style: any = {}, spec: any): any => {
  const out: any = {};
  for (const key of Object.keys(style)) {
    const value = style[key];
    out[key] = resolveToken(value, spec);
  }
  return out;
};

export const getAction = (scene: any, actionName: string, targetId: string) => {
  return scene.actions.find((a: any) => a.action === actionName && a.target === targetId);
};

export const getActions = (scene: any, actionName: string, targetId: string) => {
  return scene.actions.filter((a: any) => a.action === actionName && a.target === targetId);
};

export const fadeOpacity = (frame: number, fps: number, scene: any, targetId: string, defaultVisible = true) => {
  const action = getAction(scene, 'FADE_IN', targetId);
  if (!action) return defaultVisible ? 1 : 0;

  const start = msToFrame(action.atMs, fps);
  const end = msToFrame(action.atMs + action.durationMs, fps);
  return interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
};

export const pulseScale = (frame: number, fps: number, scene: any, targetId: string) => {
  const actions = getActions(scene, 'PULSE_HIGHLIGHT', targetId);
  for (const action of actions) {
    const start = msToFrame(action.atMs, fps);
    const end = msToFrame(action.atMs + action.durationMs, fps);
    if (frame >= start && frame <= end) {
      const progress = interpolate(frame, [start, end], [0, Math.PI], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      return 1 + Math.sin(progress) * 0.08;
    }
  }
  return 1;
};

export const animatedProgress = (frame: number, fps: number, atMs: number, durationMs: number) => {
  const start = msToFrame(atMs, fps);
  const end = msToFrame(atMs + durationMs, fps);
  return interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
};

export const centerX = (screenWidth: number, totalWidth: number) => (screenWidth - totalWidth) / 2;
