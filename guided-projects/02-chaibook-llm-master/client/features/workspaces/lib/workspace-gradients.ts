const GRADIENTS = [
    "from-sky-400/90 via-blue-500/80 to-indigo-600/90",
    "from-emerald-400/90 via-teal-500/80 to-cyan-600/90",
    "from-amber-300/90 via-orange-400/80 to-rose-500/90",
    "from-violet-400/90 via-purple-500/80 to-fuchsia-600/90",
    "from-rose-300/90 via-pink-400/80 to-red-500/90",
    "from-lime-300/90 via-green-400/80 to-emerald-600/90",
    "from-cyan-300/90 via-sky-400/80 to-blue-600/90",
    "from-fuchsia-300/90 via-violet-400/80 to-purple-600/90",
] as const;

function hashString(value: string) {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash);
}

export function getWorkspaceGradient(workspaceId: string) {
    return GRADIENTS[hashString(workspaceId) % GRADIENTS.length];
}
