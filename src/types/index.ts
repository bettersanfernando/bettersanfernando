export type LanguageType = 'en' | 'fil';

export type NavigationId =
  | 'home'
  | 'services'
  | 'projects'
  | 'government'
  | 'transparency'
  | 'about'
  | 'contact';

export type NavigationIcon =
  | 'accessibility'
  | 'archive'
  | 'badge-check'
  | 'briefcase'
  | 'building'
  | 'chart'
  | 'construction'
  | 'database'
  | 'droplet'
  | 'external-link'
  | 'file-check'
  | 'file-text'
  | 'graduation-cap'
  | 'hand-heart'
  | 'heart-pulse'
  | 'landmark'
  | 'leaf'
  | 'library'
  | 'list-checks'
  | 'map'
  | 'network'
  | 'phone'
  | 'receipt'
  | 'scale'
  | 'search'
  | 'shield-check'
  | 'shopping-cart'
  | 'triangle-alert'
  | 'users'
  | 'wallet'
  | 'wheat';

export interface NavigationDestination {
  labelKey: string;
  descriptionKey: string;
  icon: NavigationIcon;
  href: string;
  kind: 'real' | 'planned' | 'external';
}

export interface NavigationSection {
  labelKey: string;
  items: NavigationDestination[];
}

export interface NavigationItem {
  id: NavigationId;
  labelKey: string;
  href: string;
  activePathPrefixes: string[];
  sections?: NavigationSection[];
}
