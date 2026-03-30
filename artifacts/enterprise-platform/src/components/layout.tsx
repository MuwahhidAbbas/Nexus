import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarGroup, 
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { LayoutDashboard, BookOpen, CheckSquare, Folder, Zap, Users, Hexagon, Search, Sun, Moon, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/lib/store";
import { CommandMenu } from "./command-menu";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Learning", url: "/learning", icon: BookOpen },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Files", url: "/files", icon: Folder },
  { title: "Automations", url: "/automations", icon: Zap },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setCommandOpen } = useAppStore();

  const items = [...navItems];
  if (user?.role === 'admin') {
    items.push({ title: "Users", url: "/users", icon: Users });
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
        <CommandMenu />
        
        <Sidebar variant="inset">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
            <div className="flex items-center gap-2 font-display font-bold text-lg text-primary">
              <Hexagon className="h-6 w-6 fill-primary/10" strokeWidth={2} />
              <span>Nexus</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Platform</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.startsWith(item.url)}
                        tooltip={item.title}
                        className="font-medium transition-all"
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-border/50 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left">
                  <Avatar className="h-9 w-9 border border-border/50">
                    <AvatarImage src={user?.avatarUrl || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">{user?.name}</span>
                    <span className="text-xs text-muted-foreground capitalize truncate">{user?.role}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56" sideOffset={8}>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                  {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0 bg-background relative shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-10 clip-path-inset">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6 sticky top-0 z-20">
            <SidebarTrigger className="h-9 w-9 bg-muted/50 hover:bg-muted text-foreground" />
            <div className="flex-1 max-w-xl mx-auto hidden md:flex">
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground bg-muted/30 border-border shadow-none h-10 hover:bg-muted/50 transition-colors"
                onClick={() => setCommandOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                Search across platform...
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
            <div className="ml-auto flex items-center gap-2">
               <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                 {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
               </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-muted/10 p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full max-w-7xl mx-auto"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
