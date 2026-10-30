// Runs in x.com's own page context (the MAIN world, at document_start) so it can see the
// responses of X's API calls as the user browses. It only extracts public account stats:
// screen name, follower count and whether the user blocks or mutes that account. They are posted to
// the XBlock content script (xapi.js); nothing else is read or sent anywhere.
(() => {
    const SOURCE = 'xblock-xdata';
    const MAX_DEPTH = 60;

    const isXApi = url => typeof url === 'string' && (url.includes('/i/api/') || url.includes('api.x.com'));

    function collectAccounts(node, found, depth = 0) {
        if (!node || typeof node !== 'object' || depth > MAX_DEPTH) return;
        if (Array.isArray(node)) {
            node.forEach(item => collectAccounts(item, found, depth + 1));
            return;
        }

        const legacy = node.legacy;
        if (legacy && typeof legacy.followers_count === 'number') {
            // GraphQL user: { core: { screen_name }, legacy: { followers_count }, relationship_perspectives }
            const username = node.core?.screen_name ?? legacy.screen_name;
            if (typeof username === 'string') {
                found.push({
                    username,
                    followersCount: legacy.followers_count,
                    blocking: node.relationship_perspectives?.blocking ?? legacy.blocking,
                    muting: node.relationship_perspectives?.muting ?? legacy.muting,
                });
            }
        } else if (typeof node.screen_name === 'string' && typeof node.followers_count === 'number') {
            // REST (v1.1) user, e.g. the response to blocks/create
            found.push({ username: node.screen_name, followersCount: node.followers_count, blocking: node.blocking, muting: node.muting });
        }

        for (const key in node) collectAccounts(node[key], found, depth + 1);
    }

    function inspect(json) {
        const found = [];
        collectAccounts(json, found);
        if (found.length > 0) window.postMessage({ source: SOURCE, accounts: found }, window.location.origin);
    }

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);
        try {
            const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
            if (isXApi(url)) response.clone().json().then(inspect).catch(() => {});
        } catch (error) {
            // Never break X's own requests
        }
        return response;
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this.__xblockUrl = String(url);
        return originalOpen.call(this, method, url, ...rest);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args) {
        if (isXApi(this.__xblockUrl)) {
            this.addEventListener('load', () => {
                try {
                    if (this.responseType === 'json') inspect(this.response);
                    else if (this.responseType === '' || this.responseType === 'text') inspect(JSON.parse(this.responseText));
                } catch (error) {
                    // Not JSON, ignore
                }
            });
        }
        return originalSend.apply(this, args);
    };
})();
