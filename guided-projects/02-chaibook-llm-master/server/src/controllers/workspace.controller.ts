import type { Request, Response } from "express";
import {
    deleteWorkspaceForUser,
    getWorkspaceByIdForUser,
    updateWorkspaceForUser,
} from "../services/workspace.service.js";
import {
    createWorkspaceRecord,
    findWorkspacesByUserId,
} from "../repositories/workspace.repository.js";
import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    workspaceIdParamSchema,
} from "../validators/workspace.validator.js";

export async function listWorkspaces(req: Request, res: Response) {
    const workspaces = await findWorkspacesByUserId(req.session.user.id);
    res.json(workspaces);
}

export async function getWorkspace(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const workspace = await getWorkspaceByIdForUser(
        workspaceId,
        req.session.user.id,
    );
    res.json(workspace);
}

export async function createWorkspace(req: Request, res: Response) {
    const input = createWorkspaceSchema.parse(req.body);
    const workspace = await createWorkspaceRecord(
        req.session.user.id,
        input,
    );
    res.status(201).json(workspace);
}

export async function updateWorkspace(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = updateWorkspaceSchema.parse(req.body);
    const workspace = await updateWorkspaceForUser(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.json(workspace);
}

export async function deleteWorkspace(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    await deleteWorkspaceForUser(workspaceId, req.session.user.id);
    res.status(204).send();
}
