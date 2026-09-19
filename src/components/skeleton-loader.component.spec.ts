import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SkeletonLoaderComponent } from './skeleton-loader.component';

describe('SkeletonLoaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonLoaderComponent],
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(SkeletonLoaderComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders multiple placeholder blocks', () => {
    const fixture = TestBed.createComponent(SkeletonLoaderComponent);
    fixture.detectChanges();
    const blocks = fixture.nativeElement.querySelectorAll('.sk');
    expect(blocks.length).toBeGreaterThan(5);
  });

  it('is hidden from assistive technology', () => {
    const fixture = TestBed.createComponent(SkeletonLoaderComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement.firstElementChild;
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.getAttribute('role')).toBe('presentation');
  });
});
