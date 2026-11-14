// Пока движение короче — неясно, листают страницу или тянут ползунок
const SLIDE_LOCK_DISTANCE = 8;
const THUMB_SIZE_PROPERTY = "--range-thumb-size";

type Point = { x: number; y: number };
type TrackGeometry = { left: number; width: number; thumbSize: number };

function measureTrack(input: HTMLInputElement): TrackGeometry {
  const { left, width } = input.getBoundingClientRect();
  const thumbSize = parseFloat(getComputedStyle(input).getPropertyValue(THUMB_SIZE_PROPERTY)) || 0;
  return { left, width, thumbSize };
}

// Центр бегунка ходит от left + thumb/2 до right − thumb/2 — так же считает сам браузер
function valueAt(input: HTMLInputElement, track: TrackGeometry, clientX: number): number {
  const min = Number(input.min);
  const max = Number(input.max);
  const step = Number(input.step) || 1;
  const travel = Math.max(track.width - track.thumbSize, 1);
  const ratio = Math.min(Math.max((clientX - track.left - track.thumbSize / 2) / travel, 0), 1);
  return Math.min(max, min + Math.round((ratio * (max - min)) / step) * step);
}

// Нативный range на телефоне тянется только за сам бегунок, остальной свайп браузер забирает
// себе (назад/вперёд, смена вкладки). Здесь горизонтальный свайп в любом месте полосы двигает
// значение, а вертикальный по-прежнему листает страницу
export function attachTouchSlide(input: HTMLInputElement, onSlide: (value: number) => void): () => void {
  let origin: Point | null = null;
  let track: TrackGeometry | null = null;
  let startValue = 0;

  function handleStart(event: TouchEvent) {
    const touch = event.touches[0];
    origin = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
    track = null;
    startValue = Number(input.value);
  }

  // Браузер прыгает бегунком к пальцу уже на касании — если это была прокрутка, значение возвращаем
  function restoreStartValue() {
    if (Number(input.value) !== startValue) onSlide(startValue);
  }

  function lockHorizontal(touch: Touch): TrackGeometry | null {
    if (!origin) return null;
    const dx = Math.abs(touch.clientX - origin.x);
    const dy = Math.abs(touch.clientY - origin.y);
    if (Math.max(dx, dy) < SLIDE_LOCK_DISTANCE) return null;
    if (dy > dx) {
      origin = null;
      restoreStartValue();
      return null;
    }
    track = measureTrack(input);
    return track;
  }

  function handleMove(event: TouchEvent) {
    const touch = event.touches[0];
    const geometry = track ?? lockHorizontal(touch);
    if (!geometry) return;
    if (event.cancelable) event.preventDefault();
    const value = valueAt(input, geometry, touch.clientX);
    if (value !== Number(input.value)) onSlide(value);
  }

  function handleEnd() {
    origin = null;
    track = null;
  }

  function handleCancel() {
    if (!track) restoreStartValue();
    handleEnd();
  }

  input.addEventListener("touchstart", handleStart, { passive: true });
  input.addEventListener("touchmove", handleMove, { passive: false });
  input.addEventListener("touchend", handleEnd);
  input.addEventListener("touchcancel", handleCancel);

  return () => {
    input.removeEventListener("touchstart", handleStart);
    input.removeEventListener("touchmove", handleMove);
    input.removeEventListener("touchend", handleEnd);
    input.removeEventListener("touchcancel", handleCancel);
  };
}
