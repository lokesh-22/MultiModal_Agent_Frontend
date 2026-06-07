"use client";

import { FileAudio, FileImage, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadFileMetadata } from "@/types/chat";

type Props = {
  files: UploadFileMetadata[];
};

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(fileType: string) {
  if (["jpg", "jpeg", "png", "webp"].includes(fileType)) {
    return <FileImage className="size-4" />;
  }
  if (["mp3", "wav", "m4a"].includes(fileType)) {
    return <FileAudio className="size-4" />;
  }
  return <FileText className="size-4" />;
}

export function FilePreviewList({ files }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs">
          {files.map((file) => (
            <div key={file.file_path} className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-2">
              <div className="flex items-center gap-2">
                {fileIcon(file.file_type)}
                <div>
                  <p className="font-medium">{file.file_name}</p>
                  <p className="text-zinc-500">{file.file_type.toUpperCase()}</p>
                </div>
              </div>
              <span className="text-zinc-500">{formatFileSize(file.size_bytes)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}