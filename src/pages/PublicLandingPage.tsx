import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

interface SchoolPublicInfo {
    id: number;
    name: string;
    logo_path: string | null;
    theme_color: string | null;
    tagline: string | null;
    about_text: string | null;
    contact_number: string | null;
    email: string | null;
    admission_form_config: any;
    landing_theme_config: any;
    banners: any[];
    sections: any[];
    classes: any[];
}

const PublicLandingPage: React.FC = () => {
    const { schoolSlug } = useParams<{ schoolSlug: string }>();
    const [schoolInfo, setSchoolInfo] = useState<SchoolPublicInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Form states (Inquiry)
    const [inqName, setInqName] = useState('');
    const [inqEmail, setInqEmail] = useState('');
    const [inqPhone, setInqPhone] = useState('');
    const [inqMessage, setInqMessage] = useState('');
    const [inqStatus, setInqStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Admission States
    const [admName, setAdmName] = useState('');
    const [admClass, setAdmClass] = useState('');
    const [admParent, setAdmParent] = useState('');
    const [admPhone, setAdmPhone] = useState('');
    const [admEmail, setAdmEmail] = useState('');
    const [admPrevSchool, setAdmPrevSchool] = useState('');
    const [admAddress, setAdmAddress] = useState('');
    const [admOccupation, setAdmOccupation] = useState('');
    const [admPhoto, setAdmPhoto] = useState<File|null>(null);
    const [admStatus, setAdmStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const [currentSlide, setCurrentSlide] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // CSS for Marquee Animation
    const marqueeStyle = `
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .marquee-container {
            overflow: hidden;
            display: flex;
            user-select: none;
            gap: 2rem;
            position: relative;
            padding: 2rem 0;
        }
        .marquee-content {
            display: flex;
            flex-shrink: 0;
            gap: 2rem;
            min-width: 100%;
            animation: marquee 30s linear infinite;
        }
        .marquee-content:hover {
            animation-play-state: paused;
        }
    `;

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const hostname = window.location.hostname;
                const isCustomDomain = hostname !== 'localhost' && hostname !== '127.0.0.1';
                let params = {};
                if (schoolSlug) params = { slug: schoolSlug };
                else if (isCustomDomain) params = { domain: hostname };
                else { setError(true); setLoading(false); return; }

                const res = await axiosInstance.get('/school/public', { params });
                setSchoolInfo(res.data);
            } catch (err) { setError(true); } finally { setLoading(false); }
        };
        fetchPublicData();
    }, [schoolSlug]);

    useEffect(() => {
        if (schoolInfo?.landing_theme_config) {
            const config = schoolInfo.landing_theme_config;
            if (config.seo_title) document.title = config.seo_title;
            else document.title = schoolInfo.name;

            if (config.seo_description) {
                let meta = document.querySelector('meta[name="description"]');
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute('name', 'description');
                    document.head.appendChild(meta);
                }
                meta.setAttribute('content', config.seo_description);
            }
        }
    }, [schoolInfo]);

    useEffect(() => {
        if (!schoolInfo || !schoolInfo.banners || schoolInfo.banners.length <= 1) return;
        const interval = setInterval(() => setCurrentSlide(s => (s + 1) % schoolInfo.banners.length), 5000);
        return () => clearInterval(interval);
    }, [schoolInfo]);

    const handleInquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolInfo) return;
        setInqStatus('loading');
        try {
            await axiosInstance.post('/inquiries', {
                school_id: schoolInfo.id, name: inqName, email: inqEmail, phone: inqPhone, message: inqMessage,
            });
            setInqStatus('success');
            setInqName(''); setInqEmail(''); setInqPhone(''); setInqMessage('');
        } catch (err) { setInqStatus('error'); }
    };

    const handleAdmissionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolInfo) return;
        setAdmStatus('loading');
        const fd = new FormData();
        fd.append('school_id', schoolInfo.id.toString());
        fd.append('school_class_id', admClass);
        fd.append('student_name', admName);
        if (admParent) fd.append('parent_name', admParent);
        if (admPhone) fd.append('phone', admPhone);
        if (admEmail) fd.append('email', admEmail);
        if (admPhoto) fd.append('photo', admPhoto);
        
        let metaObj: any = {};
        if (admPrevSchool) metaObj.previous_school = admPrevSchool;
        if (admAddress) metaObj.address = admAddress;
        if (admOccupation) metaObj.parent_occupation = admOccupation;
        
        if (Object.keys(metaObj).length > 0) {
            fd.append('metadata', JSON.stringify(metaObj));
        }

        try {
            await axiosInstance.post('/admissions', fd);
            setAdmStatus('success');
            setAdmName(''); setAdmClass(''); setAdmParent(''); setAdmPhone(''); setAdmEmail(''); setAdmPrevSchool(''); setAdmAddress(''); setAdmOccupation(''); setAdmPhoto(null);
        } catch (err) { setAdmStatus('error'); }
    };

    if (loading) return <div className="flex bg-slate-50 justify-center items-center h-screen text-2xl font-bold text-slate-400">Loading Content...</div>;
    if (error || !schoolInfo) {
        if (!schoolSlug) return <Navigate to="/login" />;
        return <div className="flex bg-slate-50 justify-center items-center h-screen text-2xl font-bold text-red-400">Site Not Found</div>;
    }

    const theme = schoolInfo.landing_theme_config || {};
    const primaryColor = theme.primary_color || schoolInfo.theme_color || '#4338ca';
    const secondaryColor = theme.secondary_color || '#f3f4f6';
    const buttonTextColor = theme.button_text_color || '#ffffff';
    const footerBgColor = theme.footer_bg_color || '#0f172a'; // Provide slight fallback if null
    const fontFamily = theme.font_family || 'sans-serif';
    
    // Toggles
    const showAbout = theme.show_about !== false;
    const showAdmissions = theme.show_admissions !== false && schoolInfo.admission_form_config?.enable_admission;
    const showContact = theme.show_contact !== false;

    const admConfig = schoolInfo.admission_form_config || {};

    // Helper extract iframe url if user pasted full wrapper
    const getMapSrc = (input: string) => {
        if (!input) return null;
        if (input.includes('<iframe') && input.includes('src="')) {
            const match = input.match(/src="([^"]+)"/);
            return match ? match[1] : null;
        }
        return input;
    }
    const mapUrl = getMapSrc(theme.google_map_embed);

    return (
        <div style={{ fontFamily }} className="text-slate-800 min-h-screen flex flex-col bg-white">
            <style>{marqueeStyle}</style>

            {/* Header */}
            <header style={{ backgroundColor: primaryColor }} className="text-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-4">
                    {schoolInfo.logo_path && <img src={schoolInfo.logo_path} alt="Logo" className="h-[40px] md:h-[50px] object-contain bg-white rounded p-1 shadow-sm" />}
                    <h1 className="m-0 text-xl md:text-2xl font-black tracking-tight truncate max-w-[200px] md:max-w-none">{schoolInfo.name}</h1>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-8 font-bold text-sm tracking-wide">
                    {showAbout && <a href="#about" className="hover:text-white/80 transition text-white">ABOUT</a>}
                    {schoolInfo.sections?.map(s => <a key={s.id} href={`#sec-${s.id}`} className="hover:text-white/80 transition text-white uppercase">{s.title.substring(0,10)}</a>)}
                    {showAdmissions && <a href="#admission" className="hover:text-white/80 transition text-white">ADMISSIONS</a>}
                    {showContact && <a href="#contact" className="hover:text-white/80 transition text-white">CONTACT</a>}
                </nav>

                {/* Mobile Menu Toggle */}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white outline-none">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
                </button>

                {/* Mobile Nav Overlay */}
                {mobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white shadow-2xl p-6 flex flex-col gap-4 text-slate-800 md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        {showAbout && <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100 font-bold">ABOUT</a>}
                        {schoolInfo.sections?.map(s => <a key={s.id} href={`#sec-${s.id}`} onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100 font-bold uppercase">{s.title}</a>)}
                        {showAdmissions && <a href="#admission" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100 font-bold">ADMISSIONS</a>}
                        {showContact && <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100 font-bold text-primary">CONTACT</a>}
                    </div>
                )}
            </header>

            {/* Banners */}
            {schoolInfo.banners && schoolInfo.banners.length > 0 ? (
                <section className="relative w-full h-[50vh] md:h-[65vh] bg-slate-900 overflow-hidden">
                    {schoolInfo.banners.map((b, i) => (
                        <div key={b.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                            <img src={b.image_path} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20 flex flex-col items-center justify-center text-center px-4">
                                <h1 className="text-2xl md:text-5xl lg:text-7xl font-black text-white mb-2 md:mb-6 drop-shadow-xl leading-tight md:leading-none">{b.title}</h1>
                                {b.subtitle && <p className="text-base md:text-xl lg:text-3xl font-medium text-white/95 drop-shadow-lg max-w-4xl">{b.subtitle}</p>}
                                {showAdmissions && (
                                    <a href="#admission" style={{ backgroundColor: primaryColor, color: buttonTextColor }} className="mt-6 md:mt-10 py-3 md:py-4 px-8 md:px-10 rounded-full font-black text-sm md:text-lg hover:scale-105 transition-transform shadow-2xl uppercase tracking-wider border-2 border-white/20 text-center">Apply Now</a>
                                )}
                            </div>
                        </div>
                    ))}
                    {schoolInfo.banners.length > 1 && (
                        <div className="absolute bottom-6 z-20 left-0 right-0 flex justify-center gap-3">
                            {schoolInfo.banners.map((_, i) => (
                                <button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`} />
                            ))}
                        </div>
                    )}
                </section>
            ) : (
                <section style={{ backgroundColor: secondaryColor }} className="py-16 md:py-24 px-6 text-center border-b border-slate-200">
                    <h2 style={{ color: primaryColor }} className="text-3xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight">Welcome to {schoolInfo.name}</h2>
                    {schoolInfo.tagline && <p className="text-lg md:text-2xl font-medium text-slate-600 max-w-4xl mx-auto">{schoolInfo.tagline}</p>}
                </section>
            )}

            {/* About Section */}
            {showAbout && schoolInfo.about_text && (
                <section id="about" className="py-16 md:py-24 px-6 max-w-5xl mx-auto text-center">
                    <h3 className="text-3xl md:text-4xl font-black mb-6 md:mb-10 text-slate-800 relative inline-block">
                        About Us
                        <div style={{ backgroundColor: primaryColor }} className="h-1 w-1/2 mx-auto mt-2 rounded"></div>
                    </h3>
                    <p className="text-lg md:text-xl leading-relaxed text-slate-600 font-medium">{schoolInfo.about_text}</p>
                </section>
            )}

            {/* Custom Settings Sections Generator */}
            {schoolInfo.sections?.map(sec => (
                <section key={sec.id} id={`sec-${sec.id}`} className="py-16 md:py-24 px-6 border-t border-slate-100 overflow-hidden" style={{ backgroundColor: sec.id % 2 === 0 ? secondaryColor : 'white' }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-10 md:mb-16">
                            <h3 className="text-3xl md:text-4xl font-black inline-block relative text-slate-800">
                                {sec.title}
                                <div style={{ backgroundColor: primaryColor }} className="h-1 w-1/2 mx-auto mt-2 rounded"></div>
                            </h3>
                        </div>

                        {/* Rendering logic based on section type */}
                        {sec.type === 'grid' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                                {sec.cards?.map((c: any) => (
                                    <div key={c.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all border border-slate-100 flex flex-col group">
                                        {c.image_path && <div className="h-48 md:h-56 overflow-hidden"><img src={c.image_path} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>}
                                        <div className="p-6 md:p-8 flex-1 flex flex-col">
                                            <h4 className="text-xl md:text-2xl font-bold mb-3 text-slate-800">{c.title}</h4>
                                            {c.description && <p className="text-slate-600 leading-relaxed font-sm md:font-medium">{c.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {sec.type === 'gallery' && (
                            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                                {sec.cards?.map((c: any) => (
                                    <div key={c.id} className="break-inside-avoid relative group rounded-xl overflow-hidden shadow hover:shadow-xl transition-shadow cursor-pointer">
                                        {c.image_path && <img src={c.image_path} alt="" className="w-full h-auto" />}
                                        {(c.title || c.description) && (
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <h4 className="text-white font-bold text-lg">{c.title}</h4>
                                                <p className="text-white/80 text-sm font-medium">{c.description}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {sec.type === 'marquee' && (
                            <div className="marquee-container">
                                <div className="marquee-content flex gap-8">
                                    {[... (sec.cards || []), ... (sec.cards || [])].map((c: any, index) => (
                                        <div key={`${c.id}-${index}`} className="flex flex-col items-center text-center w-[200px] md:w-[250px] shrink-0 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                            {c.image_path && (
                                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-4 border-4 p-1 shadow-inner" style={{ borderColor: primaryColor }}>
                                                    <img src={c.image_path} alt={c.title} className="w-full h-full object-cover rounded-full" />
                                                </div>
                                            )}
                                            <h4 className="font-black text-slate-800 mb-1">{c.title}</h4>
                                            {c.description && <p className="text-xs md:text-sm text-slate-500 font-medium line-clamp-3">{c.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {sec.type === 'text' && (
                            <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
                                {sec.cards?.map((c: any) => (
                                    <div key={c.id} className="flex flex-col md:flex-row gap-6 md:gap-8 items-center bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                                        {c.image_path && <img src={c.image_path} className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-xl shadow-md shrink-0" />}
                                        <div>
                                            <h4 className="text-xl md:text-2xl font-bold mb-4 text-slate-800">{c.title}</h4>
                                            <div className="text-base md:text-lg text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{c.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {sec.type === 'features' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-5xl mx-auto">
                                {sec.cards?.map((c: any) => (
                                    <div key={c.id} className="flex gap-6 items-start">
                                        {c.image_path ? (
                                            <img src={c.image_path} className="w-16 h-16 rounded-full object-cover shadow-sm shrink-0" />
                                        ) : (
                                            <div style={{ backgroundColor: primaryColor }} className="w-4 h-4 rounded-full mt-2 shrink-0"></div>
                                        )}
                                        <div>
                                            <h4 className="text-xl font-bold mb-2 text-slate-800">{c.title}</h4>
                                            <p className="text-slate-600 font-medium leading-relaxed">{c.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            ))}

            {/* Admission Form */}
            {showAdmissions && (
                <section id="admission" className="py-24 px-6 relative overflow-hidden">
                    {/* Background styling block */}
                    <div className="absolute inset-0 z-0">
                        <div style={{ backgroundColor: primaryColor }} className="absolute inset-0 opacity-[0.03]"></div>
                        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-slate-100 blur-3xl"></div>
                        <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-slate-100 blur-3xl"></div>
                    </div>
                    
                    <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative z-10 border border-slate-100 border-t-4" style={{ borderTopColor: primaryColor }}>
                        <div className="text-center mb-12 border-b border-slate-100 pb-10">
                            <h3 className="text-4xl font-black mb-4 text-slate-800">Apply for Admission</h3>
                            <p className="text-lg text-slate-500 font-medium">Begin your journey. Fill out the application form below.</p>
                        </div>
                        
                        {admStatus === 'success' && <div className="p-6 bg-emerald-50 text-emerald-800 rounded-xl mb-8 text-center border-2 font-bold border-emerald-200 shadow-sm text-lg">Application Received! We will review and contact you shortly.</div>}
                        {admStatus === 'error' && <div className="p-6 bg-red-50 text-red-800 rounded-xl mb-8 text-center border-2 font-bold border-red-200 shadow-sm text-lg">Error submitting application. Please try again.</div>}
                        
                        <form onSubmit={handleAdmissionSubmit} className="flex flex-col gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Student Full Name *</label>
                                    <input type="text" required value={admName} onChange={e => setAdmName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:outline-none transition-shadow" style={{ outlineColor: primaryColor }} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Applying For Class *</label>
                                    <select required value={admClass} onChange={e => setAdmClass(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:outline-none transition-shadow appearance-none font-medium">
                                        <option value="">-- Select Class --</option>
                                        {schoolInfo.classes?.map(c => <option key={c.id} value={c.id}>{c.grade?.name} ({c.section?.name})</option>)}
                                    </select>
                                </div>
                            </div>

                            {admConfig.require_parent_name && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Parent / Guardian Name *</label>
                                    <input type="text" required value={admParent} onChange={e => setAdmParent(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:outline-none transition-shadow" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {admConfig.require_phone && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Phone Number *</label>
                                        <input type="tel" required value={admPhone} onChange={e => setAdmPhone(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:outline-none transition-shadow" />
                                    </div>
                                )}
                                {admConfig.require_email && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email Address *</label>
                                        <input type="email" required value={admEmail} onChange={e => setAdmEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:outline-none transition-shadow" />
                                    </div>
                                )}
                            </div>

                            {admConfig.require_previous_school && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Previous School Attended *</label>
                                    <input type="text" required value={admPrevSchool} onChange={e => setAdmPrevSchool(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:outline-none transition-shadow" />
                                </div>
                            )}

                            {(admConfig.require_address || admConfig.require_occupation) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {admConfig.require_address && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Residential Address *</label>
                                            <input type="text" required value={admAddress} onChange={e => setAdmAddress(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:outline-none transition-shadow" />
                                        </div>
                                    )}
                                    {admConfig.require_occupation && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Parent Occupation *</label>
                                            <input type="text" required value={admOccupation} onChange={e => setAdmOccupation(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:outline-none transition-shadow" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {admConfig.require_photo && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Student Passport Photo *</label>
                                    <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-400 transition-colors">
                                        <input type="file" accept="image/*" required onChange={e => { if(e.target.files) setAdmPhoto(e.target.files[0]) }} className="w-full font-medium text-slate-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-white file:text-indigo-600 file:shadow-sm hover:file:bg-indigo-50" />
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={admStatus === 'loading'} style={{ backgroundColor: primaryColor, color: buttonTextColor }} className="mt-8 w-full py-5 rounded-xl font-black text-xl shadow-lg hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0 transition-all uppercase tracking-wider">
                                {admStatus === 'loading' ? 'Processing...' : 'Submit Official Application'}
                            </button>
                        </form>
                    </div>
                </section>
            )}

            {/* Split Footer: Map & Contact */}
            {showContact && (
                <footer id="contact" style={{ backgroundColor: footerBgColor, borderTopColor: primaryColor }} className="border-t-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Interactive Contact Form Side */}
                        <div className="p-8 md:p-12 text-white flex flex-col justify-center">
                            <h3 className="text-3xl font-black mb-6">Get In Touch</h3>
                            <p className="text-slate-300 mb-8 max-w-sm text-sm font-medium">Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                            
                            {inqStatus === 'success' ? (
                                <div className="p-6 bg-emerald-900/40 rounded-xl border border-emerald-500/30 text-center">
                                    <h4 className="text-xl font-bold text-emerald-400 mb-2">Message Delivered!</h4>
                                    <p className="text-emerald-100 font-medium text-sm">Thank you for reaching out. We've received your query.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input type="text" placeholder="Your Name" required value={inqName} onChange={e => setInqName(e.target.value)} className="p-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-white/30 outline-none text-white font-medium text-sm" />
                                        <input type="tel" placeholder="Phone Number" value={inqPhone} onChange={e => setInqPhone(e.target.value)} className="p-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-white/30 outline-none text-white font-medium text-sm" />
                                    </div>
                                    <input type="email" placeholder="Email Address" required value={inqEmail} onChange={e => setInqEmail(e.target.value)} className="p-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-white/30 outline-none text-white font-medium text-sm" />
                                    <textarea placeholder="How can we help?" required value={inqMessage} onChange={e => setInqMessage(e.target.value)} rows={4} className="p-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-white/30 outline-none text-white font-medium text-sm resize-none"></textarea>
                                    <button type="submit" disabled={inqStatus === 'loading'} style={{ backgroundColor: primaryColor, color: buttonTextColor }} className="py-3 rounded-xl font-bold text-base mt-2 shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0 transition-transform">
                                        {inqStatus === 'loading' ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            )}

                            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                <div className="flex gap-3">
                                    {theme.social_facebook && <a href={theme.social_facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors"><svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg></a>}
                                    {theme.social_twitter && <a href={theme.social_twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors"><svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>}
                                    {theme.social_instagram && <a href={theme.social_instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors"><svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>}
                                </div>
                                <div className="text-right text-xs">
                                    {schoolInfo.email && <div className="text-slate-300 font-bold">{schoolInfo.email}</div>}
                                    {schoolInfo.contact_number && <div className="text-slate-400">{schoolInfo.contact_number}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Map Side */}
                        <div className="bg-black/20 min-h-[300px] lg:min-h-auto w-full relative">
                            {mapUrl ? (
                                <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0, position: 'absolute', inset: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center border-l border-white/5">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-white/50 mb-2">Location Map</h4>
                                    <p className="text-white/30 text-xs font-medium">Add a Google Maps embed URL in the CMS to display your campus location here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-black/40 py-6 px-8 flex flex-col md:flex-row items-center justify-between text-white/50 text-xs font-medium">
                        <div>&copy; {new Date().getFullYear()} {schoolInfo.name}. All rights reserved.</div>
                        <div className="mt-2 md:mt-0"><a href="/login" className="hover:text-white transition">Admin Portal Login</a></div>
                    </div>
                </footer>
            )}
            
            {/* If contact is disabled, just show a basic footer */}
            {!showContact && (
                <footer style={{ backgroundColor: footerBgColor, borderTopColor: primaryColor }} className="py-8 text-center text-white/50 text-sm font-medium border-t-4">
                    <p>&copy; {new Date().getFullYear()} {schoolInfo.name}. All rights reserved.</p>
                    <div className="mt-2"><a href="/login" className="hover:text-white transition">Admin Portal Login</a></div>
                </footer>
            )}
        </div>
    );
};

export default PublicLandingPage;
