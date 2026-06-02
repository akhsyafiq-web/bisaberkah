export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <span className="text-xl">🌿</span>
      </div>
      <p className="text-sm font-medium text-muted-foreground">BisaBerkah</p>
    </div>
  )
}
