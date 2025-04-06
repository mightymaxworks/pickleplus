declare module 'canvas-confetti' {
  type Options = {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  };

  type CreateTypes = {
    canvas: HTMLCanvasElement;
    reset: () => void;
  };

  function canvasConfetti(options?: Options): Promise<void>;
  namespace canvasConfetti {
    export function create(canvas: HTMLCanvasElement, options?: { resize?: boolean; useWorker?: boolean; }): CreateTypes;
    export function reset(): void;
  }
  
  export = canvasConfetti;
}