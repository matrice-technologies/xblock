// --- Localisation ---
// Strings live in _locales/<lang>/messages.json; Chrome picks the browser's language.
// Static text is tagged in popup.html (data-i18n, data-i18n-placeholder, data-i18n-tooltip)
// and keeps its English copy as a fallback.

function i18n(key, ...substitutions) {
    return chrome.i18n.getMessage(key, substitutions.map(String)) || key;
}

const UI_LANGUAGE = chrome.i18n.getUILanguage();

function applyTranslations() {
    document.documentElement.lang = UI_LANGUAGE;
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = i18n(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.placeholder = i18n(el.dataset.i18nPlaceholder); });
    document.querySelectorAll("[data-i18n-tooltip]").forEach(el => { el.dataset.tooltip = i18n(el.dataset.i18nTooltip); });
}
applyTranslations();

document.querySelectorAll('.footer-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      // Switch tab content
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
      });
      document.getElementById(target).classList.add('active');

      // Update button state
      document.querySelectorAll('.footer-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

// Home stat tiles jump to their tab
document.querySelectorAll('[data-goto]').forEach(tile => {
    tile.addEventListener('click', () => document.querySelector(`.footer-tab-btn[data-tab="${tile.dataset.goto}"]`)?.click());
});


let user = null;
let blockLists = null;

// --- DOM Elements ---
const blocklistsTable = document.getElementById("blocklistsTable");
const whitelistedUsersTable = document.getElementById("whitelistedUsersTable"); // Added for whitelist table
const blockedUsersTable = document.getElementById("blockedUsersTable"); // Added for whitelist table
const banlistStatus = document.getElementById("banlistStatus"); // Assuming this exists, though not used in provided code
const blockListCodeBadge = document.getElementById("blockListCodeInput");
const accountNameInput = document.getElementById("accountNameInput");
const settingsBtn = document.getElementById("openSettingsBtn");
const buyMeCoffeeBtn = document.getElementById("buyMeCoffeeBtn");
const blockAnimationChoices = document.getElementById("blockAnimationChoices");
const loginModal = document.getElementById("loginModal");

const blockedUsersNumberLabel = document.getElementById("blockedUsersNumberLabel");
const whitelistedUsersNumberLabel = document.getElementById("whitelistedUsersNumberLabel");
const subscribedBlockListNumberLabel = document.getElementById("subscribedBlockListNumberLabel");


const subscribeCodeInput = document.getElementById("subscribeCodeInput");
const addSubscribeBtn = document.getElementById("addSubscribeBtn");
const addSubscribeIcon = document.getElementById("addSubscribeIcon");
const addSpinner = document.getElementById("addSpinner");

const togglePersonalIdShowBtn = document.getElementById('togglePersonalIdShowButton');
const personalAuthTokenInput = document.getElementById('personalAuthTokenInput');
const eyeIcon = document.getElementById('eyeIcon');

document.getElementById("xblock-version").textContent = chrome.runtime.getManifest().version;
document.getElementById("xblock-year").textContent = new Date().getFullYear();


// --- Event Listeners ---

togglePersonalIdShowBtn.addEventListener('click', () => {
    const isPassword = personalAuthTokenInput.type === 'password';
    personalAuthTokenInput.type = isPassword ? 'text' : 'password';
    eyeIcon.classList.toggle('fa-eye');
    eyeIcon.classList.toggle('fa-eye-slash');
});

settingsBtn.addEventListener("click", openSettings);

// The share code in the header copies itself
blockListCodeBadge.addEventListener("click", async () => {
    const code = blockListCodeBadge.dataset.code;
    if (!code) return;
    try {
        await navigator.clipboard.writeText(code);
    } catch (error) {
        console.error("Could not copy the share code:", error);
        return;
    }
    blockListCodeBadge.textContent = i18n("copied");
    blockListCodeBadge.classList.add("copied");
    setTimeout(() => {
        blockListCodeBadge.textContent = code;
        blockListCodeBadge.classList.remove("copied");
    }, 1200);
});
buyMeCoffeeBtn.addEventListener("click", openBuyMeCoffeePage);

document.querySelectorAll(".openXBlockListPageBtn").forEach(button => {
    button.addEventListener("click", openXProfilePage);
});


document.querySelectorAll(".openLoginModalBtn").forEach(button => {
    button.addEventListener("click", openLoginModal);
});

document.querySelectorAll(".closeLoginModalBtn").forEach(button => {
    button.addEventListener("click", closeLoginModal);
});

document.querySelectorAll(".loginBtn").forEach(button => {
    button.addEventListener("click", loginToNewAccount);
});


// --- Search Logic for Whitelisted Users ---
const whitelistSearchInput = document.getElementById("whitelistSearchInput");
whitelistSearchInput?.addEventListener("input", () => {
    const searchTerm = whitelistSearchInput.value.toLowerCase();
    const rows = whitelistedUsersTable?.querySelectorAll("tbody tr");
    rows?.forEach(row => {
        const username = row.getAttribute("data-username")?.toLowerCase();
        if (username && username.includes(searchTerm)) {
            row.style.display = ""; // Show row
        } else {
            row.style.display = "none"; // Hide row
        }
    });
});

// --- Search Logic for Blocked Users ---
const blockedUsersSearchInput = document.getElementById("blockedUsersSearchInput");
blockedUsersSearchInput?.addEventListener("input", () => {
    const searchTerm = blockedUsersSearchInput.value.toLowerCase();
    const rows = blockedUsersTable?.querySelectorAll("tbody tr");
    rows?.forEach(row => {
        const username = row.getAttribute("data-username")?.toLowerCase();
        if (username && username.includes(searchTerm)) {
            row.style.display = ""; // Show row
        } else {
            row.style.display = "none"; // Hide row
        }
    });
});


let nameInputDebounceTimer;
accountNameInput.addEventListener('input', () => {
    clearTimeout(nameInputDebounceTimer);
    nameInputDebounceTimer = setTimeout(() => {
        const selectedValue = accountNameInput.value;
        const blockList = blockLists?.find(b => b.ownerId === user?.id); // Added safe navigation

        if (!blockList) {
            console.error("User's own blocklist not found for updating name.");
            return;
        }

        let data = {
            action: "blockListUpdate",
            id: blockList.id,
            data: {
                "name": selectedValue,
            }
        };
        chrome.runtime.sendMessage(data, (response) => {
            if (response && response.status === "success") {
                console.log("Account name updated successfully.");
                // Optionally update local state if needed, though init should refresh
            } else {
                console.error("Failed to update account name:", response?.message || 'Unknown error');
                // Maybe revert the input value or show an error
            }
        });
    }, 500); // Increased debounce time slightly
});

// New subscriptions block the list's accounts on X unless the user picks another mode
const DEFAULT_SUBSCRIPTION_MODE = "autoblock";

addSubscribeBtn.addEventListener("click", async () => {
    let code = subscribeCodeInput.value.trim();
    if (!code) return;
    code = code.replace(/^XBK-/i, "").toUpperCase(); // Codes are uppercase hex

    if (!code) {
        alert(i18n("invalidShareCode"));
        return;
    }

    // Show spinner and hide plus icon
    addSpinner.classList.remove("d-none");
    addSubscribeIcon.classList.add("d-none");
    addSubscribeBtn.disabled = true;

    chrome.runtime.sendMessage({ action: "subscribeToBanlist", banlistId: code, mode: DEFAULT_SUBSCRIPTION_MODE }, (response) => {
        // Hide spinner and show plus icon again
        addSpinner.classList.add("d-none");
        addSubscribeIcon.classList.remove("d-none");
        addSubscribeBtn.disabled = false;

        if (response && response.status === "success") {
            const newBlockList = response.blockList;
            // Add mode directly if not present (might be added by background)
            if (!newBlockList.hasOwnProperty('mode')) {
                newBlockList.mode = DEFAULT_SUBSCRIPTION_MODE;
            }

            // Ensure blockLists is an array
            if (!Array.isArray(blockLists)) {
                blockLists = [];
            }

            // Prevent duplicates and add
            if (!blockLists.some(b => b.id === newBlockList.id)) {
                blockLists.push(newBlockList);
                 // Also update the user's subscriptions locally for consistency
                if(user && !user.subscriptions) user.subscriptions = [];
                if(user && !user.subscriptions.some(sub => sub.blockListId === newBlockList.id)) {
                    user.subscriptions.push({ blockListId: newBlockList.id, mode: DEFAULT_SUBSCRIPTION_MODE });
                    localStorage.setItem('x_block_user', JSON.stringify(user)); // Update cache
                }
                localStorage.setItem('x_block_block_lists', JSON.stringify(blockLists)); // Update cache
                renderBanlists(blockLists); // Re-render subscribed lists
            } else {
                 // Re-subscribing resets the mode server-side, so mirror it locally
                 console.log("Already subscribed to this list.");
                 const existing = user?.subscriptions?.find(sub => sub.blockListId === newBlockList.id);
                 if (existing) {
                     existing.mode = DEFAULT_SUBSCRIPTION_MODE;
                     localStorage.setItem('x_block_user', JSON.stringify(user));
                 }
                 renderBanlists(blockLists);
            }
            loadBatchProgress(); // a new Block-mode list gets a progress bar

            subscribeCodeInput.value = ""; // Clear input
        } else {
            console.error("Failed to subscribe:", response?.message || 'Unknown error');
            alert(i18n("subscribeFailed", code, response?.message || i18n("unknownError")));
        }
    });
});


// Block animation: "off" is the user's enableAnimation (on the server); which animation plays
// ("explode" or "samurai") is a browser setting the content script reads from storage.sync
const BLOCK_ANIMATION_KEY = "xblock_block_animation";
let blockAnimationStyle = "explode";
chrome.storage.sync.get(BLOCK_ANIMATION_KEY, result => {
    blockAnimationStyle = result?.[BLOCK_ANIMATION_KEY] || "explode";
    if (user) updateAnimationSelect();
});

blockAnimationChoices.addEventListener("change", function (event) {
    const value = event.target.value;
    const isEnabled = value !== "off";
    updateAnimationLabel(isEnabled);
    if (isEnabled) {
        blockAnimationStyle = value;
        chrome.storage.sync.set({ [BLOCK_ANIMATION_KEY]: value });
    }
    if (user && user.enableAnimation === isEnabled) return;

    let data = {
        action: "userOptionUpdate",
        data: {
            "enableAnimation": isEnabled,
        }
    };

    // Send update to background script
    chrome.runtime.sendMessage(data, (response) => {
        if (response && response.status === "success") {
            console.log("Animation preference updated.");
             // Update local user state
            if (user) {
                 user.enableAnimation = isEnabled;
                 localStorage.setItem('x_block_user', JSON.stringify(user)); // Update cache
            }
            // Send update to active content script (if necessary)
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs.length > 0 && tabs[0].id) {
                     chrome.tabs.sendMessage(tabs[0].id, data).catch(error => {
                          // Catch error if content script isn't ready or on the wrong page
                          console.log("Could not send message to content script:", error.message);
                     });
                }
            });
        } else {
            console.error("Failed to update animation preference:", response?.message || 'Unknown error');
            updateAnimationSelect(); // back to the saved state
        }
    });
});

// Block or mute on X: a browser setting the content scripts read from storage.sync
const X_ACTION_KEY = "xblock_x_action";
const xActionChoices = document.getElementById("xActionChoices");
chrome.storage.sync.get(X_ACTION_KEY, result => {
    const value = result?.[X_ACTION_KEY] === "mute" ? "mute" : "block";
    xActionChoices.querySelector(`input[value="${value}"]`).checked = true;
});
xActionChoices.addEventListener("change", event => {
    chrome.storage.sync.set({ [X_ACTION_KEY]: event.target.value });
});

// --- Initialization ---
let user_auth_token = ""
async function init(retryCount = 0) {
    console.log(`Attempting to load initial data (Attempt ${retryCount + 1})`);

    // get from sync sync storage
    let token = await new Promise((resolve) => {
        chrome.storage.sync.get(["xblock_auth_token"], (result) => {
        resolve(result);
        });
    });
    user_auth_token = token.xblock_auth_token;

    // Try loading from cache first for faster UI painting
    const cachedUser = localStorage.getItem('x_block_user');
    const cachedblockLists = localStorage.getItem('x_block_block_lists');

    if (cachedUser && cachedblockLists) {
        console.log("Using cached data initially.");
        try {
             user = JSON.parse(cachedUser);
             blockLists = JSON.parse(cachedblockLists);
             updatePopupUI(); // Use cached data immediately
        } catch (e) {
             console.error("Error parsing cached data:", e);
             localStorage.removeItem('x_block_user'); // Clear bad cache
             localStorage.removeItem('x_block_block_lists');
        }
    }

    // Always fetch fresh data from background
    chrome.runtime.sendMessage({ action: "loadInitialData" }, (response) => {
        if (chrome.runtime.lastError) {
             console.error("Error sending message to background:", chrome.runtime.lastError.message);
             handleInitError(retryCount);
             return;
        }

        if (response && response.status === "success") {
             console.log("Successfully loaded initial data from background.");
             user = response.data.user;
             blockLists = response.data.banlists;

             // Update cache
             localStorage.setItem('x_block_user', JSON.stringify(user));
             localStorage.setItem('x_block_block_lists', JSON.stringify(blockLists));

             updatePopupUI(); // Update UI with fresh data
        } else {
             console.error("Error loading initial data from background:", response?.message || 'Unknown error');
             handleInitError(retryCount);
        }
    });
}

function handleInitError(retryCount) {
    if (retryCount < 3) { // Reduced retries
        const delay = Math.pow(2, retryCount) * 500; // Shorter delay
        console.log(`Retrying data load in ${delay}ms`);
        setTimeout(() => init(retryCount + 1), delay);
    } else {
        console.error("Max retry attempts reached. Failed to load initial data.");
        // Display an error message in the popup UI
        displayGlobalError(i18n("loadFailed"));
    }
}

function displayGlobalError(message) {
    // Example: Add a div at the top or bottom to show persistent errors
    let errorDiv = document.getElementById('globalErrorDiv');
    if (!errorDiv) {
         errorDiv = document.createElement('div');
         errorDiv.id = 'globalErrorDiv';
         errorDiv.className = 'alert alert-danger p-2 mt-2 small';
         errorDiv.setAttribute('role', 'alert');
         // Prepend to the main container
         document.body.insertBefore(errorDiv, document.body.firstChild);
    }
    errorDiv.textContent = message;
}


// --- UI Update Functions ---

function updatePopupUI() {
    if (!user || !blockLists) {
        console.error("User or blockLists data is missing, cannot update UI.");
        // Don't display global error here if init retries are still happening
        // displayGlobalError("Data unavailable. Cannot update UI.");
        return;
    }
     // Clear any global error messages if data loaded successfully
    const errorDiv = document.getElementById('globalErrorDiv');
    if (errorDiv) {
         errorDiv.remove();
    }

    const userOwnBlockList = blockLists.find(b => b.ownerId === user.id);

    blockedUsersNumberLabel.textContent = userOwnBlockList.bannedUsers?.length || 0;
    whitelistedUsersNumberLabel.textContent = user.whiteListedUsers?.length || 0; // Ensure it's a number
    subscribedBlockListNumberLabel.textContent = blockLists.length - 1 || 0; // Ensure it's a number


    accountNameInput.value = userOwnBlockList?.name || ''; // Use optional chaining
    personalAuthTokenInput.value = user_auth_token || '';
    blockListCodeBadge.innerText = userOwnBlockList ? `XBK-${userOwnBlockList.id}` : 'N/A'; // Handle if user has no list yet
    blockListCodeBadge.dataset.code = userOwnBlockList ? `XBK-${userOwnBlockList.id}` : '';
    updateCountChips();

    // Update Animation Switch and Label
    updateAnimationSelect();

    renderBanlists(blockLists);
    renderWhitelist(user.whiteListedUsers || []); // Render whitelist, ensure it's an array
    renderblockedUsersTable(userOwnBlockList.bannedUsers || [], userOwnBlockList.bannedUserFollowers || {});
}


function updateCountChips() {
    const ownList = blockLists?.find(b => b.ownerId === user?.id);
    document.getElementById("blockedUsersCountChip").textContent = (ownList?.bannedUsers?.length || 0).toLocaleString(UI_LANGUAGE);
    document.getElementById("whitelistedUsersCountChip").textContent = (user?.whiteListedUsers?.length || 0).toLocaleString(UI_LANGUAGE);
}

// Initial-letter avatar with a colour derived from the name; `mark` adds a small blocked/safe badge
function avatarHTML(name, mark = "") {
    let hue = 0;
    for (const char of name) hue = (hue * 31 + char.charCodeAt(0)) % 360;
    const initial = name.replace(/^[^a-z0-9]+/i, "")[0] || "?";
    const badge = mark ? `<span class="mark ${mark}"><i class="fa-solid ${mark === "safe" ? "fa-shield" : "fa-ban"}"></i></span>` : "";
    return `<span class="avatar" style="--h: ${hue}">${escapeHtml(initial)}${badge}</span>`;
}

function emptyRow(colspan, message, icon) {
    return `<tr><td colspan="${colspan}" class="empty"><i class="fa-solid ${icon}"></i>${message}</td></tr>`;
}

function updateAnimationSelect() {
    const value = user.enableAnimation ? blockAnimationStyle : "off";
    blockAnimationChoices.querySelector(`input[value="${value}"]`).checked = true;
    updateAnimationLabel(!!user.enableAnimation);
}

function updateAnimationLabel(isEnabled) {
    document.getElementById("blockAnimationLabel").innerText = isEnabled ? "😎" : i18n("animationOff");
}


async function loginToNewAccount() {
    const newAuthTokenInput = document.getElementById("newAuthTokenInput");
    const personalAuthToken = newAuthTokenInput.value.trim();
    if (!personalAuthToken) {
        alert(i18n("enterValidToken"));
        return;
    }

    // Show loading spinner
    const loginBtn = document.querySelector(".loginBtn");
    const closeLoginModalBtn = document.querySelector(".closeLoginModalBtn");
    closeLoginModalBtn.style.display = "none"; // Hide close button
    loginBtn.classList.add("loading");
    loginBtn.setAttribute("disabled", "true");
    loginBtn.textContent = i18n("loggingIn");
    // If no UID is found, generate a new unique UID and store it in sync storage
    chrome.storage.sync.set({ xblock_auth_token: personalAuthToken });

    chrome.runtime.sendMessage({ action: "signIn" }, async (response) => {
        if (response && response.status === "success") {
            await init();
            alert(i18n("loginSuccess"));
            loginModal.style.display = "none"; // Close the modal
            loginBtn.textContent = i18n("signIn");
            loginBtn.classList.remove("loading");
            loginBtn.removeAttribute("disabled");
            closeLoginModalBtn.style.display = "block"; // Show close button again
        } else {
            console.error("Failed to sign in:", response?.message || 'Unknown error');
            alert(i18n("loginFailed", response?.message || i18n("unknownError")));
            loginBtn.textContent = i18n("signIn");
            loginBtn.classList.remove("loading");
            loginBtn.removeAttribute("disabled");
            closeLoginModalBtn.style.display = "block";
        }
    });

}

// Render subscribed banlists
// Assumes your HTML table has a thead like:
// <thead class="small text-muted">
//   <tr>
//     <th>AutoBlock</th>
//     <th>Name</th>
//     <th>Code</th>
//     <th>Count</th>
//     <th>Unsub</th> {/* Added header for the new column */}
//   </tr>
// </thead>
function renderBanlists(allBlockLists) {
    const tbody = blocklistsTable?.querySelector("tbody"); // Use optional chaining
    if (!tbody) {
        console.error("Blocklists table body not found!");
        return;
    }
    tbody.innerHTML = ""; // Clear existing rows

    if (!user || !Array.isArray(allBlockLists)) {
        tbody.innerHTML = emptyRow(5, i18n("errorLoadingData"), "fa-triangle-exclamation");
        return;
    }

    // Prepare subscribed lists, excluding the user's own list
    const subscribedLists = allBlockLists
        .filter(banlist => banlist.ownerId !== user.id) // Exclude own list
        .map(banlist => {
            const subscription = user.subscriptions?.find(sub => sub.blockListId === banlist.id); // Safe navigation
            return {
                ...banlist, // Copy banlist properties
                mode: subscription ? subscription.mode : "hide" // Assign mode or default
            };
        });


    if (subscribedLists.length === 0) {
        tbody.innerHTML = emptyRow(5, i18n("noSubscribedLists"), "fa-list-check");
        return;
    }

    subscribedLists.forEach(banlist => {
        const row = document.createElement("tr");
        row.setAttribute('data-banlist-id', banlist.id); // Add id for reference

        // *** Added new TD for the unsubscribe button ***
        const listName = banlist.name || i18n("unnamedList");
        row.innerHTML = `
                    <td style="max-width: 300px;">
                        <div class="list-cell">
                            <span class="ring-avatar"><span>${escapeHtml(listName.trim()[0] || "?")}</span></span>
                            <div style="min-width: 0;">
                                <a href="#" class="browse-list-link d-block text-truncate" title="${escapeHtml(i18n("browseList"))}">${escapeHtml(listName)}</a>
                                <div class="sub"><span class="code-chip">XBK-${banlist.id}</span>${escapeHtml(i18n("listAccounts", (banlist.bannedUsers?.length || 0).toLocaleString(UI_LANGUAGE)))}</div>
                            </div>
                        </div>
                    </td>
                    <td class="d-none">
                         <div class="form-check form-switch d-flex align-items-center">
                             <input class="form-check-input auto-block-switch" type="checkbox" role="switch" id="switchCheck-${banlist.id}" ${banlist.mode === 'autoblock' ? 'checked' : ''}>
                         </div>
                    </td>
                    <td>
                         <select class="form-select form-select-sm banlist-mode-select" data-mode="${banlist.mode}" data-banlist-id="${banlist.id}">
                             <option value="autoblock" ${banlist.mode === 'autoblock' ? 'selected' : ''}>${i18n("modeBlock")}</option>
                             <option value="automute" ${banlist.mode === 'automute' ? 'selected' : ''}>${i18n("modeMute")}</option>
                             <option value="hide" ${banlist.mode === 'hide' ? 'selected' : ''}>${i18n("modeHide")}</option>
                             <option value="blur" ${banlist.mode === 'blur' ? 'selected' : ''}>${i18n("modeBlur")}</option>
                         </select>
                     </td>
                     <td class="batch-progress-cell">${renderBatchProgress(banlist.id, banlist.mode)}</td>
                     <td class="text-end">
                        <button class="icon-btn small danger unsubscribe-btn" data-banlist-id="${banlist.id}" title="${escapeHtml(i18n("unsubscribeFrom", listName))}"><i class="fa-solid fa-trash-can"></i></button>
                     </td>
                `;

        tbody.appendChild(row);

        row.querySelector('.browse-list-link')?.addEventListener('click', (event) => {
            event.preventDefault();
            openListBrowser(banlist);
        });

        // add listener for the mode select
        const modeSelect = row.querySelector('.banlist-mode-select');
        modeSelect?.addEventListener("change", (event) => {
            const selectedMode = event.target.value;
            modeSelect.dataset.mode = selectedMode;
            serverHandleSubscribeToBanlist(banlist.id, selectedMode);
            updateBatchProgressCells();
        });

        // *** Add listener for the new Unsubscribe button ***
        const unsubButton = row.querySelector('.unsubscribe-btn');
        unsubButton?.addEventListener('click', (event) => {
            const button = event.currentTarget; // Get the button itself
            const banlistId = button.getAttribute('data-banlist-id');
            const listName = banlist.name || i18n("unnamedList");

            if (banlistId) {
                if (confirm(i18n("confirmUnsubscribe", listName))) {
                    // Pass the banlistId AND the row element to the handler function
                    serverHandleUnsubscribeToBanlist(banlistId, row);
                }
            } else {
                console.error("Could not find banlist ID for unsubscribe button.");
            }
        });
    });
}


function renderblockedUsersTable(blockedUsers, followers = {}) {
    const tbody = blockedUsersTable?.querySelector("tbody"); // Use optional chaining
    if (!tbody) {
        console.error("Whitelisted users table body not found!");
        return;
    }
    tbody.innerHTML = ""; // Clear existing rows

    if (!Array.isArray(blockedUsers) || blockedUsers.length === 0) {
        tbody.innerHTML = emptyRow(3, i18n("noBlockedUsers"), "fa-user-slash");
        return;
    }

    blockedUsers.forEach(username => {
        if (!username) return; // Skip if username is empty/null
        const row = document.createElement("tr");
        row.setAttribute('data-username', username); // Add username for reference

        const followersCount = followers[username];
        row.innerHTML = `
             <td><div class="user-cell">${avatarHTML(username, "blocked")}<a class="handle" href="https://x.com/${encodeURIComponent(username)}" target="_blank">@${escapeHtml(username)}</a></div></td>
             <td class="followers text-end">${followersCount === undefined ? '' : i18n("followersCount", formatCount(followersCount))}</td>
             <td class="text-end" style="width: 48px;">
                <button class="icon-btn small danger remove-user-blocklist-btn" title="${escapeHtml(i18n("removeFromBlocklist", username))}"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Render Whitelisted Users --- NEW ---
function renderWhitelist(whitelist) {
    const tbody = whitelistedUsersTable?.querySelector("tbody"); // Use optional chaining
    if (!tbody) {
        console.error("Whitelisted users table body not found!");
        return;
    }
    tbody.innerHTML = ""; // Clear existing rows

    if (!Array.isArray(whitelist) || whitelist.length === 0) {
        tbody.innerHTML = emptyRow(2, i18n("noWhitelistedUsers"), "fa-user-shield");
        return;
    }

    whitelist.forEach(username => {
        if (!username) return; // Skip if username is empty/null
        const row = document.createElement("tr");
        row.setAttribute('data-username', username); // Add username for reference

        row.innerHTML = `
             <td><div class="user-cell">${avatarHTML(username, "safe")}<a class="handle" href="https://x.com/${encodeURIComponent(username)}" target="_blank">@${escapeHtml(username)}</a></div></td>
             <td class="text-end" style="width: 48px;">
                <button class="icon-btn small danger remove-whitelist-btn" title="${escapeHtml(i18n("removeFromWhitelist", username))}"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// --- Browsing a subscribed list ---

const listBrowserView = document.getElementById("listBrowserView");
const subscribedListsView = document.getElementById("subscribedListsView");
const listBrowserTable = document.getElementById("listBrowserTable");
const listBrowserSearchInput = document.getElementById("listBrowserSearchInput");
let browsedAccounts = [];

function showListBrowser(visible) {
    listBrowserView.classList.toggle("d-none", !visible);
    listBrowserView.classList.toggle("d-flex", visible);
    subscribedListsView.classList.toggle("d-none", visible);
}

document.getElementById("listBrowserBackBtn").addEventListener("click", () => showListBrowser(false));

listBrowserSearchInput.addEventListener("input", () => {
    const searchTerm = listBrowserSearchInput.value.trim().toLowerCase();
    listBrowserTable.querySelectorAll("tbody tr[data-search]").forEach(row => {
        row.style.display = row.dataset.search.includes(searchTerm) ? "" : "none";
    });
});

function openListBrowser(banlist) {
    document.getElementById("listBrowserTitle").textContent = banlist.name || i18n("unnamedList");
    document.getElementById("listBrowserMeta").textContent = `XBK-${banlist.id}`;
    listBrowserSearchInput.value = "";
    listBrowserTable.querySelector("tbody").innerHTML =
        `<tr><td class="empty"><span class="spinner-border spinner-border-sm text-danger d-block mx-auto mb-2"></span>${i18n("loadingAccounts")}</td></tr>`;
    showListBrowser(true);

    chrome.runtime.sendMessage({ action: "loadBanlistAccounts", banlistId: banlist.id }, (response) => {
        if (response?.status !== "success") {
            listBrowserTable.querySelector("tbody").innerHTML =
                emptyRow(1, escapeHtml(response?.message || i18n("errorLoadingData")), "fa-triangle-exclamation");
            return;
        }
        browsedAccounts = response.accounts;
        const blocked = browsedAccounts.filter(a => ["blocked", "muted"].includes(a.status)).length;
        document.getElementById("listBrowserMeta").textContent =
            `XBK-${banlist.id} · ${i18n("listAccountsSummary", browsedAccounts.length.toLocaleString(UI_LANGUAGE), blocked.toLocaleString(UI_LANGUAGE))}`;
        renderListBrowser();
    });
}

function accountStatusBadge(account) {
    if (account.whitelisted) return `<span class="xb-badge safe"><i class="fa-solid fa-shield"></i>${i18n("statusNeverBlock")}</span>`;
    if (account.status === "blocked") return `<span class="xb-badge blocked"><i class="fa-solid fa-ban"></i>${i18n("statusBlocked")}</span>`;
    if (account.status === "muted") return `<span class="xb-badge muted"><i class="fa-solid fa-volume-xmark"></i>${i18n("statusMuted")}</span>`;
    if (account.status === "unavailable") return `<span class="xb-badge unavailable">${i18n("statusUnavailable")}</span>`;
    return "";
}

function renderListBrowser() {
    const tbody = listBrowserTable.querySelector("tbody");
    if (browsedAccounts.length === 0) {
        tbody.innerHTML = emptyRow(1, i18n("noListAccounts"), "fa-list-ul");
        return;
    }
    tbody.innerHTML = browsedAccounts.map((account, index) => {
        const details = [account.name, account.note].filter(Boolean).join(" · ");
        const search = [account.username, account.name, account.note].filter(Boolean).join(" ").toLowerCase();
        const shieldTitle = i18n(account.whitelisted ? "allowBlocking" : "neverBlock", account.username);
        return `
            <tr data-index="${index}" data-search="${escapeHtml(search)}">
                <td style="max-width: 360px;">
                    <div class="user-cell">
                        ${avatarHTML(account.username)}
                        <div class="who">
                            <a href="https://x.com/${encodeURIComponent(account.username)}" target="_blank" class="handle">@${escapeHtml(account.username)}</a>
                            ${details ? `<div class="details" title="${escapeHtml(details)}">${escapeHtml(details)}</div>` : ""}
                        </div>
                    </div>
                </td>
                <td class="followers">${account.followersCount === null ? "" : i18n("followersCount", formatCount(account.followersCount))}</td>
                <td>${accountStatusBadge(account)}</td>
                <td class="text-end" style="width: 48px;">
                    <button class="icon-btn small ${account.whitelisted ? "green" : ""} toggle-whitelist-btn" title="${escapeHtml(shieldTitle)}"><i class="fa-solid ${account.whitelisted ? "fa-user-shield" : "fa-shield-halved"}"></i></button>
                </td>
            </tr>`;
    }).join("");
    listBrowserSearchInput.dispatchEvent(new Event("input"));
}

// The shield exempts an account from blocking (adds it to the user's whitelist), or undoes it
listBrowserTable.addEventListener("click", (event) => {
    const button = event.target.closest(".toggle-whitelist-btn");
    if (!button) return;
    const account = browsedAccounts[Number(button.closest("tr").dataset.index)];
    const whitelist = !account.whitelisted;
    button.classList.add("opacity-50");

    chrome.runtime.sendMessage({ action: whitelist ? "addUsersToWhitelist" : "removeUsersFromWhitelist", userIds: [account.username] }, (response) => {
        if (response?.status !== "success") {
            button.classList.remove("opacity-50");
            alert(i18n("whitelistUpdateFailed", response?.message || i18n("unknownError")));
            return;
        }
        account.whitelisted = whitelist;
        if (user) {
            const others = (user.whiteListedUsers || []).filter(u => u.toLowerCase() !== account.username.toLowerCase());
            user.whiteListedUsers = whitelist ? [...others, account.username] : others;
            localStorage.setItem('x_block_user', JSON.stringify(user));
            whitelistedUsersNumberLabel.textContent = user.whiteListedUsers.length;
            updateCountChips();
            renderWhitelist(user.whiteListedUsers);
        }
        renderListBrowser();
        loadBatchProgress();
    });
});

// --- Action Functions ---

function openSettings() {
    chrome.runtime.openOptionsPage();
}

function openLoginModal() {
    // Open the login modal
    const loginModal = document.getElementById("loginModal");
    loginModal.style.display = "block"; // Show the modal
    // Optionally, you can add logic to focus on the first input field in the modal
    const firstInput = loginModal.querySelector("input");
    if (firstInput) {
        firstInput.focus(); // Focus on the first input field
    }
}

function closeLoginModal() {
    // Close the login modal
    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
        loginModal.style.display = "none"; // Hide the modal
    }
}



function openXProfilePage() {
    localStorage.setItem("syncCardHidden", "true");
    // Consider opening the specific user's block list page on X/Twitter if the URL is predictable
    // For now, opens the generic blocked accounts page
    chrome.tabs.create({ url: "https://x.com/settings/blocked/all" });
}

function openBuyMeCoffeePage() {
    // Consider opening the specific user's block list page on X/Twitter if the URL is predictable
    // For now, opens the generic blocked accounts page
    chrome.tabs.create({ url: "https://buymeacoffee.com/jbcollet" });
}


// Server Banlist Functions
// *** MODIFIED to handle UI update ***
function serverHandleUnsubscribeToBanlist(banlistId, tableRow) { // Added tableRow parameter
    if (tableRow) tableRow.style.opacity = '0.5'; // Optimistic UI feedback

    chrome.runtime.sendMessage({ action: "unsubscribeFromBanlist", banlistId: banlistId }, (response) => {
        if (response && response.status === "success") {
             console.log(`Successfully unsubscribed from banlist ${banlistId}.`);

             // --- Update local state ---
             let updated = false;
             if (user && user.subscriptions) {
                 const initialLength = user.subscriptions.length;
                 user.subscriptions = user.subscriptions.filter(sub => sub.blockListId !== banlistId);
                 if(user.subscriptions.length !== initialLength) updated = true;
             }
             if (blockLists) {
                 const initialLength = blockLists.length;
                 // Filter out the unsubscribed list *unless* it's the user's own list (shouldn't happen based on render logic, but safe)
                 blockLists = blockLists.filter(bl => bl.id !== banlistId || bl.ownerId === user?.id);
                 if(blockLists.length !== initialLength) updated = true;
             }

             // Update cache if state changed
             if(updated) {
                 localStorage.setItem('x_block_user', JSON.stringify(user));
                 localStorage.setItem('x_block_block_lists', JSON.stringify(blockLists));
             }
             // --- End of local state update ---


             // Remove row from UI
             if (tableRow) {
                 tableRow.remove();
             } else {
                 // If row wasn't passed, need to re-render or find it again (less ideal)
                 console.warn("Table row not passed to unsubscribe handler, re-rendering list.");
                 renderBanlists(blockLists); // Fallback to re-render if row isn't available
             }

              // Check if the list is now empty and display the placeholder message if needed
             const tbody = blocklistsTable?.querySelector("tbody");
             if (tbody && !tbody.querySelector('tr')) { // Check if tbody is empty
                const subscribedLists = blockLists?.filter(banlist => banlist.ownerId !== user?.id) || [];
                if (subscribedLists.length === 0) {
                     tbody.innerHTML = emptyRow(5, i18n("noSubscribedLists"), "fa-list-check");
                }
             }


        } else {
            console.error(`Failed to unsubscribe from banlist ${banlistId}:`, response?.message || 'Unknown error');
            alert(i18n("unsubscribeFailed", response?.message || i18n("unknownError")));
             if (tableRow) tableRow.style.opacity = '1'; // Revert optimistic UI feedback on failure
        }
    });
}

// Server Banlist Subscription Update/Toggle Function
function serverHandleSubscribeToBanlist(banlistId, mode = "autoblock") { // Changed default to autoblock for clarity
    // Optional: Add optimistic UI update here if desired (e.g., visually toggle switch immediately)
    chrome.runtime.sendMessage({ action: "subscribeToBanlist", banlistId: banlistId, mode: mode }, (response) => {
        if (response && response.status === "success") {
            console.log(`Successfully updated subscription for banlist ${banlistId} to mode: ${mode}.`);
            loadBatchProgress(); // the set of Block-mode lists changed
            // Update local state if needed (important for consistency)
             if(user && user.subscriptions) {
                const sub = user.subscriptions.find(s => s.blockListId === banlistId);
                if (sub) {
                    sub.mode = mode;
                    localStorage.setItem('x_block_user', JSON.stringify(user)); // Update cache
                } else {
                     // This case shouldn't happen if the switch is only shown for subscribed lists,
                     // but handle defensively
                     console.warn(`Subscription data not found locally for banlist ${banlistId} while updating mode.`);
                     // Optionally re-fetch data or add the subscription locally
                }
             }
        } else {
            console.error(`Failed to update subscription for banlist ${banlistId}:`, response?.message || 'Unknown error');
            alert(i18n("updateModeFailed", response?.message || i18n("unknownError")));
            // Revert optimistic UI update if you added one
             const switchInput = document.getElementById(`switchCheck-${banlistId}`);
             if (switchInput) {
                switchInput.checked = !switchInput.checked; // Revert the toggle
             }
        }
    });
}

// --- Whitelist Removal Logic --- NEW ---
whitelistedUsersTable?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.remove-whitelist-btn');
    if (removeButton) {
        const row = removeButton.closest('tr');
        const username = row?.getAttribute('data-username');

        if (username) {
            if (confirm(i18n("confirmRemoveWhitelist", username))) {
                 removeUserFromWhitelist(username, row); // Pass the row element for potential UI feedback
            }
        } else {
            console.error("Could not find username for removal target.");
        }
    }
});


blockedUsersTable?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.remove-user-blocklist-btn');
    if (removeButton) {
        const row = removeButton.closest('tr');
        const username = row?.getAttribute('data-username');

        if (username) {
            if (confirm(i18n("confirmRemoveBlocklist", username))) {
                removeUserFromBlockList(username, row); // Pass the row element for potential UI feedback
            }
        } else {
            console.error("Could not find username for removal target.");
        }
    }
});



function removeUserFromBlockList(username, tableRow) {
    console.log(`Attempting to remove ${username} from whitelist.`);
    if (tableRow) tableRow.style.opacity = '0.5'; // Optimistic UI feedback
    const userOwnBlockList = blockLists.find(b => b.ownerId === user.id);

    chrome.runtime.sendMessage({ action: "removeUsersFromBanlist", onlyRemoveFromBanlist: true, banlistId: userOwnBlockList.id, userIds: [username] }, (response) => {
        if (response && response.status === "success") {
            console.log(`Successfully removed ${username} from whitelist.`);
             // Update local user state
            if (userOwnBlockList && userOwnBlockList.bannedusers) {
                userOwnBlockList.bannedusers = userOwnBlockList.bannedusers.filter(u => u !== username);
                 // find the blocklist in the local state and update it
                const blockListIndex = blockLists.findIndex(bl => bl.id === userOwnBlockList.id);
                if (blockListIndex !== -1) {
                    blockLists[blockListIndex] = userOwnBlockList; // Update the blocklist in local state
                }
                 localStorage.setItem('x_block_block_lists', JSON.stringify(blockLists)); // Update cache
                 // Re-render the list immediately *OR* just remove the row
                 // Removing row directly is usually smoother:
                 if (tableRow) {
                     tableRow.remove();
                 } else {
                     renderWhitelist(user.whiteListedUsers); // Fallback if row wasn't passed
                 }
                 // Check if the list is now empty and display the placeholder message if needed
                const tbody = whitelistedUsersTable?.querySelector("tbody");
                if (tbody && !tbody.querySelector('tr')) { // Check if tbody is empty
                    if ((user.whiteListedUsers || []).length === 0) {
                        tbody.innerHTML = emptyRow(2, i18n("noWhitelistedUsers"), "fa-user-shield");
                    }
                }

            } else {
                 // If local state update failed, request full refresh on next open maybe?
                 // For now, just log it. The list should be correct on next popup open.
                 console.warn("Local user object was not updated, list will refresh on next open.");
                 if(tableRow) tableRow.remove(); // Remove row manually if local update failed but backend succeeded
            }
        } else {
            console.error(`Failed to remove ${username} from whitelist:`, response?.message || 'Unknown error');
             alert(i18n("removeFailed", username, response?.message || i18n("unknownError")));
             if (tableRow) tableRow.style.opacity = '1'; // Revert optimistic UI feedback on failure
        }
    });
}



function removeUserFromWhitelist(username, tableRow) {
    console.log(`Attempting to remove ${username} from whitelist.`);
    if (tableRow) tableRow.style.opacity = '0.5'; // Optimistic UI feedback

    chrome.runtime.sendMessage({ action: "removeUsersFromWhitelist", userIds: [username] }, (response) => {
        if (response && response.status === "success") {
            console.log(`Successfully removed ${username} from whitelist.`);
             // Update local user state
            if (user && user.whiteListedUsers) {
                 user.whiteListedUsers = user.whiteListedUsers.filter(u => u !== username);
                 localStorage.setItem('x_block_user', JSON.stringify(user)); // Update cache
                 // Re-render the list immediately *OR* just remove the row
                 // Removing row directly is usually smoother:
                 if (tableRow) {
                     tableRow.remove();
                 } else {
                     renderWhitelist(user.whiteListedUsers); // Fallback if row wasn't passed
                 }
                 // Check if the list is now empty and display the placeholder message if needed
                const tbody = whitelistedUsersTable?.querySelector("tbody");
                if (tbody && !tbody.querySelector('tr')) { // Check if tbody is empty
                    if ((user.whiteListedUsers || []).length === 0) {
                        tbody.innerHTML = emptyRow(2, i18n("noWhitelistedUsers"), "fa-user-shield");
                    }
                }

            } else {
                 // If local state update failed, request full refresh on next open maybe?
                 // For now, just log it. The list should be correct on next popup open.
                 console.warn("Local user object was not updated, list will refresh on next open.");
                 if(tableRow) tableRow.remove(); // Remove row manually if local update failed but backend succeeded
            }
        } else {
            console.error(`Failed to remove ${username} from whitelist:`, response?.message || 'Unknown error');
             alert(i18n("removeFailed", username, response?.message || i18n("unknownError")));
             if (tableRow) tableRow.style.opacity = '1'; // Revert optimistic UI feedback on failure
        }
    });
}


// --- Utility Functions ---
function escapeHtml(unsafe) {
    if (unsafe === null || typeof unsafe === 'undefined') return ''; // Handle null/undefined
    return String(unsafe) // Ensure it's a string
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
}

// --- Initial Load ---
init(); // Start the process


const syncCard = document.getElementById("syncCard");
const closeSyncCardBtn = document.getElementById("closeSyncCardBtn");
closeSyncCardBtn.addEventListener("click", () => {
    syncCard.style.display = "none";
    localStorage.setItem("syncCardHidden", "true");
});
function initSyncCardVisibility() {
    const isSyncCardHidden = localStorage.getItem("syncCardHidden") === "true";
    console.log("Sync Card Hidden:", isSyncCardHidden);
    if (isSyncCardHidden) {
        syncCard.style.display = "none";
    }
}
initSyncCardVisibility();

// --- Batch blocking ---
// The batch runs in its own x.com window (opened by the background, run by content/batch.js).
// The popup starts it, pauses it through chrome.storage and shows the progress published there.

const BATCH_RUNNER_TIMEOUT = 30000; // the runner refreshes its heartbeat at least every 5 s
const batchBlockBtn = document.getElementById("batchBlockBtn");
const batchBlockStatus = document.getElementById("batchBlockStatus");
const batchBlockRemaining = document.getElementById("batchBlockRemaining");

let batchProgressById = {};
let batchRemaining = null;
let batchRequested = false;
let batchStatus = null;

function formatCount(count) {
    return new Intl.NumberFormat(UI_LANGUAGE, { notation: "compact", maximumFractionDigits: 1 }).format(count);
}

function renderBatchProgress(banlistId, mode) {
    if (mode !== "autoblock" && mode !== "automute") {
        return `<span class="followers" title="${escapeHtml(i18n("batchNotBlockMode"))}">—</span>`;
    }
    const progress = batchProgressById[banlistId];
    if (!progress) return `<span class="followers">…</span>`;
    const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 100;
    return `
        <div class="xb-progress" title="${escapeHtml(i18n("batchProgressTitle", progress.done, progress.total))}">
            <div class="track"><div class="fill ${percent >= 100 ? "full" : ""}" style="width: ${percent}%"></div></div>
            <span class="num">${progress.done.toLocaleString(UI_LANGUAGE)}/${progress.total.toLocaleString(UI_LANGUAGE)}</span>
        </div>`;
}

function updateBatchProgressCells() {
    document.querySelectorAll("#blocklistsTable tbody tr[data-banlist-id]").forEach(row => {
        const cell = row.querySelector(".batch-progress-cell");
        const mode = row.querySelector(".banlist-mode-select")?.value;
        if (cell) cell.innerHTML = renderBatchProgress(row.getAttribute("data-banlist-id"), mode);
    });
}

function applyBatchLists(lists) {
    batchProgressById = Object.fromEntries(lists.map(list => [list.id, list]));
    updateBatchProgressCells();
}

function loadBatchProgress() {
    chrome.runtime.sendMessage({ action: "loadBatchBlock", limit: 0 }, response => {
        if (chrome.runtime.lastError || response?.status !== "success") {
            console.error("Failed to load batch block progress:", response?.message || chrome.runtime.lastError?.message);
            return;
        }
        applyBatchLists(response.batch.lists);
        batchRemaining = response.batch.remaining;
        updateBatchUI();
    });
}

function batchRunnerAlive() {
    return !!batchStatus
        && ["running", "rate-limited"].includes(batchStatus.state)
        && Date.now() - batchStatus.heartbeat < BATCH_RUNNER_TIMEOUT;
}

function setBatchStatusText(html, tone = "muted") {
    batchBlockStatus.className = `small text-truncate text-${tone}`;
    batchBlockStatus.innerHTML = html;
}

function updateBatchUI() {
    const blockedThisRun = batchStatus?.blockedCount ? ` · ${i18n("batchBlockedThisRun", batchStatus.blockedCount)}` : "";

    if (batchRequested && !batchRunnerAlive()) {
        setBatchStatusText(`${i18n("batchOpening")} <a href="#" id="showBatchWindow">${i18n("batchShowWindow")}</a>`, "warning");
        document.getElementById("showBatchWindow")?.addEventListener("click", event => {
            event.preventDefault();
            chrome.runtime.sendMessage({ action: "startBatchBlock" });
        });
    } else if (batchRequested && batchStatus.state === "rate-limited") {
        const message = batchStatus.resumeAt
            ? i18n("batchRateLimitedUntil", new Date(batchStatus.resumeAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
            : i18n("batchRateLimitedSoon");
        setBatchStatusText(`${message}${blockedThisRun}`, "warning");
    } else if (batchRequested) {
        setBatchStatusText(
            batchStatus.current ? `${i18n("batchBlocking", escapeHtml(batchStatus.current.username))}${blockedThisRun}` : `${i18n("batchStarting")}${blockedThisRun}`,
            "light"
        );
    } else if (batchStatus?.state === "error") {
        setBatchStatusText(escapeHtml(i18n("batchStopped", batchStatus.message || i18n("unknownError"))), "danger");
    } else if (batchStatus?.state === "done") {
        setBatchStatusText(`${escapeHtml(batchStatus.message || i18n("batchDone"))}${blockedThisRun}`, "success");
    } else if (batchStatus?.state === "paused") {
        setBatchStatusText(`${escapeHtml(batchStatus.message || i18n("batchPaused"))}${blockedThisRun}`);
    } else {
        setBatchStatusText(i18n("batchIdle"));
    }

    const remaining = batchRunnerAlive() ? batchStatus.remaining ?? batchRemaining : batchRemaining;
    batchBlockRemaining.textContent = remaining > 0 ? i18n("batchLeft", remaining) : "";

    batchBlockBtn.innerHTML = batchRequested
        ? `<i class="fa-solid fa-pause me-1"></i>${i18n("batchPause")}`
        : `<i class="fa-solid fa-play me-1"></i>${i18n("batchStart")}`;
    batchBlockBtn.className = `btn btn-sm text-nowrap ${batchRequested ? "btn-outline-light" : "btn-danger"}`;
}

batchBlockBtn.addEventListener("click", () => {
    if (batchRequested) {
        chrome.storage.local.set({ xblockBatch: { running: false } });
        return;
    }
    const question = batchRemaining ? i18n("batchConfirmCount", batchRemaining) : i18n("batchConfirmAll");
    const confirmed = confirm(`${question}\n\n${i18n("batchConfirmDetails")}`);
    if (confirmed) chrome.runtime.sendMessage({ action: "startBatchBlock" });
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.xblockBatch) batchRequested = !!changes.xblockBatch.newValue?.running;
    if (changes.xblockBatchStatus) {
        batchStatus = changes.xblockBatchStatus.newValue || null;
        if (batchStatus?.lists) applyBatchLists(batchStatus.lists);
        if (typeof batchStatus?.remaining === "number") batchRemaining = batchStatus.remaining;
    }
    updateBatchUI();
});

chrome.storage.local.get(["xblockBatch", "xblockBatchStatus"], items => {
    batchRequested = !!items.xblockBatch?.running;
    batchStatus = items.xblockBatchStatus || null;
    updateBatchUI();
});
loadBatchProgress();
// The "opening the window" hint depends on how old the runner's heartbeat is
setInterval(updateBatchUI, 5000);
