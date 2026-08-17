type IconProps = { className?: string }

function Base({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function LogoMark({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.2" />
      <g transform="translate(12 12) scale(0.52) translate(-12 -12)">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </g>
    </svg>
  )
}

export function FlameIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Base>
  )
}

export function TableIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 9h16" />
      <path d="M6.5 9v9" />
      <path d="M17.5 9v9" />
      <path d="M8.5 18h7" />
    </Base>
  )
}

export function BikeIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
    </Base>
  )
}

export function UtensilsIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z" />
      <path d="M21 15v7" />
    </Base>
  )
}

export function ClipboardIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </Base>
  )
}

export function ListIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </Base>
  )
}

export function BookIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </Base>
  )
}

export function ChartIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </Base>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </Base>
  )
}

export function MinusIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M5 12h14" />
    </Base>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Base>
  )
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Base>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M20 6 9 17l-5-5" />
    </Base>
  )
}

export function BellIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Base>
  )
}

export function WifiOffIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 20h.01" />
      <path d="M8.5 16.43a5 5 0 0 1 7 0" />
      <path d="M5 12.86a10 10 0 0 1 5.17-2.69" />
      <path d="M19 12.86a10 10 0 0 0-2.007-1.523" />
      <path d="M2 8.82a15 15 0 0 1 4.177-2.643" />
      <path d="M22 8.82a15 15 0 0 0-11.288-3.764" />
      <path d="m2 2 20 20" />
    </Base>
  )
}

export function PencilIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </Base>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Base>
  )
}

export function UsersIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Base>
  )
}

export function UserRoundIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Base>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </Base>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </Base>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Base>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  )
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m9 18 6-6-6-6" />
    </Base>
  )
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Base>
  )
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Base>
  )
}

export function TagIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </Base>
  )
}

export function MoneyIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01" />
      <path d="M18 12h.01" />
    </Base>
  )
}

export function TrendUpIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </Base>
  )
}

export function HomeIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
      <path d="M9 21v-6h6v6" />
    </Base>
  )
}

export function MailIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </Base>
  )
}

export function LockIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Base>
  )
}

export function EyeIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Base>
  )
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="m2 2 20 20" />
    </Base>
  )
}

export function PlayIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <polygon points="6 3 20 12 6 21 6 3" />
    </Base>
  )
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </Base>
  )
}

export function ReceiptIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5 4 2Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </Base>
  )
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="m8.5 12.5 2.5 2.5 5-5" />
    </Base>
  )
}

export function InfoIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </Base>
  )
}

export function SendIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </Base>
  )
}

export function ShoppingBagIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </Base>
  )
}