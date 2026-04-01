import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch } from '../../store'
import { createClassroom, deleteClassroom } from '../../store/appSlice'
import { DoorOpen, Trash2, PlusCircle, Users, Pencil, ChevronDown } from 'lucide-react'
import { useConfirm } from '../../contexts/ConfirmContext'

const Classrooms: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { confirm } = useConfirm()
  const { schoolData } = useSelector((state: any) => state.app)
  const [formData, setFormData] = useState({ name: '', capacity: '', type: 'Standard Classroom' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(createClassroom({ ...formData, capacity: Number(formData.capacity) }))
    setFormData({ name: '', capacity: '', type: 'Standard Classroom' })
  }

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Remove Facility',
      message: 'Are you sure you want to remove this facility? This action cannot be undone and may affect timetable assignments.',
      type: 'danger'
    })

    if (isConfirmed) {
      dispatch(deleteClassroom(id))
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 app-card p-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <DoorOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Classrooms & Facilities</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Infrastructure Registry</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                  <th className="pb-5 px-4 w-16">#</th>
                  <th className="pb-5 px-4">Room Identity</th>
                  <th className="pb-5 px-4 w-32">Type</th>
                  <th className="pb-5 px-4 w-32">Capacity</th>
                  <th className="pb-5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schoolData?.classrooms.map((room: any, i: number) => (
                  <tr key={room.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="py-5 px-4 text-sm font-black text-slate-400">{String(i+1).padStart(2, '0')}</td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-700">{room.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                        room.type === 'Science Lab' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        room.type === 'Dance Studio' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        room.type === 'Computer Lab' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {room.type || 'General'}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-indigo-400" />
                        <span className="font-black text-indigo-600 font-mono text-sm">{room.capacity || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(room.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Register Unit</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Room Name / Number</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Science Lab 4" 
                  className="auth-input text-sm" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Facility Type</label>
                <div className="relative group">
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})} 
                    className="auth-input appearance-none pr-10 text-sm"
                  >
                    <option value="Standard Classroom">Standard Classroom</option>
                    <option value="Science Lab">Science Lab</option>
                    <option value="Computer Lab">Computer Lab</option>
                    <option value="Dance Studio">Dance Studio</option>
                    <option value="Sports Gym">Sports Gym</option>
                    <option value="Music Room">Music Room</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-600 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Capacity</label>
                <input 
                  type="number" 
                  value={formData.capacity} 
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="30" 
                  className="auth-input text-sm" 
                />
              </div>
            </div>

            <button type="submit" className="primary-btn mt-2">Initialize Facility</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Classrooms
