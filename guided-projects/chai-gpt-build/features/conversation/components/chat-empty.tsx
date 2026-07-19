import { MessageSquareIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/** Empty-state placeholder shown before the first message is sent. */
export function ChatEmpty() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageSquareIcon />
          </EmptyMedia>
          <EmptyTitle className="text-2xl tracking-tight">
            How can I help you today?
          </EmptyTitle>
          <EmptyDescription>
            Ask anything — replies stream in real time.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
