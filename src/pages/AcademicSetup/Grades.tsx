import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch } from '../../store'
import { createGrade, deleteGrade } from '../../store/appSlice'
import { GraduationCap, Trash2, PlusCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useConfirm } from '../../contexts/ConfirmContext'

const Grades: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { confirm } = useConfirm()
  const { schoolData } = useSelector((state: any) => state.app)
  const [name, setName] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(createGrade({ name })).unwrap()
      toast.success(`${name} initialized successfully!`)
      setName('')
    } catch (err: any) {
      toast.error(err || 'Failed to initialize grade level')
    }
  }

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Delete Grade Level',
      message: 'Are you sure you want to delete this grade level? All associated class mappings will also be removed.',
      type: 'danger'
    })

    if (isConfirmed) {
      try {
        await dispatch(deleteGrade(id)).unwrap()
        toast.success('Grade level removed')
      } catch (err: any) {
        toast.error(err || 'Failed to remove grade level')
      }
    }
  }

  if (!schoolData) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 app-card p-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Grade Levels</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Institutional Hierarchy</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                  <th className="pb-5 px-4 w-16">#</th>
                  <th className="pb-5 px-4">Level Name</th>
                  <th className="pb-5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schoolData?.grades.map((grade: any, i: number) => (
                  <tr key={grade.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="py-5 px-4 text-sm font-black text-slate-400">{String(i+1).padStart(2, '0')}</td>
                    <td className="py-5 px-4 font-black text-slate-700">{grade.name}</td>
                    <td className="py-5 px-4 text-right">
                      <button 
                        onClick={() => handleDelete(grade.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="app-card p-10 h-fit sticky top-32">
          <div className="flex items-center gap-3 mb-8">
            <PlusCircle size={20} className="text-indigo-600" />
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Add Level</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grade 10" 
                className="auth-input" 
                required 
              />
            </div>
            <button type="submit" className="primary-btn mt-2">Initialize Grade</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Grades
