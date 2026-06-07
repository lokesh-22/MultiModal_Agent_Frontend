import {
	ChatResponse,
	StreamEnvelope,
	StreamEvent,
	UploadResponse,
} from "@/types/chat";

const API_ROOT =
	process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
	"http://localhost:8000/api/v1";

function makeChatFormData(query: string, files: File[]): FormData {
	const formData = new FormData();
	formData.append("query", query);
	for (const file of files) {
		formData.append("files", file);
	}
	return formData;
}

export async function uploadFiles(query: string, files: File[]): Promise<UploadResponse> {
	const response = await fetch(`${API_ROOT}/upload`, {
		method: "POST",
		body: makeChatFormData(query, files),
	});

	if (!response.ok) {
		throw new Error("Upload failed");
	}

	return response.json() as Promise<UploadResponse>;
}

export async function sendChat(query: string, files: File[]): Promise<ChatResponse> {
	const response = await fetch(`${API_ROOT}/chat`, {
		method: "POST",
		body: makeChatFormData(query, files),
	});

	if (!response.ok) {
		throw new Error("Chat request failed");
	}

	return response.json() as Promise<ChatResponse>;
}

export async function* streamChat(
	query: string,
	files: File[]
): AsyncGenerator<StreamEvent, void, unknown> {
	const response = await fetch(`${API_ROOT}/chat/stream`, {
		method: "POST",
		body: makeChatFormData(query, files),
		headers: {
			Accept: "text/event-stream",
		},
	});

	if (!response.ok || !response.body) {
		throw new Error("Streaming request failed");
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder("utf-8");
	let buffer = "";

	while (true) {
		const { value, done } = await reader.read();
		if (done) {
			break;
		}

		buffer += decoder.decode(value, { stream: true });
		let boundaryIndex = buffer.indexOf("\n\n");

		while (boundaryIndex !== -1) {
			const rawEvent = buffer.slice(0, boundaryIndex);
			buffer = buffer.slice(boundaryIndex + 2);
			const event = parseSseEvent(rawEvent);
			if (event) yield event;
			boundaryIndex = buffer.indexOf("\n\n");
		}
	}

	const finalChunk = decoder.decode();
	if (finalChunk) {
		buffer += finalChunk;
	}
	const trailingEvent = parseSseEvent(buffer);
	if (trailingEvent) {
		yield trailingEvent;
	}
}

function parseSseEvent(rawEvent: string): StreamEvent | null {
	const lines = rawEvent.split(/\r?\n/);
	let eventName = "";
	const dataLines: string[] = [];

	for (const line of lines) {
		if (line.startsWith("event:")) {
			eventName = line.slice(6).trim();
		}
		if (line.startsWith("data:")) {
			dataLines.push(line.slice(5).replace(/^\s/, ""));
		}
	}

	const data = dataLines.join("\n").trim();

	if (!eventName || !data) {
		return null;
	}

	const parsed = JSON.parse(data) as StreamEnvelope;

	return {
		event: (parsed.event_type ?? eventName) as StreamEvent["event"],
		data: (parsed.payload ?? parsed) as Record<string, unknown>,
	};
}
