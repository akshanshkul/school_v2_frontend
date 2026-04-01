import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

interface Inquiry {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    status: 'unread' | 'read';
    created_at: string;
}

const SchoolInquiries: React.FC = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);

    useEffect(() => {
        const fetchInquiries = async () => {
            const { data } = await api.get('/school/inquiries');
            setInquiries(data);
        };
        fetchInquiries();
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await api.patch(`/school/inquiries/${id}/status`, { status: 'read' });
            setInquiries(inquiries.map(i => i.id === id ? { ...i, status: 'read' } : i));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Admission Inquiries</h2>
            <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Name</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Contact</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Message</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Date</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Status</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {inquiries.map(inquiry => (
                        <tr key={inquiry.id} style={{ backgroundColor: inquiry.status === 'unread' ? '#f9f9f9' : '#fff' }}>
                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{inquiry.name}</td>
                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                {inquiry.email}<br/>
                                <small>{inquiry.phone}</small>
                            </td>
                            <td style={{ padding: '10px', borderBottom: '1px solid #eee', maxWidth: '300px' }}>{inquiry.message}</td>
                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{new Date(inquiry.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: inquiry.status === 'unread' ? '#ffeeba' : '#d4edda', color: inquiry.status === 'unread' ? '#856404' : '#155724' }}>
                                    {inquiry.status}
                                </span>
                            </td>
                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                {inquiry.status === 'unread' && (
                                    <button onClick={() => markAsRead(inquiry.id)} style={{ padding: '5px 10px', cursor: 'pointer' }}>Mark Read</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {inquiries.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>No inquiries yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default SchoolInquiries;
