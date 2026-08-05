/**
 * Firecrawl integration for scraping website content into markdown sources.
 *
 * Requires `FIRECRAWL_API_KEY` in the environment.
 */

import Firecrawl from "@mendable/firecrawl-js";
import { ValidationError } from "../types/app-error.js";

/**
 * Scrapes a public URL and returns clean markdown suitable for RAG indexing.
 *
 * @param url - Page URL to scrape (must be reachable by Firecrawl)
 * @returns Markdown content, optional page title, and canonical source URL
 * @throws {ValidationError} When Firecrawl is not configured or extraction fails
 */
export async function scrapeWebsite(url: string) {
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey) {
        throw new ValidationError("Firecrawl is not configured on the server");
    }

    const client = new Firecrawl({ apiKey });
    const result = await client.scrape(url, {
        formats: ["markdown"],
    });

    const markdown = result.markdown?.trim();

    if (!markdown) {
        throw new ValidationError("Could not extract content from this URL");
    }

    return {
        markdown,
        title: result.metadata?.title,
        sourceUrl: result.metadata?.sourceURL ?? url,
    };
}
