import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  AnswerCardPrimitive,
  ArrayPrimitive,
  BarGraphPrimitive,
  CalloutPrimitive,
  CounterPrimitive,
  TextPrimitive,
  WaterOverlayPrimitive,
} from './primitives';

export const TrappingRainWaterPoc: React.FC<{spec: any}> = ({spec}) => {
  const frame = useCurrentFrame();
  const scene = spec.scenes[0];
  const safeArea = spec.renderSettings.safeArea ?? {top: 60, right: 60, bottom: 60, left: 60};
  const graphRegion = scene.layout?.graphRegion;
  const footerRegion = scene.layout?.arrayFooterRegion;

  const renderElement = (element: any) => {
    const props = {key: element.id, element, scene, spec, frame};

    switch (element.type) {
      case 'TEXT':
        return <TextPrimitive {...props} />;
      case 'BAR_GRAPH':
        return <BarGraphPrimitive {...props} />;
      case 'WATER_OVERLAY':
        return <WaterOverlayPrimitive {...props} />;
      case 'ARRAY':
        return <ArrayPrimitive {...props} />;
      case 'COUNTER':
        return <CounterPrimitive {...props} />;
      case 'ANSWER_CARD':
        return <AnswerCardPrimitive {...props} />;
      case 'CALLOUT':
        return <CalloutPrimitive {...props} />;
      default:
        return null;
    }
  };

  return (
    <AbsoluteFill
      style={{
        background: spec.theme.colors.background,
        color: spec.theme.colors.textPrimary,
        fontFamily: spec.theme.fontFamily.body,
      }}
    >
      {/* subtle background glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.15), transparent 30%), radial-gradient(circle at 80% 35%, rgba(245,158,11,0.12), transparent 28%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: safeArea.top,
          left: safeArea.left,
          right: safeArea.right,
          bottom: safeArea.bottom,
          border: '1px solid rgba(148,163,184,0.16)',
          borderRadius: 24,
          pointerEvents: 'none',
        }}
      />

      {graphRegion && (
        <div
          style={{
            position: 'absolute',
            left: graphRegion.x - 24,
            top: graphRegion.y - 24,
            width: graphRegion.width + 48,
            height: graphRegion.height + 42,
            borderRadius: 26,
            background: 'linear-gradient(180deg, rgba(15,23,42,0.45), rgba(15,23,42,0.2))',
            border: '1px solid rgba(51,65,85,0.6)',
            boxShadow: 'inset 0 1px 0 rgba(148,163,184,0.12)',
          }}
        />
      )}

      {footerRegion && (
        <div
          style={{
            position: 'absolute',
            left: footerRegion.x - 24,
            top: footerRegion.y - 20,
            width: footerRegion.width + 48,
            height: footerRegion.height + 10,
            borderRadius: 26,
            background: 'rgba(17,24,39,0.42)',
            border: '1px solid rgba(51,65,85,0.5)',
          }}
        />
      )}

      {scene.elements.map(renderElement)}
    </AbsoluteFill>
  );
};
