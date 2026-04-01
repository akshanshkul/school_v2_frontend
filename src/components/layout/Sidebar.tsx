import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import gradoxLogo from '../../assets/logo/G.png'
import { 
  LayoutDashboard, 
  LineChart, 
  Package,
  ChevronRight,
  GraduationCap,
  FolderTree,
  Link2,
  BookOpen,
  Building2,
  Users,
  Settings,
  MessageSquare,
  Inbox,
  CreditCard
} from 'lucide-react'

const NavItem = ({ to, label, icon: Icon, active }: { to: string, label: string, icon: any, active: boolean }) => (
  <Link to={to} className={active ? 'sidebar-link-active' : 'sidebar-link-inactive'}>
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className="flex-1">{label}</span>
    {active && <ChevronRight size={14} className="opacity-50" />}
  </Link>
)

const Sidebar: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="w-72 bg-white flex flex-col sticky top-0 h-screen shrink-0 z-30">
      <div className="p-8 pb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-200 shrink-0">
          <img src={gradoxLogo} alt="Gradox" className="h-full w-full object-cover" />
        </div>
        <span className="font-black text-2xl text-slate-800 tracking-tight">Gradox</span>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1 custom-scrollbar">
        <div className="setup-label">Overview</div>
        <NavItem to="/" label="Dashboard" icon={LayoutDashboard} active={isActive('/')} />
        <NavItem to="/timetable" label="Timetable" icon={LineChart} active={isActive('/timetable')} />

        <div className="setup-label">Academic Setup</div>
        <NavItem to="/grades" label="Grades" icon={GraduationCap} active={isActive('/grades')} />
        <NavItem to="/sections" label="Sections" icon={FolderTree} active={isActive('/sections')} />
        <NavItem to="/classes" label="Class Mapping" icon={Link2} active={isActive('/classes')} />

        <div className="setup-label">Resources</div>
        <NavItem to="/subjects" label="Subjects" icon={BookOpen} active={isActive('/subjects')} />
        <NavItem to="/classrooms" label="Classrooms" icon={Building2} active={isActive('/classrooms')} />

        <div className="setup-label">Staff & Inquiries</div>
        <NavItem to="/staff" label="Staff & Roles" icon={Users} active={isActive('/staff')} />
        <NavItem to="/attendance" label="Staff Attendance" icon={Users} active={isActive('/attendance')} />
        <NavItem to="/inquiries" label="Contact Messages" icon={MessageSquare} active={isActive('/inquiries')} />
        <NavItem to="/admissions" label="Admission Applications" icon={Inbox} active={isActive('/admissions')} />

        <div className="setup-label">Admin</div>
        <NavItem to="/settings" label="CMS & Site Config" icon={Settings} active={isActive('/settings')} />
        <NavItem to="/subscription" label="Subscription & Bills" icon={CreditCard} active={isActive('/subscription')} />
      </nav>

      <div className="p-4 pt-0">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-100 group">
          <div className="absolute -right-4 -top-4 bg-white/10 h-24 w-24 rounded-full group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <Package size={18} />
            </div>
            <h4 className="font-black text-sm mb-1">Gradox Pro</h4>
            <p className="text-[10px] text-white/70 mb-4 font-medium leading-relaxed">Unlock advanced scheduling & conflict resolution.</p>
            <Link to="/subscription" className="w-full py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase flex items-center justify-center tracking-wider hover:bg-slate-50 transition-colors shadow-lg">
              Get Pro Access
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
