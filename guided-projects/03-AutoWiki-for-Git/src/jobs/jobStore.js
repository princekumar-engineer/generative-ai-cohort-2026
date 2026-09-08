const jobs = new Map();

export function createJob(repo, extra = {}) {
  const jobId = crypto.randomUUID();
  const job = { jobId, repo, status: "queued", ...extra };
  jobs.set(jobId, job);
  return job;
}

export function updateJob(jobId, data) {
  const job = jobs.get(jobId);
  if (!job) return;
  Object.assign(job, data);
}

export function getJob(jobId) {
  return jobs.get(jobId);
}
