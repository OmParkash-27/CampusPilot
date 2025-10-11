import { signal, WritableSignal } from '@angular/core';

export abstract class BaseService<T> {
  loading = signal<boolean>(true);
  items = signal<T[]>([]);
  customrGlobalFilterItems = signal<T[]>([]);    // filtered copy
  globalFilter: string[] = [];
  filterMenuVisible = signal(false);
  selectedColumns: WritableSignal<any[]> = signal([]);
  
  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Student', value: 'student' },
    { label: 'Editor', value: 'editor' },
    { label: 'Teacher', value: 'teacher' }
  ];


  abstract fetchItems(): void;

  customGlobalFilter(value: string) {
    const search = value.toLowerCase().trim();

    if (!search) {
      this.customrGlobalFilterItems.set(this.items()); // reset to full list
      return;
    }

    const filtered = this.items().filter(item => {
      return this.globalFilter.some(field => {
        const val = this.resolveField(item, field);
        return val?.toString().toLowerCase().includes(search);
      });
    });

    this.customrGlobalFilterItems.set(filtered);
  }

  protected resolveField(obj: any, path: string): any {
    try {
        const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
        
        // If value is an array (like courses)
        if (Array.isArray(value)) {
            // join all key values inside
            return value.map(v =>
            Object.values(v).join(' ')
            ).join(' ');
        }

        return value;
    } catch {
      return '';
    }
  }

  onColReorder(event: any) {
    const { dragIndex, dropIndex } = event;
    const cols = [...this.selectedColumns()];
    const [moved] = cols.splice(dragIndex, 1);
    cols.splice(dropIndex, 0, moved);
    this.selectedColumns.set(cols);
  }
}
