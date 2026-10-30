import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter, map } from 'rxjs/operators';

export interface BreadcrumbState {
  items: MenuItem[];
  hidden: boolean;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private router = inject(Router);

  /** Emits a fresh BreadcrumbState after every completed navigation. */
  readonly state: Signal<BreadcrumbState> = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.buildState())
    ),
    { initialValue: this.buildState() }
  );

  // ── Core builder ───────────────────────────────────────────────────────────

  private buildState(): BreadcrumbState {
    const root = this.router.routerState.snapshot.root;
    const segments = this.collectSegments(root);

    // If the deepest matched route opted out, hide the whole bar
    const hidden = segments.some(s => s.hidden);

    // Filter out null/undefined labels (transparent passthrough segments)
    // and build MenuItem array
    const items: MenuItem[] = segments
      .filter(s => !s.hidden && s.label != null)
      .map((s, i, arr) => {
        const isLast = i === arr.length - 1;
        return {
          label: s.label!,
          // Last crumb is non-clickable (no routerLink/command)
          ...(isLast ? {} : { routerLink: s.url })
        };
      });

    return { items, hidden };
  }

  // ── Route tree walker ──────────────────────────────────────────────────────

  private collectSegments(
    route: ActivatedRouteSnapshot | null
  ): Array<{ label: string | null; url: string; hidden: boolean }> {
    if (!route) return [];

    const results: Array<{ label: string | null; url: string; hidden: boolean }> = [];
    let current: ActivatedRouteSnapshot | null = route;

    // Walk the primary outlet child chain
    while (current) {
      const data = current.data;

      // hideBreadcrumb on ANY segment in the chain → whole bar hidden
      if (data['hideBreadcrumb']) {
        return [{ label: null, url: '', hidden: true }];
      }

      // breadcrumb key present (including explicit null = transparent segment)
      if ('breadcrumb' in data) {
        const label: string | null = data['breadcrumb'];
        const url = this.buildUrl(current);

        // Push even if label is null — will be filtered out later (transparent)
        results.push({ label, url, hidden: false });
      }

      current = current.children.find(c => c.outlet === 'primary') ?? null;
    }

    return results;
  }

  // ── URL builder ────────────────────────────────────────────────────────────

  /** Reconstructs the absolute URL up to and including this snapshot's segment. */
  private buildUrl(snapshot: ActivatedRouteSnapshot): string {
    const parts: string[] = [];
    let current: ActivatedRouteSnapshot | null = snapshot;

    // Walk UP the tree to collect all path segments
    while (current) {
      const segmentPath = current.url.map(u => u.path).join('/');
      if (segmentPath) parts.unshift(segmentPath);
      current = current.parent;
    }

    return '/' + parts.join('/');
  }
}
