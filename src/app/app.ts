import { Component, signal, Inject, PLATFORM_ID, ViewChildren, ViewChild, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavBar } from './nav-bar/nav-bar';
import { ProjectModal, Project } from './project-modal/project-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavBar, ProjectModal, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  title = 'portfolio_sakriya';

  // Typed text signal
  heroText = signal('');
  private fullText = 'Experiences Worth Remembering.';

  @ViewChildren('animateItem') animateItems!: QueryList<ElementRef>;
  @ViewChild('cursorOuter') cursorOuter!: ElementRef<HTMLDivElement>;
  @ViewChild('cursorDot') cursorDot!: ElementRef<HTMLDivElement>;

  // Back to top signal
  showBackToTop = signal(false);

  // Project Modal
  selectedProject = signal<Project | null>(null);

  // Contact form
  private FORMSPREE_URL = 'https://formspree.io/f/xojnplaw';
  formData = { name: '', email: '', message: '' };
  isLoading = signal(false);
  formStatus = signal<'idle' | 'success' | 'error'>('idle');

  projects: Project[] = [
    {
      title: 'E-Commerce Platform',
      description: 'A full-featured online store built with Angular and Firebase.',
      longDescription: 'A comprehensive e-commerce solution featuring user authentication, product management, shopping cart functionality, and secure checkout integration. Built with scalability and performance in mind.',
      techStack: ['Angular', 'Firebase', 'RxJS', 'Stripe API'],
      image: 'assets/project1.jpg', // Placeholder
      link: '#',
      repoLink: '#'
    },
    {
      title: 'Task Management App',
      description: 'Streamline your workflow with this intuitive task manager.',
      longDescription: 'A productivity application designed to help teams organize tasks, set deadlines, and track progress. Features include drag-and-drop boards, real-time updates, and team collaboration tools.',
      techStack: ['Angular', 'Node.js', 'MongoDB', 'Socket.io'],
      image: 'assets/project2.jpg', // Placeholder
      link: '#',
      repoLink: '#'
    },
    {
      title: 'Portfolio Website',
      description: 'This very website! Built with modern CSS and Angular.',
      longDescription: 'A personal portfolio website showcasing my skills, projects, and experience. Designed with a focus on modern aesthetics, responsiveness, and performance.',
      techStack: ['Angular', 'TypeScript', 'CSS3', 'HTML5'],
      image: 'assets/project3.jpg', // Placeholder
      link: '#',
      repoLink: '#'
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initIntersectionObserver();
      this.startTypingEffect();
      this.initScrollListener();
      this.initCursorFollower();
    }
  }

  openProject(project: Project) {
    this.selectedProject.set(project);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closeProject() {
    this.selectedProject.set(null);
    document.body.style.overflow = ''; // Restore scrolling
  }

  /**
   * Handles contact form submission via Formspree.
   * Uses Angular HttpClient to POST form data.
   */
  sendMessage(event: Event) {
    event.preventDefault();
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.formStatus.set('idle');

    this.http.post(this.FORMSPREE_URL, this.formData, {
      headers: { 'Accept': 'application/json' }
    }).subscribe({
      next: () => {
        this.formStatus.set('success');
        this.formData = { name: '', email: '', message: '' }; // Reset form
        this.isLoading.set(false);
      },
      error: () => {
        this.formStatus.set('error');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Initializes the dual cursor effect.
   * 'dot' follows the mouse instantly.
   * 'outer' follows with a 'Lerp' (Linear Interpolation) lag for a smooth trail.
   */
  private initCursorFollower() {
    // Disable on touch devices (mobile/tablets)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const outer = this.cursorOuter.nativeElement;
    const dot = this.cursorDot.nativeElement;
    let mouseX = 0, mouseY = 0; // Current mouse coordinates
    let outerX = 0, outerY = 0; // Current outer ring coordinates

    // Update coordinates on mouse move
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      outer.style.opacity = '1';

      // Dot tracks the mouse pointer instantly
      dot.style.opacity = '1';
      dot.style.transform = `translate(-50%, -50%) translate(${mouseX}px, ${mouseY}px)`;
    });

    // Hide custom cursor when mouse leaves the window
    document.addEventListener('mouseleave', () => {
      outer.style.opacity = '0';
      dot.style.opacity = '0';
    });

    // Handle cursor expansion on hover of interactive elements
    const hoverTargets = 'a, button, [role="button"], input, textarea, label';
    document.addEventListener('mouseover', (e) => {
      if ((e.target as Element).closest(hoverTargets)) {
        outer.classList.add('cursor--hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if ((e.target as Element).closest(hoverTargets)) {
        outer.classList.remove('cursor--hover');
      }
    });

    /**
     * Animation loop for the lagging outer cursor.
     * Uses Lerp: current = current + (target - current) * factor
     */
    const animate = () => {
      // 0.12 is the 'snappiness' factor (lower = more lag)
      outerX += (mouseX - outerX) * 0.12;
      outerY += (mouseY - outerY) * 0.12;
      outer.style.transform = `translate(-50%, -50%) translate(${outerX}px, ${outerY}px)`;

      requestAnimationFrame(animate);
    };
    animate();
  }

  private initScrollListener() {
    window.addEventListener('scroll', () => {
      this.showBackToTop.set(window.scrollY > 400);
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Intersection Observer for scroll-based animations.
   * Adds 'is-visible' class when elements enter the viewport.
   */
  private initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px' // Slightly early trigger point
    });

    this.animateItems.forEach(item => {
      observer.observe(item.nativeElement);
    });
  }

  private startTypingEffect() {
    let index = 0;
    const type = () => {
      if (index < this.fullText.length) {
        this.heroText.update(text => text + this.fullText.charAt(index));
        index++;
        setTimeout(type, 100); // Typing speed
      }
    };
    // Start after a small delay
    setTimeout(type, 500);
  }
}
