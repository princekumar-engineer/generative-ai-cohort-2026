import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "chaibook" });

export type SourceCreatedEvent = {
    name: "source/created";
    data: {
        sourceId: string;
        workspaceId: string;
    };
};

export type InngestEvents = SourceCreatedEvent;
