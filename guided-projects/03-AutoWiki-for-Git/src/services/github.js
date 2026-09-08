import { Octokit } from "@octokit/rest";

export function parseRepo(input) {
  const clean = input
    .replace("https://github.com/", "")
    .replace("http://github.com/", "")
    .replace(/\.git$/, "");

  const [owner, repo] = clean.split("/");
  return { owner, repo, repoKey: `${owner}/${repo}` };
}

export async function fetchRepoFiles(token, owner, repo) {
  console.log("GitHub fetch:", `${owner}/${repo}`);

  const octokit = new Octokit({ auth: token });

  const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo }).catch((err) => {
    if (err.status === 404) {
      throw new Error(
        `GitHub could not find ${owner}/${repo}. Fine-grained tokens (github_pat_) must include this repo.`,
      );
    }
    throw err;
  });
  const { data: tree } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: repoInfo.default_branch,
    recursive: "true",
  });

  const files = [];

  for (const item of tree.tree) {
    if (item.type !== "blob") continue;
    if (item.path.includes("node_modules")) continue;
    if (!item.path.match(/\.(js|ts|tsx|jsx|py|md|json)$/)) continue;

    const { data: blob } = await octokit.rest.git.getBlob({
      owner,
      repo,
      file_sha: item.sha,
    });

    files.push({
      path: item.path,
      content: Buffer.from(blob.content, "base64").toString("utf8"),
    });

    if (files.length >= 200) break;
  }

  return files;
}
