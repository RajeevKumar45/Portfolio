/**
 * Personal details, copy, and links used across the portfolio.
 * This file is also read by vite.config.ts to generate the page's SEO and
 * social-sharing tags, so keep it free of browser-only code.
 */
export const site = {
  name: 'Rajeev Kumar',
  initials: 'RK',
  headline: 'Computer Science Engineering Student | Software Developer | AI/ML Enthusiast',
  tagline: 'Building, learning, and engineering better solutions.',
  email: 'rajeevkumar642006@gmail.com',
  githubUsername: 'rajeevkumar-05',

  links: {
    github: 'https://github.com/rajeevkumar-05',
    linkedin: 'https://www.linkedin.com/in/rajeev-kumar-88a1252a3/',
    leetcode: 'https://leetcode.com/u/rmml71URiv/',
  },

  seo: {
    title: 'Rajeev Kumar | Software Developer Portfolio',
    description:
      "Explore Rajeev Kumar's software projects, technical interests, GitHub repositories, and work in software development and AI.",
    imageAlt: 'Rajeev Kumar: Building Ideas Into Intelligent Software.',
    themeColor: '#fbfaf8',
  },

  hero: {
    label: 'Computer Science Engineering Student',
    // Rendered as "Building Ideas Into" + italic "Intelligent" + "Software."
    headlineLead: 'Building Ideas Into',
    headlineAccent: 'Intelligent',
    headlineTail: 'Software.',
    intro:
      "I'm Rajeev Kumar, a Computer Science Engineering student passionate about software development, AI-powered applications, and solving real-world problems through technology.",
    focusTags: ['Full-Stack', 'AI/ML', 'Developer Tools'],
  },

  about: [
    "I'm Rajeev Kumar, a Computer Science Engineering student who enjoys building software, exploring artificial intelligence, and developing practical technology solutions.",
    'I am continuously strengthening my programming, problem-solving, and software engineering skills through hands-on projects and coding practice.',
    'My interests include full-stack development, AI and machine learning, developer tools, and intelligent applications. I aim to build useful, reliable software while continuously improving my technical knowledge and engineering practices.',
  ],

  focusAreas: [
    {
      title: 'Full-stack development',
      description: 'Building web applications end to end with React, TypeScript, Node.js, and MongoDB.',
    },
    {
      title: 'AI-powered applications',
      description: 'Exploring LLM APIs, speech and translation pipelines, and machine learning experiments.',
    },
    {
      title: 'Developer tools',
      description: 'Interested in tools that plan, generate, and validate software before it ships.',
    },
  ],

  education: {
    degree: 'Bachelor of Engineering in Computer Science Engineering',
    institution: 'BMS Institute of Technology & Management',
    location: 'Bengaluru, Karnataka, India',
  },

  contact: {
    heading: "Have an Interesting Idea? Let's Connect.",
    // Display version of the heading; the italic part is set in the accent serif.
    headingLead: 'Have an Interesting Idea?',
    headingAccent: "Let's Connect.",
    description:
      "I'm always interested in learning, collaborating, and exploring opportunities to build meaningful technology solutions.",
    /**
     * Formspree endpoint that delivers form messages to your inbox, e.g.
     * 'https://formspree.io/f/abcdwxyz'. Create a free form at formspree.io
     * with your email and paste its endpoint here. It is public by design.
     * While this is null, "Send Message" opens a pre-filled Gmail draft instead.
     */
    formEndpoint: null as string | null,
  },
} as const;

/**
 * Gmail "compose" link addressed to you. Unlike mailto:, it works on computers
 * without a desktop mail app; Gmail asks visitors to sign in if needed.
 */
export function composeEmailHref(subject?: string, body?: string): string {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: site.email });
  if (subject) params.set('su', subject);
  if (body) params.set('body', body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export const emailHref = composeEmailHref();

/** Last path segment of a profile URL, e.g. "rajeev-kumar-88a1252a3". */
export function profileHandle(url: string): string {
  return url.replace(/\/+$/, '').split('/').pop() ?? url;
}
