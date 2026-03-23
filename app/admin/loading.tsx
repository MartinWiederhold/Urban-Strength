export default function AdminLoading() {
  return (
    <div className="p-6 md:p-8 max-w-6xl space-y-6">
      <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white border border-border rounded-2xl animate-pulse" />)}
      </div>
      <div className="h-64 bg-white border border-border rounded-2xl animate-pulse" />
    </div>
  )
}
