// Local Storage Helper Functions
function getSubscriptions() {
    const stored = localStorage.getItem("xblock_subscription");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  function saveSubscriptions(arr) {
    localStorage.setItem("xblock_subscription", JSON.stringify(arr));
  }

  // Server Banlist Functions
  function serverHandleSubscribeToBanlist(banlistId, mode = "autoblock") {
    let sliced = banlistId.slice(4).toUpperCase();
    console.log(sliced);
    chrome.runtime.sendMessage({ action: "subscribeToBanlist", banlistId: sliced, mode: mode }, (response) => {
      console.log(response);
    });
  }

  function serverHandleUnsubscribeFromBanlist(banlistId) {
    let sliced = banlistId.slice(4).toUpperCase();
    console.log(sliced);
    chrome.runtime.sendMessage({ action: "unsubscribeFromBanlist", banlistId: sliced }, (response) => {
      console.log(response);
    });
  }

  // Updates the button appearance based on its subscription state.
  function updateButtonState(button) {
    const code = button.getAttribute("data-original");
    const subs = getSubscriptions();
    if (subs.includes(code)) {
      button.textContent = i18n("shareCodeSubscribed", code);
      button.classList.remove("button-not-subscribed");
      button.classList.add("button-subscribed");
    } else {
      button.textContent = i18n("shareCodeSubscribe", code);
      button.classList.remove("button-subscribed");
      button.classList.add("button-not-subscribed");
    }
  }

  // Function to process a text node by scanning for two patterns:
  // 1. Plain "XBP" → replaced with "ABP"
  // 2. "XBK-XXX" (3 to 5 hex digits) → replaced by a button with dynamic subscription state.
  function processTextNode(textNode) {
    // Our own Subscribe buttons show the code too: leave them alone
    if (textNode.parentElement?.closest("button[data-original]")) return;
    const originalText = textNode.nodeValue;
    // Regex that matches either "XBK-XXXX" or "XBP"
    const regex = /XBK-[0-9A-Fa-f]{3,5}|XBP/g;
    if (!regex.test(originalText)) {
      return; // nothing to replace
    }

    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    regex.lastIndex = 0; // Reset regex pointer

    let match;
    while ((match = regex.exec(originalText)) !== null) {
      // Append any text before the current match as a new text node.
      if (match.index > lastIndex) {
        const textPart = originalText.slice(lastIndex, match.index);
        frag.appendChild(document.createTextNode(textPart));
      }
      // Process the match:
      if (match[0].startsWith("XBK-")) {
        const code = match[0];
        const button = document.createElement("button");
        button.setAttribute("data-original", code);
        // Set the button's initial state based on subscription status.
        updateButtonState(button);

        // Toggle subscription on click.
        button.addEventListener("click", function() {
          let subs = getSubscriptions();
          // sstrip code of the "XBK-" prefix
          if (subs.includes(code)) {
            // Unsubscribe: remove the code and call the removal function.
            subs = subs.filter(item => item !== code);
            serverHandleUnsubscribeFromBanlist(code);
          } else {
            // Subscribe: add the code and call the add function.
            subs.push(code);
            serverHandleSubscribeToBanlist(code);
          }
          saveSubscriptions(subs);
          updateButtonState(button);
        });
        frag.appendChild(button);
      } else if (match[0] === "XBP") {
        // For "XBP", simply replace with "ABP".
        frag.appendChild(document.createTextNode("ABP"));
      }
      lastIndex = regex.lastIndex;
    }
    // Append any remaining text after the last match.
    if (lastIndex < originalText.length) {
      frag.appendChild(document.createTextNode(originalText.slice(lastIndex)));
    }
    // Replace the original text node with the new content.
    textNode.parentNode.replaceChild(frag, textNode);
  }

  // Recursive function to traverse the DOM and process all text nodes.
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node);
    } else if (
      node.nodeType === Node.ELEMENT_NODE ||
      node.nodeType === Node.DOCUMENT_NODE ||
      node.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
      let child = node.firstChild;
      while (child) {
        // Cache the next sibling in case the DOM is modified during traversal.
        let next = child.nextSibling;
        walk(child);
        child = next;
      }
    }
  }

  // Process the document body once it is available.
  if (document.body) {
    walk(document.body);
  } else {
    document.addEventListener("DOMContentLoaded", () => walk(document.body));
  }

  // Set up a MutationObserver to handle dynamically added content.
  const observerXblockCode = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(addedNode => {
        if (addedNode.nodeType === Node.TEXT_NODE) {
          processTextNode(addedNode);
        } else if (
          addedNode.nodeType === Node.ELEMENT_NODE ||
          addedNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE
        ) {
          walk(addedNode);
        }
      });
    });
  });

  // Begin observing changes in the entire document body.
  observerXblockCode.observe(document.body, { childList: true, subtree: true });