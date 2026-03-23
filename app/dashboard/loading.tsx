export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-6">
      <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
      <div className="h-24 bg-muted rounded-2xl animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
      </div>
    </div>
  )
}
