import { TREND_SOURCE_URLS } from "@/constants/site";

import styles from "./Trend.module.scss";

export function TrendSourceLink({ id, label }: { id: string; label: string }) {
  const url = TREND_SOURCE_URLS[id];
  if (!url) return label;

  return (
    <a href={url} className={styles.sourceLink} target="_blank" rel="noopener">
      {label}
    </a>
  );
}
