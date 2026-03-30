import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { useAppStore } from "@/lib/store";
import { LayoutDashboard, BookOpen, CheckSquare, Folder, Zap, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function CommandMenu() {
  const [_, setLocation] = useLocation();
  const { commandOpen, setCommandOpen } = useAppStore();
  const { user } = useAuth(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandOpen, setCommandOpen]);

  const runCommand = (path: string) => {
    setLocation(path);
    setCommandOpen(false);
  };

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent className="p-0 overflow-hidden shadow-2xl border-border sm:max-w-[550px]">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => runCommand("/dashboard")}>
                <LayoutDashboard className="mr-2" /> Dashboard
              </CommandItem>
              <CommandItem onSelect={() => runCommand("/learning")}>
                <BookOpen className="mr-2" /> Learning Center
              </CommandItem>
              <CommandItem onSelect={() => runCommand("/tasks")}>
                <CheckSquare className="mr-2" /> Tasks & Projects
              </CommandItem>
              <CommandItem onSelect={() => runCommand("/files")}>
                <Folder className="mr-2" /> File Storage
              </CommandItem>
              <CommandItem onSelect={() => runCommand("/automations")}>
                <Zap className="mr-2" /> Automations
              </CommandItem>
              {user?.role === 'admin' && (
                <CommandItem onSelect={() => runCommand("/users")}>
                  <Users className="mr-2" /> User Management
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
