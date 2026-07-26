/**
 * GENERATED COMPONENT REGISTRY — Sprint 8.2A
 * Descriptor-only registry. No JSX.
 */

import { SiteHeaderDescriptor } from './SiteHeader.descriptor';
import { SiteFooterDescriptor } from './SiteFooter.descriptor';
import { HeroSectionDescriptor } from './HeroSection.descriptor';
import { SectionHeadingDescriptor } from './SectionHeading.descriptor';
import { CTASectionDescriptor } from './CTASection.descriptor';
import { CardDescriptor } from './Card.descriptor';
import { ProductCardDescriptor } from './ProductCard.descriptor';
import { MenuSectionDescriptor } from './MenuSection.descriptor';
import { GallerySectionDescriptor } from './GallerySection.descriptor';
import { TestimonialDescriptor } from './Testimonial.descriptor';
import { FAQDescriptor } from './FAQ.descriptor';
import { ContactFormDescriptor } from './ContactForm.descriptor';
import { MapSectionDescriptor } from './MapSection.descriptor';
import { OpeningHoursDescriptor } from './OpeningHours.descriptor';
import { SocialLinksDescriptor } from './SocialLinks.descriptor';
import { MobileStickyCTADescriptor } from './MobileStickyCTA.descriptor';

export const componentRegistry = {
  SiteHeader: SiteHeaderDescriptor,
  SiteFooter: SiteFooterDescriptor,
  HeroSection: HeroSectionDescriptor,
  SectionHeading: SectionHeadingDescriptor,
  CTASection: CTASectionDescriptor,
  Card: CardDescriptor,
  ProductCard: ProductCardDescriptor,
  MenuSection: MenuSectionDescriptor,
  GallerySection: GallerySectionDescriptor,
  Testimonial: TestimonialDescriptor,
  FAQ: FAQDescriptor,
  ContactForm: ContactFormDescriptor,
  MapSection: MapSectionDescriptor,
  OpeningHours: OpeningHoursDescriptor,
  SocialLinks: SocialLinksDescriptor,
  MobileStickyCTA: MobileStickyCTADescriptor,
} as const;

export type ComponentRegistry = typeof componentRegistry;

export const componentDescriptorNames = [
  'SiteHeader',
  'SiteFooter',
  'HeroSection',
  'SectionHeading',
  'CTASection',
  'Card',
  'ProductCard',
  'MenuSection',
  'GallerySection',
  'Testimonial',
  'FAQ',
  'ContactForm',
  'MapSection',
  'OpeningHours',
  'SocialLinks',
  'MobileStickyCTA',
] as const;
