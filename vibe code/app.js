const FREE_MESSAGE_LIMIT = 5;
const CHAT_STORAGE_KEY = "trade-link-chat-v1";
const CATEGORIES = ["Food and Beverage", "Textiles", "Packaging", "Electronics", "Furniture", "Agriculture", "Beauty"];

const businesses = window.TRADE_LINK_DATA || [];
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const businessById = (id) => businesses.find((business) => business.id === id);

function renderSharedShell() {
  const page = document.body.dataset.page;
  const links = [["home", "Home", "index.html"], ["discover", "Discover", "discover.html"], ["about", "About", "about.html"]];
  document.querySelector("#site-header").innerHTML = `
    <header class="site-header"><div class="wrap header-inner">
      <a class="wordmark" href="index.html" aria-label="Trade Link home">Trade<span> Link</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation"><span class="menu-lines" aria-hidden="true"></span><span class="visually-hidden">Open navigation</span></button>
      <nav id="primary-navigation" class="primary-nav" aria-label="Main navigation">${links.map(([key, label, href]) => `<a href="${href}"${page === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}<a class="nav-join" href="index.html#updates">Join free</a></nav>
    </div></header>`;
  document.querySelector("#site-footer").innerHTML = `
    <footer class="site-footer"><div class="wrap footer-main"><div><a class="wordmark footer-wordmark" href="index.html">Trade<span> Link</span></a><p>Good business starts with a conversation.</p></div><nav class="footer-nav" aria-label="Footer navigation">${links.map(([, label, href]) => `<a href="${href}">${label}</a>`).join("")}</nav><a class="footer-email" href="mailto:hello@tradelink.example">hello@tradelink.example</a></div><div class="wrap footer-bottom"><span>Copyright &copy; ${new Date().getFullYear()} Trade Link</span><span>Placeholder content for prototype</span></div></footer>`;
  document.querySelector("#global-overlays").innerHTML = `
    <button class="chat-launcher" type="button" aria-label="Open messages" aria-controls="chat-drawer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H11l-5.5 3v-3H4z"></path><path d="M8 10h8M8 13h5"></path></svg></button>
    <div class="drawer-backdrop" hidden></div><aside class="chat-drawer" id="chat-drawer" role="dialog" aria-modal="true" aria-labelledby="chat-title" aria-hidden="true" tabindex="-1"><div class="chat-header"><div><p class="eyebrow">Trade Link messages</p><h2 id="chat-title">Your conversations</h2></div><button class="icon-button chat-close" type="button" aria-label="Close messages">&times;</button></div><div class="chat-layout"><nav class="conversation-list" aria-label="Conversations"></nav><section class="chat-thread" aria-label="Selected conversation"></section></div></aside>
    <dialog class="site-modal" aria-labelledby="modal-title"><div class="modal-content"></div><button class="icon-button modal-close" type="button" aria-label="Close dialog">&times;</button></dialog>`;
  document.querySelectorAll("[data-email-form]").forEach((mount, index) => {
    const id = `email-${page}-${index}`;
    mount.innerHTML = `<form class="email-form" novalidate><label class="visually-hidden" for="${id}">Email address</label><input id="${id}" name="email" type="email" placeholder="Your email address" autocomplete="email" required><div class="honeypot" aria-hidden="true"><label for="website-${id}">Leave this field empty</label><input id="website-${id}" name="website" tabindex="-1" autocomplete="off"></div><button class="button button-primary" type="submit">Notify me</button><p class="form-status" aria-live="polite"></p></form>`;
  });
}

function renderBusinessCard(business, featured = false) {
  return `<article class="business-card${featured ? " featured-card" : ""}"><div class="card-top"><div class="business-avatar" aria-hidden="true">${escapeHTML(business.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase())}</div><div class="card-title"><p class="business-category">${escapeHTML(business.category)}</p><h3>${escapeHTML(business.name)}</h3></div>${business.verified ? '<span class="verified-badge">Verified</span>' : ""}</div><div class="card-meta"><span>${escapeHTML(business.type)}</span><span>${escapeHTML(business.location)}</span></div><p class="business-description">${escapeHTML(business.description)}</p><ul class="product-tags">${business.productTags.slice(0, 3).map((tag) => `<li>${escapeHTML(tag)}</li>`).join("")}</ul><div class="card-actions"><button class="button button-outline" type="button" data-view-business="${escapeHTML(business.id)}">View</button><button class="button button-primary" type="button" data-message-business="${escapeHTML(business.id)}">Message</button></div></article>`;
}

function renderHome() {
  const featured = document.querySelector("#featured-businesses");
  if (featured) featured.innerHTML = businesses.slice(0, 3).map((business) => renderBusinessCard(business, true)).join("");
}

function renderCategories() {
  const mount = document.querySelector("#category-filters");
  if (!mount) return;
  mount.innerHTML = CATEGORIES.map((category) => `<button class="category-chip" type="button" aria-pressed="false" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join("");
}

function renderDirectory() {
  const locationSelect = document.querySelector("#location-filter");
  if (!locationSelect) return;
  [...new Set(businesses.map((business) => business.location))].sort().forEach((location) => locationSelect.add(new Option(location, location)));
  const controls = { search: document.querySelector("#business-search"), type: document.querySelector("#type-filter"), location: locationSelect, sort: document.querySelector("#sort-filter"), categories: document.querySelector("#category-filters") };
  const update = () => {
    const query = controls.search.value.trim().toLowerCase();
    const selectedCategories = [...controls.categories.querySelectorAll('[aria-pressed="true"]')].map((chip) => chip.dataset.category);
    let results = businesses.filter((business) => {
      const searchable = [business.name, business.description, business.location, business.category, business.type, ...business.productTags].join(" ").toLowerCase();
      return (!query || searchable.includes(query)) && (!controls.type.value || business.type === controls.type.value) && (!controls.location.value || business.location === controls.location.value) && (!selectedCategories.length || selectedCategories.includes(business.category));
    });
    if (controls.sort.value === "az") results.sort((a, b) => a.name.localeCompare(b.name));
    else results.sort((a, b) => b.created - a.created);
    document.querySelector("#business-results").innerHTML = results.map((business) => renderBusinessCard(business)).join("");
    document.querySelector("#business-results").hidden = results.length === 0;
    document.querySelector("#empty-state").hidden = results.length !== 0;
    const activeCount = Number(Boolean(query)) + Number(Boolean(controls.type.value)) + Number(Boolean(controls.location.value)) + selectedCategories.length;
    document.querySelector("#active-filter-count").textContent = `${activeCount} active filter${activeCount === 1 ? "" : "s"} · ${results.length} result${results.length === 1 ? "" : "s"}`;
  };
  controls.search.addEventListener("input", update);
  [controls.type, controls.location, controls.sort].forEach((control) => control.addEventListener("change", update));
  controls.categories.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-category]");
    if (!chip) return;
    chip.setAttribute("aria-pressed", chip.getAttribute("aria-pressed") === "true" ? "false" : "true");
    update();
  });
  const clear = () => {
    controls.search.value = "";
    controls.type.value = "";
    controls.location.value = "";
    controls.sort.value = "newest";
    controls.categories.querySelectorAll("[data-category]").forEach((chip) => chip.setAttribute("aria-pressed", "false"));
    update();
  };
  document.querySelector("#clear-filters").addEventListener("click", clear);
  document.querySelector("#empty-clear").addEventListener("click", clear);
  update();
}

function emptyChatState() {
  return { conversations: [
    { id: "northstar-grain", businessName: "Northstar Grain Co.", preview: "Thanks for reaching out!", unread: true, messages: [{ from: "them", text: "Thanks for reaching out! We can share current availability.", time: "9:42 AM" }] },
    { id: "goodfold", businessName: "Goodfold Packaging", preview: "Do you offer custom sizes?", unread: true, messages: [{ from: "me", text: "Do you offer custom sizes?", time: "Yesterday" }, { from: "them", text: "We do. What are you looking to package?", time: "Yesterday" }] },
    { id: "field-and-form", businessName: "Field & Form Textiles", preview: "We have a new linen run.", unread: false, messages: [{ from: "them", text: "We have a new linen run available next month.", time: "Mon" }] },
    { id: "oak-and-iron", businessName: "Oak & Iron Workshop", preview: "Minimum order is one piece.", unread: false, messages: [{ from: "them", text: "Our minimum order is one piece for standard items.", time: "Tue" }] },
    { id: "harbor-roast", businessName: "Harbor Roast Supply", preview: "Happy to send a sample list.", unread: false, messages: [{ from: "them", text: "Happy to send a sample list for your cafe.", time: "Wed" }] }
  ], sentCount: 0 };
}

function loadChatState() {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.conversations) && Number.isFinite(parsed.sentCount)) return parsed;
    }
  } catch (error) {
    console.warn("Trade Link chat could not be loaded from localStorage.", error);
  }
  return emptyChatState();
}

let chatState = loadChatState();
let selectedConversationId = chatState.conversations[0]?.id || "";
let typingConversationId = "";
let typingTimer;
let lastOverlayTrigger;

function saveChatState() {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatState));
  } catch (error) {
    console.warn("Trade Link chat could not be saved to localStorage.", error);
  }
}

function findConversation(id) {
  return chatState.conversations.find((conversation) => conversation.id === id);
}

function addConversation(business) {
  let conversation = findConversation(business.id);
  if (!conversation) {
    conversation = { id: business.id, businessName: business.name, preview: "Start a conversation", unread: false, messages: [] };
    chatState.conversations.unshift(conversation);
    saveChatState();
  }
  return conversation;
}

function renderConversations() {
  const list = document.querySelector(".conversation-list");
  list.innerHTML = chatState.conversations.map((conversation) => `<button class="conversation-item${conversation.id === selectedConversationId ? " is-selected" : ""}" type="button" data-conversation-id="${escapeHTML(conversation.id)}" aria-current="${conversation.id === selectedConversationId ? "true" : "false"}"><span class="conversation-name">${escapeHTML(conversation.businessName)}${conversation.unread ? '<span class="unread-dot" aria-label="Unread"></span>' : ""}</span><span class="conversation-preview">${escapeHTML(conversation.preview)}</span></button>`).join("");
}

function renderThread() {
  const thread = document.querySelector(".chat-thread");
  const conversation = findConversation(selectedConversationId);
  if (!conversation) {
    thread.innerHTML = '<div class="thread-empty"><p>Select a conversation to get started.</p></div>';
    return;
  }
  conversation.unread = false;
  thread.innerHTML = `<div class="thread-heading"><div><p class="eyebrow">Conversation</p><h3>${escapeHTML(conversation.businessName)}</h3></div></div><div class="message-list" role="log" aria-live="polite" aria-label="Messages with ${escapeHTML(conversation.businessName)}">${conversation.messages.map((message) => `<div class="message-row ${message.from === "me" ? "message-mine" : "message-theirs"}"><p class="message-bubble">${escapeHTML(message.text)}</p><time>${escapeHTML(message.time)}</time></div>`).join("")}${typingConversationId === conversation.id ? '<p class="typing-indicator" role="status">Typing<span aria-hidden="true">...</span></p>' : ""}</div><div class="limit-notice" ${chatState.sentCount < FREE_MESSAGE_LIMIT ? "hidden" : ""}><p>Free plan limit reached. Upgrade to Pro for unlimited messages</p><button type="button" class="button button-primary" data-open-pricing>Upgrade</button></div><form class="message-form"><label class="visually-hidden" for="chat-message-input">Write a message</label><input id="chat-message-input" name="message" type="text" maxlength="500" placeholder="Write a message..." autocomplete="off" required ${chatState.sentCount >= FREE_MESSAGE_LIMIT ? "disabled" : ""}><button class="button button-primary" type="submit" ${chatState.sentCount >= FREE_MESSAGE_LIMIT ? "disabled" : ""}>Send</button></form>`;
  const messageList = thread.querySelector(".message-list");
  messageList.scrollTop = messageList.scrollHeight;
  saveChatState();
}

function renderChat() {
  renderConversations();
  renderThread();
}

function openChat(businessId) {
  if (businessId) {
    const business = businessById(businessId);
    if (business) {
      selectedConversationId = addConversation(business).id;
      renderChat();
    }
  }
  const drawer = document.querySelector("#chat-drawer");
  const backdrop = document.querySelector(".drawer-backdrop");
  lastOverlayTrigger = document.activeElement;
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
  document.body.classList.add("overlay-open");
  drawer.querySelector(".chat-close").focus();
}

function closeChat() {
  const drawer = document.querySelector("#chat-drawer");
  if (!drawer.classList.contains("is-open")) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.querySelector(".drawer-backdrop").hidden = true;
  document.body.classList.remove("overlay-open");
  lastOverlayTrigger?.focus();
}

function showModal(title, content) {
  const dialog = document.querySelector(".site-modal");
  dialog.querySelector(".modal-content").innerHTML = `<p class="eyebrow">Trade Link</p><h2 id="modal-title">${escapeHTML(title)}</h2>${content}`;
  if (!dialog.open) dialog.showModal();
}

function openBusinessDetails(id) {
  const business = businessById(id);
  if (!business) return;
  showModal(business.name, `<p>${escapeHTML(business.about)}</p><h3>Products</h3><ul class="modal-list">${business.products.map((product) => `<li>${escapeHTML(product)}</li>`).join("")}</ul><dl class="detail-list"><div><dt>Minimum order</dt><dd>${escapeHTML(business.minimumOrder)}</dd></div><div><dt>Contact</dt><dd>${escapeHTML(business.contactMethod)}</dd></div></dl><button class="button button-primary" type="button" data-message-business="${escapeHTML(business.id)}">Message business</button>`);
}

function openPricing() {
  showModal("More room to grow with Pro", `<p class="modal-price">$9 <span>/ month</span></p><ul class="modal-list"><li>Unlimited messages</li><li>Featured listing</li><li>Verified badge</li><li>Product analytics</li><li>Priority support</li></ul><p class="fine-print">Subscription and payment setup are placeholders in this prototype.</p><button class="button button-primary" type="button" data-close-modal>Got it</button>`);
}

function submitEmail(form) {
  const email = form.elements.email;
  const status = form.querySelector(".form-status");
  status.textContent = "";
  if (form.elements.website.value) return;
  if (!email.value.trim() || !email.validity.valid) {
    email.setAttribute("aria-invalid", "true");
    status.textContent = "Enter a valid email address.";
    email.focus();
    return;
  }
  email.removeAttribute("aria-invalid");
  // TODO: connect to email service here
  console.log("Launch update signup:", email.value.trim());
  status.textContent = "You're on the list.";
  form.reset();
}

function sendMessage(form) {
  const input = form.elements.message;
  const text = input.value.trim();
  const conversation = findConversation(selectedConversationId);
  if (!text || !conversation || chatState.sentCount >= FREE_MESSAGE_LIMIT) return;
  const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  conversation.messages.push({ from: "me", text, time: now });
  conversation.preview = text;
  chatState.sentCount += 1;
  saveChatState();
  renderChat();
  if (chatState.sentCount >= FREE_MESSAGE_LIMIT) return;
  typingConversationId = conversation.id;
  renderThread();
  window.clearTimeout(typingTimer);
  typingTimer = window.setTimeout(() => {
    const current = findConversation(conversation.id);
    if (!current) return;
    const replies = ["Thanks for your message. Could you tell me a little more?", "That sounds like a good fit. Let me check and get back to you.", "Thanks for reaching out. I'll share a few more details shortly."];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    current.messages.push({ from: "them", text: reply, time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) });
    current.preview = reply;
    current.unread = selectedConversationId !== current.id;
    typingConversationId = "";
    saveChatState();
    renderChat();
  }, 1500);
}

function handleGlobalClick(event) {
  const viewButton = event.target.closest("[data-view-business]");
  const messageButton = event.target.closest("[data-message-business]");
  if (viewButton) openBusinessDetails(viewButton.dataset.viewBusiness);
  else if (messageButton) {
    const id = messageButton.dataset.messageBusiness;
    document.querySelector(".site-modal").close();
    openChat(id);
  } else if (event.target.closest("[data-open-pricing]")) openPricing();
  else if (event.target.closest("[data-close-modal]")) document.querySelector(".site-modal").close();
}

function trapOverlayFocus(event) {
  const drawer = document.querySelector("#chat-drawer");
  const dialog = document.querySelector(".site-modal");
  const activeOverlay = dialog.open ? dialog : drawer.classList.contains("is-open") ? drawer : null;
  if (event.key === "Escape" && drawer.classList.contains("is-open")) {
    event.preventDefault();
    closeChat();
    return;
  }
  if (event.key !== "Tab" || !activeOverlay) return;
  const focusable = [...activeOverlay.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((element) => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

function bindEvents() {
  document.querySelector(".menu-toggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    document.querySelector("#primary-navigation").classList.toggle("is-open", !expanded);
  });
  document.querySelector(".chat-launcher").addEventListener("click", () => openChat());
  document.querySelector(".chat-close").addEventListener("click", closeChat);
  document.querySelector(".drawer-backdrop").addEventListener("click", closeChat);
  document.querySelector(".conversation-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-conversation-id]");
    if (!button) return;
    selectedConversationId = button.dataset.conversationId;
    renderChat();
  });
  document.querySelector(".chat-thread").addEventListener("submit", (event) => {
    if (!event.target.matches(".message-form")) return;
    event.preventDefault();
    sendMessage(event.target);
  });
  document.addEventListener("submit", (event) => {
    if (!event.target.matches(".email-form")) return;
    event.preventDefault();
    submitEmail(event.target);
  });
  document.addEventListener("click", handleGlobalClick);
  document.addEventListener("keydown", trapOverlayFocus);
  document.querySelector(".site-modal").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
  document.querySelector(".modal-close").addEventListener("click", () => document.querySelector(".site-modal").close());
}

renderSharedShell();
renderHome();
renderCategories();
renderDirectory();
renderChat();
bindEvents();