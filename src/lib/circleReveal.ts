import { prefersReducedMotion } from "@/lib/motion";

const REVEAL_DURATION = 700;
const REVEAL_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

type RevealOrigin = { x: number; y: number };

function animateCircle({ x, y }: RevealOrigin): void {
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  document.documentElement.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${radius}px at ${x}px ${y}px)`,
      ],
    },
    {
      duration: REVEAL_DURATION,
      easing: REVEAL_EASING,
      pseudoElement: "::view-transition-new(root)",
    },
  );
}

// Новый вид раскрывается кругом из точки origin. Без View Transitions API
// (старые браузеры) и при «уменьшить движение» вид меняется мгновенно
export function revealChange(origin: RevealOrigin, update: () => void): void {
  const canAnimate =
    typeof document.startViewTransition === "function" &&
    !prefersReducedMotion();

  if (!canAnimate) {
    update();
    return;
  }

  // ready отклоняется, если браузер пропустил переход; вид при этом всё равно меняется
  document
    .startViewTransition(update)
    .ready.then(() => animateCircle(origin), () => undefined);
}
