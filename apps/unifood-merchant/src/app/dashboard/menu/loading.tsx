import { Skeleton } from "@/components/ui/skeleton"

export default function MenuLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[180px]" />
          <Skeleton className="h-9 w-[150px]" />
          <Skeleton className="h-9 w-[130px]" />
          <Skeleton className="h-9 w-[130px]" />
        </div>
        <Skeleton className="h-9 w-[220px]" />
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="bg-muted/40 px-4 py-3 flex gap-4">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px] ml-auto" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-t">
            <Skeleton className="h-10 w-10 rounded-md shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="flex gap-1 ml-auto">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
            <div className="flex items-center gap-2 ml-auto">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
