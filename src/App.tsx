import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';
import { Education } from './components/sections/Education';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';
import { Skills } from './components/sections/Skills';

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-full bg-fg px-4 py-2.5 text-sm font-medium text-canvas focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
