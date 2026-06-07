"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
	Bot,
	ChevronLeft,
	ChevronRight,
	FileAudio2,
	FileImage,
	FileText,
	LoaderCircle,
	Menu,
	Plus,
	Search,
	SendHorizontal,
	Trash2,
	Upload,
	X,
} from "lucide-react";

import { useStreamingChat } from "@/hooks/useStreaming";
import { useChatStore } from "@/store/chatStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function fileIcon(fileName: string) {
	const lower = fileName.toLowerCase();
	if (lower.match(/\.(png|jpg|jpeg|webp|gif|bmp|svg)$/)) return <FileImage className="size-4" />;
	if (lower.match(/\.(mp3|wav|m4a|aac|flac|ogg)$/)) return <FileAudio2 className="size-4" />;
	return <FileText className="size-4" />;
}

function fileKind(fileName: string) {
	const lower = fileName.toLowerCase();
	if (lower.match(/\.(png|jpg|jpeg|webp|gif|bmp|svg)$/)) return "Image";
	if (lower.match(/\.(mp3|wav|m4a|aac|flac|ogg)$/)) return "Audio";
	if (lower.match(/\.pdf$/)) return "PDF";
	return "File";
}

function prettySize(bytes: number) {
	return bytes < 1024 ? `${bytes} B` : `${Math.round(bytes / 1024)} KB`;
}

function formatDate(value: number) {
	const date = new Date(value);
	const day = String(date.getUTCDate()).padStart(2, "0");
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const year = date.getUTCFullYear();
	return `${day}/${month}/${year}`;
}

function formatTime(value: number) {
	const date = new Date(value);
	const hours = String(date.getUTCHours()).padStart(2, "0");
	const minutes = String(date.getUTCMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
}

function getLastAssistantReasoning(message: { reasoningTrace?: string[] }) {
	return message.reasoningTrace?.length ? message.reasoningTrace : [];
}

export function ChatShell() {
	const [query, setQuery] = useState("");
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const {
		sessions,
		activeSessionId,
		createSession,
		setActiveSession,
		isThinking,
		isOcrRunning,
		isAudioRunning,
		isToolRunning,
	} = useChatStore();
	const { stream, isPending: isStreaming } = useStreamingChat();

	const activeSession = useMemo(
		() => sessions.find((session) => session.id === activeSessionId) ?? sessions[0] ?? null,
		[sessions, activeSessionId],
	);

	const activeMessages = activeSession?.messages ?? [];
	const isBusy = isStreaming || isThinking;
	const statusItems = [
		{ label: "Streaming", active: isStreaming || isThinking },
		{ label: "OCR", active: isOcrRunning },
		{ label: "Audio", active: isAudioRunning },
		{ label: "Tools", active: isToolRunning },
	];

	useEffect(() => {
		if (!activeSessionId && sessions.length > 0) {
			setActiveSession(sessions[0].id);
		}
	}, [activeSessionId, sessions, setActiveSession]);

	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		textarea.style.height = "0px";
		textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
	}, [query]);

	const updateFiles = (incoming: File[]) => {
		setSelectedFiles((current) => {
			const merged = [...current];
			for (const file of incoming) {
				if (!merged.some((entry) => entry.name === file.name && entry.size === file.size)) {
					merged.push(file);
				}
			}
			return merged;
		});
	};

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmed = query.trim();
		if (!trimmed || isBusy) return;

		if (!activeSessionId) {
			createSession();
		}

		stream({ query: trimmed, files: selectedFiles });
		setQuery("");
		setSelectedFiles([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			event.currentTarget.form?.requestSubmit();
		}
	};

	return (
		<div className="flex h-dvh min-h-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(232,227,214,0.9),_rgba(246,244,239,0.95)_40%,_rgba(235,230,223,1)_100%)] text-zinc-950">
			{mobileSidebarOpen && (
				<button
					type="button"
					aria-label="Close sidebar"
					className="fixed inset-0 z-30 bg-black/30 lg:hidden"
					onClick={() => setMobileSidebarOpen(false)}
				/>
			)}

			<aside
				className={cn(
					"absolute inset-y-0 left-0 z-40 flex w-[290px] max-w-[85vw] flex-col border-r border-zinc-200/80 bg-white/88 shadow-2xl shadow-zinc-950/10 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none",
					sidebarCollapsed ? "lg:w-[84px]" : "lg:w-[300px]",
					mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
				)}
			>
				<div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-4">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-2xl bg-zinc-950 text-white">
							<Bot className="size-5" />
						</div>
						{!sidebarCollapsed && (
							<div>
								<p className="text-sm font-semibold tracking-tight">Agentic Assistant</p>
								<p className="text-xs text-zinc-500">Multimodal chat</p>
							</div>
						)}
					</div>
					<div className="flex items-center gap-1">
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							className="lg:hidden"
							onClick={() => setMobileSidebarOpen(false)}
							aria-label="Close sidebar"
						>
							<X className="size-4" />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							onClick={() => setSidebarCollapsed((value) => !value)}
							aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
							className="hidden lg:inline-flex"
						>
							{sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
						</Button>
					</div>
				</div>

				<div className="border-b border-zinc-200/80 p-4">
					<Button
						type="button"
						className={cn("w-full justify-start gap-2 rounded-2xl", sidebarCollapsed && "lg:justify-center")}
						onClick={() => createSession()}
					>
						<Plus className="size-4" />
						{!sidebarCollapsed && "New Chat"}
					</Button>
				</div>

				<div className={cn("border-b border-zinc-200/80 px-4 py-4", sidebarCollapsed && "lg:px-3")}>
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
						<Input
							placeholder="Recent chats"
							disabled
							className={cn("h-10 rounded-2xl bg-zinc-50 pl-9", sidebarCollapsed && "lg:hidden")}
						/>
					</div>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto p-3 chat-scrollbar">
					<div className="space-y-2">
						{sessions.map((session) => (
							<button
								type="button"
								key={session.id}
								onClick={() => {
									setActiveSession(session.id);
									setMobileSidebarOpen(false);
								}}
								className={cn(
									"w-full rounded-2xl border px-3 py-3 text-left transition hover:-translate-y-px hover:shadow-sm",
									session.id === activeSessionId
										? "border-zinc-950 bg-zinc-950 text-white shadow-lg shadow-zinc-950/10"
										: "border-zinc-200 bg-white hover:border-zinc-300",
								)}
							>
								<p className="truncate text-sm font-medium">{session.title}</p>
								<p className="mt-1 line-clamp-2 text-xs leading-5 opacity-70">
									{session.messages.length
										? session.messages[session.messages.length - 1].content || "Empty conversation"
										: "Start a new conversation"}
								</p>
								<div className="mt-3 flex items-center justify-between text-[11px] opacity-70">
									<span>{formatDate(session.createdAt)}</span>
									<span>{session.messages.length} msgs</span>
								</div>
							</button>
						))}
					</div>
				</div>
			</aside>

			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				<header className="flex h-16 items-center justify-between gap-3 border-b border-zinc-200/80 bg-white/70 px-4 backdrop-blur-xl md:px-6">
					<div className="flex min-w-0 items-center gap-3">
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							className="lg:hidden"
							onClick={() => setMobileSidebarOpen(true)}
							aria-label="Open sidebar"
						>
							<Menu className="size-4" />
						</Button>
						<div className="min-w-0">
							<p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Multimodal assistant</p>
							<h1 className="truncate text-base font-semibold tracking-tight md:text-lg">
								{activeSession?.title ?? "New Chat"}
							</h1>
						</div>
					</div>
					<div className="flex flex-wrap items-center justify-end gap-2">
						{statusItems.map((item) => (
							<Badge key={item.label} variant={item.active ? "default" : "outline"} className="rounded-full px-3 py-1">
								{item.active && <LoaderCircle className="mr-1 size-3 animate-spin" />}
								{item.label}
							</Badge>
						))}
					</div>
				</header>

				<main className="flex min-h-0 flex-1 flex-col overflow-hidden">
					<section className="min-h-0 flex-1 overflow-y-auto px-4 py-5 chat-scrollbar md:px-6">
						<div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
							{activeMessages.length === 0 ? (
								<div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/75 p-8 shadow-sm backdrop-blur">
									<div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-center">
										<div>
											<div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
												<Bot className="size-3.5" />
												Ask anything or upload files
											</div>
											<h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
												Text, PDF, images, and audio in one clean workspace.
											</h2>
											<p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
												Drop files below or start a conversation. The assistant will stream answers live and keep
												reasoning tucked away inside each response.
											</p>
										</div>
										<div className="grid gap-2 text-sm">
											{[
												"Summarize this PDF",
												"Explain the code in this image",
												"Transcribe this audio",
												"Compare this audio and PDF",
											].map((prompt) => (
												<button
													key={prompt}
													type="button"
													onClick={() => setQuery(prompt)}
													className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
												>
													{prompt}
												</button>
											))}
											<div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs text-zinc-500">
												{[
													{ icon: <FileText className="size-4" />, label: "PDF" },
													{ icon: <FileImage className="size-4" />, label: "Images" },
													{ icon: <FileAudio2 className="size-4" />, label: "Audio" },
												].map((item) => (
													<div key={item.label} className="rounded-2xl border border-zinc-200 bg-white px-3 py-3">
														<div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-zinc-950 text-white">
															{item.icon}
														</div>
														{item.label}
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							) : (
								activeMessages.map((message) => {
									const reasoning = getLastAssistantReasoning(message);
									const isUser = message.role === "user";
									return (
										<article
											key={message.id}
											className={cn(
												"max-w-[min(100%,46rem)] rounded-[1.7rem] border px-4 py-4 shadow-sm md:px-5 md:py-5",
												isUser
													? "ml-auto border-zinc-950 bg-zinc-950 text-white shadow-zinc-950/10"
													: "mr-auto border-zinc-200 bg-white/90 text-zinc-950",
											)}
										>
											<div className="flex items-center justify-between gap-3">
												<div className="flex items-center gap-2">
													<Badge variant={isUser ? "secondary" : "outline"} className="rounded-full px-3 py-1">
														{isUser ? "You" : "Assistant"}
													</Badge>
													{message.intent && !isUser && (
														<Badge variant="outline" className="rounded-full px-3 py-1">
															{message.intent}
														</Badge>
													)}
												</div>
												<span className="text-[11px] opacity-60">
													{formatTime(message.timestamp)}
												</span>
											</div>

											<div
												className={cn(
													"prose prose-zinc mt-4 max-w-none text-sm leading-7",
													isUser && "prose-invert text-white",
												)}
											>
												<ReactMarkdown
													components={{
														p: ({ children: markdownChildren }) => <p className="whitespace-pre-wrap break-words">{markdownChildren}</p>,
														a: ({ children, ...props }) => (
															<a {...props} className="font-medium underline underline-offset-4">
																{children}
															</a>
														),
														ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>,
														ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>,
														li: ({ children }) => <li className="pl-1">{children}</li>,
														table: ({ children }) => (
															<div className="my-4 overflow-x-auto rounded-2xl border border-zinc-200">
																<table className="w-full border-collapse text-sm">{children}</table>
															</div>
														),
														th: ({ children }) => (
															<th className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-left font-semibold">
																{children}
															</th>
														),
														td: ({ children }) => (
															<td className="border-b border-zinc-200 px-3 py-2 align-top">{children}</td>
														),
														code: ({ className, children, ...props }) => {
															const language = /language-(\w+)/.exec(className ?? "")?.[1];
															const inline = !className;
															if (inline) {
																return (
																	<code {...props} className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.92em]">
																		{children}
																	</code>
																);
															}
															return (
																<div className="my-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100">
																	<div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
																		<span>{language ?? "code"}</span>
																	</div>
																	<pre className="overflow-x-auto p-4 text-sm leading-6">
																		<code {...props} className={className}>
																			{children}
																		</code>
																	</pre>
																</div>
															);
														},
													}}
												>
												{message.content || (isBusy && !isUser ? "Streaming response..." : "Waiting for a response...")}
												</ReactMarkdown>
											</div>

											{!isUser && reasoning.length > 0 && (
												<details className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3">
													<summary className="cursor-pointer list-none text-sm font-medium text-zinc-800">
														View Agent Reasoning
													</summary>
													<div className="mt-3 space-y-2 text-sm text-zinc-600">
														<p>
															<span className="font-medium text-zinc-900">Intent:</span>{" "}
															{message.intent ?? "SUMMARY"}
														</p>
														<p>
															<span className="font-medium text-zinc-900">Plan:</span>{" "}
															{message.executionPlan?.length ? message.executionPlan.join(" → ") : "Not available"}
														</p>
														<div>
															<p className="font-medium text-zinc-900">Tools Used:</p>
															<ul className="mt-2 list-disc space-y-1 pl-5">
																{(message.toolsUsed?.length ? message.toolsUsed : ["None yet"]).map((tool) => (
																	<li key={tool}>{tool}</li>
																))}
															</ul>
														</div>
														<div>
															<p className="font-medium text-zinc-900">Trace:</p>
															<ul className="mt-2 list-disc space-y-1 pl-5">
																{reasoning.map((trace) => (
																	<li key={trace}>{trace}</li>
																))}
															</ul>
														</div>
													</div>
												</details>
											)}
										</article>
									);
								})
							)}
						</div>
					</section>

					<footer className="border-t border-zinc-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl md:px-6">
						<form onSubmit={onSubmit} className="mx-auto w-full max-w-4xl">
							<div className="space-y-3 rounded-[2rem] border border-zinc-200/80 bg-white p-3 shadow-[0_18px_70px_rgba(0,0,0,0.08)]">
								{selectedFiles.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{selectedFiles.map((file, index) => (
											<div
												key={`${file.name}-${file.size}`}
												className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
											>
												<div className="flex items-center gap-2">
													{fileIcon(file.name)}
													<span className="max-w-40 truncate">{file.name}</span>
													<Badge variant="outline" className="rounded-full px-2 py-0 text-[11px]">
														{fileKind(file.name)}
													</Badge>
													<span className="text-xs text-zinc-500">{prettySize(file.size)}</span>
												</div>
												<button
													type="button"
													aria-label={`Remove ${file.name}`}
													className="rounded-full p-1 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900"
													onClick={() => setSelectedFiles((current) => current.filter((_, i) => i !== index))}
												>
													<Trash2 className="size-3.5" />
												</button>
											</div>
										))}
									</div>
								)}

								<div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50/80 p-3">
									<Textarea
										ref={textareaRef}
										value={query}
										onChange={(event) => setQuery(event.target.value)}
										onKeyDown={onKeyDown}
										placeholder="Ask about PDFs, images, audio, or a mixed set of files..."
										className="min-h-[60px] border-0 bg-transparent px-1 py-1 text-[15px] leading-7 shadow-none focus-visible:ring-0"
									/>
								</div>

								<div className="flex items-center justify-between gap-3">
									<div className="flex items-center gap-2">
										<input
											ref={fileInputRef}
											type="file"
											multiple
											className="hidden"
											onChange={(event) => updateFiles(Array.from(event.target.files ?? []))}
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="rounded-full"
											onClick={() => fileInputRef.current?.click()}
										>
											<Upload className="mr-2 size-4" />
											Upload
										</Button>
										<p className="hidden text-xs text-zinc-500 md:block">
											Drop files here or use Ctrl/Cmd + Enter to send
										</p>
									</div>

									<Button
										type="submit"
										disabled={isBusy || !query.trim()}
										className="rounded-full px-5"
									>
										{isBusy && <LoaderCircle className="mr-2 size-4 animate-spin" />}
										Send
										<SendHorizontal className="ml-2 size-4" />
									</Button>
								</div>
							</div>
						</form>
					</footer>
				</main>
			</div>
		</div>
	);
}
