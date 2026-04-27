import React from 'react';
import {interpolate, useVideoConfig} from 'remotion';
import {
  animatedProgress,
  centerX,
  fadeOpacity,
  getAction,
  msToFrame,
  pulseScale,
  resolveStyle,
  resolveToken,
} from './utils';

type PrimitiveProps = {
  element: any;
  scene: any;
  spec: any;
  frame: number;
};

const getX = (x: any, width: number) => (x === 'center' ? width / 2 : x);
const BAR_WIDTH = 78;
const BAR_GAP = 18;
const BAR_STROKE_WIDTH = 2;
const WATER_INSET = 4;

const getBarGeometry = (width: number, values: number[]) => {
  const totalWidth = values.length * BAR_WIDTH + (values.length - 1) * BAR_GAP;
  return {
    startX: centerX(width, totalWidth),
    totalWidth,
  };
};

export const TextPrimitive: React.FC<PrimitiveProps> = ({element, scene, spec, frame}) => {
  const {fps, width} = useVideoConfig();
  const style = resolveStyle(element.style, spec);
  const opacity = fadeOpacity(frame, fps, scene, element.id, false);
  const scale = pulseScale(frame, fps, scene, element.id);

  return (
    <div
      style={{
        position: 'absolute',
        left: getX(element.position.x, width),
        top: element.position.y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        color: style.color ?? spec.theme.colors.textPrimary,
        fontSize: style.fontSize ?? 28,
        fontWeight: style.weight ?? 'normal',
        fontFamily: spec.theme.fontFamily.heading,
        whiteSpace: 'nowrap',
      }}
    >
      {element.text}
    </div>
  );
};

export const CalloutPrimitive: React.FC<PrimitiveProps> = ({element, scene, spec, frame}) => {
  const {fps, width} = useVideoConfig();
  const style = resolveStyle(element.style, spec);
  const opacity = fadeOpacity(frame, fps, scene, element.id, false);

  return (
    <div
      style={{
        position: 'absolute',
        left: getX(element.position.x, width),
        top: element.position.y,
        transform: 'translate(-50%, -50%)',
        opacity,
        color: style.color ?? spec.theme.colors.textPrimary,
        background: style.backgroundColor ?? spec.theme.colors.calloutBg,
        border: `2px solid ${style.borderColor ?? spec.theme.colors.calloutBorder}`,
        borderRadius: 18,
        padding: '16px 24px',
        fontSize: style.fontSize ?? 26,
        fontFamily: spec.theme.fontFamily.body,
        boxShadow: '0 16px 40px rgba(0,0,0,0.32)',
      }}
    >
      {element.text}
    </div>
  );
};

export const BarGraphPrimitive: React.FC<PrimitiveProps> = ({element, scene, spec, frame}) => {
  const {fps, width} = useVideoConfig();
  const style = element.style ?? {};
  const values = element.values;
  const unitHeightPx = style.scale?.unitHeightPx ?? 100;
  const {startX} = getBarGeometry(width, values);
  const baselineY = element.position.y;
  const maxVal = Math.max(...values);
  const action = getAction(scene, 'BUILD_BAR_GRAPH_FROM_VALUES', element.id);
  const delayMs = action?.options?.delayPerBarMs ?? 100;

  return (
    <div style={{position: 'absolute', left: 0, top: 0}}>
      {values.map((value: number, index: number) => {
        const localStart = (action?.atMs ?? 0) + index * delayMs;
        const progress = action
          ? animatedProgress(frame, fps, localStart, Math.max(300, action.durationMs - index * delayMs))
          : 1;
        const barHeight = value * unitHeightPx * progress;
        const x = startX + index * (BAR_WIDTH + BAR_GAP);
        const y = baselineY - barHeight;
        const isPeak = value === maxVal;

        return (
          <div key={index}>
            <div
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: BAR_WIDTH,
                height: barHeight,
                background: isPeak ? resolveToken(style.barHighlightColor, spec) : resolveToken(style.barColor, spec),
                border: `2px solid ${resolveToken(style.barStroke, spec) ?? spec.theme.colors.surfaceStrong}`,
                borderRadius: '10px 10px 3px 3px',
                boxShadow: isPeak ? `0 0 22px ${spec.theme.colors.accent}` : 'none',
              }}
            />
            {style.showValueLabels && (
              <div
                style={{
                  position: 'absolute',
                  left: x + BAR_WIDTH / 2,
                  top: y - 28,
                  transform: 'translateX(-50%)',
                  color: resolveToken(style.labelColor, spec) ?? spec.theme.colors.textSecondary,
                  fontSize: 20,
                  fontFamily: spec.theme.fontFamily.mono,
                }}
              >
                {value}
              </div>
            )}
            {style.showIndexLabels && (
              <div
                style={{
                  position: 'absolute',
                  left: x + BAR_WIDTH / 2,
                  top: baselineY + 14,
                  transform: 'translateX(-50%)',
                  color: spec.theme.colors.textMuted,
                  fontSize: 18,
                  fontFamily: spec.theme.fontFamily.mono,
                }}
              >
                {index}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const WaterOverlayPrimitive: React.FC<PrimitiveProps> = ({element, scene, spec, frame}) => {
  const {fps, width} = useVideoConfig();
  const barElement = scene.elements.find((e: any) => e.id === element.attachedTo);
  if (!barElement) return null;

  const values = barElement.values;
  const action = getAction(scene, 'FILL_REMAINING_WATER_SEQUENTIALLY', element.id);
  const valuesFromAction = action?.options?.waterValues ?? {};
  const waterValues = element.waterValues.map((water: number, index: number) =>
    valuesFromAction[index] === undefined ? water : valuesFromAction[index]
  );
  const barStyle = barElement.style ?? {};
  const waterStyle = element.style ?? {};
  const unitHeightPx = barStyle.scale?.unitHeightPx ?? 100;
  const {startX} = getBarGeometry(width, values);
  const baselineY = barElement.position.y;
  const delayMs = action?.options?.delayPerIndexMs ?? 500;
  const indices = action?.options?.indices ?? [];
  const pulse = pulseScale(frame, fps, scene, element.id);

  return (
    <div style={{position: 'absolute', left: 0, top: 0}}>
      {waterValues.map((water: number, index: number) => {
        if (water <= 0) return null;

        const sequenceIndex = indices.indexOf(index);
        const localStart = (action?.atMs ?? 0) + Math.max(0, sequenceIndex) * delayMs;
        const progress = action
          ? animatedProgress(frame, fps, localStart, Math.max(350, action.durationMs / Math.max(1, indices.length)))
          : 1;

        const currentWaterHeight = water * unitHeightPx * progress;
        const x = startX + index * (BAR_WIDTH + BAR_GAP);
        const topOfBar = baselineY - values[index] * unitHeightPx;
        const y = topOfBar - currentWaterHeight + BAR_STROKE_WIDTH;
        const waterWidth = BAR_WIDTH - WATER_INSET * 2;
        const safeHeight = Math.max(0, currentWaterHeight - BAR_STROKE_WIDTH);

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x + WATER_INSET,
              top: y,
              width: waterWidth,
              height: safeHeight,
              opacity: waterStyle.opacity ?? 0.72,
              background: `linear-gradient(180deg, ${resolveToken(waterStyle.waterColor, spec)}, ${resolveToken(waterStyle.waterDeepColor, spec)})`,
              border: `2px solid ${resolveToken(waterStyle.strokeColor, spec)}`,
              borderRadius: '10px 10px 4px 4px',
              boxShadow: `0 0 20px ${resolveToken(waterStyle.waterColor, spec)}`,
              transformOrigin: 'bottom center',
              transform: `scale(${pulse})`,
              overflow: 'hidden',
            }}
          >
            {waterStyle.waveEffect && (
              <div
                style={{
                  position: 'absolute',
                  left: '-30%',
                  top: 0,
                  width: '160%',
                  height: '36%',
                  background:
                    'radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)',
                  opacity: 0.55,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ArrayPrimitive: React.FC<PrimitiveProps> = ({element, scene, spec, frame}) => {
  const {fps, width} = useVideoConfig();
  const opacity = fadeOpacity(frame, fps, scene, element.id, false);
  const style = element.cellStyle ?? {};
  const cellWidth = style.width ?? 58;
  const cellHeight = style.height ?? 48;
  const gap = 8;
  const labelWidth = 130;
  const totalWidth = labelWidth + element.values.length * cellWidth + (element.values.length - 1) * gap;
  const startX = centerX(width, totalWidth);
  const y = element.position.y;
  const highlightAction = getAction(scene, 'HIGHLIGHT_ARRAY_CELLS', element.id);
  const highlightIndices = highlightAction?.options?.indices ?? [];
  const mode = highlightAction?.options?.mode ?? 'all';
  const highlightColor = resolveToken(highlightAction?.options?.highlightColor, spec) ?? spec.theme.colors.arrayCellHighlight;

  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity}}>
      <div
        style={{
          position: 'absolute',
          left: startX,
          top: y,
          transform: 'translateY(-50%)',
          width: labelWidth - 12,
          color: resolveToken(style.labelColor, spec) ?? spec.theme.colors.textSecondary,
          fontSize: 21,
          fontWeight: 'bold',
          fontFamily: spec.theme.fontFamily.mono,
          textAlign: 'right',
        }}
      >
        {element.label}
      </div>

      {element.values.map((value: number, index: number) => {
        let isHighlighted = false;
        if (highlightAction && highlightIndices.includes(index)) {
          if (mode === 'sequential') {
            const seq = highlightIndices.indexOf(index);
            const delay = 450;
            const start = msToFrame(highlightAction.atMs + seq * delay, fps);
            const end = msToFrame(highlightAction.atMs + seq * delay + 700, fps);
            isHighlighted = frame >= start && frame <= end;
          } else {
            const start = msToFrame(highlightAction.atMs, fps);
            const end = msToFrame(highlightAction.atMs + highlightAction.durationMs, fps);
            isHighlighted = frame >= start && frame <= end;
          }
        }

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: startX + labelWidth + index * (cellWidth + gap),
              top: y,
              transform: `translateY(-50%) scale(${isHighlighted ? 1.12 : 1})`,
              width: cellWidth,
              height: cellHeight,
              borderRadius: 10,
              background: isHighlighted ? highlightColor : resolveToken(style.fillColor, spec),
              border: `2px solid ${resolveToken(style.borderColor, spec) ?? spec.theme.colors.arrayCellBorder}`,
              color: resolveToken(style.textColor, spec) ?? spec.theme.colors.textPrimary,
              fontSize: style.fontSize ?? 22,
              fontFamily: spec.theme.fontFamily.mono,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isHighlighted ? `0 0 20px ${highlightColor}` : 'none',
            }}
          >
            {value}
          </div>
        );
      })}
    </div>
  );
};

export const CounterPrimitive: React.FC<PrimitiveProps> = ({element, scene, spec, frame}) => {
  const {fps, width} = useVideoConfig();
  const style = resolveStyle(element.style, spec);
  const opacity = fadeOpacity(frame, fps, scene, element.id, false);
  const action = getAction(scene, 'UPDATE_COUNTER', element.id);
  let value = element.value;

  if (action) {
    const start = msToFrame(action.atMs, fps);
    const end = msToFrame(action.atMs + action.durationMs, fps);
    value = Math.round(
      interpolate(frame, [start, end], [action.options.from, action.options.to], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        transform: 'translate(-50%, -50%)',
        opacity,
        fontFamily: spec.theme.fontFamily.body,
        textAlign: 'center',
      }}
    >
      <div style={{color: style.labelColor ?? spec.theme.colors.textSecondary, fontSize: 22}}>{element.label}</div>
      <div style={{color: style.color ?? spec.theme.colors.accentSoft, fontSize: style.fontSize ?? 34, fontWeight: 'bold'}}>
        {value}
      </div>
    </div>
  );
};

export const AnswerCardPrimitive: React.FC<PrimitiveProps> = ({element, scene, spec, frame}) => {
  const {fps} = useVideoConfig();
  const style = resolveStyle(element.style, spec);
  const opacity = fadeOpacity(frame, fps, scene, element.id, false);
  const scale = pulseScale(frame, fps, scene, element.id);

  return (
    <div
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: style.width ?? 360,
        height: style.height ?? 150,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        background: style.backgroundColor ?? spec.theme.colors.answerCardBg,
        border: `3px solid ${style.borderColor ?? spec.theme.colors.answerCardBorder}`,
        borderRadius: 28,
        boxShadow: `0 0 34px ${style.borderColor ?? spec.theme.colors.answerCardBorder}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: spec.theme.fontFamily.heading,
      }}
    >
      <div style={{color: style.titleColor ?? spec.theme.colors.textSecondary, fontSize: 24}}>{element.title}</div>
      <div style={{color: style.valueColor ?? spec.theme.colors.textPrimary, fontSize: style.fontSize ?? 46, fontWeight: 'bold'}}>
        {element.value}
      </div>
    </div>
  );
};
