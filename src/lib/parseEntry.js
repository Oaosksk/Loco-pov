/**
 * parseEntry.js — THE CORE FILE
 * 
 * Parses user input text with @ commands and extracts structured data.
 * Routes to: expenses, health, reminders, subscriptions, goals, casual notes, uploads.
 */

// ═══════════════════════════════════════════
// Tag definitions
// ═══════════════════════════════════════════
const TAG_MAP = {
  '@e':            'expense',
  '@expense':      'expense',
  '@exp':          'expense',
  '@r':            'reminder',
  '@remind':       'reminder',
  '@reminder':     'reminder',
  '@h':            'health',
  '@health':       'health',
  '@casual':       'casual',
  '@c':            'casual',
  '@journal':      'casual',
  '@upload':       'upload',
  '@file':         'upload',
  '@attach':       'upload',
  '@sub':          'subscription',
  '@subscription': 'subscription',
  '@g':            'goal',
  '@goal':         'goal',
}

// ═══════════════════════════════════════════
// Expense category detection
// ═══════════════════════════════════════════
const EXPENSE_CATEGORIES = {
  transport: ['petrol', 'diesel', 'fuel', 'uber', 'ola', 'cab', 'taxi', 'auto', 'bus', 'train', 'metro', 'flight', 'parking', 'toll'],
  food: ['food', 'lunch', 'dinner', 'breakfast', 'snack', 'coffee', 'tea', 'chai', 'restaurant', 'zomato', 'swiggy', 'biryani', 'pizza', 'burger', 'juice', 'water', 'drink', 'ice cream', 'dessert', 'cake', 'bakery', 'milk', 'groceries', 'grocery', 'fruits', 'vegetables'],
  shopping: ['shopping', 'clothes', 'shoes', 'amazon', 'flipkart', 'myntra', 'electronics', 'phone', 'laptop', 'accessories', 'gift', 'watch'],
  entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'games', 'gaming', 'concert', 'show', 'party', 'club', 'bar', 'pub'],
  health: ['doctor', 'medicine', 'hospital', 'pharmacy', 'medical', 'gym', 'fitness', 'health', 'dental', 'eye', 'lab', 'test', 'checkup'],
  bills: ['bill', 'electricity', 'water bill', 'gas bill', 'internet', 'wifi', 'mobile', 'recharge', 'rent', 'emi', 'insurance', 'tax'],
  education: ['book', 'books', 'course', 'class', 'tuition', 'college', 'school', 'exam', 'study', 'udemy', 'coursera'],
  personal: ['haircut', 'salon', 'spa', 'laundry', 'dry clean', 'grooming'],
}

function detectExpenseCategory(description) {
  const lower = description.toLowerCase()
  for (const [category, keywords] of Object.entries(EXPENSE_CATEGORIES)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return category
    }
  }
  return 'other'
}

// ═══════════════════════════════════════════
// Amount extraction
// ═══════════════════════════════════════════
function extractAmount(text) {
  // Match patterns like: 159, ₹159, rs159, rs.159, 1,500, 1500.50
  const patterns = [
    /₹\s*([\d,]+(?:\.\d{1,2})?)/,
    /rs\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /\b([\d,]+(?:\.\d{1,2})?)\b/,
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(amount) && amount > 0) return amount
    }
  }
  return null
}

// ═══════════════════════════════════════════
// Health metric detection
// ═══════════════════════════════════════════
const HEALTH_METRICS = {
  workout: ['workout', 'exercise', 'gym', 'run', 'running', 'jog', 'jogging', 'walk', 'walking', 'swim', 'swimming', 'cycling', 'yoga', 'pushup', 'pushups', 'situp', 'situps', 'plank', 'stretch', 'cardio', 'hiit', 'lift', 'lifting', 'weights'],
  weight: ['weight', 'weigh', 'kg', 'kgs'],
  sleep: ['sleep', 'slept', 'nap', 'rest'],
  steps: ['steps', 'step'],
  water: ['water', 'hydration', 'litres', 'liters', 'glasses', 'glass', 'bottles', 'bottle'],
  mood: ['mood', 'feeling', 'felt', 'happy', 'sad', 'anxious', 'stressed', 'calm', 'good', 'bad', 'great', 'terrible', 'okay', 'fine'],
}

function detectHealthMetric(text) {
  const lower = text.toLowerCase()
  for (const [metric, keywords] of Object.entries(HEALTH_METRICS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return metric
    }
  }
  return 'custom'
}

function extractHealthValue(text) {
  // Match value + unit patterns like: 45min, 72.5kg, 8hrs, 3000steps, 2L, 7 hours
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(min|mins|minutes?|hr|hrs|hours?|h)\b/i,
    /(\d+(?:\.\d+)?)\s*(kg|kgs|kilos?|lbs?|pounds?)\b/i,
    /(\d+(?:\.\d+)?)\s*(steps?|km|mi|miles?|metres?|meters?)\b/i,
    /(\d+(?:\.\d+)?)\s*(l|litres?|liters?|ml|glasses?|bottles?|cups?)\b/i,
    /(\d+(?:\.\d+)?)\s*(cal|kcal|calories?)\b/i,
    /\b(\d+(?:\.\d+)?)\b/,  // fallback: just a number
  ]

  const unitMap = {
    'min': 'min', 'mins': 'min', 'minute': 'min', 'minutes': 'min',
    'hr': 'hr', 'hrs': 'hr', 'hour': 'hr', 'hours': 'hr', 'h': 'hr',
    'kg': 'kg', 'kgs': 'kg', 'kilo': 'kg', 'kilos': 'kg',
    'lb': 'lb', 'lbs': 'lb', 'pound': 'lb', 'pounds': 'lb',
    'step': 'steps', 'steps': 'steps',
    'km': 'km', 'mi': 'mi', 'mile': 'mi', 'miles': 'mi',
    'l': 'L', 'litre': 'L', 'litres': 'L', 'liter': 'L', 'liters': 'L',
    'ml': 'ml', 'glass': 'glasses', 'glasses': 'glasses',
    'bottle': 'bottles', 'bottles': 'bottles', 'cup': 'cups', 'cups': 'cups',
    'cal': 'cal', 'kcal': 'cal', 'calorie': 'cal', 'calories': 'cal',
    'metre': 'm', 'metres': 'm', 'meter': 'm', 'meters': 'm',
  }

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const value = parseFloat(match[1])
      const rawUnit = match[2]?.toLowerCase() || ''
      const unit = unitMap[rawUnit] || rawUnit || ''
      if (!isNaN(value) && value > 0) return { value, unit }
    }
  }
  return { value: null, unit: '' }
}

// ═══════════════════════════════════════════
// Time parsing for @R reminders
// ═══════════════════════════════════════════
function parseReminderTime(text) {
  const now = new Date()
  const lower = text.toLowerCase()

  // "9pm", "9 pm", "10:30am", "10:30 am"
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i)
  let hours = null, minutes = 0

  if (timeMatch) {
    hours = parseInt(timeMatch[1])
    minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
    const period = timeMatch[3].toLowerCase()
    if (period === 'pm' && hours !== 12) hours += 12
    if (period === 'am' && hours === 12) hours = 0
  }

  // "in X hours/minutes"
  const inMatch = lower.match(/in\s+(\d+)\s*(hour|hr|hours|hrs|minute|min|minutes|mins)/i)
  if (inMatch) {
    const val = parseInt(inMatch[1])
    const unit = inMatch[2].toLowerCase()
    const result = new Date(now)
    if (unit.startsWith('hour') || unit.startsWith('hr')) {
      result.setHours(result.getHours() + val)
    } else {
      result.setMinutes(result.getMinutes() + val)
    }
    return result.toISOString()
  }

  // Determine the date
  let targetDate = new Date(now)
  
  if (lower.includes('tomorrow')) {
    targetDate.setDate(targetDate.getDate() + 1)
  } else if (lower.includes('monday') || lower.includes('mon')) {
    targetDate = getNextWeekday(now, 1)
  } else if (lower.includes('tuesday') || lower.includes('tue')) {
    targetDate = getNextWeekday(now, 2)
  } else if (lower.includes('wednesday') || lower.includes('wed')) {
    targetDate = getNextWeekday(now, 3)
  } else if (lower.includes('thursday') || lower.includes('thu')) {
    targetDate = getNextWeekday(now, 4)
  } else if (lower.includes('friday') || lower.includes('fri')) {
    targetDate = getNextWeekday(now, 5)
  } else if (lower.includes('saturday') || lower.includes('sat')) {
    targetDate = getNextWeekday(now, 6)
  } else if (lower.includes('sunday') || lower.includes('sun')) {
    targetDate = getNextWeekday(now, 0)
  }

  // morning/afternoon/evening/night shortcuts
  if (hours === null) {
    if (lower.includes('morning')) hours = 8
    else if (lower.includes('afternoon')) hours = 14
    else if (lower.includes('evening')) hours = 18
    else if (lower.includes('night')) hours = 21
  }

  if (hours !== null) {
    targetDate.setHours(hours, minutes, 0, 0)
    
    // If time already passed today and no specific day mentioned, push to tomorrow
    if (targetDate <= now && !lower.includes('tomorrow') && !lower.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/i)) {
      targetDate.setDate(targetDate.getDate() + 1)
    }
    
    return targetDate.toISOString()
  }

  // Fallback: tomorrow 8:00 AM
  const fallback = new Date(now)
  fallback.setDate(fallback.getDate() + 1)
  fallback.setHours(8, 0, 0, 0)
  return fallback.toISOString()
}

function getNextWeekday(from, dayOfWeek) {
  const result = new Date(from)
  const currentDay = result.getDay()
  const daysUntil = (dayOfWeek - currentDay + 7) % 7
  result.setDate(result.getDate() + (daysUntil === 0 ? 7 : daysUntil))
  return result
}

// ═══════════════════════════════════════════
// Subscription cycle detection
// ═══════════════════════════════════════════
function detectSubscriptionCycle(text) {
  const lower = text.toLowerCase()
  if (lower.includes('yearly') || lower.includes('annual')) return 'yearly'
  if (lower.includes('quarterly')) return 'quarterly'
  if (lower.includes('weekly')) return 'weekly'
  return 'monthly' // default
}

// ═══════════════════════════════════════════
// Clean text helpers 
// ═══════════════════════════════════════════
function removeTag(text, tag) {
  // Remove the @tag from the text (case-insensitive)
  return text.replace(new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '').trim()
}

function cleanDescription(text) {
  // Remove amounts, tags, and extra whitespace
  return text
    .replace(/₹\s*[\d,]+(?:\.\d{1,2})?/g, '')
    .replace(/\brs\.?\s*[\d,]+(?:\.\d{1,2})?/gi, '')
    .replace(/\b\d+(?:\.\d+)?\s*(?:min|mins|minutes?|hr|hrs|hours?|h|kg|kgs|steps?|km|l|litres?|liters?|ml|glasses?|bottles?|cal|kcal)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ═══════════════════════════════════════════
// Goal entry parser — numbered list support
// ═══════════════════════════════════════════
/**
 * Parses goal text into a task-list goal.
 *
 * Supports two formats:
 *   Multi-line:  "1. Go to PG\n2. Complete Running"
 *   Inline list: "1. Go to PG 2. Complete Running"
 *   Single line: "Learn guitar"  →  one task with same title as goal
 *
 * Returns: { type, raw, data: { title, tasks[], progress, target } }
 */
function parseGoalEntry(textWithoutTag, raw) {
  // Normalise newlines so we can split uniformly
  const normalised = textWithoutTag.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Regex: matches "1.", "2.", "10." at the start of a word boundary
  const numberedItemRegex = /(?:^|\n)\s*\d+\.\s+/g

  const hasNumberedList = numberedItemRegex.test(normalised)

  let tasks = []

  if (hasNumberedList) {
    // Split on "N. " markers — handles both newline & inline variants
    // e.g. "1. task one 2. task two" → ["task one", "task two"]
    const parts = normalised
      .split(/\n?\s*\d+\.\s+/)
      .map(s => s.trim())
      .filter(Boolean)

    tasks = parts.map((title, idx) => ({
      title: title.charAt(0).toUpperCase() + title.slice(1),
      done: false,
      sort_order: idx + 1,
    }))
  } else {
    // Single-line goal → one task, goal title = task title
    const title = textWithoutTag.trim().charAt(0).toUpperCase() + textWithoutTag.trim().slice(1) || 'New Goal'
    tasks = [{ title, done: false, sort_order: 1 }]
  }

  // Goal title = first task title (or the whole text if single)
  const goalTitle = tasks.length === 1
    ? tasks[0].title
    : tasks[0].title  // leading task as the goal name

  return {
    type: 'goal',
    raw,
    data: {
      title: goalTitle,
      tasks,
      progress: 0,
      target: tasks.length,
    },
  }
}

// ═══════════════════════════════════════════
// Main parser
// ═══════════════════════════════════════════
/**
 * Parse a single input line and return structured data.
 * 
 * @param {string} text - The raw input text
 * @returns {{ type: string, raw: string, data: object }}
 */
export function parseEntry(text) {
  if (!text || !text.trim()) {
    return { type: 'casual', raw: text, data: { content: text } }
  }

  const raw = text.trim()
  
  // Find the tag
  let detectedType = null
  let matchedTag = null
  
  // Sort tags by length (longest first) to match @expense before @e
  const sortedTags = Object.keys(TAG_MAP).sort((a, b) => b.length - a.length)
  
  for (const tag of sortedTags) {
    const regex = new RegExp(`(^|\\s)${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i')
    if (regex.test(raw)) {
      detectedType = TAG_MAP[tag]
      matchedTag = tag
      break
    }
  }

  // No tag found → casual note
  if (!detectedType) {
    return {
      type: 'casual',
      raw,
      data: { content: raw },
    }
  }

  const textWithoutTag = removeTag(raw, matchedTag)

  // ─── Expense ───
  if (detectedType === 'expense') {
    const amount = extractAmount(textWithoutTag)
    const descClean = cleanDescription(textWithoutTag)
      .replace(/\b\d+(?:\.\d{1,2})?\b/, '')  // remove standalone number (the amount)
      .trim()
    const description = descClean || textWithoutTag.replace(/\d+/g, '').trim() || 'Expense'
    const category = detectExpenseCategory(description)
    
    return {
      type: 'expense',
      raw,
      data: {
        description: description.charAt(0).toUpperCase() + description.slice(1),
        amount: amount || 0,
        category,
        date: new Date().toISOString().split('T')[0],
      },
    }
  }

  // ─── Reminder ───
  if (detectedType === 'reminder') {
    const remind_at = parseReminderTime(textWithoutTag)
    // Remove time-related words from title
    const title = textWithoutTag
      .replace(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, '')
      .replace(/\b(?:today|tonight|tomorrow|morning|afternoon|evening|night)\b/gi, '')
      .replace(/\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/gi, '')
      .replace(/\bin\s+\d+\s*(?:hours?|hrs?|minutes?|mins?)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Reminder'

    return {
      type: 'reminder',
      raw,
      data: {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        remind_at,
      },
    }
  }

  // ─── Health ───
  if (detectedType === 'health') {
    const metric = detectHealthMetric(textWithoutTag)
    const { value, unit } = extractHealthValue(textWithoutTag)
    const note = cleanDescription(textWithoutTag) || textWithoutTag
    
    return {
      type: 'health',
      raw,
      data: {
        metric,
        value,
        unit,
        note: note.charAt(0).toUpperCase() + note.slice(1),
        date: new Date().toISOString().split('T')[0],
      },
    }
  }

  // ─── Subscription ───
  if (detectedType === 'subscription') {
    const amount = extractAmount(textWithoutTag)
    const cycle = detectSubscriptionCycle(textWithoutTag)
    const name = textWithoutTag
      .replace(/₹?\s*[\d,]+(?:\.\d{1,2})?/g, '')
      .replace(/\b(?:monthly|yearly|annual|quarterly|weekly)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Subscription'

    return {
      type: 'subscription',
      raw,
      data: {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount: amount || 0,
        cycle,
      },
    }
  }

  // ─── Goal ───
  if (detectedType === 'goal') {
    return parseGoalEntry(textWithoutTag, raw)
  }

  // ─── Upload ───
  if (detectedType === 'upload') {
    return {
      type: 'upload',
      raw,
      data: {
        note: textWithoutTag || 'File upload',
      },
    }
  }

  // ─── Casual (fallback) ───
  return {
    type: 'casual',
    raw,
    data: { content: raw },
  }
}

/**
 * Detect tags in text (for UI highlighting while typing)
 */
export function detectTags(text) {
  if (!text) return []
  const found = []
  const sortedTags = Object.keys(TAG_MAP).sort((a, b) => b.length - a.length)
  const usedTypes = new Set()
  
  for (const tag of sortedTags) {
    const regex = new RegExp(`(^|\\s)${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i')
    const type = TAG_MAP[tag]
    if (regex.test(text) && !usedTypes.has(type)) {
      found.push({ tag, type })
      usedTypes.add(type)
    }
  }
  return found
}

/**
 * Get tag color for UI display
 */
export function getTagColor(type) {
  const colors = {
    expense:      { bg: 'bg-green-500/20', text: 'text-green-400', label: '💰 Expense' },
    reminder:     { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '⏰ Reminder' },
    health:       { bg: 'bg-red-500/20', text: 'text-red-400', label: '❤️ Health' },
    casual:       { bg: 'bg-purple-500/20', text: 'text-purple-400', label: '📝 Casual' },
    upload:       { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '📎 Upload' },
    subscription: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: '🔄 Subscription' },
    goal:         { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: '🎯 Goal' },
  }
  return colors[type] || colors.casual
}

/**
 * Get all available @ commands for help/autocomplete
 */
export function getAvailableCommands() {
  return [
    { tag: '@e', aliases: ['@expense', '@exp'], description: 'Log an expense', example: 'petrol 159 @e' },
    { tag: '@R', aliases: ['@remind', '@reminder'], description: 'Set a reminder', example: 'call mum @R 9pm tonight' },
    { tag: '@h', aliases: ['@health'], description: 'Log health data', example: 'gym 45min @h' },
    { tag: '@casual', aliases: ['@c', '@journal'], description: 'Casual note', example: 'feeling good @casual' },
    { tag: '@sub', aliases: ['@subscription'], description: 'Track subscription', example: 'netflix 649 @sub monthly' },
    { tag: '@g', aliases: ['@goal'], description: 'Add a goal', example: 'learn guitar @g' },
    { tag: '@upload', aliases: ['@file', '@attach'], description: 'Attach file', example: 'receipt @upload' },
  ]
}
