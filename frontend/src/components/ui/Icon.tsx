import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  Boxes,
  Briefcase,
  Building,
  CalendarCheck,
  Check,
  Clock,
  Coins,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  HeartHandshake,
  House,
  KeyRound,
  Leaf,
  LogIn,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Quote,
  Recycle,
  Satellite,
  Settings,
  ShieldCheck,
  Sofa,
  Sparkles,
  Star,
  Truck,
  Users,
  Warehouse,
  Weight,
  Wrench,
  Zap,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/**
 * Icon-Registry: Inhalte referenzieren Icons per Name (CMS-tauglich).
 * Nur hier registrierte Icons landen im Bundle (Tree-Shaking).
 */
const registry = {
  activity: Activity,
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  award: Award,
  bell: Bell,
  boxes: Boxes,
  briefcase: Briefcase,
  building: Building,
  "calendar-check": CalendarCheck,
  check: Check,
  clock: Clock,
  coins: Coins,
  "file-text": FileText,
  globe: Globe,
  "graduation-cap": GraduationCap,
  handshake: Handshake,
  "heart-handshake": HeartHandshake,
  house: House,
  key: KeyRound,
  leaf: Leaf,
  "log-in": LogIn,
  mail: Mail,
  "map-pin": MapPin,
  message: MessageSquare,
  package: Package,
  phone: Phone,
  quote: Quote,
  recycle: Recycle,
  satellite: Satellite,
  settings: Settings,
  "shield-check": ShieldCheck,
  sofa: Sofa,
  sparkles: Sparkles,
  star: Star,
  truck: Truck,
  users: Users,
  warehouse: Warehouse,
  weight: Weight,
  wrench: Wrench,
  zap: Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof registry;

interface IconProps extends LucideProps {
  name: IconName;
}

/** Dekoratives Icon – für Screenreader ausgeblendet, Bedeutung trägt der Text. */
export function Icon({ name, strokeWidth = 1.75, ...props }: IconProps) {
  const Component = registry[name];
  return <Component aria-hidden="true" focusable="false" strokeWidth={strokeWidth} {...props} />;
}
