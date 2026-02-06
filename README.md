# 🧭 FileNavigator – An Experiment in Design Documentation

> **"What if documentation wasn't something you maintain on the side, but something that naturally evolves with the design process?"**

---

## 💭 The Exploration

This is an **MVP experiment** exploring a simple idea: documentation often feels harder than it should be because it lives *separate* from the design process.

Instead of writing and rewriting documentation across Figma, Notion, Confluence, and various docs, I'm experimenting with a workflow where **design becomes the entry point to project knowledge**.

### The Inspiration: Alt Attributes

The concept came from the web: images don't explain themselves, so we attach `alt` attributes directly to them.

```html
<img src="component.png" alt="Navigation bar with user profile and notifications" />
```

I'm applying the same principle to design: **every screen, component, and user flow carries its own context** – what it does, why it exists, and how it fits into the bigger picture.

### The Vision

Each new component, page, variant, user flow, or user test continuously feeds the project with information. That knowledge is interconnected and evolves over time.

For **developers**, this means asking *"Where is the user flow?"* or *"What happens in this state?"* and getting direct answers, not a list of links to read through.

For **designers**, it means less friction. Significant changes can be documented quickly, right when they happen. AI helps improve and refine the text using existing project knowledge – not rewriting it, but putting it into context and structuring it properly.

### Current State (MVP)

Right now, everything intentionally lives **locally and close to the design** in Figma. The plan is to eventually connect with tools like Notion or Confluence, but the focus is on making documentation accessible, contextual, and actionable within the design environment first.

---

## 🎨 How It Works (Current MVP)

Figma isn't meant to replace other tools – it's where the knowledge becomes **accessible, contextual, and actionable**.

```
Frame: "Onboarding-Step-1" 
  → Description: "First step of user registration. Shows email input..."
  → Features: "Email validation, SSO options, Progress indicator"
  → Category: "User Flow"
  → Connected to: Project Knowledge Base
```

This documentation is **searchable**, **browsable**, and **editable** directly from the design environment without breaking focus or switching mental context.

---

## ✨ Key Features

### 📝 Screen Documentation
Attach rich documentation directly to any Frame:
- **Description**: What is this screen? What's its purpose?
- **Features**: What functionality does it contain?
- **Category**: Pages, User Flows, Components, Modals...
- **Linked Knowledge**: Connect to design system guidelines

### 📚 Project Knowledge Base
Create a central knowledge hub for your entire project:
- **Vision & Goals**: What are we building and why?
- **Target Audience**: Who are our users?
- **Core Features**: What does the product do?
- **Design Language**: Colors, typography, spacing principles
- **Terminology**: Glossary of project-specific terms

### 🔍 AI-Powered Natural Language Search
Stop scrolling through hundreds of frames. Just ask:
- *"Where is the onboarding user flow?"*
- *"Show me all screens with payment functionality"*
- *"What's our button hover state?"*
- *"Which screens use the new navigation?"*

The AI understands context and finds relevant screens and documentation instantly.

### 🎯 One-Click Navigation
Search results aren't just text – click any result to:
1. **Zoom directly to the Frame** in your Figma file
2. **View the full documentation** with formatted content (Markdown support!)

### 🤖 AI Writing Assistant
Struggling to write documentation? The built-in AI helps:
- Improve and structure your descriptions
- Format feature lists consistently
- Polish your design language documentation
- Suggest terminology definitions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Figma Desktop App
- OpenAI API Key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/Litorian113/FileNavigator.git
cd FileNavigator

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your OpenAI API key to .env

# Build the plugin
npm run build
```

### Load in Figma
1. Open Figma Desktop
2. Go to *Plugins* → *Development* → *Import plugin from manifest...*
3. Select the `manifest.json` file
4. Done! Find FileNavigator in your Plugins menu

---

## 📖 How to Use

### 1. Initial Setup (Onboarding)
When you first open FileNavigator, you'll be guided through project setup:

1. **Project Name** – What's this Figma file about?
2. **Vision & Goals** – What are we building and why?
3. **Target Audience** – Who are our users?
4. **Core Features** – What does the product do?
5. **Design Language** – Colors, typography, spacing
6. **Terminology** – Project-specific glossary

This creates your **Project Knowledge Base** – searchable and always accessible.

### 2. Document a Screen
1. Select any Frame in Figma
2. Open FileNavigator → **Editor** tab
3. Fill in:
   - **Description**: What is this screen?
   - **Features**: Key functionality (comma-separated)
   - **Category**: Type of screen
4. Click **Save** – documentation is stored in the Frame itself!

### 3. Search Your Documentation
Switch to the **Search** tab:

| Query Type | Example | How It Works |
|------------|---------|--------------|
| Keywords | `button` | Finds all screens mentioning "button" |
| Features | `payment` | Searches through feature tags |
| Natural Language | `Where is checkout?` | AI analyzes and finds relevant screens |
| Questions | `What colors do we use?` | AI searches knowledge base |

Results show:
- 📚 **Knowledge Base entries** – Click to view full documentation
- 🖼️ **Screens** – Click to zoom to the frame AND view details

### 4. Browse Everything
The **Browse** tab shows all documented content:
- Project Knowledge (Vision, Audience, Features, etc.)
- Screens grouped by category

Click any item to view full, formatted documentation.

---

## 🏗️ Architecture

```
FileNavigator/
├── src/
│   ├── plugin/              # Figma Plugin (TypeScript)
│   │   ├── index.ts         # Main plugin logic & message handlers
│   │   ├── handlers/        # Specialized handlers
│   │   │   ├── searchHandler.ts      # Search logic
│   │   │   ├── screenCacheHandler.ts # Screen management
│   │   │   └── knowledgeBaseHandler.ts
│   │   ├── data/            # Static knowledge base
│   │   └── utils/           # Helper functions
│   │
│   ├── ui/                  # React UI (TypeScript + React 18)
│   │   ├── components/
│   │   │   ├── Search/      # AI-powered search interface
│   │   │   ├── Browse/      # Browse all documentation
│   │   │   ├── Editor/      # Edit screen documentation
│   │   │   ├── Onboarding/  # Project setup wizard
│   │   │   └── DetailView/  # View formatted documentation
│   │   ├── context/         # React Context (global state)
│   │   └── styles/          # CSS styles
│   │
│   └── shared/              # Shared TypeScript types
│
├── dist/                    # Build output (Figma loads this)
│   ├── code.js              # Compiled plugin code
│   └── ui.html              # Single-file UI bundle
│
├── manifest.json            # Figma plugin manifest
└── package.json
```

### Tech Stack
| Layer | Technology | Why |
|-------|------------|-----|
| Plugin | TypeScript + esbuild | Fast builds, ES6 for Figma compatibility |
| UI | React 18 + Vite | Modern, fast, single-file output |
| AI | OpenAI GPT-4o-mini | Cost-effective, fast responses |
| Storage | Figma Plugin Data | No external DB, travels with file |

---

## 💾 Data Storage

All documentation is stored in Figma's native `pluginData`:

```typescript
// Per-Frame documentation
frame.setPluginData('sid', 'unique-screen-id');
frame.setPluginData('description', 'What this screen does...');
frame.setPluginData('features', 'login, oauth, validation');
frame.setPluginData('category', 'user-flows');

// Document-level Knowledge Base
figma.root.setPluginData('mainKnowledgeBase', JSON.stringify({
  projectName: 'My App',
  vision: 'We are building...',
  audience: 'Young professionals who...',
  features: '• Feature 1\n• Feature 2',
  design: 'Primary color: #0066FF...',
  terminology: '• Term = Definition'
}));
```

**Benefits:**
- ✅ Documentation travels with your Figma file
- ✅ No external services required
- ✅ Version history through Figma's native versioning
- ✅ Team collaboration through Figma's sharing
- ✅ Works offline (except AI features)

---

## 🤝 The Designer-Developer Handoff

### Before FileNavigator
```
Designer: "Here's the Figma link"
Developer: "What does this button do?"
Designer: "Check the Confluence page"
Developer: "Which page?"
Designer: "Let me find it..."
[3 days later]
Developer: "I just implemented it based on my assumptions"
```

### After FileNavigator
```
Designer: "Here's the Figma link"
Developer: [Opens FileNavigator, searches "checkout button"]
Developer: "Got it – primary action, leads to payment flow, 
            disabled when cart is empty. Thanks!"
Designer: "👍"
```

---

## 🔧 Development

```bash
# Watch mode for plugin (auto-rebuild on changes)
npm run dev:plugin

# Watch mode for UI (Vite dev server)
npm run dev:ui

# Build everything for production
npm run build

# Type checking
npm run typecheck
```

### Environment Variables
Create a `.env` file:
```env
OPENAI_API_KEY=sk-your-key-here
```

---

## 🎨 Formatting Support

Documentation supports Markdown-like formatting:

| Syntax | Result |
|--------|--------|
| `**Bold text**` | **Bold text** |
| `*Heading*` (own line) | Rendered as heading |
| `- Item` or `• Item` | Bullet list |
| Line breaks | Preserved |

Example input:
```
**Produktvision: Lerntisch**

**Funktionen:**
- Kamera: Erkennt Bauteile automatisch
- Projektor: Zeigt Anleitungen auf dem Tisch
- Website: Steuert den gesamten Ablauf
```

---

## 📊 Screen Categories

Default categories for organizing screens:

| Category | Icon | Use For |
|----------|------|---------|
| Pages | 📄 | Main application screens |
| User Flows | 🔀 | Multi-step processes |
| Component Specs | 🧩 | Component documentation |
| Modals | 💬 | Dialogs and overlays |
| States | 🔄 | Different UI states |

---

## 🛣️ Roadmap

### Planned Features
- [ ] Export documentation to Markdown/HTML
- [ ] Component library integration
- [ ] Design token documentation
- [ ] Figma comments integration
- [ ] Multi-language support
- [ ] Custom categories
- [ ] Documentation templates
- [ ] Changelog generation
- [ ] Figma Variables integration

---

## 🐛 Troubleshooting

### "AI search not working"
- Check your OpenAI API key in `.env`
- Ensure the key has credits/quota
- AI features require internet connection

### "Documentation not saving"
- Make sure you've selected a Frame (not a Group or other element)
- Check Figma's plugin console for errors

### "Plugin not loading"
- Rebuild with `npm run build`
- Re-import the manifest in Figma
- Check the browser console in Figma (Plugins → Development → Open Console)

---

## 📄 License

MIT License – see [LICENSE](LICENSE) for details.

---

## 🙏 Credits

Built with:
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [OpenAI API](https://openai.com/)
- [esbuild](https://esbuild.github.io/)

---

<div align="center">

### FileNavigator

**Because good design deserves good documentation.**

*Stop documenting in silos. Start documenting where you design.*

---

[🐛 Report Bug](https://github.com/Litorian113/FileNavigator/issues) · [✨ Request Feature](https://github.com/Litorian113/FileNavigator/issues)

</div>
