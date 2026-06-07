"use client";

import { useMutation } from "@tanstack/react-query";

import { streamChat } from "@/services/api";
import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/types/chat";

function makeAssistantMessage(): ChatMessage {
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

function readEventPayload(event: { data: Record<string, unknown> }) {
	const maybePayload = event.data.payload;
	return (maybePayload && typeof maybePayload === "object" ? (maybePayload as Record<string, unknown>) : event.data);
}

export function useStreamingChat() {
	const {
		addMessage,
		updateLastAssistantMessage,
		setThinking,
		setToolRunning,
		setOcrRunning,
		setAudioRunning,
	} = useChatStore();

	const mutation = useMutation({
		mutationFn: async ({ query, files }: { query: string; files: File[] }) => {
			addMessage({
				id: crypto.randomUUID(),
				role: "user",
				content: query,
				timestamp: Date.now(),
			});
			addMessage(makeAssistantMessage());
			setThinking(true);

			for await (const event of streamChat(query, files)) {
				const payload = readEventPayload(event);

				if (event.event === "reasoning_trace" || event.event === "reasoning_update") {
					const message =
						String(payload.message ?? payload.content ?? payload.text ?? "");
					if (message) {
						updateLastAssistantMessage((assistantMessage) => ({
							...assistantMessage,
							reasoningTrace: [...(assistantMessage.reasoningTrace ?? []), message],
						}));
					}

					const lowered = message.toLowerCase();
					if (lowered.includes("ocr")) setOcrRunning(true);
					if (lowered.includes("audio")) setAudioRunning(true);
				}

				if (event.event === "agent_started") {
					setThinking(true);
				}

				if (event.event === "tools") {
					const toolsUsed = Array.isArray(payload.tools_used)
						? (payload.tools_used as string[])
						: Array.isArray(payload.toolsUsed)
							? (payload.toolsUsed as string[])
							: [];
					setToolRunning(toolsUsed.length > 0);
					updateLastAssistantMessage((assistantMessage) => ({
						...assistantMessage,
						toolsUsed,
					}));
				}

				if (event.event === "token" || event.event === "final_tokens") {
					const delta = String(
						payload.text ?? payload.delta ?? payload.token ?? "",
					);
					if (delta) {
						updateLastAssistantMessage((assistantMessage) => ({
							...assistantMessage,
							content: `${assistantMessage.content}${delta}`,
						}));
					}
				}

				if (event.event === "final_response") {
					const content = String(
						payload.content ?? payload.response ?? payload.followup_question ?? "",
					);
					if (content) {
						updateLastAssistantMessage((assistantMessage) => ({
							...assistantMessage,
							content,
						}));
					}

					const toolsUsed = Array.isArray(payload.tools_used)
						? (payload.tools_used as string[])
						: Array.isArray(payload.tool_results_summary?.tools_used)
							? (payload.tool_results_summary.tools_used as string[])
						: [];
					if (toolsUsed.length > 0) {
						updateLastAssistantMessage((assistantMessage) => ({
							...assistantMessage,
							toolsUsed,
						}));
					}

					const needsFollowup = Boolean(payload.needs_followup);
					if (needsFollowup) {
						updateLastAssistantMessage((assistantMessage) => ({
							...assistantMessage,
							intent: assistantMessage.intent ?? "FOLLOWUP",
						}));
					}
				}

				if (event.event === "agent_completed" || event.event === "done") {
					setThinking(false);
					setToolRunning(false);
					setOcrRunning(false);
					setAudioRunning(false);
				}
			}
		},
		onError: () => {
			setThinking(false);
			setToolRunning(false);
			setOcrRunning(false);
			setAudioRunning(false);
		},
	});

	return {
		stream: mutation.mutate,
		isPending: mutation.isPending,
		error: mutation.error,
	};
}
