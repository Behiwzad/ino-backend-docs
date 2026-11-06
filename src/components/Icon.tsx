import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Home05Icon, HierarchySquare01Icon, Table02Icon, LeftToRightListBulletIcon, WorkflowSquare10Icon, ApiIcon, SmartPhone01Icon,
  SecurityCheckIcon, Download04Icon, Search01Icon, Sun03Icon, Moon02Icon, Copy01Icon, Tick02Icon, Key01Icon, Link04Icon,
  ArrowLeft01Icon, ArrowRight01Icon, ArrowDown01Icon, Cancel01Icon, Layers01Icon, ViewIcon, DatabaseIcon, RefreshIcon,
  CenterFocusIcon, Menu01Icon, FilterHorizontalIcon, Settings02Icon, FingerPrintIcon, FlashIcon, InformationCircleIcon,
  Idea01Icon, GithubIcon, FileDownloadIcon, SqlIcon, CodeIcon, Route01Icon, CursorMove01Icon, ZoomInIcon, ZoomOutIcon,
  Maximize01Icon, AlertCircleIcon, ArrowUpRight01Icon, CheckListIcon, Note01Icon, Csv01Icon, DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";

/** Single icon set for the whole site: Hugeicons stroke-rounded (same family as the app design). */
const icons = {
  home: Home05Icon,
  canvas: HierarchySquare01Icon,
  table: Table02Icon,
  enum: LeftToRightListBulletIcon,
  flow: WorkflowSquare10Icon,
  api: ApiIcon,
  screen: SmartPhone01Icon,
  rule: SecurityCheckIcon,
  download: Download04Icon,
  search: Search01Icon,
  sun: Sun03Icon,
  moon: Moon02Icon,
  copy: Copy01Icon,
  check: Tick02Icon,
  key: Key01Icon,
  link: Link04Icon,
  arrowL: ArrowLeft01Icon,
  arrowR: ArrowRight01Icon,
  chevron: ArrowDown01Icon,
  close: Cancel01Icon,
  layers: Layers01Icon,
  eye: ViewIcon,
  db: DatabaseIcon,
  reset: RefreshIcon,
  focus: CenterFocusIcon,
  menu: Menu01Icon,
  filter: FilterHorizontalIcon,
  settings: Settings02Icon,
  unique: FingerPrintIcon,
  flash: FlashIcon,
  info: InformationCircleIcon,
  idea: Idea01Icon,
  github: GithubIcon,
  file: FileDownloadIcon,
  sql: SqlIcon,
  code: CodeIcon,
  route: Route01Icon,
  move: CursorMove01Icon,
  zoomIn: ZoomInIcon,
  zoomOut: ZoomOutIcon,
  fit: Maximize01Icon,
  alert: AlertCircleIcon,
  external: ArrowUpRight01Icon,
  list: CheckListIcon,
  note: Note01Icon,
  csv: Csv01Icon,
  dashboard: DashboardSquare01Icon,
} satisfies Record<string, IconSvgElement>;

export type IconName = keyof typeof icons;

export function Icon({ name, size = 18, className = "", stroke = 1.6 }: { name: IconName; size?: number; className?: string; stroke?: number }) {
  return <HugeiconsIcon icon={icons[name]} size={size} strokeWidth={stroke} className={`shrink-0 ${className}`} aria-hidden />;
}
