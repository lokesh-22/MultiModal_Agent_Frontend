export type ToolResult = Record<string, unknown>;

export type UploadFileMetadata = {
	file_name: string;
	file_path: string;
	file_type: string;
	size_bytes: number;
	content_type?: string | null;
};

export type UploadResponse = {
	files: UploadFileMetadata[];
	query: string;
};

export type ChatResponse = {
	response: string;
	reasoning_trace: string[];
	tools_used: string[];
	intent?: string | null;
	execution_plan: string[];
	extracted_contents: Record<string, unknown>;
	needs_followup?: boolean;
	followup_question?: string | null;
};

export type StreamEventType =
	| "session"
	| "agent_started"
	| "agent_completed"
	| "reasoning"
	| "reasoning_trace"
	| "reasoning_update"
	| "tools"
	| "token"
	| "final_tokens"
	| "final_response"
	| "done";

export type StreamEvent = {
	event: StreamEventType;
	data: Record<string, unknown>;
};

export type StreamEnvelope = {
	version?: string;
	event_id?: string;
	seq?: number;
	timestamp?: string;
	session_id?: string;
	request_id?: string;
	event_type?: StreamEventType | string;
	payload?: Record<string, unknown>;
	trace_id?: string | null;
	parent_event_id?: string | null;
};

export type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: number;
	reasoningTrace?: string[];
	toolsUsed?: string[];
	intent?: string | null;
	executionPlan?: string[];
};

export type ChatSession = {
	id: string;
	title: string;
	createdAt: number;
	messages: ChatMessage[];
};
