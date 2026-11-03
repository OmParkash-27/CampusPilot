import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { ViewDocumentsService } from './view-documents.service';

// ── Document model ────────────────────────────────────────────────────────────
export interface DocumentItem {
  index: number;           // 1-based sequential number
  url: string;             // Cloudinary URL (original)
  name: string;            // derived label, e.g. "Document 1"
  type: DocType;           // image | pdf | other
  thumbnailUrl: string;    // same URL — Cloudinary serves the image directly
}

export type DocType = 'image' | 'pdf' | 'other' | String;

type FilterType = 'all' | DocType;

// ── Helpers ───────────────────────────────────────────────────────────────────
function detectType(url: string): DocType {
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/.test(lower)) return 'image';
  if (/\.pdf(\?|$)/.test(lower)) return 'pdf';
  return 'image'; // Cloudinary student photos are always images
}

@Component({
  selector: 'app-view-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    TagModule,
    TooltipModule,
    SkeletonModule,
  ],
  templateUrl: './view-documents.html',
  styleUrl: './view-documents.scss',
})
export class ViewDocuments implements OnInit {
  private service = inject(ViewDocumentsService);
  router = inject(Router);

  // ── State ──────────────────────────────────────────────────────────────────
  loading: WritableSignal<boolean> = signal(true);
  error: WritableSignal<string | null> = signal(null);
  allDocs: WritableSignal<DocumentItem[]> = signal([]);
  studentName: WritableSignal<string> = signal('');
  rollNo: WritableSignal<string> = signal('');

  // ── Search & filter ────────────────────────────────────────────────────────
  searchTerm: WritableSignal<string> = signal('');
  activeFilter: WritableSignal<FilterType> = signal('all');

  filterOptions = [
    { label: 'All Documents', value: 'all' },
    { label: 'Images',        value: 'image' },
    { label: 'PDFs',          value: 'pdf' },
    { label: 'Other',         value: 'other' },
  ];

  // ── Preview dialog ─────────────────────────────────────────────────────────
  previewVisible = false;
  previewDoc: DocumentItem | null = null;

  // ── Computed filtered list ────────────────────────────────────────────────
  filteredDocs = computed(() => {
    const term   = this.searchTerm().toLowerCase().trim();
    const filter = this.activeFilter();
    return this.allDocs().filter(doc => {
      const matchesType   = filter === 'all' || doc.type === filter;
      const matchesSearch = !term || doc.name.toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  totalCount  = computed(() => this.allDocs().length);
  imageCount  = computed(() => this.allDocs().filter(d => d.type === 'image').length);
  pdfCount    = computed(() => this.allDocs().filter(d => d.type === 'pdf').length);
  otherCount  = computed(() => this.allDocs().filter(d => d.type === 'other').length);

  // ── Skeleton array for loading state ──────────────────────────────────────
  skeletons = Array(6).fill(null);

  ngOnInit(): void {
    this.service.getStudentRecord().subscribe({
      next: (res) => {
        this.studentName.set(res?.user?.name ?? '');
        this.rollNo.set(res?.rollNo ?? '');

        const photos: string[] = res?.photos ?? [];
        const docs: DocumentItem[] = photos.map((url, i) => ({
          index:        i + 1,
          url,
          name:         `Document ${i + 1}`,
          type:         detectType(url),
          thumbnailUrl: url,
        }));

        this.allDocs.set(docs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load your documents. Please try again.');
        this.loading.set(false);
      },
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  openPreview(doc: DocumentItem): void {
    this.previewDoc = doc;
    this.previewVisible = true;
  }

  closePreview(): void {
    this.previewVisible = false;
    this.previewDoc = null;
  }

  downloadDoc(doc: DocumentItem): void {
    const anchor = document.createElement('a');
    anchor.href = doc.url;
    anchor.download = doc.name;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  setFilter(value: FilterType): void {
    this.activeFilter.set(value);
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getTypeSeverity(type: DocType): 'success' | 'info' | 'secondary' {
    if (type === 'image') return 'success';
    if (type === 'pdf')   return 'info';
    return 'secondary';
  }

  getTypeLabel(type: DocType): string {
    if (type === 'image') return 'Image';
    if (type === 'pdf')   return 'PDF';
    return 'File';
  }

  getTypeIcon(type: DocType): string {
    if (type === 'image') return 'pi pi-image';
    if (type === 'pdf')   return 'pi pi-file-pdf';
    return 'pi pi-file';
  }
}
