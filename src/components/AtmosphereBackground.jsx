/** Original motion treatment built from the user-provided abstract image. */
export function AtmosphereBackground() {
  return (
    <div className="atmosphere-background" aria-hidden="true">
      <div className="atmosphere-base" />
      <div className="atmosphere-drift" />
      <div className="atmosphere-glow" />
    </div>
  )
}
