import {
  Archive,
  BookA,
  ChartColumn,
  Globe,
  Hourglass,
  LibraryBig,
  Newspaper,
  PenLine,
  SearchCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "pen-line": PenLine,
  "book-a": BookA,
  users: Users,
  "chart-column": ChartColumn,
  globe: Globe,
  "search-check": SearchCheck,
  archive: Archive,
  hourglass: Hourglass,
  library: LibraryBig,
  newspaper: Newspaper,
};

export function SectionIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = ICONS[name] ?? Newspaper;
  return <Icon className={className} style={style} aria-hidden />;
}
