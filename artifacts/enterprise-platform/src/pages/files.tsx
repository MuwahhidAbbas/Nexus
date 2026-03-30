import { useState } from "react";
import { useGetFiles, useUploadFile, useDeleteFile } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FolderOpen, FileText, Image, FileVideo, UploadCloud, Trash2, Download } from "lucide-react";
import { format } from "date-fns";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getIcon = (mime: string) => {
  if (mime.includes('image')) return <Image className="h-5 w-5 text-blue-500" />;
  if (mime.includes('video')) return <FileVideo className="h-5 w-5 text-purple-500" />;
  if (mime.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
  return <FileText className="h-5 w-5 text-slate-500" />;
};

export default function Files() {
  const { data: files, isLoading } = useGetFiles();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState("");

  const uploadMutation = useUploadFile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/files'] });
        setOpen(false);
        setFilename("");
      }
    }
  });

  const deleteMutation = useDeleteFile({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/files'] }) }
  });

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user?.id) return;
    uploadMutation.mutate({
      data: {
        name: filename,
        originalName: `${filename}.pdf`,
        mimeType: "application/pdf",
        size: Math.floor(Math.random() * 5000000) + 100000,
        url: "https://example.com/file.pdf",
        uploadedById: auth.user.id,
        isPublic: true
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">File Storage</h1>
          <p className="text-muted-foreground mt-1">Secure enterprise asset management</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl hover-elevate">
              <UploadCloud className="mr-2 h-4 w-4" /> Upload File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
            <form onSubmit={handleSimulateUpload} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input value={filename} onChange={e => setFilename(e.target.value)} required placeholder="e.g. Q3 Financial Report" />
              </div>
              <div className="p-8 border-2 border-dashed border-border/60 rounded-xl bg-muted/30 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Click to browse or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, JPG up to 50MB</p>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {files?.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <FolderOpen className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">No files stored</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">Upload documents to share them securely across your organization.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px]">Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files?.map((file) => (
                  <TableRow key={file.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg group-hover:bg-background transition-colors border border-transparent group-hover:border-border/50">
                          {getIcon(file.mimeType)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.originalName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatBytes(file.size)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{file.uploadedBy?.name || 'System'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(new Date(file.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate({ id: file.id })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
