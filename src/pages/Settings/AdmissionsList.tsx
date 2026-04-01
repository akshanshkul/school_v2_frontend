import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

interface Admission {
    id: number;
    student_name: string;
    parent_name: string;
    email: string;
    phone: string;
    photo_path: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    school_class: {
        id: number;
        grade: { name: string };
        section: { name: string };
    };
    metadata: any;
}

const AdmissionsList: React.FC = () => {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdmissions = async () => {
            try {
                const { data } = await api.get('/school/admissions');
                setAdmissions(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdmissions();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/school/admissions/${id}/status`, { status });
            setAdmissions(admissions.map(a => a.id === id ? { ...a, status: status as any } : a));
        } catch (error) {
            console.error("Failed to update status", error);
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Admission Applications</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-slate-600">Applicant</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Class</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Parent/Contact</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Details</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {admissions.map(adm => (
                            <tr key={adm.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        {adm.photo_path ? (
                                            <img src={adm.photo_path} alt="Student" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                                {adm.student_name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-slate-800">{adm.student_name}</div>
                                            <div className="text-xs text-slate-500">{new Date(adm.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-slate-700">
                                    {adm.school_class?.grade?.name} - {adm.school_class?.section?.name}
                                </td>
                                <td className="p-4 text-sm text-slate-700">
                                    {adm.parent_name && <div>{adm.parent_name}</div>}
                                    {adm.phone && <div className="text-slate-500">{adm.phone}</div>}
                                    {adm.email && <div className="text-slate-500">{adm.email}</div>}
                                </td>
                                <td className="p-4 text-sm text-slate-700 max-w-xs">
                                    {adm.metadata ? (
                                        <ul className="list-disc pl-4 text-xs text-slate-500">
                                            {Object.entries(adm.metadata).map(([k, v]) => (
                                                <li key={k}><span className="capitalize">{k.replace('_', ' ')}</span>: {String(v)}</li>
                                            ))}
                                        </ul>
                                    ) : '-'}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider
                                        ${adm.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                                          adm.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                                          'bg-red-100 text-red-800'}`}>
                                        {adm.status}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    {adm.status === 'pending' && (
                                        <>
                                            <button onClick={() => updateStatus(adm.id, 'approved')} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">Approve</button>
                                            <button onClick={() => updateStatus(adm.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {admissions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">No applications found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdmissionsList;
