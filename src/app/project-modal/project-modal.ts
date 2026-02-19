import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Project {
    title: string;
    description: string;
    longDescription?: string;
    techStack: string[];
    image: string;
    link?: string;
    repoLink?: string;
}

@Component({
    selector: 'app-project-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './project-modal.html',
    styleUrls: ['./project-modal.css']
})
export class ProjectModal {
    @Input() project: Project | null = null;
    @Output() close = new EventEmitter<void>();

    closeModal() {
        this.close.emit();
    }

    // Prevent click on content from closing modal
    stopPropagation(event: Event) {
        event.stopPropagation();
    }
}
