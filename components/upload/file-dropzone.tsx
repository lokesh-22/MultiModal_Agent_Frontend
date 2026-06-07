"use client";

import { ClipboardPlus, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type Props = {
	files: File[];
	onChange: (files: File[]) => void;
};

function appendFiles(currentFiles: File[], nextFiles: File[]) {
	const merged = [...currentFiles];
	for (const file of nextFiles) {
		const exists = merged.some((entry) => entry.name === file.name && entry.size === file.size);
		if (!exists) merged.push(file);
	}
	return merged;
}

export function FileDropzone({ files, onChange }: Props) {
	return (
		<div className="space-y-3">
			<label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-5 text-center transition hover:border-zinc-400 hover:bg-zinc-50">
				<UploadCloud className="size-6 text-zinc-600" />
				<p className="mt-2 text-sm font-medium text-zinc-900">Drag files here or browse</p>
				<p className="mt-1 text-xs text-zinc-500">PDF, images, audio, and other local files</p>
				<input
					type="file"
					className="hidden"
					multiple
					onChange={(event) => {
						const nextFiles = Array.from(event.target.files ?? []);
						onChange(appendFiles(files, nextFiles));
					}}
				/>
			</label>

			<div className="flex flex-wrap gap-2">
				{files.length === 0 ? (
					<Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
						<ClipboardPlus className="size-3.5" />
						No files selected
					</Badge>
				) : (
					files.map((file) => (
						<Badge key={`${file.name}-${file.size}`} variant="outline" className="gap-1.5 rounded-full px-3 py-1">
							{file.name}
						</Badge>
					))
				)}
			</div>
		</div>
	);
}
