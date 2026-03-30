import { useGetUsers } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, Users as UsersIcon } from "lucide-react";
import { format } from "date-fns";

export default function Users() {
  const { user } = useAuth();
  const { data: users, isLoading } = useGetUsers({}, { query: { enabled: user?.role === 'admin' } });

  if (user?.role !== 'admin') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <ShieldAlert className="h-16 w-16 text-destructive/50 mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground mt-2">Only platform administrators can access user management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">User Directory</h1>
          <p className="text-muted-foreground mt-1">Manage platform access and roles</p>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading directory...</div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarImage src={u.avatarUrl || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">{u.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${u.role === 'admin' ? 'border-primary/50 text-primary bg-primary/5' : 'border-border'}`}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.department || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-destructive'}`} />
                      {u.isActive ? 'Active' : 'Suspended'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(u.createdAt), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
