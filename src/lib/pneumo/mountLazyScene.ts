type LazyScene = {
  resize(width: number, height: number): void;
  dispose(): void;
};

// Сцена создаётся, когда канвас впервые попадает в кадр: до этого three.js не грузится,
// а анимация появления играет на глазах у человека, а не где-то ниже экрана
export function mountLazyScene<T extends LazyScene>(
  canvas: HTMLCanvasElement,
  create: () => Promise<T | null>,
  attach: (scene: T) => () => void,
): () => void {
  let scene: T | null = null;
  let detach: (() => void) | null = null;
  let isCancelled = false;

  const resizeObserver = new ResizeObserver(([entry]) => {
    scene?.resize(entry.contentRect.width, entry.contentRect.height);
  });

  async function start(): Promise<void> {
    const created = await create();
    if (!created) return;
    if (isCancelled) {
      created.dispose();
      return;
    }
    scene = created;
    detach = attach(created);
    resizeObserver.observe(canvas);
    canvas.dataset.ready = "";
  }

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    visibilityObserver.disconnect();
    void start();
  });
  visibilityObserver.observe(canvas);

  return () => {
    isCancelled = true;
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    detach?.();
    scene?.dispose();
    delete canvas.dataset.ready;
  };
}
