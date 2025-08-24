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
  Smartphone,
  Repeat,
  History,
  Heart,
  Globe,
  Star,
  Building,
  
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
  Trash2 as Trash,
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
  BarChart3 as BarChart,
  PieChart,
  
  // Status & Feedback
  Check,
  CheckCircle,
  CheckCircle2,
  QrCode,
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  Loader2 as Spinner,
  
  // UI Elements
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Tag,
  
  // Files & Documents
  File,
  FileText,
  Image,
  Download as FileDownload,
  Upload as FileUpload,
  
  // Location & Places
  MapPin,
  Navigation,
  Globe,
  Building,
  Church,
  
  // Technology
  Smartphone,
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
  RotateCcw as Refresh,
  
  // Misc
  Lock,
  Unlock,
  Key,
  Gift,
  Music,
  Volume2 as Volume,
  VolumeX as Mute,
  Camera,
  Video,
  Zap,
  Sparkles,
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
  smartphone: Smartphone,
  repeat: Repeat,
  history: History,
  heart: Heart,
  globe: Globe,
  star: Star,
  building: Building,
  dollarSign: DollarSign,
  creditCard: CreditCard,
  trendingUp: TrendingUp,
  barChart: BarChart3,
  
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