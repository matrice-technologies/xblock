console.log("background!");

import {
    setAuthToken,
    isAuthenticated,
    startSession,
    loadUserBanlists,
    loadUserData,
    udpateUser,
    subscribeToBanlist,
    updateBlockList,
    unsubscribeFromBanlist,
    addUsersToWhiteList,
    removeUsersFromWhiteList,
    addUsersToBanlist,
    removeUsersFromBanlist,
    reportObservedAccounts,
    recordBlocks,
    loadBatchBlock,
    loadBanlistAccounts
} from "./api.js";


async function signInUser() {
  if (isAuthenticated()) {
    console.log("User already signed in");
    return;
  }

  // get from sync sync storage (xblock_firebase_uid is the pre-Prisma key)
  let { xblock_auth_token, xblock_firebase_uid } = await new Promise((resolve) => {
    chrome.storage.sync.get(["xblock_auth_token", "xblock_firebase_uid"], (result) => {
      resolve(result);
    });
  });

  if (!xblock_auth_token) {
    // Reuse a legacy token if there is one, otherwise generate a new one
    xblock_auth_token = xblock_firebase_uid || crypto.randomUUID();
    chrome.storage.sync.set({ xblock_auth_token: xblock_auth_token });
  }

  try {
    setAuthToken(xblock_auth_token);

    // we check if the user is already in the database, if not we create it
    const user = await startSession();
    console.log("User signed in:", user.id);

    return

  } catch (error) {
    setAuthToken(null);
    console.error("Sign-in error:", error);
  }
}


// on startup
chrome.runtime.onStartup.addListener(() => {
  signInUser();
});

// on install 
chrome.runtime.onInstalled.addListener(() => {
  signInUser();
});

async function ensureUserSignedIn() {
  if (!isAuthenticated()) {
    console.log("User not signed in, signing in...");
    await signInUser();  // This will sign the user in if they're not already signed in
  }
}

// --- Batch blocking window ---
// Batch blocking runs in its own small x.com window (content/batch.js draws the progress
// overlay there). A dedicated, visible window isn't throttled like a background tab.

const getBatchWindow = async () => (await chrome.storage.local.get("xblockBatchWindow")).xblockBatchWindow;

async function startBatchBlock() {
  await chrome.storage.local.set({ xblockBatch: { running: true } });

  const existing = await getBatchWindow();
  if (existing) {
    try {
      await chrome.windows.update(existing.windowId, { focused: true });
      return;
    } catch (error) {
      // The window is gone, open a new one
    }
  }

  // A new window starts a new run: reset the "blocked this run" counter
  const { xblockBatchStatus } = await chrome.storage.local.get("xblockBatchStatus");
  await chrome.storage.local.set({
    xblockBatchStatus: { ...xblockBatchStatus, state: "running", blockedCount: 0, current: null, message: "", heartbeat: 0 },
  });

  const batchWindow = await chrome.windows.create({
    url: "https://x.com/home",
    type: "popup",
    width: 560,
    height: 780,
    focused: true,
  });
  await chrome.storage.local.set({
    xblockBatchWindow: { windowId: batchWindow.id, tabId: batchWindow.tabs[0].id },
  });
}

async function closeBatchWindow() {
  const batchWindow = await getBatchWindow();
  await chrome.storage.local.remove("xblockBatchWindow");
  if (batchWindow) await chrome.windows.remove(batchWindow.windowId).catch(() => {});
}

// Closing the window by hand pauses the batch
chrome.windows.onRemoved.addListener(async (windowId) => {
  const batchWindow = await getBatchWindow();
  if (batchWindow?.windowId !== windowId) return;

  await chrome.storage.local.remove("xblockBatchWindow");
  const { xblockBatch, xblockBatchStatus } = await chrome.storage.local.get(["xblockBatch", "xblockBatchStatus"]);
  if (xblockBatch?.running) {
    await chrome.storage.local.set({
      xblockBatch: { running: false },
      xblockBatchStatus: { ...xblockBatchStatus, state: "paused", current: null, message: chrome.i18n.getMessage("batchMsgWindowClosed") },
    });
  }
});

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {

    await ensureUserSignedIn();
    
    try {
      if (message.action === "loadInitialData") {
          let user = await loadUserData();  
          const banlists = await loadUserBanlists();

          sendResponse({ status: "success", data: {user: user,banlists: banlists}});
        
      } else if (message.action === "loadBanlists") {
          const banlists = await loadUserBanlists();
          sendResponse({ status: "success", banlists });
          
      } else if (message.action === "addUsersToBanlist") {
          await addUsersToBanlist(message.banlistId, message.userIds);
          await removeUsersFromWhiteList(message.userIds);
          sendResponse({ status: "success", message: `User ${message.userIds} added!` });
          
      } else if (message.action === "removeUsersFromBanlist") {
          await removeUsersFromBanlist(message.banlistId, message.userIds);
          if(!message.onlyRemoveFromBanlist) {
            await addUsersToWhiteList(message.userIds);
          }
          sendResponse({ status: "success", message: `User ${message.userIds} removed!` });
          
      } else if (message.action === "loadBanlistAccounts") {
        const accounts = await loadBanlistAccounts(message.banlistId);
        sendResponse({ status: "success", accounts });

      } else if (message.action === "addUsersToWhitelist") {
        await addUsersToWhiteList(message.userIds);
        sendResponse({ status: "success" });

      } else if (message.action === "removeUsersFromWhitelist") {
        await removeUsersFromWhiteList(message.userIds);
        sendResponse({ status: "success", message: `User ${message.userIds} removed from whitelist!` });
      }  else if (message.action === "userOptionUpdate") {
          await udpateUser(message.data);
          sendResponse({ status: "success", message: `User ${message.userId} removed!` });
      } else if (message.action === "blockListUpdate") {
          await updateBlockList(message.id, message.data);
          sendResponse({ status: "success", message: `Block list ${message.userId} removed!` });
      }  else if (message.action === "subscribeToBanlist") {
          let blockList = await subscribeToBanlist(message.banlistId, message.mode);
          sendResponse({ status: "success", blockList });
          
      } else if (message.action === "unsubscribeFromBanlist") {
        await unsubscribeFromBanlist(message.banlistId);
        sendResponse({ status: "success", message: `you unsub from ${message.banlistId}!` });
      } else if (message.action === "reportObservedAccounts") {
        await reportObservedAccounts(message.accounts);
        sendResponse({ status: "success" });
      } else if (message.action === "recordBlocks") {
        await recordBlocks(message.blocks);
        sendResponse({ status: "success" });
      } else if (message.action === "loadBatchBlock") {
        const batch = await loadBatchBlock(message.limit ?? 100);
        sendResponse({ status: "success", batch });
      } else if (message.action === "startBatchBlock") {
        await startBatchBlock();
        sendResponse({ status: "success" });
      } else if (message.action === "isBatchTab") {
        const batchWindow = await getBatchWindow();
        sendResponse({ status: "success", isBatchTab: !!batchWindow && sender.tab?.id === batchWindow.tabId });
      } else if (message.action === "closeBatchWindow") {
        await closeBatchWindow();
        sendResponse({ status: "success" });
      } else if (message.action === "signIn") {
        setAuthToken(null);
        await signInUser();
        sendResponse({ status: "success", message: `sign IN` });
      }
    }
    catch (error) {
      sendResponse({ status: "error", message: error.message });
    } 

  })();
  
  return true; // Required for async sendResponse
});