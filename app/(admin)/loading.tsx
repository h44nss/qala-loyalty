import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px] rounded-xl" />
          <Skeleton className="h-4 w-[300px] rounded-lg" />
        </div>
        <Skeleton className="h-10 w-[120px] rounded-xl hidden md:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-[140px] w-full rounded-2xl" />
        <Skeleton className="h-[140px] w-full rounded-2xl" />
        <Skeleton className="h-[140px] w-full rounded-2xl" />
        <Skeleton className="h-[140px] w-full rounded-2xl" />
      </div>

      <div className="space-y-4 pt-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  )
}
