"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";


/**
 * Server action that creates a new conversation titled "New Chat".
 *
 * @returns The ID of the newly created conversation.
 */
export async function startNewChat(){
    const user = await requireUser();

    const conversation = await prisma.conversation.create({
        data:{
            userId:user.id,
            title:"New Chat"
        }
    });

    return conversation.id;
}