export function StoryProgress({ value }) {
  return (
    <aside className="story-progress" aria-label="Story progress">
      <span>01 — 03</span>
      <div className="progress-track"><i style={{ transform: `scaleY(${Math.max(.03, value)})` }} /></div>
      <span>SCROLL</span>
    </aside>
  )
}
