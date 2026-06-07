"use client";

import { Activity, WandSparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
	traces: string[];
};

export function ReasoningPanel({ traces }: Props) {
	return (
		<Card className="bg-white/85">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<WandSparkles className="size-4" />
					Reasoning trace
				</CardTitle>
				<CardDescription>{traces.length} events captured from the current session</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-72 pr-3">
					<div className="space-y-2 text-xs leading-5">
						{traces.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
								<Activity className="mb-2 size-4" />
								Waiting for assistant reasoning events.
							</div>
						) : (
							traces.map((trace, index) => (
								<p key={`${trace}-${index}`} className="rounded-2xl border border-zinc-200 bg-white p-3 text-zinc-700">
									{trace}
								</p>
							))
						)}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
