import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  Settings,
  LogOut,
  Menu,
  ClipboardCheck
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
  { title: 'My Dashboard', url: '/parent', icon: LayoutDashboard, roles: ['parent'] },
  { title: 'Students', url: '/students', icon: GraduationCap, roles: ['admin', 'staff'] },
  { title: 'Staff', url: '/staff', icon: Users, roles: ['admin', 'staff'] },
  { title: 'Classes', url: '/classes', icon: BookOpen, roles: ['admin', 'staff'] },
  { title: 'Attendance', url: '/attendance', icon: ClipboardCheck, roles: ['admin', 'staff'] },
  { title: 'Payments', url: '/payments', icon: CreditCard, roles: ['admin', 'staff'] },
  { title: 'Settings', url: '/settings', icon: Settings, roles: ['admin'] },
];

export function AppSidebar() {
  const { user, profile, role, logout } = useAuth();
  const location = useLocation();
  const { toggleSidebar, open } = useSidebar();

  const isActive = (path: string) => location.pathname === path;

  // Filter menu items based on role
  const filteredMenuItems = menuItems.filter(item => {
    if (!role) return false;
    return item.roles.includes(role);
  });

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Minhaaj Academy" 
            className="h-10 w-auto"
          />
          {open && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-semibold text-sidebar-foreground text-sm">
                Minhaaj Academy
              </span>
              <span className="text-[10px] text-sidebar-foreground/70 font-amiri">
                Faith. Foundation. Future
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="transition-all duration-200"
                  >
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-primary' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {open && (profile || user) && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">
              {role || 'User'}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          {open && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
