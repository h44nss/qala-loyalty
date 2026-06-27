import { Skeleton } from "@/components/ui/skeleton"

export default function CustomerLoading() {
  return (
    <div className="space-y-6 p-4 pt-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px] rounded-xl" />
        <Skeleton className="h-4 w-[250px] rounded-lg" />
      </div>

      <Skeleton className="h-[200px] w-full rounded-2xl" />

      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-[120px] w-full rounded-2xl" />
        <Skeleton className="h-[120px] w-full rounded-2xl" />
      </div>
      
      <div className="space-y-4 pt-4">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  )
}
