import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch } from '../../store'
import { createClass, updateClass, deleteClass } from '../../store/appSlice'
import { Trash2, PlusCircle, Layers, Pencil, X, UserMinus } from 'lucide-react'
import { useConfirm } from '../../contexts/ConfirmContext'

const Classes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { confirm } = useConfirm()
  const { schoolData } = useSelector((state: any) => state.app)
  const [gradeId, setGradeId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [classroomId, setClassroomId] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!gradeId || !sectionId) return

    const payload = { 
      grade_id: Number(gradeId), 
      section_id: Number(sectionId),
      class_teacher_id: teacherId ? Number(teacherId) : undefined,
      default_classroom_id: classroomId ? Number(classroomId) : undefined
    }

    if (editingId) {
      dispatch(updateClass({ id: editingId, data: payload }))
      setEditingId(null)
    } else {
      dispatch(createClass(payload))
    }
    
    setGradeId(''); setSectionId(''); setTeacherId(''); setClassroomId('')
  }

  const handleEdit = (cls: any) => {
    setEditingId(cls.id)
    setGradeId(cls.grade_id.toString())
    setSectionId(cls.section_id.toString())
    setTeacherId(cls.class_teacher_id?.toString() || '')
    setClassroomId(cls.default_classroom_id?.toString() || '')
  }

  const handleRemoveTeacher = async (cls: any) => {
    const isConfirmed = await confirm({
      title: 'Remove Class Teacher',
      message: `Are you sure you want to remove ${cls.class_teacher.name} from this class?`,
      type: 'warning'
    })

    if (isConfirmed) {
      dispatch(updateClass({ 
        id: cls.id, 
        data: { 
          grade_id: cls.grade_id, 
          section_id: cls.section_id, 
          class_teacher_id: null,
          default_classroom_id: cls.default_classroom_id
        } 
      }))
    }
  }

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Delete Class Mapping',
      message: 'Are you sure you want to remove this class mapping? This will also clear its associated timetable entries.',
      type: 'danger'
    })

    if (isConfirmed) {
      dispatch(deleteClass(id))
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 app-card p-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Class Mappings</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Academic Entity Management</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                  <th className="pb-5 px-4 w-16">#</th>
                  <th className="pb-5 px-4">Entity Identity</th>
                  <th className="pb-5 px-4">Class Teacher</th>
                  <th className="pb-5 px-4">Default Room</th>
                  <th className="pb-5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schoolData?.classes.map((cls: any, i: number) => (
                  <tr key={cls.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="py-5 px-4 text-sm font-black text-slate-400">{String(i+1).padStart(2, '0')}</td>
                    <td className="py-5 px-4 font-black text-indigo-600">{cls.grade.name} - {cls.section.name}</td>
                    <td className="py-5 px-4">
                      {cls.class_teacher ? (
                        <div className="flex items-center gap-2">
                           <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                              {cls.class_teacher.name.charAt(0)}
                           </div>
                           <span className="text-sm font-bold text-slate-700">{cls.class_teacher.name}</span>
                           <button 
                             onClick={() => handleRemoveTeacher(cls)}
                             className="ml-auto p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                             title="Unassign Teacher"
                           >
                              <UserMinus size={14} />
                           </button>
                        </div>
                      ) : <span className="text-xs text-slate-300 font-bold italic">Not Assigned</span>}
                    </td>
                    <td className="py-5 px-4 text-sm font-bold text-slate-600">
                      {cls.default_classroom ? (
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] uppercase font-black tracking-wider border border-indigo-100">
                           {cls.default_classroom.name}
                        </span>
                      ) : <span className="text-xs text-slate-300 font-bold italic">Auto-assign</span>}
                    </td>
                    <td className="py-5 px-4 text-right flex justify-end gap-2">
                      <button 
                         onClick={() => handleEdit(cls)}
                         className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cls.id)}
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
            {editingId ? <Pencil size={20} className="text-indigo-600" /> : <PlusCircle size={20} className="text-indigo-600" />}
            <h2 className="text-lg font-black text-slate-800 tracking-tight">{editingId ? 'Update Mapping' : 'Map Entity'}</h2>
          </div>

          <p className="text-xs text-slate-500 mb-8 font-medium leading-relaxed">
            {editingId ? 'Modify the associations for this class level and group.' : 'Select a Grade Level and Section to generate a unique Class record.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Grade Level</label>
              <select value={gradeId} onChange={(e) => setGradeId(e.target.value)} required className="auth-input appearance-none">
                <option value="">Select Level</option>
                {schoolData?.grades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Section Group</label>
              <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} required className="auth-input appearance-none">
                <option value="">Select Section</option>
                {schoolData?.sections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Class Teacher <span className="text-slate-300 font-medium normal-case">(Optional)</span></label>
              <div className="relative group">
                <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="auth-input appearance-none pr-10">
                  <option value="">Select Instructor</option>
                  {schoolData?.teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 pointer-events-none">
                  <PlusCircle size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Default Room <span className="text-slate-300 font-medium normal-case">(Optional)</span></label>
              <div className="relative group">
                <select value={classroomId} onChange={(e) => setClassroomId(e.target.value)} className="auth-input appearance-none pr-10">
                  <option value="">Select Room</option>
                  {schoolData?.classrooms.map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 pointer-events-none">
                  <Layers size={16} />
                </div>
              </div>
            </div>

            <button type="submit" className="primary-btn mt-2 font-black uppercase tracking-[0.2em] text-[10px] py-4 bg-indigo-600 hover:bg-slate-900 shadow-xl shadow-indigo-100 transition-all">
               {editingId ? 'Save Changes' : 'Initialize Mapping'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setGradeId(''); setSectionId(''); setTeacherId(''); setClassroomId(''); }}
                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2"
              >
                <X size={14} /> Cancel Selection
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Classes
