export interface StateNode {
  id: string;
  label: string;
  kind?: "start" | "end" | "normal" | "danger" | "success";
}
export interface Transition {
  from: string;
  to: string;
  label: string;
  actor?: string;
}
export interface Machine {
  key: string;
  title: string;
  table: string;
  column: string;
  description: string;
  states: StateNode[];
  transitions: Transition[];
  sideEffects?: string[];
}

export const machines: Machine[] = [
  {
    key: "booking",
    title: "چرخه عمر رزرو",
    table: "bookings",
    column: "status",
    description: "از ثبت درخواست تا انجام، لغو یا عدم حضور. نوبت دستی مستقیم confirmed ساخته می‌شود.",
    states: [
      { id: "start", label: "●", kind: "start" },
      { id: "pending", label: "در انتظار تأیید سالن" },
      { id: "confirmed", label: "تأیید شده" },
      { id: "completed", label: "انجام‌شده", kind: "success" },
      { id: "rejected", label: "رد شده توسط سالن", kind: "danger" },
      { id: "expired", label: "منقضی (لغو خودکار)", kind: "danger" },
      { id: "cancelled_by_customer", label: "لغو توسط مشتری", kind: "danger" },
      { id: "cancelled_by_salon", label: "لغو توسط سالن", kind: "danger" },
      { id: "no_show", label: "عدم حضور", kind: "danger" },
    ],
    transitions: [
      { from: "start", to: "pending", label: "پرداخت ودیعه/کامل موفق", actor: "مشتری" },
      { from: "start", to: "confirmed", label: "نوبت دستی", actor: "سالن" },
      { from: "pending", to: "confirmed", label: "تأیید رزرو", actor: "سالن" },
      { from: "pending", to: "rejected", label: "رد درخواست + دلیل", actor: "سالن" },
      { from: "pending", to: "expired", label: "عدم پاسخ تا زمان نوبت", actor: "سیستم" },
      { from: "pending", to: "cancelled_by_customer", label: "لغو", actor: "مشتری" },
      { from: "confirmed", to: "cancelled_by_customer", label: "لغو (رایگان تا ۲۴ ساعت قبل)", actor: "مشتری" },
      { from: "confirmed", to: "cancelled_by_salon", label: "لغو نوبت + دلیل", actor: "سالن" },
      { from: "confirmed", to: "completed", label: "ثبت انجام", actor: "سالن" },
      { from: "confirmed", to: "no_show", label: "ثبت عدم حضور", actor: "سالن" },
    ],
    sideEffects: [
      "confirmed → پیامک و اعلان «رزرو شما تأیید شد» برای مشتری.",
      "rejected / cancelled_by_salon / expired / لغو زودهنگام مشتری → escrow.refunded و کل مبلغ به کیف پول مشتری.",
      "completed → escrow.released: کارمزد ۳۰٬۰۰۰ کم و مابقی به کیف پول سالن؛ اعلان ثبت نظر.",
      "no_show / لغو دیرهنگام → ودیعه (۱۰٪) پس از کسر کارمزد به سالن؛ مابقی پرداخت آنلاین به مشتری.",
      "هر انتقال → booking_status_logs + بازمحاسبه branch_customers.",
    ],
  },
  {
    key: "verification",
    title: "بررسی سالن / شعبه توسط تیم اینو",
    table: "verification_requests",
    column: "status",
    description: "ثبت سالن جدید یا افزودن شعبه. سالن/شعبه تا تأیید در جستجو نمایش داده نمی‌شود.",
    states: [
      { id: "start", label: "●", kind: "start" },
      { id: "in_review", label: "در حال بررسی" },
      { id: "needs_changes", label: "نیاز به اصلاح" },
      { id: "approved", label: "تأیید شد", kind: "success" },
      { id: "rejected", label: "رد شد", kind: "danger" },
      { id: "cancelled", label: "لغو شده", kind: "danger" },
    ],
    transitions: [
      { from: "start", to: "in_review", label: "ارسال برای بررسی", actor: "مالک" },
      { from: "in_review", to: "approved", label: "تأیید", actor: "تیم اینو" },
      { from: "in_review", to: "needs_changes", label: "یادداشت اصلاح", actor: "تیم اینو" },
      { from: "in_review", to: "rejected", label: "رد", actor: "تیم اینو" },
      { from: "needs_changes", to: "in_review", label: "اصلاح و ارسال دوباره", actor: "مالک" },
      { from: "in_review", to: "cancelled", label: "لغو ثبت", actor: "مالک" },
      { from: "needs_changes", to: "cancelled", label: "لغو ثبت", actor: "مالک" },
      { from: "in_review", to: "in_review", label: "ویرایش اطلاعات (بررسی از اول)", actor: "مالک" },
    ],
    sideEffects: ["approved → salons.status/branches.status = active و اعلان «سالن شما تأیید شد» + چک‌لیست راه‌اندازی.", "SLA: ۲۴ ساعت کاری (sla_due_at)."],
  },
  {
    key: "join",
    title: "درخواست همکاری متخصص",
    table: "join_requests",
    column: "status",
    description: "متخصص سالن را پیدا می‌کند و برای یک شعبه درخواست می‌دهد.",
    states: [
      { id: "start", label: "●", kind: "start" },
      { id: "pending", label: "در انتظار" },
      { id: "accepted", label: "پذیرفته شد", kind: "success" },
      { id: "rejected", label: "رد شد", kind: "danger" },
      { id: "cancelled", label: "لغو شده", kind: "danger" },
    ],
    transitions: [
      { from: "start", to: "pending", label: "ارسال درخواست", actor: "متخصص" },
      { from: "pending", to: "accepted", label: "پذیرش", actor: "مالک" },
      { from: "pending", to: "rejected", label: "رد", actor: "مالک" },
      { from: "pending", to: "cancelled", label: "لغو درخواست", actor: "متخصص" },
    ],
    sideEffects: ["accepted → ساخت branch_members (role=expert) و فعال‌شدن تقویم/رزروهای سالن در پنل متخصص.", "فقط یک درخواست pending برای هر (شعبه، کاربر)."],
  },
  {
    key: "membership",
    title: "عضویت در تیم",
    table: "branch_members",
    column: "status",
    description: "عضویت فعال تا ترک یا حذف.",
    states: [
      { id: "start", label: "●", kind: "start" },
      { id: "active", label: "عضو فعال", kind: "success" },
      { id: "left", label: "ترک سالن", kind: "danger" },
      { id: "removed", label: "حذف از تیم", kind: "danger" },
    ],
    transitions: [
      { from: "start", to: "active", label: "پذیرش درخواست / ثبت سالن", actor: "مالک" },
      { from: "active", to: "left", label: "ترک سالن", actor: "متخصص" },
      { from: "active", to: "removed", label: "حذف از تیم", actor: "مالک" },
    ],
    sideEffects: ["قبل از left/removed، نوبت‌های آینده باید منتقل یا لغو شوند."],
  },
  {
    key: "escrow",
    title: "امانت و تسویه",
    table: "escrow_holds",
    column: "status",
    description: "پول آنلاین تا پایان نوبت نزد اینو.",
    states: [
      { id: "start", label: "●", kind: "start" },
      { id: "held", label: "امانت نزد اینو" },
      { id: "released", label: "تسویه با سالن", kind: "success" },
      { id: "split", label: "تقسیم", kind: "normal" },
      { id: "refunded", label: "برگشت به مشتری", kind: "danger" },
    ],
    transitions: [
      { from: "start", to: "held", label: "پرداخت موفق", actor: "درگاه/کیف پول" },
      { from: "held", to: "released", label: "انجام نوبت", actor: "سیستم" },
      { from: "held", to: "split", label: "عدم حضور / لغو دیرهنگام", actor: "سیستم" },
      { from: "held", to: "refunded", label: "لغو زودهنگام / رد / لغو سالن", actor: "سیستم" },
    ],
  },
  {
    key: "payment",
    title: "پرداخت درگاه",
    table: "payments",
    column: "status",
    description: "پرداخت از طریق درگاه بانکی.",
    states: [
      { id: "initiated", label: "ایجاد شده", kind: "start" },
      { id: "pending", label: "در درگاه" },
      { id: "succeeded", label: "موفق", kind: "success" },
      { id: "failed", label: "ناموفق", kind: "danger" },
      { id: "refunded", label: "بازگشت", kind: "normal" },
    ],
    transitions: [
      { from: "initiated", to: "pending", label: "redirect به درگاه" },
      { from: "pending", to: "succeeded", label: "callback OK + verify" },
      { from: "pending", to: "failed", label: "callback NOK / timeout" },
      { from: "succeeded", to: "refunded", label: "برگشت به کارت (نادر)" },
    ],
  },
  {
    key: "withdrawal",
    title: "برداشت از کیف پول سالن",
    table: "withdrawals",
    column: "status",
    description: "تسویه به حساب بانکی.",
    states: [
      { id: "requested", label: "ثبت درخواست", kind: "start" },
      { id: "processing", label: "در حال پردازش" },
      { id: "paid", label: "واریز شد", kind: "success" },
      { id: "rejected", label: "رد شد", kind: "danger" },
    ],
    transitions: [
      { from: "requested", to: "processing", label: "ارسال به بانک (پایا)", actor: "مالی" },
      { from: "processing", to: "paid", label: "تأیید بانک", actor: "مالی" },
      { from: "requested", to: "rejected", label: "رد (برگشت مبلغ به کیف پول)", actor: "مالی" },
    ],
  },
];
