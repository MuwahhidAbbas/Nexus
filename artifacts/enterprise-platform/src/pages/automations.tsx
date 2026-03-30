import { useState } from "react";
import { useGetAutomations, useUpdateAutomation, useCreateAutomation } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Zap, Plus, ArrowRight, Activity, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Automations() {
  const { data: automations } = useGetAutomations();
  const queryClient = useQueryClient();
  
  const updateMutation = useUpdateAutomation({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/automations'] }) }
  });
  
  const createMutation = useCreateAutomation({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/automations'] }); setOpen(false); } }
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<any>("task_completed");
  const [action, setAction] = useState<any>("notify_admin");

  const toggleStatus = (id: number, current: boolean) => {
    updateMutation.mutate({ id, data: { isActive: !current } });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        name,
        trigger,
        action,
        isActive: true,
        actionConfig: {}
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Workflow Automations</h1>
          <p className="text-muted-foreground mt-1">Automate routine actions across the platform</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl hover-elevate">
              <Plus className="mr-2 h-4 w-4" /> Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Automation Rule</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Notify on course finish" />
              </div>
              <div className="space-y-2">
                <Label>When this happens (Trigger)</Label>
                <Select value={trigger} onValueChange={setTrigger}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course_completed">Course Completed</SelectItem>
                    <SelectItem value="task_completed">Task Completed</SelectItem>
                    <SelectItem value="file_uploaded">File Uploaded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Then do this (Action)</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notify_admin">Notify Admin</SelectItem>
                    <SelectItem value="send_notification">Send Notification</SelectItem>
                    <SelectItem value="create_task">Create Follow-up Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Rule"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automations?.map((auto) => (
          <Card key={auto.id} className={`rounded-2xl border-border/50 shadow-sm transition-all duration-300 ${!auto.isActive ? 'opacity-60 grayscale-[30%]' : ''}`}>
            <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1 pr-4">
                <CardTitle className="text-lg leading-tight">{auto.name}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-1 mt-2">
                  <Activity className="h-3 w-3" /> Runs: {auto.runCount}
                </CardDescription>
              </div>
              <Switch 
                checked={auto.isActive} 
                onCheckedChange={() => toggleStatus(auto.id, auto.isActive)} 
              />
            </CardHeader>
            <CardContent>
              <div className="bg-muted/40 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="truncate">{auto.trigger.replace('_', ' ')}</span>
                </div>
                <div className="pl-2 border-l-2 border-primary/20 ml-2 py-1 flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Settings2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{auto.action.replace('_', ' ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {automations?.length === 0 && (
           <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-card rounded-2xl border border-dashed border-border/60">
             <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
               <Zap className="h-8 w-8" />
             </div>
             <h3 className="text-xl font-semibold">No active automations</h3>
             <p className="text-muted-foreground max-w-sm mt-2">Create workflow rules to automate repetitive tasks and save time.</p>
           </div>
        )}
      </div>
    </div>
  );
}
