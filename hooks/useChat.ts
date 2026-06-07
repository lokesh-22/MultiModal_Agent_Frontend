"use client";

import { useMutation } from "@tanstack/react-query";

import { sendChat } from "@/services/api";
import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/types/chat";

function assistantSeedMessage(): ChatMessage {
	return {
		id: crypto.randomUUID(),
		role: "assistant",
		content: "",
		timestamp: Date.now(),
		reasoningTrace: [],
		toolsUsed: [],
		executionPlan: [],
	};
}

export function useChat() {
	const {
		addMessage,
		setThinking,
		setToolRunning,
		updateLastAssistantMessage,
	} = useChatStore();

	const mutation = useMutation({
		mutationFn: async ({ query, files }: { query: string; files: File[] }) => {
			addMessage({
				id: crypto.randomUUID(),
				role: "user",
				content: query,
				timestamp: Date.now(),
			});

			addMessage(assistantSeedMessage());
			setThinking(true);
			setToolRunning(true);

			return sendChat(query, files);
		},
		onSuccess: (response) => {
			updateLastAssistantMessage((message) => ({
				...message,
				content: response.followup_question ?? response.response,
				reasoningTrace: response.reasoning_trace,
				toolsUsed: response.tools_used,
				intent: response.needs_followup ? "FOLLOWUP" : response.intent,
				executionPlan: response.execution_plan,
			}));
		},
		onSettled: () => {
			setThinking(false);
			setToolRunning(false);
		},
	});

	return {
		send: mutation.mutate,
		isPending: mutation.isPending,
		error: mutation.error,
	};
}
