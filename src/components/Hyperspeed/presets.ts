// Hyperspeed presets for different visual effects
export const hyperspeedPresets = {
  ens: {
    onSpeedUp: () => {},
    onSlowDown: () => {},
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 9,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 50,
    lightPairsPerRoadWay: 50,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [400 * 0.05, 400 * 0.15],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.2, 0.2],
    carFloorSeparation: [0.05, 1],
    colors: {
      roadColor: 0xF8FAFC, // Light background to match ENS theme
      islandColor: 0xE2E8F0,
      background: 0xF8FAFC,
      shoulderLines: 0x3888FF, // ENS blue
      brokenLines: 0x93C5FD,
      leftCars: [0x3888FF, 0x5BA3FF, 0x2870E0], // Blues
      rightCars: [0x1a9c7b, 0x22c997, 0x10b981], // Greens
      sticks: 0x3888FF
    }
  }
};
