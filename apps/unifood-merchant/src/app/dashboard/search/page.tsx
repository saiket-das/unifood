export default function SearchPage() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">Quickly find orders, menu items, or staff members across your restaurant.</p>
      </div>
      <div className="min-h-[40px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
        Type to search...
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  )
}
