import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'rect' | 'circle' | 'text'
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseClasses = "animate-pulse bg-slate-200/60"
  const variantClasses = {
    rect: "rounded-xl",
    circle: "rounded-full",
    text: "rounded-md h-4"
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  )
}

export default Skeleton
