/* ============================================================================
   SITE CONTENT: every word, link and colour on the website lives in this file.
   You can edit it by hand, or use admin.html and press "Download site-data.js".
   Leave a value as "" to hide it. Do not add facts you cannot verify.
   ============================================================================ */
window.SITE_DATA = {
  version: 2,

  profile: {
    name: "Abdul Waheed Baloch",
    title: "IT Support Specialist | AI Agent Developer | Web Developer | n8n Automation Specialist",
    photo: "profile.webp"
  },

  hero: {
    label: "IT SUPPORT • AI DEVELOPMENT • AUTOMATION",
    headline: "Engineering Intelligent Solutions for a Smarter Digital World.",
    subheadline: "IT Expertise. AI Innovation. Intelligent Automation.",
    description: "I'm a technology professional with a BSCS background and experience in IT support, enterprise systems, and technical troubleshooting. I also develop AI-powered assistants, modern websites, chatbots, and automated workflows that help businesses work smarter and operate more efficiently.",
    cta1: "Explore My Work",
    cta2: "Let's Work Together",
    roles: ["IT Support Specialist", "AI Agent Developer", "Web Developer", "n8n Automation Specialist"],
    badges: ["Python", "n8n", "Next.js", "TypeScript", "Oracle Fusion ERP"],
    available: true,
    availabilityText: "Open to new projects"
  },

  about: {
    heading: "IT support experience, applied to modern AI",
    p1: "I hold a **Bachelor of Science in Computer Science (BSCS)** and have hands-on experience in IT support, including exposure to enterprise systems such as **Oracle Fusion ERP**. That work built a steady habit of tracing problems to their cause and explaining fixes in plain language.",
    p2: "Alongside it, I'm focused on AI agents, chatbots, prompt engineering, and n8n automation. I bring both sides together: the support mindset that knows where people get stuck, and the development skills to build assistants, websites, and workflows that remove that friction.",
    cta: "Explore My Projects",
    highlights: [
      "IT Support and Desktop Troubleshooting",
      "Oracle Fusion ERP exposure",
      "System and Application Support",
      "Networking Fundamentals",
      "AI Agent Development",
      "Chatbot Development",
      "n8n Workflow Automation",
      "Prompt Engineering",
      "Web Development"
    ]
  },

  /* icon options: bot, chat, globe, flow, wrench, cpu, code, db, chart, server, desktop, spark, net, prompt */
  services: [
    { icon: "bot", title: "AI Agent Development", desc: "Assistants that take on routine business work and hand off to people when it matters.",
      items: ["Custom AI assistants", "AI agents with tool integrations", "Business process assistance", "LLM and API integrations", "Intelligent task automation"] },
    { icon: "chat", title: "AI Chatbot Development", desc: "Chatbots grounded in your own business information.",
      items: ["Website chatbots", "Customer support assistants", "FAQ automation", "Lead-generation chatbots", "Business knowledge assistants"] },
    { icon: "globe", title: "Web Development", desc: "Fast, responsive sites and apps that are easy to maintain.",
      items: ["Professional business websites", "Portfolio websites", "Landing pages", "Responsive web applications", "Dashboards and admin interfaces"] },
    { icon: "flow", title: "n8n Workflow Automation", desc: "Connect the tools you already use and let the busywork run itself.",
      items: ["Workflow automation", "API and webhook integrations", "Email notifications", "Automated data processing", "AI-powered workflows", "CRM and business tool connections"] },
    { icon: "wrench", title: "IT Support Services", desc: "Practical, patient support for people and systems.",
      items: ["Desktop and Windows troubleshooting", "Hardware and software support", "LAN, Wi-Fi, and router troubleshooting", "Oracle Fusion ERP support exposure", "Technical documentation", "System and application troubleshooting"] }
  ],

  /* preview options: chat, booking, flow, site, help, dash, agent
     status options: Concept, In Development, Prototype, Completed
     Add liveUrl / repoUrl only when they are real. Empty means the button stays disabled. */
  projects: [
    { id: "salon", title: "AI Salon Booking Agent", desc: "An AI assistant for appointment inquiries and booking workflows.", preview: "booking", status: "Concept",
      tags: ["LLM API", "n8n", "Calendar integration"],
      overview: "A concept for an AI assistant that handles appointment inquiries for a salon and guides customers through booking.",
      problem: "Small service businesses lose bookings when nobody can reply quickly to inquiries about services, prices, and availability.",
      solution: "A conversational agent answers common questions from a configured knowledge base, collects the customer's service and preferred time, and passes the request to staff through an n8n workflow for confirmation.",
      features: ["Answers service and pricing questions from a knowledge base", "Collects name, service, and preferred time", "Sends booking requests to staff for confirmation", "Hands off to a person when it cannot answer"],
      stack: ["LLM API", "n8n", "Next.js", "Calendar or spreadsheet integration (planned)"], liveUrl: "", repoUrl: "" },
    { id: "support", title: "AI Customer Support Chatbot", desc: "A chatbot that answers business questions and assists customers.", preview: "chat", status: "Concept",
      tags: ["Chatbot", "Next.js", "REST API"],
      overview: "A concept for a website chatbot that answers customer questions using a business's own information.",
      problem: "Customers expect quick answers, while repeated questions take up a team's time.",
      solution: "A chatbot grounded in a business knowledge base answers common questions, captures contact details for sales leads, and escalates the rest to a person.",
      features: ["Answers questions from approved business content", "Captures leads with name and contact details", "Escalates unanswered questions to staff", "Embeddable on a business website"],
      stack: ["LLM API", "Next.js", "TypeScript", "REST APIs"], liveUrl: "", repoUrl: "" },
    { id: "n8n", title: "n8n Business Automation System", desc: "Automated forms, notifications, and business workflows.", preview: "flow", status: "Concept",
      tags: ["n8n", "Webhooks", "AI"],
      overview: "A concept workflow that connects web forms, email notifications, AI processing, and business records.",
      problem: "Manual copying between forms, inboxes, and spreadsheets is slow and easy to get wrong.",
      solution: "An n8n workflow receives form submissions by webhook, optionally summarizes or categorizes them with an AI step, records them, and notifies the team by email.",
      features: ["Webhook intake from web forms", "Optional AI summary and categorization", "Automatic record keeping", "Email notifications to the team"],
      stack: ["n8n", "Webhooks", "REST APIs", "LLM API"], liveUrl: "", repoUrl: "" },
    { id: "site", title: "Modern Business Website", desc: "A responsive business website using modern frontend technology.", preview: "site", status: "Concept",
      tags: ["Next.js", "Tailwind CSS", "TypeScript"],
      overview: "A concept for a fast, responsive business website with clear services, contact options, and good accessibility.",
      problem: "Many small business sites are slow, hard to use on phones, or difficult to update.",
      solution: "A Next.js and Tailwind CSS site with reusable components, responsive layouts, and content kept in simple data files for easy updates.",
      features: ["Responsive layouts for phones to large monitors", "Reusable, easy-to-edit content", "Semantic HTML and accessible controls", "SEO metadata and fast loading"],
      stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"], liveUrl: "", repoUrl: "" },
    { id: "it", title: "IT Support Knowledge Assistant", desc: "An assistant that helps users find solutions to common IT issues.", preview: "help", status: "Concept",
      tags: ["AI", "Knowledge base", "Python"],
      overview: "A concept for an assistant that helps people find answers to common IT problems without waiting for a technician.",
      problem: "Many IT requests are repeats, such as password resets, Wi-Fi problems, and printer setup.",
      solution: "A search-and-chat assistant draws on a maintained set of support articles to guide users through fixes step by step, and flags issues that need a technician.",
      features: ["Searches a maintained set of support articles", "Step-by-step troubleshooting guidance", "Flags issues that need a technician", "Built from real support experience"],
      stack: ["LLM API", "Python", "Knowledge base", "Documentation"], liveUrl: "", repoUrl: "" },
    { id: "dash", title: "Business Analytics Dashboard", desc: "A dashboard concept for business and operational reporting.", preview: "dash", status: "Concept",
      tags: ["React", "SQL", "Power BI"],
      overview: "A concept dashboard for viewing operational data and performance in one place.",
      problem: "Business data often lives in separate files and systems, which makes it slow to review.",
      solution: "A dashboard that reads from a database or spreadsheet and shows trends and summaries through clear charts and filters.",
      features: ["Charts and summaries for operational data", "Filters by date and category", "Data from SQL or spreadsheets", "Designed for quick weekly reviews"],
      stack: ["React", "SQL", "Power BI", "Advanced Excel"], liveUrl: "", repoUrl: "" }
  ],

  skills: [
    { title: "IT Support", blurb: "Keeping people and business systems running.",
      items: ["IT Support", "Desktop Support", "Windows Troubleshooting", "Networking Fundamentals", "Oracle Fusion ERP"] },
    { title: "AI and Automation", blurb: "Turning language models and workflows into working tools.",
      items: ["AI Agent Development", "Prompt Engineering", "LLM Integration", "n8n", "REST APIs", "Webhooks", "Chatbot Development"] },
    { title: "Web Development", blurb: "Building interfaces and services for the web.",
      items: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Node.js"] },
    { title: "Data and Reporting", blurb: "Working with code, data, and reporting.",
      items: ["Python", "SQL", "Git", "GitHub", "Power BI", "Advanced Excel"] }
  ],

  marquee: ["Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "HTML", "CSS", "Tailwind CSS", "SQL", "Git", "GitHub", "n8n", "Power BI", "Oracle Fusion ERP"],

  /* Add org and period (for example "Company Name", "2023 to Present") and they will show.
     achievements stay hidden until you add real ones. */
  experience: [
    { role: "IT Support and Enterprise Systems", org: "", period: "",
      summary: "Hands-on support for users, devices, networks, and business applications.",
      responsibilities: ["Desktop, Windows, and network troubleshooting for everyday users", "Exposure to Oracle Fusion ERP in an enterprise setting", "User account and system support with clear technical documentation"],
      achievements: [] },
    { role: "Data Management and Troubleshooting", org: "", period: "",
      summary: "Careful handling of business data and methodical problem solving.",
      responsibilities: ["Working with business records and reports using Excel, SQL, and Power BI", "Tracing issues to their cause and explaining fixes in plain language"],
      achievements: [] },
    { role: "AI, Prompt Engineering and Automation", org: "", period: "Ongoing learning",
      summary: "Building practical skills in AI agents and workflow automation through hands-on projects.",
      responsibilities: ["Designing prompts and tool-calling agents with LLM APIs", "Building n8n workflows with webhooks and REST integrations", "Practicing with concept projects until client work is ready to show"],
      achievements: [] }
  ],

  education: { degree: "Bachelor of Science in Computer Science (BSCS)", institution: "", graduation: "" },

  /* { title: "Certification name", issuer: "Issuing organization", date: "Month YYYY", url: "https://..." } */
  certifications: [],

  contact: {
    heading: "Have a Project in Mind? Let's Build Something Smart.",
    text: "Tell me what you need. I'll reply with questions or a first idea of how to approach it.",
    email: "waheedjdk@hotmail.com",
    whatsapp: "923222392618",
    whatsappMessage: "Hello Abdul Waheed, I found your portfolio and would like to discuss a project.",
    linkedin: "https://www.linkedin.com/in/abdul-waheed-al-balushi-84486317b",
    github: "https://github.com/AI-Balushi",
    saveToServer: true,
    formEndpoint: ""
  },

  /* preset: electric, neon, ocean, emerald, sunset, custom */
  theme: { preset: "electric", blue: "#4F8CFF", cyan: "#22D3EE", violet: "#9D7BFF" }
};
