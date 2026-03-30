import { useState } from "react";
import { useGetTasks, useCreateTask, useUpdateTask } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Clock, GripVertical, CheckSquare } from "lucide-react";
import { format } from "date-fns";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function Tasks() {
  const { data: tasks, isLoading } = useGetTasks();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const updateTask = useUpdateTask({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/tasks'] }) }
  });
  const createTask = useCreateTask({
    mutation: { 
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        setOpen(false);
      }
    }
  });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low"|"medium"|"high"|"urgent">("medium");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user?.id) return;
    createTask.mutate({
      data: {
        title,
        priority,
        status: "todo",
        createdById: auth.user.id,
        assigneeId: auth.user.id
      }
    });
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("taskId", id.toString());
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent, newStatus: "todo"|"in_progress"|"completed") => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"), 10);
    if (!taskId) return;
    // Optimistic update could go here, but relying on rapid mutation
    updateTask.mutate({ id: taskId, data: { status: newStatus } });
  };

  const columns = [
    { id: "todo", title: "To Do", tasks: tasks?.filter(t => t.status === "todo") || [] },
    { id: "in_progress", title: "In Progress", tasks: tasks?.filter(t => t.status === "in_progress") || [] },
    { id: "completed", title: "Completed", tasks: tasks?.filter(t => t.status === "completed") || [] },
  ];

  return (
    <div className="h-full flex flex-col pb-6">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage project workflows</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-sm hover-elevate">
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="What needs to be done?" />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v:any) => setPriority(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createTask.isPending}>
                  {createTask.isPending ? "Adding..." : "Add Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 kanban-column-scroll snap-x">
        {columns.map(col => (
          <div 
            key={col.id} 
            className="flex-shrink-0 w-80 bg-muted/40 rounded-2xl border border-border/50 flex flex-col snap-center"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id as any)}
          >
            <div className="p-4 flex items-center justify-between border-b border-border/30">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
                {col.id === 'completed' ? <CheckSquare className="h-4 w-4 text-green-500" /> : <div className={`w-2 h-2 rounded-full ${col.id === 'todo' ? 'bg-slate-400' : 'bg-primary'}`} />}
                {col.title}
              </h3>
              <Badge variant="secondary" className="bg-background">{col.tasks.length}</Badge>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {col.tasks.map(task => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="bg-card p-4 rounded-xl border border-border/60 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold border-transparent px-2 py-0.5 rounded-md ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </Badge>
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-medium text-sm text-foreground leading-snug mb-3">{task.title}</h4>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                    <div className="flex items-center text-xs text-muted-foreground font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {format(new Date(task.createdAt), "MMM d")}
                    </div>
                    <Avatar className="h-6 w-6 border border-background ring-1 ring-border/50">
                      <AvatarImage src={task.assignee?.avatarUrl || ''} />
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{task.assignee?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ))}
              {col.tasks.length === 0 && (
                <div className="h-24 border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center text-xs text-muted-foreground font-medium">
                  Drop here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
