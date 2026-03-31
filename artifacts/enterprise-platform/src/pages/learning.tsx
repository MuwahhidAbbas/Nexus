import { useState } from "react";
import { Link } from "wouter";
import { useGetCourses, useCreateCourse } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, Plus, Clock, Users, ChevronRight } from "lucide-react";

export default function Learning() {
  const [search, setSearch] = useState("");
  const { data: courses, isLoading } = useGetCourses({ search: search || undefined });
  const authQuery = useAuth();
  const isAdmin = authQuery.user?.role === 'admin';
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft"|"published">("draft");

  const createCourse = useCreateCourse({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
        setOpen(false);
        setTitle("");
        setDescription("");
      }
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authQuery.user?.id) return;
    createCourse.mutate({
      data: {
        title,
        description,
        status,
        createdById: authQuery.user?.id
      }
    });
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Learning Center</h1>
          <p className="text-muted-foreground mt-1 text-lg">Enhance your skills with our corporate training modules.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search courses..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-card border-border/50 rounded-xl"
            />
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 rounded-xl bg-primary shadow-sm hover-elevate">
                  <Plus className="mr-2 h-4 w-4" /> New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Compliance Training 101" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Input id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short overview..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Initial Status</Label>
                    <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createCourse.isPending}>
                      {createCourse.isPending ? "Creating..." : "Create Course"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : courses?.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-card rounded-2xl border border-dashed border-border/60">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">No courses found</h3>
          <p className="text-muted-foreground max-w-sm mt-2">There are no courses available right now or matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/learning/${course.id}`}>
              <Card className="overflow-hidden rounded-2xl cursor-pointer border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group h-full flex flex-col bg-card">
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative p-4 flex flex-col justify-between border-b border-border/30">
                  <div className="flex justify-between items-start">
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'} className="capitalize bg-background/80 backdrop-blur text-foreground">
                      {course.status}
                    </Badge>
                  </div>
                  <BookOpen className="h-12 w-12 text-primary/30 absolute -bottom-4 -right-2 transform group-hover:scale-110 transition-transform duration-500" />
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {course.description || "No description provided for this course."}
                  </p>
                  
                  <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-medium mt-auto">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrolledCount}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration || 0}m</span>
                    </div>
                    <span className="text-primary flex items-center font-bold">View <ChevronRight className="h-3 w-3 ml-0.5" /></span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
