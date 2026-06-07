"use client";

import { useMutation } from "@tanstack/react-query";

import { uploadFiles } from "@/services/api";
import { useChatStore } from "@/store/chatStore";

export function useFileUpload() {
  const setUploadedFiles = useChatStore((state) => state.setUploadedFiles);

  const mutation = useMutation({
    mutationFn: async ({ query, files }: { query: string; files: File[] }) => {
      return uploadFiles(query, files);
    },
    onSuccess: (response) => {
      setUploadedFiles(response.files);
    },
  });

  return {
    upload: mutation.mutate,
    uploadAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}