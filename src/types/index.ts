export type LanguageType =
  | 'en' // English
  | 'fil' // Filipino (standardized Tagalog)
  | 'ceb' // Cebuano/Bisaya
  | 'ilo' // Ilocano
  | 'hil' // Hiligaynon/Ilonggo
  | 'war' // Waray
  | 'pam' // Kapampangan
  | 'bcl' // Bikol
  | 'pag' // Pangasinan
  | 'mag' // Maguindanao
  | 'tsg' // Tausug
  | 'mdh'; // Maranao

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
