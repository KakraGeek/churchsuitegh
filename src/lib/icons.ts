// Centralized icon system using Lucide React
// This ensures consistent icon usage across the entire application
import React from 'react'

// Import all icons first
import {
  // Navigation & Layout
  Home,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  Settings,
  
  // Users & People
  User,
  Users,
  UserPlus,
  UserMinus,
  UserX,
  UserCheck,
  UserCog,
  Crown,
  Shield,
  
  // Actions
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Share,
  Eye,
  EyeOff,
  
  // Communication
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  Send,
  Bell,
  BellRing,
  BellOff,
  
  // Calendar & Time
  Calendar,
  CalendarDays,
  Clock,
  Timer,
  
  // Finance & Giving
  DollarSign,
  CreditCard,
  Banknote,
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Gift,
  Percent,
  Repeat,
  History,
  Heart,
  Star,
  
  // Status & Feedback
  Check,
  CheckCircle,
  CheckCircle2,
  QrCode,
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  Loader2,
  
  // UI Elements
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Tag,
  
  // Files & Documents
  File,
  FileText,
  Image,
  
  // Location & Places
  MapPin,
  Navigation,
  Globe as GlobeIcon,
  Building as BuildingIcon,
  Church,
  
  // Technology
  Smartphone as SmartphoneIcon,
  Monitor,
  Wifi,
  WifiOff,
  Database,
  Server,
  
  // Arrows & Directions
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  
  // Misc
  Lock,
  Unlock,
  Key,
  Music,
  Volume2,
  VolumeX,
  Camera,
  Video,
  Zap,
  Sparkles,
  
  // Additional Icons
  Award,
  GraduationCap,
  Package,
  FolderOpen,
  Wrench,
  ClipboardCheck,
  Hash,
  Building2,
  Activity,
  LogIn,
  LogOut,
  HeartHandshake,
  BookOpen,
  Wine,
  Printer,
} from 'lucide-react'

// Export all icons
export {
  // Navigation & Layout
  Home,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  Settings,
  
  // Users & People
  User,
  Users,
  UserPlus,
  UserMinus,
  UserX,
  UserCheck,
  UserCog,
  Crown,
  Shield,
  
  // Actions
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Share,
  Eye,
  EyeOff,
  
  // Communication
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  Send,
  Bell,
  BellRing,
  BellOff,
  
  // Calendar & Time
  Calendar,
  CalendarDays,
  Clock,
  Timer,
  
  // Finance & Giving
  DollarSign,
  CreditCard,
  Banknote,
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Gift,
  Percent,
  Repeat,
  History,
  Heart,
  Star,
  
  // Status & Feedback
  Check,
  CheckCircle,
  CheckCircle2,
  QrCode,
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  Loader2,
  
  // UI Elements
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Tag,
  
  // Files & Documents
  File,
  FileText,
  Image,
  
  // Location & Places
  MapPin,
  Navigation,
  Church,
  
  // Technology
  Monitor,
  Wifi,
  WifiOff,
  Database,
  Server,
  
  // Arrows & Directions
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  
  // Misc
  Lock,
  Unlock,
  Key,
  Music,
  Volume2,
  VolumeX,
  Camera,
  Video,
  Zap,
  Sparkles,
  
  // Additional Icons
  Award,
  GraduationCap,
  Package,
  FolderOpen,
  Wrench,
  ClipboardCheck,
  Hash,
  Building2,
  Activity,
  LogIn,
  LogOut,
  HeartHandshake,
  BookOpen,
  Wine,
  Printer,
}

// Custom icon variants for church-specific use cases
export type IconComponent = React.ComponentType<{
  className?: string
  size?: number | string
}>

// Icon size presets
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const

export type IconSize = keyof typeof iconSizes

// Helper function to get icon size
export const getIconSize = (size: IconSize | number = 'md'): number => {
  if (typeof size === 'number') return size
  return iconSizes[size]
}

// Church-specific icon mappings
export const churchIcons = {
  // Member roles
  pastor: Crown,
  admin: Shield,
  leader: UserCheck,
  member: User,
  visitor: UserPlus,
  userPlus: UserPlus,
  userCheck: UserCheck,
  userX: UserX,
  
  // Member status
  active: CheckCircle,
  inactive: XCircle,
  transferred: ArrowRight,
  suspended: AlertTriangle,
  deceased: X,
  
  // Features
  members: Users,
  events: Calendar,
  calendar: Calendar,
  giving: Gift,
  communications: MessageSquare,
  attendance: CheckCircle2,
  qrcode: QrCode,
  children: Users, // Using Users icon for children
  
  // Actions
  add: Plus,
  edit: Edit,
  delete: Trash2,
  view: Eye,
  search: Search,
  filter: Filter,
  
  // Contact methods
  email: Mail,
  phone: Phone,
  sms: MessageCircle,
  
  // Utilities
  help: User, // Will update when HelpCircle is imported
  loader: Loader2,
  user: User,
  
  // Quick stats
  trending: TrendingUp,
  chart: BarChart3,
  
  // Downloads & Reports
  download: Download,
  file: File,
  
  // Communications
  bell: Bell,
  send: Send,
  mail: Mail,
  messageSquare: MessageSquare,
  megaphone: Volume2,
  template: FileText,
  users: Users,
  settings: Settings,
  clock: Clock,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  alert: AlertCircle,
  copy: Copy,
  edit3: Edit,
  trash2: Trash2,
  atSign: Mail,
  info: Info,
  
  // Navigation & Layout
  home: Home,
  menu: Menu,
  
  // UI Elements
  spinner: Loader2,
  check: Check,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  alertCircle: AlertCircle,
  alertTriangle: AlertTriangle,
  x: X,
  
  // Giving & Finance
  gift: Gift,
  percent: Percent,
  smartphone: SmartphoneIcon,
  repeat: Repeat,
  history: History,
  heart: Heart,
  globe: GlobeIcon,
  star: Star,
  building: BuildingIcon,
  dollarSign: DollarSign,
  creditCard: CreditCard,
  
  // Volunteer & Team Management
  volunteers: Users,
  team: Users,
  schedule: Calendar,
  skills: Award,
  training: GraduationCap,
  availability: Clock,
  checkIn: LogIn,
  checkOut: LogOut,
  confirm: CheckCircle,
  reject: XCircle,

  // Inventory Management
  inventory: Package,
  item: Package,
  category: FolderOpen,
  borrow: ArrowUpRight,
  return: ArrowDownLeft,
  overdue: AlertTriangle,
  maintenance: Wrench,
  audit: ClipboardCheck,
  location: MapPin,
  barcode: QrCode,
  serial: Hash,
  supplier: Building2,
  warranty: Shield,
  condition: Activity,
  value: DollarSign,
  
  // Service & Worship
  service: Church,
  worship: Music,
  prayer: Heart,
  sermon: BookOpen,
  communion: Wine,
  offering: Gift,
  benediction: HeartHandshake,
  sundayService: Calendar,
  
  // Additional icons needed for SundayService
  document: FileText,
  print: Printer,
  arrowRight: ArrowRight,
} as const

export type ChurchIcon = keyof typeof churchIcons

// Helper component for church icons
export const ChurchIcon = ({ 
  name, 
  size = 'md', 
  className = '',
  ...props 
}: {
  name: ChurchIcon
  size?: IconSize | number
  className?: string
}) => {
  const IconComponent = churchIcons[name]
  const iconSize = typeof size === 'number' ? size : getIconSize(size)
  
  return React.createElement(IconComponent, { size: iconSize, className, ...props })
}