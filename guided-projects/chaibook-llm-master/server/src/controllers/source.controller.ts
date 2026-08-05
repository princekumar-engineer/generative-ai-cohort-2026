import type { Request, Response } from "express";
import {
    createTextOrMarkdownSource,
    bulkDeleteSourcesForWorkspace,
    deleteSourceForWorkspace,
    getSourceChunksForWorkspace,
    getSourceForWorkspace,
    importWebSearchSource,
    importWebsiteSource,
    importYoutubeSource,
    listSourcesForWorkspace,
    reprocessSourceForWorkspace,
    reprocessSourcesForWorkspace,
    uploadPdfSource,
} from "../services/source.service.js";
import { ValidationError } from "../types/app-error.js";
import {
    bulkDeleteSourcesSchema,
    createSourceSchema,
    importWebSearchSchema,
    importWebsiteSchema,
    importYoutubeSchema,
    listSourcesQuerySchema,
    reprocessSourcesSchema,
    sourceIdParamSchema,
    workspaceIdParamSchema,
} from "../validators/source.validator.js";

export async function listSources(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const filters = listSourcesQuerySchema.parse(req.query);
    const sources = await listSourcesForWorkspace(
        workspaceId,
        req.session.user.id,
        filters,
    );
    res.json(sources);
}

export async function getSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = sourceIdParamSchema.parse(req.params);
    const source = await getSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.json(source);
}

export async function getSourceChunks(req: Request, res: Response) {
    const { workspaceId, sourceId } = sourceIdParamSchema.parse(req.params);
    const result = await getSourceChunksForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.json(result);
}

export async function createSource(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = createSourceSchema.parse(req.body);
    const source = await createTextOrMarkdownSource(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.status(201).json(source);
}

export async function uploadPdf(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);

    if (!req.file) {
        throw new ValidationError("PDF file is required");
    }

    const title =
        typeof req.body.title === "string" ? req.body.title : undefined;

    const source = await uploadPdfSource(
        workspaceId,
        req.session.user.id,
        req.file,
        title,
    );

    res.status(201).json(source);
}

export async function importWebsite(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = importWebsiteSchema.parse(req.body);
    const source = await importWebsiteSource(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.status(201).json(source);
}

export async function importYoutube(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = importYoutubeSchema.parse(req.body);
    const source = await importYoutubeSource(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.status(201).json(source);
}

export async function deleteSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = sourceIdParamSchema.parse(req.params);
    await deleteSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.status(204).send();
}

export async function bulkDeleteSources(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = bulkDeleteSourcesSchema.parse(req.body);
    await bulkDeleteSourcesForWorkspace(
        workspaceId,
        req.session.user.id,
        input.sourceIds,
    );
    res.status(204).send();
}

export async function reprocessSources(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = reprocessSourcesSchema.parse(req.body ?? {});
    const result = await reprocessSourcesForWorkspace(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.json(result);
}

export async function reprocessSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = sourceIdParamSchema.parse(req.params);
    await reprocessSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.status(202).json({ reprocessed: true });
}

export async function importWebSearch(req: Request, res: Response) {
    const { workspaceId } = workspaceIdParamSchema.parse(req.params);
    const input = importWebSearchSchema.parse(req.body);
    const source = await importWebSearchSource(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.status(201).json(source);
}
