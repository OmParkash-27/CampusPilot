
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule,
    CardModule,
    ButtonModule,
    CarouselModule,
    GalleriaModule,
    DividerModule,
    AvatarModule,
    RippleModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true
})
export class Home {
  authService = inject(AuthService);
  isLoggedIn = computed(() => !!this.authService.current_user());

  testimonials = [
    {
      name: 'Ravi Kumar',
      message: 'Best platform for students. Amazing experience!',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    {
      name: 'Neha Sharma',
      message: 'Very helpful portal with a clean and modern UI!',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
  ];

  galleryImages = [
  { itemImageSrc: 'images/college8.jpg', thumbnailImageSrc:'images/college8.jpg', alt: 'College 1' },
  { itemImageSrc: 'images/college7.jpg', thumbnailImageSrc:'images/college7.jpg', alt: 'College 2' },
  { itemImageSrc: 'images/college3.jpg', thumbnailImageSrc:'images/college3.jpg', alt: 'College 3' },
  { itemImageSrc: 'images/college4.jpg', thumbnailImageSrc:'images/college4.jpg', alt: 'College 4' },
  { itemImageSrc: 'images/college5.jpg', thumbnailImageSrc:'images/college5.jpg', alt: 'College 5' },
  { itemImageSrc: 'images/college6.jpg', thumbnailImageSrc:'images/college6.jpg', alt: 'College 6' }
];
responsiveOptions = [
  {
    breakpoint: '1024px',
    numVisible: 3
  },
  {
    breakpoint: '768px',
    numVisible: 2
  },
  {
    breakpoint: '560px',
    numVisible: 1
  }
];

  
}
