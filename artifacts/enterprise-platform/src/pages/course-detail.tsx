import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetCourse, useEnrollUserInCourse } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, PlayCircle, CheckCircle2, Clock, Users, Award } from "lucide-react";

export default function CourseDetail() {
  const [match, params] = useRoute("/learning/:id");
  const courseId = parseInt(params?.id || "0", 10);
  const { data: course, isLoading } = useGetCourse(courseId);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const enrollMutation = useEnrollUserInCourse({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] })
    }
  });

  const handleEnroll = () => {
    if (user?.id) enrollMutation.mutate({ id: courseId, data: { userId: user.id } });
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-32"/><Skeleton className="h-64 w-full rounded-2xl"/><Skeleton className="h-96 w-full rounded-2xl"/></div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link href="/learning" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to courses
      </Link>

      {/* Hero Section */}
      <div className="bg-card rounded-3xl p-8 md:p-10 border border-border/50 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-wrap gap-3 mb-6 relative z-10">
          <Badge variant="secondary" className="px-3 py-1 text-sm bg-muted text-foreground">{course.status}</Badge>
          <Badge variant="outline" className="px-3 py-1 text-sm border-primary/20 text-primary bg-primary/5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {course.duration || 60} mins
          </Badge>
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground mb-4 relative z-10 leading-tight">
          {course.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8 relative z-10">
          {course.description || "Comprehensive enterprise training module to ensure compliance and skill enhancement across the organization."}
        </p>

        <div className="flex flex-wrap items-center gap-6 relative z-10">
          <Button 
            size="lg" 
            className="rounded-xl px-8 h-12 text-base font-semibold shadow-md bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            onClick={handleEnroll}
            disabled={enrollMutation.isPending}
          >
            {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
          </Button>
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {course.enrolledCount} Enrolled</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Certificate on completion</span>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold">Course Curriculum</h2>
        
        {course.modules && course.modules.length > 0 ? (
          <Accordion type="multiple" className="w-full space-y-4">
            {course.modules.map((module, i) => (
              <AccordionItem key={module.id} value={`module-${module.id}`} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm px-2">
                <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/30 rounded-xl transition-colors">
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Module {i + 1}</span>
                    <span className="text-lg font-semibold">{module.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <p className="text-muted-foreground mb-4 text-sm">{module.description}</p>
                  <div className="space-y-2">
                    {module.lessons?.map((lesson, j) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 group hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="font-medium text-sm">{j + 1}. {lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                          {lesson.duration && <span>{lesson.duration}m</span>}
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold rounded-lg text-primary hover:bg-primary/10">View</Button>
                        </div>
                      </div>
                    ))}
                    {!module.lessons?.length && <div className="text-sm text-muted-foreground italic pl-2">No lessons in this module yet.</div>}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed text-muted-foreground">
            No modules published yet.
          </div>
        )}
      </div>
    </div>
  );
}
