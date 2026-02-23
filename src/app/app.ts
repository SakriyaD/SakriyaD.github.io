import { Component, signal, Inject, PLATFORM_ID, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
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
  private fullText = 'Experiences That Matter';

  @ViewChildren('animateItem') animateItems!: QueryList<ElementRef>;

  // Back to top signal
  showBackToTop = signal(false);

  // Project Modal
  selectedProject = signal<Project | null>(null);

  // Contact form
  // ⚠️ Replace 'YOUR_FORM_ID' with your actual Formspree form ID after signing up at formspree.io
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
        this.formData = { name: '', email: '', message: '' };
        this.isLoading.set(false);
      },
      error: () => {
        this.formStatus.set('error');
        this.isLoading.set(false);
      }
    });
  }

  private initScrollListener() {
    window.addEventListener('scroll', () => {
      this.showBackToTop.set(window.scrollY > 400);
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Optional: Stop observing once visible
          // observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
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
