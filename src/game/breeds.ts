import { DogBreed } from './types';

export const DOG_BREEDS: Record<string, DogBreed> = {
  shiba: {
    id: 'shiba',
    name: 'Shiba Inu',
    koreanName: '시루 (시바견)',
    tagline: '용감하고 쾌활한 모험 대장!',
    primaryColor: '#D97724',     // rich golden tan
    secondaryColor: '#FFF8E7',   // warm cream belly/cheeks
    earColor: '#B85816',
    noseColor: '#1E293B',
    collarColor: '#EF4444',      // bright red collar with bell
    tailStyle: 'curled',
    earStyle: 'pointed',
    legLength: 1.0,
    bodyLength: 1.0,
  },
  corgi: {
    id: 'corgi',
    name: 'Welsh Corgi',
    koreanName: '뭉치 (웰시코기)',
    tagline: '짧은 다리로 퐁퐁 뛰는 매력 덩어리!',
    primaryColor: '#EA580C',     // vibrant orange-tan
    secondaryColor: '#FFFFFF',   // clean white muzzle & chest
    earColor: '#C2410C',
    noseColor: '#0F172A',
    collarColor: '#3B82F6',      // royal blue collar
    tailStyle: 'fluffy_stump',
    earStyle: 'large_bat',
    legLength: 0.72,
    bodyLength: 1.15,
  },
  retriever: {
    id: 'retriever',
    name: 'Golden Retriever',
    koreanName: '봄이 (리트리버)',
    tagline: '언제나 해맑은 에너자이저 순둥이!',
    primaryColor: '#EAB308',     // golden honey
    secondaryColor: '#FEF08A',   // light golden cream
    earColor: '#CA8A04',
    noseColor: '#1F2937',
    collarColor: '#10B981',      // emerald green collar
    tailStyle: 'long_feathery',
    earStyle: 'floppy',
    legLength: 1.12,
    bodyLength: 1.05,
  },
  poodle: {
    id: 'poodle',
    name: 'White Poodle',
    koreanName: '몽이 (토이푸들)',
    tagline: '폭신폭신 구름처럼 가벼운 점프 달인!',
    primaryColor: '#F8FAFC',     // snow white
    secondaryColor: '#E2E8F0',   // soft shading
    earColor: '#CBD5E1',
    noseColor: '#020617',
    collarColor: '#EC4899',      // bright pink collar
    tailStyle: 'pom_pom',
    earStyle: 'curly_floppy',
    legLength: 1.05,
    bodyLength: 0.95,
  },
};
