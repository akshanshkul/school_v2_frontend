import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useConfirm } from '../../contexts/ConfirmContext';

const SchoolSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'admissions' | 'banners' | 'sections' | 'seo_social'>('general');
    const { confirm } = useConfirm();
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Theme Config (which acts as a catch-all for our advanced generic configs)
    const [themeConfig, setThemeConfig] = useState({
        primary_color: '#4CAF50',
        secondary_color: '#ffffff',
        button_text_color: '#ffffff',
        font_family: 'sans-serif',
        footer_bg_color: '#1e293b',
        
        // Component Visibilities
        show_about: true,
        show_admissions: true,
        show_contact: true,

        // SEO & Social & Maps
        google_map_embed: '',
        social_facebook: '',
        social_instagram: '',
        social_twitter: '',
        seo_title: '',
        seo_description: '',
    });

    const [slug, setSlug] = useState('');
    const [customDomain, setCustomDomain] = useState('');
    const [tagline, setTagline] = useState('');
    const [aboutText, setAboutText] = useState('');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // Admissions Form Config
    const [admissionConfig, setAdmissionConfig] = useState({
        enable_admission: true,
        require_photo: false,
        require_parent_name: false,
        require_phone: false,
        require_email: false,
        require_previous_school: false,
        require_address: false,
        require_occupation: false,
    });

    const [banners, setBanners] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/school/data');
            const school = data.school;
            
            if (school.landing_theme_config) {
                setThemeConfig(prev => ({ ...prev, ...school.landing_theme_config }));
            }
            if (school.admission_form_config) {
                setAdmissionConfig(prev => ({ ...prev, ...school.admission_form_config }));
            }
            
            setSlug(school.slug || '');
            setCustomDomain(school.custom_domain || '');
            setTagline(school.tagline || '');
            setAboutText(school.about_text || '');
            if (school.logo_path) setLogoPreview(school.logo_path);

            const cmsRes = await api.get('/school/cms');
            setBanners(cmsRes.data.banners || []);
            setSections(cmsRes.data.sections || []);
        } catch (err) {
            console.error("Failed to fetch settings", err);
        } finally {
            setIsInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveGeneralTheme = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData();
        formData.append('slug', slug);
        formData.append('custom_domain', customDomain);
        formData.append('landing_theme_config', JSON.stringify(themeConfig));
        formData.append('admission_form_config', JSON.stringify(admissionConfig));
        formData.append('tagline', tagline);
        formData.append('about_text', aboutText);
        if (logoFile) formData.append('school_logo', logoFile);

        try {
            const res = await api.post('/school/settings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.logo_path) setLogoPreview(res.data.logo_path);
            await confirm({
                title: 'Settings Updated',
                message: 'Your school configuration has been successfully synchronized.',
                type: 'info',
                confirmText: 'Excellent'
            });
        } catch (error) {
            await confirm({
                title: 'Update Failed',
                message: 'Failed to update settings. Please check your inputs and try again.',
                type: 'danger',
                confirmText: 'Retry'
            });
        } finally {
            setIsSaving(false);
        }
    };

    // CMS Banners handers
    const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
    const [newBannerTitle, setNewBannerTitle] = useState('');
    const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
    const handleAddBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBannerFile) {
            await confirm({
                title: 'Asset Missing',
                message: 'Please select an image file to upload as a slider banner.',
                type: 'warning'
            });
            return;
        }
        const fd = new FormData();
        fd.append('image', newBannerFile);
        fd.append('title', newBannerTitle);
        fd.append('subtitle', newBannerSubtitle);
        try {
            await api.post('/school/cms/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            fetchData();
            setNewBannerFile(null); setNewBannerTitle(''); setNewBannerSubtitle('');
        } catch (err) { 
            await confirm({
                title: 'Upload Failed',
                message: 'We could not process the banner image. Ensure the format is JPG/PNG.',
                type: 'danger'
            });
        }
    }
    const handleDeleteBanner = async (id: number) => {
        if (!await confirm({ title: 'Delete Banner', message: 'Are you sure? This will remove the image from the landing page slider.', type: 'danger' })) return;
        await api.delete(`/school/cms/banners/${id}`);
        fetchData();
    }

    // CMS Sections handlers
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [newSectionType, setNewSectionType] = useState('grid');
    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/school/cms/sections', { title: newSectionTitle, type: newSectionType });
            fetchData();
            setNewSectionTitle('');
        } catch (err) { 
            await confirm({
                title: 'Section Error',
                message: 'Could not initialize the new custom section.',
                type: 'danger'
            });
        }
    }
    const handleDeleteSection = async (id: number) => {
        if (!await confirm({ title: 'Delete Section', message: 'Remove this entire block from the landing page?', type: 'danger' })) return;
        await api.delete(`/school/cms/sections/${id}`);
        fetchData();
    }

    // Card handlers
    const [openCardSecId, setOpenCardSecId] = useState<number | null>(null);
    const [cardTitle, setCardTitle] = useState('');
    const [cardDesc, setCardDesc] = useState('');
    const [cardFile, setCardFile] = useState<File|null>(null);
    const handleAddCard = async (sectionId: number, e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('title', cardTitle);
        fd.append('description', cardDesc);
        if (cardFile) fd.append('image', cardFile);
        try {
            await api.post(`/school/cms/sections/${sectionId}/cards`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            fetchData();
            setOpenCardSecId(null); setCardTitle(''); setCardDesc(''); setCardFile(null);
        } catch (err) { 
            await confirm({
                title: 'Content Error',
                message: 'Failed to add content card to this section.',
                type: 'danger'
            });
        }
    }
    const handleDeleteCard = async (secId: number, cardId: number) => {
        if (!await confirm({ title: 'Delete Card', message: 'Confirm removal of this individual card element.', type: 'danger' })) return;
        await api.delete(`/school/cms/sections/${secId}/cards/${cardId}`);
        fetchData();
    }

    if (isInitialLoading) {
        return (
            <div className="p-6 animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
                <div className="flex gap-2 border-b border-slate-200 mb-6">
                    <div className="h-10 w-24 bg-slate-200 rounded-t"></div>
                    <div className="h-10 w-32 bg-slate-200 rounded-t"></div>
                    <div className="h-10 w-40 bg-slate-200 rounded-t"></div>
                </div>
                <div className="max-w-3xl bg-white p-6 rounded shadow-sm border border-slate-200">
                    <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="h-12 bg-slate-100 rounded"></div>
                        <div className="h-12 bg-slate-100 rounded"></div>
                    </div>
                    <div className="h-24 bg-slate-100 rounded mt-4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Landing Page Builder (Mini-CMS)</h2>
            
            <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-6">
                {[
                    { id: 'general', label: 'Theme & Flow' }, 
                    { id: 'seo_social', label: 'SEO, Map & Social' },
                    { id: 'admissions', label: 'Admission Form Config' }, 
                    { id: 'banners', label: 'Slider Banners' }, 
                    { id: 'sections', label: 'Custom Content Sections' }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-2 px-4 shadow-none ${activeTab === tab.id ? 'border-b-2 border-indigo-600 font-bold text-indigo-600' : 'text-slate-500 font-medium'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* General & Theme Settings */}
            {activeTab === 'general' && (
                <form onSubmit={handleSaveGeneralTheme} className="flex flex-col gap-5 max-w-5xl bg-white p-6 rounded shadow-sm border border-slate-200">
                    
                    <div>
                        <h3 className="text-lg font-bold mb-3 border-b pb-2">Component Flow Integrations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 shadow-sm border border-slate-100 rounded p-4 gap-4 bg-slate-50">
                            <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={themeConfig.show_about} onChange={e => setThemeConfig({...themeConfig, show_about: e.target.checked})} /> Show "About Us" Section</label>
                            <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={themeConfig.show_admissions} onChange={e => setThemeConfig({...themeConfig, show_admissions: e.target.checked})} /> Show Admission Form Block</label>
                            <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={themeConfig.show_contact} onChange={e => setThemeConfig({...themeConfig, show_contact: e.target.checked})} /> Show Contact Us / Maps</label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-bold mb-3 border-b pb-2">General Text & Identifiers</h3>
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div><label className="block text-sm font-medium mb-1">Subdomain Slug</label><input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full p-2 border rounded" /></div>
                                <div><label className="block text-sm font-medium mb-1">Custom Domain</label><input type="text" value={customDomain} onChange={e => setCustomDomain(e.target.value)} className="w-full p-2 border rounded" /></div>
                            </div>
                            <div className="mb-3"><label className="block text-sm font-medium mb-1">Tagline</label><input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="w-full p-2 border rounded" /></div>
                            <div><label className="block text-sm font-medium mb-1">About Us Text</label><textarea value={aboutText} onChange={e => setAboutText(e.target.value)} rows={3} className="w-full p-2 border rounded" /></div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-3 border-b pb-2">Custom Branding</h3>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <div><label className="block text-sm font-medium mb-1 truncate" title="Primary Color">Primary Color</label><input type="color" value={themeConfig.primary_color} onChange={e => setThemeConfig({...themeConfig, primary_color: e.target.value})} className="h-10 w-full" /></div>
                                <div><label className="block text-sm font-medium mb-1 truncate" title="Light Background">Light Background</label><input type="color" value={themeConfig.secondary_color} onChange={e => setThemeConfig({...themeConfig, secondary_color: e.target.value})} className="h-10 w-full" /></div>
                                <div><label className="block text-sm font-medium mb-1 truncate" title="Button Text">Button Text</label><input type="color" value={themeConfig.button_text_color} onChange={e => setThemeConfig({...themeConfig, button_text_color: e.target.value})} className="h-10 w-full" /></div>
                                <div><label className="block text-sm font-medium mb-1 truncate" title="Footer Background">Footer Background</label><input type="color" value={themeConfig.footer_bg_color || '#1e293b'} onChange={e => setThemeConfig({...themeConfig, footer_bg_color: e.target.value})} className="h-10 w-full" /></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">School Logo Image</label>
                                {logoPreview && <div className="mb-2"><img src={logoPreview} className="h-12 object-contain bg-slate-100 p-1 rounded" /></div>}
                                <input type="file" accept="image/*" onChange={(e)=>{ if(e.target.files) { setLogoFile(e.target.files[0]); setLogoPreview(URL.createObjectURL(e.target.files[0])); } }} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isSaving} className="self-start py-2 px-8 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700">{isSaving ? 'Saving...' : 'Save Theme & Flow'}</button>
                </form>
            )}

            {/* SEO & Social */}
            {activeTab === 'seo_social' && (
                <form onSubmit={handleSaveGeneralTheme} className="bg-white p-6 rounded shadow-sm border border-slate-200 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <h3 className="text-lg font-bold mb-3 border-b pb-2">Search Engine Optimization (SEO)</h3>
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Meta Title</label>
                                <input type="text" placeholder="e.g. Best School in the Valley" value={themeConfig.seo_title} onChange={e => setThemeConfig({...themeConfig, seo_title: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:outline-none" />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Meta Description</label>
                                <textarea placeholder="A short description that appears on google searches..." value={themeConfig.seo_description} onChange={e => setThemeConfig({...themeConfig, seo_description: e.target.value})} rows={3} className="w-full p-2 border rounded focus:ring-2 focus:outline-none" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-3 border-b pb-2">Social Hub & Maps</h3>
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-0">Google Maps Embed URL</label>
                                <p className="text-[11px] text-slate-500 mb-2 leading-tight">Go to Google Maps {'->'} Share {'->'} Embed a Map {'->'} Copy just the `src="..."` URL.</p>
                                <input type="text" placeholder="https://www.google.com/maps/embed?pb=..." value={themeConfig.google_map_embed} onChange={e => setThemeConfig({...themeConfig, google_map_embed: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:outline-none" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium mb-1">Facebook URL</label><input type="text" value={themeConfig.social_facebook} onChange={e => setThemeConfig({...themeConfig, social_facebook: e.target.value})} className="w-full p-2 border rounded" /></div>
                                <div><label className="block text-sm font-medium mb-1">Instagram URL</label><input type="text" value={themeConfig.social_instagram} onChange={e => setThemeConfig({...themeConfig, social_instagram: e.target.value})} className="w-full p-2 border rounded" /></div>
                                <div><label className="block text-sm font-medium mb-1">Twitter URL</label><input type="text" value={themeConfig.social_twitter} onChange={e => setThemeConfig({...themeConfig, social_twitter: e.target.value})} className="w-full p-2 border rounded" /></div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isSaving} className="py-2 px-8 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700">{isSaving ? 'Saving...' : 'Save SEO & Social Settings'}</button>
                </form>
            )}

            {/* Admissions Form Config */}
            {activeTab === 'admissions' && (
                <div className="bg-white p-6 rounded shadow-sm border border-slate-200 max-w-2xl">
                    <h3 className="text-lg font-bold mb-4">Admissions Form Configuration</h3>
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={admissionConfig.enable_admission} onChange={e => setAdmissionConfig({...admissionConfig, enable_admission: e.target.checked})} /> Actively Accept Online Applications</label>
                        
                        <div className="pl-6 flex flex-col gap-2 mt-2 opacity-80 border-l-2 border-indigo-200 ml-2">
                            <h4 className="text-sm font-semibold mb-1 text-slate-600">Dynamic Fields to show in form:</h4>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={admissionConfig.require_photo} onChange={e => setAdmissionConfig({...admissionConfig, require_photo: e.target.checked})} /> Photo Upload</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={admissionConfig.require_parent_name} onChange={e => setAdmissionConfig({...admissionConfig, require_parent_name: e.target.checked})} /> Parent/Guardian Name</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={admissionConfig.require_phone} onChange={e => setAdmissionConfig({...admissionConfig, require_phone: e.target.checked})} /> Phone Number</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={admissionConfig.require_email} onChange={e => setAdmissionConfig({...admissionConfig, require_email: e.target.checked})} /> Email Address</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={admissionConfig.require_address} onChange={e => setAdmissionConfig({...admissionConfig, require_address: e.target.checked})} /> Residential Address</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={admissionConfig.require_occupation} onChange={e => setAdmissionConfig({...admissionConfig, require_occupation: e.target.checked})} /> Parent Occupation</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={admissionConfig.require_previous_school} onChange={e => setAdmissionConfig({...admissionConfig, require_previous_school: e.target.checked})} /> Previous School Field</label>
                        </div>
                    </div>
                    <button onClick={handleSaveGeneralTheme} className="mt-6 py-2 px-6 bg-indigo-600 text-white font-bold rounded">Save Application Settings</button>
                </div>
            )}

            {/* Banners */}
            {activeTab === 'banners' && (
                <div className="flex flex-col gap-6">
                    <form onSubmit={handleAddBanner} className="bg-white p-6 rounded shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold mb-4">Add Slider Banner</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input type="text" placeholder="Title" value={newBannerTitle} onChange={e => setNewBannerTitle(e.target.value)} className="p-2 border rounded" />
                            <input type="text" placeholder="Subtitle" value={newBannerSubtitle} onChange={e => setNewBannerSubtitle(e.target.value)} className="p-2 border rounded" />
                        </div>
                        <input type="file" accept="image/*" onChange={(e)=>{ if(e.target.files) setNewBannerFile(e.target.files[0]) }} className="mb-4 block" />
                        <button type="submit" className="py-2 px-4 bg-indigo-600 text-white rounded">Upload Banner</button>
                    </form>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {banners.map(b => (
                            <div key={b.id} className="relative group rounded overflow-hidden shadow-sm border border-slate-200">
                                <img src={b.image_path} alt="banner" className="w-full h-32 object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity flex-col">
                                    <div className="text-white font-bold text-center px-2">{b.title}</div>
                                    <button onClick={() => handleDeleteBanner(b.id)} className="mt-3 bg-red-600 text-white text-xs py-1 px-4 rounded font-bold tracking-wider">DELETE</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sections & Cards */}
            {activeTab === 'sections' && (
                <div className="flex flex-col gap-6">
                    <form onSubmit={handleAddSection} className="bg-white p-6 rounded shadow-sm border border-slate-200 flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">New Section Title</label>
                            <input type="text" placeholder="e.g. Our Facilities" required value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Layout Style</label>
                            <select value={newSectionType} onChange={e => setNewSectionType(e.target.value)} className="p-2 border rounded w-48 focus:ring-2 focus:outline-none">
                                <option value="grid">Grid Layout (Standard)</option>
                                <option value="gallery">Photo Gallery</option>
                                <option value="text">Text Blocks</option>
                                <option value="features">Feature List</option>
                                <option value="marquee">Auto-Scroll Marquee</option>
                            </select>
                        </div>
                        <button type="submit" className="py-2 px-6 bg-indigo-600 font-bold text-white rounded hover:bg-indigo-700">Build Section</button>
                    </form>

                    {sections.map(s => (
                        <div key={s.id} className="bg-white p-6 rounded shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-4 border-b pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        {s.title} <span className="text-xs bg-slate-100 text-slate-500 py-1 px-2 rounded-full uppercase">{s.type}</span>
                                    </h3>
                                </div>
                                <button type="button" onClick={() => handleDeleteSection(s.id)} className="text-red-500 text-sm font-semibold hover:underline">Delete Entire Section</button>
                            </div>
                            
                            <div className={`grid gap-4 mb-4 ${s.type === 'grid' ? 'grid-cols-3' : s.type === 'gallery' ? 'grid-cols-4' : s.type === 'marquee' ? 'flex overflow-x-auto pb-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                                {s.cards && s.cards.map((c: any) => (
                                    <div key={c.id} className={`border rounded p-3 relative bg-slate-50 shrink-0 ${s.type === 'gallery' && 'p-1'} ${s.type === 'marquee' ? 'w-48 text-center' : ''}`}>
                                        <button type="button" onClick={() => handleDeleteCard(s.id, c.id)} className="absolute top-2 right-2 text-red-500 bg-white rounded-full w-6 h-6 flex items-center justify-center font-bold shadow z-10 hover:bg-red-50">&times;</button>
                                        
                                        {s.type === 'gallery' && c.image_path && <img src={c.image_path} className="w-full h-32 object-cover rounded" />}
                                        
                                        {s.type === 'marquee' && (
                                            <>
                                                {c.image_path && <img src={c.image_path} className="w-20 h-20 object-cover rounded-full mx-auto mb-2" />}
                                                <div className="font-bold text-slate-800 text-sm">{c.title}</div>
                                                <div className="text-xs text-slate-500 mt-1 line-clamp-3">{c.description}</div>
                                            </>
                                        )}

                                        {(s.type !== 'gallery' && s.type !== 'marquee') && (
                                            <>
                                                {c.image_path && <img src={c.image_path} className="w-full h-32 object-cover rounded mb-2" />}
                                                <div className="font-bold text-slate-800">{c.title}</div>
                                                <div className="text-sm text-slate-600 mt-1">{c.description}</div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {openCardSecId === s.id ? (
                                <form onSubmit={(e) => handleAddCard(s.id, e)} className="p-4 border border-indigo-200 bg-indigo-50/50 rounded mt-4">
                                    <h4 className="font-semibold mb-3 text-indigo-900 border-b border-indigo-100 pb-2">Add Content to '{s.title}'</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
                                            <input type="text" placeholder="Title/Name" required={s.type !== 'gallery'} value={cardTitle} onChange={e => setCardTitle(e.target.value)} className="p-2 border border-white rounded shadow-sm focus:ring-2" />
                                            <textarea placeholder="Description Content" value={cardDesc} onChange={e => setCardDesc(e.target.value)} className="p-2 border border-white rounded shadow-sm focus:ring-2" />
                                        </div>
                                        <div className="col-span-2 md:col-span-1 flex flex-col justify-center gap-3 bg-white p-4 rounded border border-indigo-100">
                                            <label className="text-sm font-medium text-slate-500">Attach Image {s.type === 'gallery' && '(Required)'}</label>
                                            <input type="file" required={s.type === 'gallery'} onChange={(e)=>{ if(e.target.files) setCardFile(e.target.files[0]) }} />
                                            
                                            <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                                                <button type="submit" className="py-2 px-6 font-bold bg-indigo-600 text-white rounded">Save Record</button>
                                                <button type="button" onClick={() => setOpenCardSecId(null)} className="py-2 px-6 bg-slate-200 text-slate-700 rounded font-medium hover:bg-slate-300">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <button onClick={() => setOpenCardSecId(s.id)} className="py-3 px-4 border border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-600 font-semibold rounded mt-4 w-full hover:bg-indigo-50 transition-colors">
                                    + Add Item to Section
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SchoolSettings;
