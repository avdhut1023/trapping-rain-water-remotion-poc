import React from 'react';
import {Composition} from 'remotion';
import spec from '../public/video-spec-trapping-rain-water-poc-v1.json';
import {TrappingRainWaterPoc} from './TrappingRainWaterPoc';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={spec.renderSettings.renderer.compositionId}
      component={TrappingRainWaterPoc}
      durationInFrames={spec.renderSettings.durationFrames}
      fps={spec.renderSettings.fps}
      width={spec.renderSettings.width}
      height={spec.renderSettings.height}
      defaultProps={{spec}}
    />
  );
};
