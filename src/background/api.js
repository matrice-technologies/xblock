// Client for the XBlock server (see server/). The URL is injected at build time from XBLOCK_API_URL.
export const API_BASE_URL = `${__XBLOCK_API_URL__}/api`;

let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

export const isAuthenticated = () => !!authToken;

const request = async (method, path, body) => {
    if (!authToken) throw new Error("User not authenticated");

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: {
                "Authorization": `Bearer ${authToken}`,
                ...(body !== undefined && { "Content-Type": "application/json" }),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch (error) {
        throw new Error(`Could not reach the XBlock server at ${API_BASE_URL}. Is it running?`);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
};

// Creates the user and their own banlist on first sign-in, refreshes lastConnection otherwise
export const startSession = async () => {
    const { user } = await request("POST", "/session");
    return user;
};

export const loadUserData = async () => {
    const { user } = await request("GET", "/me");
    return user;
};

export const udpateUser = async (userData) => {
    await request("PATCH", "/me", userData);
};

export const updateBlockList = async (blockListId, blockListData) => {
    await request("PATCH", `/banlists/${encodeURIComponent(blockListId)}`, blockListData);
};

export const loadUserBanlists = async () => {
    const { banlists } = await request("GET", "/banlists");
    return banlists;
};

export const addUsersToWhiteList = async (userIds) => {
    await request("POST", "/me/whitelist", { userIds });
};

export const removeUsersFromWhiteList = async (userIds) => {
    await request("DELETE", "/me/whitelist", { userIds });
};

export const addUsersToBanlist = async (banlistId, bannedUserIds) => {
    await request("POST", `/banlists/${encodeURIComponent(banlistId)}/banned-users`, { userIds: bannedUserIds });
};

export const removeUsersFromBanlist = async (banlistId, bannedUserIds) => {
    await request("DELETE", `/banlists/${encodeURIComponent(banlistId)}/banned-users`, { userIds: bannedUserIds });
};

/**
 * Subscribes to a banlist (or updates the mode of an existing subscription)
 * @returns {Object} The subscribed banlist
 */
export const subscribeToBanlist = async (banlistId, mode) => {
    const { blockList } = await request("PUT", `/subscriptions/${encodeURIComponent(banlistId)}`, { mode });
    return blockList;
};

export const unsubscribeFromBanlist = async (banlistId) => {
    await request("DELETE", `/subscriptions/${encodeURIComponent(banlistId)}`);
};

/**
 * A list's accounts for browsing, with context, follower counts and this user's block status
 * @returns {Array<{username, name, note, followersCount, status, whitelisted}>}
 */
export const loadBanlistAccounts = async (banlistId) => {
    const { accounts } = await request("GET", `/banlists/${encodeURIComponent(banlistId)}/accounts`);
    return accounts;
};

/**
 * Reports account stats seen in X's own responses
 * @param {Array<{username: string, followersCount?: number, blocking?: boolean}>} accounts
 */
export const reportObservedAccounts = async (accounts) => {
    await request("POST", "/accounts/observed", { accounts });
};

/**
 * Records accounts the user just blocked on X (status "blocked") or couldn't ("unavailable")
 * @param {Array<{username: string, followersCount?: number, status?: string}>} blocks
 */
export const recordBlocks = async (blocks) => {
    await request("POST", "/blocks", { blocks });
};

/**
 * Batch blocking state: per-list progress and the next accounts to block
 * @param {number} limit - How many queued accounts to return (0 for progress only)
 * @returns {{lists: Array, queue: Array, remaining: number}}
 */
export const loadBatchBlock = async (limit) => {
    return request("GET", `/batch-block?limit=${limit}`);
};
