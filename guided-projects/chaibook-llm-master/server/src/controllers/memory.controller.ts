import type { Request, Response } from "express";
import {
    createMemoryForUser,
    updateMemoryForUser,
} from "../services/memory.service.js";
import { deleteUserMemory, listUserMemories } from "../lib/mem0.js";
import {
    createMemorySchema,
    memoryIdParamSchema,
    updateMemorySchema,
} from "../validators/memory.validator.js";

export async function listMemories(req: Request, res: Response) {
    const memories = await listUserMemories(req.session.user.id);
    res.json(memories);
}

export async function createMemory(req: Request, res: Response) {
    const input = createMemorySchema.parse(req.body);
    const memory = await createMemoryForUser(req.session.user.id, input);
    res.status(201).json(memory);
}

export async function updateMemory(req: Request, res: Response) {
    const { memoryId } = memoryIdParamSchema.parse(req.params);
    const input = updateMemorySchema.parse(req.body);
    const memory = await updateMemoryForUser(
        req.session.user.id,
        memoryId,
        input,
    );
    res.json(memory);
}

export async function deleteMemory(req: Request, res: Response) {
    const { memoryId } = memoryIdParamSchema.parse(req.params);
    await deleteUserMemory(memoryId);
    res.status(204).send();
}
