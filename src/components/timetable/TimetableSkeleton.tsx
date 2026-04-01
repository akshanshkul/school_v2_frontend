import React from 'react'
import Skeleton from '../common/Skeleton'

const TimetableSkeleton: React.FC = () => {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const TIMES = Array(8).fill(0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-12 w-60" />
      </div>

      {/* Grid Skeleton */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 border-r border-slate-200 w-20">
                  <Skeleton className="h-3 w-10 mx-auto" />
                </th>
                {DAYS.map((_, i) => (
                  <th key={i} className="p-4">
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TIMES.map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="p-4 border-r border-slate-100 bg-slate-50/30">
                    <Skeleton className="h-3 w-10 mx-auto" />
                  </td>
                  {DAYS.map((_, colIndex) => (
                    <td key={colIndex} className="p-4 border-r border-slate-100 last:border-0 h-28 min-w-[140px]">
                      <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2 w-16 opacity-60" />
                        <Skeleton className="h-4 w-12 rounded-full opacity-40" />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TimetableSkeleton
