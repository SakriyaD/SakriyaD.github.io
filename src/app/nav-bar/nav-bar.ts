import { Component, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  isMenuOpen = signal(false);
  isDarkTheme = signal(true);
  activeSection = signal<string>('home');
  scrollProgress = signal<number>(0);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      this.setTheme('light');
    } else {
      this.setTheme('dark');
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollSpy();
      this.initScrollProgress();
    }
  }

  /**
   * Calculates what percentage of the page has been scrolled.
   * Used for the top progress bar.
   */
  private initScrollProgress() {
    const update = () => {
      const scrollTop = window.scrollY; // Current scroll position
      const docHeight = document.documentElement.scrollHeight - window.innerHeight; // Total scrollable height
      this.scrollProgress.set(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
  }

  /**
   * Intersection Observer for 'Scroll Spy'.
   * Detects which section is currently centered on screen to highlight the active menu link.
   */
  private initScrollSpy() {
    const sections = document.querySelectorAll('section, header');
    const options = {
      // rootMargin adjusts the detection area: -30% from top, -70% from bottom
      // This ensures only sections near the top-middle trigger the update.
      rootMargin: '-30% 0px -70% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let id = entry.target.getAttribute('id');
          if (!id && entry.target.tagName === 'HEADER') id = 'home';
          if (id) this.activeSection.set(id);
        }
      });
    }, options);

    sections.forEach(section => {
      observer.observe(section);
    });
  }

  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }

  toggleTheme() {
    const newTheme = this.isDarkTheme() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  private setTheme(theme: 'light' | 'dark') {
    this.isDarkTheme.set(theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}
