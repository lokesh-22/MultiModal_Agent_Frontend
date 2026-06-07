import { create } from "zustand";

import { ChatMessage, ChatSession, UploadFileMetadata } from "@/types/chat";

type ChatStoreState = {
	sessions: ChatSession[];
	activeSessionId: string | null;
	uploadedFiles: UploadFileMetadata[];
	isThinking: boolean;
	isOcrRunning: boolean;
	isAudioRunning: boolean;
	isToolRunning: boolean;
	createSession: () => string;
	setActiveSession: (sessionId: string) => void;
	addMessage: (message: ChatMessage) => void;
	updateLastAssistantMessage: (updater: (message: ChatMessage) => ChatMessage) => void;
	setUploadedFiles: (files: UploadFileMetadata[]) => void;
	setThinking: (value: boolean) => void;
	setOcrRunning: (value: boolean) => void;
	setAudioRunning: (value: boolean) => void;
	setToolRunning: (value: boolean) => void;
};

function createEmptySession(): ChatSession {
	return {
		id: crypto.randomUUID(),
		title: "New Chat",
		createdAt: Date.now(),
		messages: [],
	};
}

function createSeedSessions(): ChatSession[] {
	return [
		{
			id: "seed-session-pdf",
			title: "Summarize uploaded PDF",
			createdAt: Date.UTC(2026, 5, 7, 9, 20, 0),
			messages: [
				{ id: "seed-session-pdf-user", role: "user", content: "Summarize this PDF in 5 bullets.", timestamp: Date.UTC(2026, 5, 7, 9, 19, 0) },
				{ id: "seed-session-pdf-assistant", role: "assistant", content: "Here is a concise summary of the document...", timestamp: Date.UTC(2026, 5, 7, 9, 20, 0), reasoningTrace: ["Detected PDF summary intent"], toolsUsed: ["pdf_extractor", "summarizer"], executionPlan: ["pdf_extractor", "summarizer"] },
			],
		},
		{
			id: "seed-session-audio",
			title: "Audio transcription review",
			createdAt: Date.UTC(2026, 5, 7, 8, 0, 0),
			messages: [
				{ id: "seed-session-audio-user", role: "user", content: "Transcribe this audio and highlight action items.", timestamp: Date.UTC(2026, 5, 7, 7, 58, 0) },
				{ id: "seed-session-audio-assistant", role: "assistant", content: "Transcription complete. The main action items are...", timestamp: Date.UTC(2026, 5, 7, 8, 0, 0), reasoningTrace: ["Audio detected", "Transcription pipeline started"], toolsUsed: ["audio_tool"], executionPlan: ["audio_tool"] },
			],
		},
	];
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
	sessions: createSeedSessions(),
	activeSessionId: null,
	uploadedFiles: [],
	isThinking: false,
	isOcrRunning: false,
	isAudioRunning: false,
	isToolRunning: false,
	createSession: () => {
		const session = createEmptySession();
		set((state) => ({
			sessions: [session, ...state.sessions],
			activeSessionId: session.id,
		}));
		return session.id;
	},
	setActiveSession: (sessionId) => {
		set({ activeSessionId: sessionId });
	},
	addMessage: (message) => {
		let activeSessionId = get().activeSessionId;
		if (!activeSessionId) {
			activeSessionId = get().createSession();
		}

		set((state) => ({
			sessions: state.sessions.map((session) => {
				if (session.id !== activeSessionId) {
					return session;
				}
				const updatedMessages = [...session.messages, message];
				const nextTitle =
					session.title === "New Chat" && updatedMessages.length
						? updatedMessages[0].content.slice(0, 40) || "New Chat"
						: session.title;
				return {
					...session,
					messages: updatedMessages,
					title: nextTitle,
				};
			}),
		}));
	},
	updateLastAssistantMessage: (updater) => {
		const activeSessionId = get().activeSessionId;
		if (!activeSessionId) {
			return;
		}

		set((state) => ({
			sessions: state.sessions.map((session) => {
				if (session.id !== activeSessionId) {
					return session;
				}

				const nextMessages = [...session.messages];
				for (let index = nextMessages.length - 1; index >= 0; index -= 1) {
					if (nextMessages[index].role === "assistant") {
						nextMessages[index] = updater(nextMessages[index]);
						break;
					}
				}

				return {
					...session,
					messages: nextMessages,
				};
			}),
		}));
	},
	setUploadedFiles: (files) => {
		set({ uploadedFiles: files });
	},
	setThinking: (value) => set({ isThinking: value }),
	setOcrRunning: (value) => set({ isOcrRunning: value }),
	setAudioRunning: (value) => set({ isAudioRunning: value }),
	setToolRunning: (value) => set({ isToolRunning: value }),
}));
