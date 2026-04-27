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

      {scene.elements.map(renderElement)}
    </AbsoluteFill>
  );
};
