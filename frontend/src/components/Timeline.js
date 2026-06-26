/**
 * Timeline component
 */

import { escapeHtml } from '../utils/dom.js';
import { formatTimelineDate } from '../utils/time.js';

export function renderTimeline(container, timelineData) {
  if (!timelineData || timelineData.length === 0) return;

  const timeline = document.createElement('div');
  timeline.className = 'timeline';

  for (const item of timelineData) {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';

    timelineItem.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-time">${formatTimelineDate(item.time)}</div>
      <div class="timeline-content">${escapeHtml(item.title)}</div>
      <div class="timeline-source">${escapeHtml(item.source)}</div>
    `;

    timeline.appendChild(timelineItem);
  }

  container.appendChild(timeline);
}
