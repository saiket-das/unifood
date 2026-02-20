export default function ManualOrdersPage() {
  return (
    <>
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Manual Orders</h1>
        <p className="text-sm text-muted-foreground">Quickly create and process orders manually for walk-in customers.</p>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  )
}
