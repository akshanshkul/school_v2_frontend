import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch } from '../../store'
import { createSection, deleteSection } from '../../store/appSlice'
import { FolderTree, Trash2, PlusCircle } from 'lucide-react'
import { useConfirm } from '../../contexts/ConfirmContext'

const Sections: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { confirm } = useConfirm()
  const { schoolData } = useSelector((state: any) => state.app)
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(createSection({ name }))
    setName('')
  }

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Delete Section',
      message: 'Are you sure you want to delete this section? All associated class mappings will also be removed.',
      type: 'danger'
    })

    if (isConfirmed) {
      dispatch(deleteSection(id))
    }
  }

  if (!schoolData) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 app-card p-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <FolderTree size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Sections</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Classroom Segments</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                  <th className="pb-5 px-4 w-16">#</th>
                  <th className="pb-5 px-4">Section Name</th>
                  <th className="pb-5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schoolData?.sections.map((section: any, i: number) => (
                  <tr key={section.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="py-5 px-4 text-sm font-black text-slate-400">{String(i+1).padStart(2, '0')}</td>
                    <td className="py-5 px-4 font-black text-slate-700">{section.name}</td>
                    <td className="py-5 px-4 text-right">
                      <button 
                        onClick={() => handleDelete(section.id)}
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
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Add Section</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Section A" 
                className="auth-input" 
                required 
              />
            </div>
            <button type="submit" className="primary-btn mt-2">Initialize Section</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Sections
