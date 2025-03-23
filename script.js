// DOM Elements
const chatBox = document.getElementById("chat-box")
const messageInput = document.getElementById("message-input")
const sendButton = document.getElementById("send-button")
const themeToggle = document.getElementById("theme-toggle")
const typingIndicator = document.getElementById("typing-indicator")
const emptyState = document.getElementById("empty-state")
const clearChatButton = document.getElementById("clear-chat")
const suggestionChips = document.querySelectorAll(".suggestion-chip")
const mobileMenuToggle = document.getElementById("mobile-menu-toggle")
const sidebar = document.querySelector(".sidebar")
const newChatBtn = document.querySelector(".new-chat-btn")
const chatHistory = document.getElementById("chat-history")

// ZumyNext configuration
const perintah =
  "Kamu adalah assisten AI yang diberi nama ZumyNext, pembuatmu adalah Angga a.k.a iZumy, umurnya 19 tahun, dia lulusan teknik komputer dan jaringan, dia memiliki kepribadian baik, perhatian, lucu, bertanggung jawab, dan ganteng, dia sedang mengembangkan projek bot WhatsApp, dia berasal dari Yogyakarta, webnya adalah zumynext.tech"

// Track conversation state
let conversationStarted = false
let currentChatId = null
let conversations = {}

// Initialize chat
function initChat() {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem("zumyTheme")
  if (savedTheme === "dark") {
    document.body.classList.add("dark")
    updateThemeIcon(true)
  }

  // Load saved conversations
  loadConversations()

  // Auto-resize textarea
  messageInput.addEventListener("input", autoResizeTextarea)

  // Focus the input field
  messageInput.focus()

  // Set up suggestion chips
  suggestionChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      messageInput.value = chip.textContent
      sendMessage()
    })
  })

  // Mobile menu toggle
  mobileMenuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active")
  })

  // New chat button
  newChatBtn.addEventListener("click", startNewChat)
}

// Auto-resize textarea
function autoResizeTextarea() {
  messageInput.style.height = "auto"
  messageInput.style.height = messageInput.scrollHeight + "px"
}

// Helper function to format messages with markdown-like syntax
function formatMessage(text) {
  // Handle code blocks with syntax highlighting
  text = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')

  // Handle inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>")

  // Handle bold text
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")

  // Handle italic text
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>")

  // Handle links
  text = text.replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" target="_blank">$1</a>')

  // Handle line breaks
  text = text.replace(/\n/g, "<br>")

  return text
}

// Function to append a message to the chat
function appendMessage(sender, message, isImage = false) {
  // Hide empty state if visible
  if (emptyState && emptyState.style.display !== "none") {
    emptyState.style.display = "none"
    conversationStarted = true
  }

  const messageWrapper = document.createElement("div")
  messageWrapper.className = `message-wrapper ${sender}`

  const messageInner = document.createElement("div")
  messageInner.className = "message-inner"

  const avatar = document.createElement("div")
  avatar.className = `avatar ${sender}`

  if (sender === "ai") {
    avatar.textContent = "Z"
  } else {
    avatar.textContent = "U"
  }

  const messageContent = document.createElement("div")
  messageContent.className = "message-content"

  if (isImage) {
    messageContent.innerHTML = `<img src="${message}" alt="Image" style="max-width: 100%; border-radius: 8px;">`
  } else {
    messageContent.innerHTML = formatMessage(message)
  }

  messageInner.appendChild(avatar)
  messageInner.appendChild(messageContent)
  messageWrapper.appendChild(messageInner)
  chatBox.appendChild(messageWrapper)

  // Apply entry animation
  messageWrapper.style.animation = "slideUp 0.3s ease forwards"

  // Auto-scroll to the latest message with smooth animation
  setTimeout(() => {
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: "smooth",
    })
  }, 100)

  // Save message to current conversation
  if (currentChatId) {
    if (!conversations[currentChatId].messages) {
      conversations[currentChatId].messages = []
    }
    conversations[currentChatId].messages.push({
      sender,
      message,
      timestamp: new Date().toISOString(),
    })
    saveConversations()
  }
}

// Function to send a text message
async function sendMessage() {
  const text = messageInput.value.trim()
  if (!text) return

  // Create a new chat if none exists
  if (!currentChatId) {
    startNewChat(text)
  }

  appendMessage("user", text)
  messageInput.value = ""
  messageInput.style.height = "auto"

  // Disable the send button while processing
  sendButton.disabled = true
  sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

  // Show typing indicator
  typingIndicator.style.display = "block"

  try {
    const response = await fetch("https://luminai.my.id/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, user: "user", prompt: perintah }),
    })

    const result = await response.json()

    // Simulate a slight delay for more natural feeling
    setTimeout(() => {
      appendMessage("ai", result.result)

      // Update chat title if this is the first message
      if (conversations[currentChatId].messages.length <= 2) {
        updateChatTitle(currentChatId, text)
      }
    }, 500)
  } catch (error) {
    appendMessage("ai", "Maaf, terjadi kesalahan saat menghubungi server. Silakan coba lagi setelah beberapa saat.")
  } finally {
    typingIndicator.style.display = "none" // Hide typing indicator after response
    sendButton.disabled = false // Re-enable the send button
    sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>'

    // Focus the input field after sending
    messageInput.focus()
  }
}

// Start a new chat
function startNewChat(initialMessage = null) {
  // Generate a new chat ID
  currentChatId = "chat_" + Date.now()

  // Clear the chat box
  while (chatBox.firstChild) {
    chatBox.removeChild(chatBox.firstChild)
  }

  // Show empty state
  emptyState.style.display = "flex"
  conversationStarted = false

  // Create a new conversation entry
  conversations[currentChatId] = {
    id: currentChatId,
    title: initialMessage ? truncateText(initialMessage, 30) : "New Conversation",
    timestamp: new Date().toISOString(),
    messages: [],
  }

  // Add to chat history
  addChatToHistory(currentChatId)

  // Save conversations
  saveConversations()

  // If there's an initial message, send it
  if (initialMessage && typeof initialMessage === "string") {
    messageInput.value = initialMessage
    sendMessage()
  }

  // Close mobile sidebar if open
  sidebar.classList.remove("active")
}

// Add a chat to the history sidebar
function addChatToHistory(chatId) {
  const chat = conversations[chatId]
  if (!chat) return

  // Remove empty history message if present
  const emptyHistory = chatHistory.querySelector(".empty-history")
  if (emptyHistory) {
    emptyHistory.remove()
  }

  // Create history item
  const historyItem = document.createElement("div")
  historyItem.className = "history-item"
  historyItem.dataset.chatId = chatId
  historyItem.innerHTML = `
        <i class="fas fa-message"></i>
        <span>${chat.title}</span>
    `

  // Add active class if this is the current chat
  if (chatId === currentChatId) {
    historyItem.classList.add("active")
  }

  // Add click event to load this chat
  historyItem.addEventListener("click", () => {
    loadChat(chatId)
  })

  // Add to history (at the top)
  chatHistory.insertBefore(historyItem, chatHistory.firstChild)
}

// Load a specific chat
function loadChat(chatId) {
  if (!conversations[chatId]) return

  // Update current chat ID
  currentChatId = chatId

  // Clear the chat box
  while (chatBox.firstChild) {
    chatBox.removeChild(chatBox.firstChild)
  }

  // Hide empty state
  emptyState.style.display = "none"
  conversationStarted = true

  // Update active class in history
  const historyItems = chatHistory.querySelectorAll(".history-item")
  historyItems.forEach((item) => {
    item.classList.remove("active")
    if (item.dataset.chatId === chatId) {
      item.classList.add("active")
    }
  })

  // Load messages
  const chat = conversations[chatId]
  if (chat.messages && chat.messages.length > 0) {
    chat.messages.forEach((msg) => {
      appendMessage(msg.sender, msg.message, false)
    })
  }

  // Close mobile sidebar
  sidebar.classList.remove("active")
}

// Update chat title
function updateChatTitle(chatId, message) {
  if (!conversations[chatId]) return

  // Update title in memory
  conversations[chatId].title = truncateText(message, 30)

  // Update in DOM
  const historyItem = chatHistory.querySelector(`.history-item[data-chatid="${chatId}"]`)
  if (historyItem) {
    const titleSpan = historyItem.querySelector("span")
    if (titleSpan) {
      titleSpan.textContent = conversations[chatId].title
    }
  }

  // Save conversations
  saveConversations()
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Save conversations to localStorage
function saveConversations() {
  localStorage.setItem("zumyConversations", JSON.stringify(conversations))
}

// Load conversations from localStorage
function loadConversations() {
  const saved = localStorage.getItem("zumyConversations")
  if (saved) {
    conversations = JSON.parse(saved)

    // Populate chat history
    if (Object.keys(conversations).length > 0) {
      chatHistory.innerHTML = "" // Clear "no conversations" message

      // Sort conversations by timestamp (newest first)
      const sortedChats = Object.values(conversations).sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp)
      })

      sortedChats.forEach((chat) => {
        addChatToHistory(chat.id)
      })
    }
  }
}

// Clear chat conversation
function clearChat() {
  // Confirm before clearing
  if (Object.keys(conversations).length > 0 && confirm("Are you sure you want to clear all conversations?")) {
    // Clear all conversations
    conversations = {}
    localStorage.removeItem("zumyConversations")

    // Clear chat history
    chatHistory.innerHTML = '<div class="empty-history"><p>No recent conversations</p></div>'

    // Start a new chat
    startNewChat()
  }
}

// Update theme toggle icon
function updateThemeIcon(isDark) {
  const icon = themeToggle.querySelector("i")
  const text = themeToggle.querySelector("span")

  if (isDark) {
    icon.className = "fas fa-sun"
    text.textContent = "Light mode"
  } else {
    icon.className = "fas fa-moon"
    text.textContent = "Dark mode"
  }
}

// Toggle dark mode
function toggleTheme() {
  const isDarkMode = document.body.classList.toggle("dark")
  updateThemeIcon(isDarkMode)

  // Save preference
  localStorage.setItem("zumyTheme", isDarkMode ? "dark" : "light")
}

// Event Listeners
sendButton.addEventListener("click", sendMessage)
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
})
themeToggle.addEventListener("click", toggleTheme)
clearChatButton.addEventListener("click", clearChat)

// Initialize when everything is loaded
window.addEventListener("load", initChat)

