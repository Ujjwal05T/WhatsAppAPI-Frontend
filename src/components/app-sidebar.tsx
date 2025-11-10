'use client';

import { Home, Phone, User, BookOpen, LogOut, Key, Keyboard, Webhook } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';

interface User {
  mobile: string;
  apiKey: string;
  isActive: boolean;
}

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    shortcut: 'Ctrl + D',
    key: 'd',
  },
  {
    title: 'Accounts',
    url: '/accounts',
    icon: Phone,
    shortcut: 'Ctrl + A',
    key: 'a',
  },
  {
    title: 'Webhooks',
    url: '/webhooks',
    icon: Webhook,
    shortcut: 'Ctrl + W',
    key: 'w',
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
    shortcut: 'Ctrl + P',
    key: 'p',
  },
  {
    title: 'Docs',
    url: '/docs',
    icon: BookOpen,
    shortcut: 'Ctrl + I',
    key: 'i',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    // Fetch user info from localStorage
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      // Fetch user profile
      fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'X-API-Key': apiKey,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch((err) => console.error('Failed to fetch user:', err));
    }
  }, []);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Cmd/Ctrl is pressed
      if (e.metaKey || e.ctrlKey) {
        const item = menuItems.find(item => item.key === e.key.toLowerCase());
        if (item) {
          e.preventDefault();
          router.push(item.url);
        }

        // Toggle shortcuts help with ⌘K
        if (e.key === 'k') {
          e.preventDefault();
          setShowShortcuts(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('apiKey');
    router.push('/login');
  };

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border px-6 py-5 bg-sidebar group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4">
          <div className="flex items-center space-x-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className=""
                >
                  <Image src={'/logo.png'} alt="Logo" width={64} height={64} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-semibold">
                WhatsApp API Dashboard
              </TooltipContent>
            </Tooltip>
            <div className="group-data-[collapsible=icon]:hidden">
              <h2 className="font-bold text-lg text-sidebar-foreground">WhatsApp API</h2>
              <p className="text-xs text-sidebar-accent-foreground">Dashboard</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                          className="smooth-transition"
                        >
                          <a href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                           
                            <kbd className="ml-auto hidden group-data-[collapsible=offcanvas]:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                              {item.shortcut}
                            </kbd>
                          </a>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="flex items-center gap-2">
                        <span>{item.title}</span>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Keyboard Shortcuts Help */}
          {showShortcuts && (
            <SidebarGroup className="mt-auto slide-in-bottom">
              <SidebarGroupLabel className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Keyboard Shortcuts
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 text-xs space-y-1 text-muted-foreground">
                  {menuItems.map((item) => (
                    <div key={item.title} className="flex items-center justify-between">
                      <span>{item.title}</span>
                      <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px]">
                        {item.shortcut}
                      </kbd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t pt-1 mt-1">
                    <span>Toggle Help</span>
                    <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px]">
                      Ctrl +K
                    </kbd>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-4 bg-sidebar">
          {user && (
            <div className="mb-3 px-2 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center space-x-3 mb-2 p-2 rounded-lg bg-sidebar-accent/30 smooth-transition">
                <div className="bg-linear-to-br from-blue-400 to-blue-600 p-2 rounded-full shadow-sm">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-sidebar-foreground">{user.mobile}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-sidebar-accent-foreground bg-sidebar-accent/20 rounded-md px-3 py-2">
                <Key className="h-3 w-3" />
                <span className="truncate font-mono">{user.apiKey.substring(0, 12)}...</span>
              </div>
            </div>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton onClick={() => setShowShortcuts(!showShortcuts)}>
                    <Keyboard />
                    <span>Shortcuts</span>
                    <kbd className="ml-auto hidden group-data-[collapsible=offcanvas]:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px]">
                      ⌘K
                    </kbd>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Toggle keyboard shortcuts (Ctrl + K)
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="smooth-transition hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400">
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
