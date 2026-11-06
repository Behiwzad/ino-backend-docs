import type { EnumDef } from "./types";

export const enums: EnumDef[] = [
  {
    name: "gender",
    title: "جنسیت",
    values: [
      { value: "female", fa: "زن" },
      { value: "male", fa: "مرد" },
    ],
  },
  {
    name: "user_status",
    title: "وضعیت کاربر",
    values: [
      { value: "active", fa: "فعال" },
      { value: "guest", fa: "مهمان", note: "مشتری‌ای که با نوبت دستی سالن ساخته شده و هنوز در اپ ثبت‌نام نکرده" },
      { value: "blocked", fa: "مسدود", note: "به‌دلیل گزارش تخلف؛ مودال «حساب شما مسدود شده است»" },
      { value: "deleted", fa: "حذف‌شده", note: "حذف حساب؛ داده‌ها ناشناس می‌شوند" },
    ],
  },
  {
    name: "app_kind",
    title: "نوع اپلیکیشن",
    values: [
      { value: "customer", fa: "اپ مشتری" },
      { value: "staff", fa: "پنل سالن (مالک/متخصص)" },
      { value: "admin", fa: "پنل تیم اینو" },
    ],
  },
  {
    name: "locale",
    title: "زبان برنامه",
    values: [
      { value: "fa", fa: "فارسی" },
      { value: "en", fa: "English" },
      { value: "tr", fa: "Türkçe" },
      { value: "ar", fa: "العربية" },
      { value: "fr", fa: "Français" },
    ],
  },
  {
    name: "otp_purpose",
    title: "هدف کد تایید",
    values: [
      { value: "signup", fa: "ثبت‌نام" },
      { value: "login", fa: "ورود" },
      { value: "change_mobile", fa: "تغییر شماره موبایل" },
    ],
  },
  {
    name: "language_level",
    title: "سطح تسلط زبان",
    values: [
      { value: "native", fa: "مادری" },
      { value: "fluent", fa: "مسلط" },
      { value: "intermediate", fa: "متوسط" },
      { value: "beginner", fa: "مقدماتی" },
    ],
  },
  {
    name: "salon_status",
    title: "وضعیت سالن / شعبه",
    values: [
      { value: "pending_review", fa: "در حال بررسی", note: "بعد از «ارسال برای بررسی»؛ معمولاً تا ۲۴ ساعت کاری" },
      { value: "needs_changes", fa: "نیاز به اصلاح", note: "تیم اینو یادداشت اصلاح گذاشته" },
      { value: "active", fa: "فعال", note: "در جستجوی مشتری‌ها نمایش داده می‌شود" },
      { value: "rejected", fa: "رد شده" },
      { value: "cancelled", fa: "لغو شده", note: "صاحب سالن ثبت را لغو کرده" },
      { value: "suspended", fa: "معلق", note: "توسط تیم اینو غیرفعال شده" },
    ],
  },
  {
    name: "gender_target",
    title: "پذیرش مشتری",
    values: [
      { value: "female", fa: "زنانه · فقط خانم‌ها" },
      { value: "male", fa: "مردانه · فقط آقایان" },
      { value: "both", fa: "هر دو · خانم و آقا" },
    ],
  },
  {
    name: "weekday",
    title: "روز هفته (شروع از شنبه)",
    values: [
      { value: "sat", fa: "شنبه" },
      { value: "sun", fa: "یکشنبه" },
      { value: "mon", fa: "دوشنبه" },
      { value: "tue", fa: "سه‌شنبه" },
      { value: "wed", fa: "چهارشنبه" },
      { value: "thu", fa: "پنج‌شنبه" },
      { value: "fri", fa: "جمعه" },
    ],
  },
  {
    name: "verification_type",
    title: "نوع درخواست بررسی",
    values: [
      { value: "create_salon", fa: "ثبت سالن جدید" },
      { value: "add_branch", fa: "افزودن شعبه" },
      { value: "edit_salon", fa: "ویرایش اطلاعات (بررسی دوباره)" },
    ],
  },
  {
    name: "verification_status",
    title: "وضعیت درخواست بررسی",
    values: [
      { value: "in_review", fa: "در حال بررسی" },
      { value: "needs_changes", fa: "نیاز به اصلاح" },
      { value: "approved", fa: "تأیید شد" },
      { value: "rejected", fa: "رد شد" },
      { value: "cancelled", fa: "لغو شده", note: "لغو توسط خود کاربر" },
    ],
  },
  {
    name: "member_role",
    title: "نقش عضو در شعبه",
    values: [
      { value: "owner", fa: "فقط مالک", note: "فقط مدیریت می‌کند؛ نوبت برای او ثبت نمی‌شود" },
      { value: "owner_expert", fa: "مالک و متخصص", note: "هم مدیریت و هم ارائه خدمت" },
      { value: "expert", fa: "متخصص" },
    ],
  },
  {
    name: "employment_type",
    title: "نوع همکاری",
    values: [
      { value: "full_time", fa: "تمام‌وقت" },
      { value: "part_time", fa: "پاره‌وقت" },
      { value: "freelance", fa: "فریلنسر" },
    ],
  },
  {
    name: "member_status",
    title: "وضعیت عضویت",
    values: [
      { value: "active", fa: "عضو فعال" },
      { value: "left", fa: "ترک سالن", note: "متخصص خودش خارج شده" },
      { value: "removed", fa: "حذف از تیم", note: "مالک حذف کرده" },
    ],
  },
  {
    name: "work_status",
    title: "وضعیت کاری من",
    values: [
      { value: "active", fa: "فعال", note: "قابل رزرو" },
      { value: "on_leave", fa: "مرخصی" },
      { value: "inactive", fa: "غیرفعال", note: "موقتاً نوبت نمی‌گیرد" },
    ],
  },
  {
    name: "join_request_status",
    title: "وضعیت درخواست همکاری",
    values: [
      { value: "pending", fa: "در انتظار" },
      { value: "accepted", fa: "پذیرفته شد" },
      { value: "rejected", fa: "رد شد" },
      { value: "cancelled", fa: "لغو شده" },
    ],
  },
  {
    name: "time_off_kind",
    title: "نوع زمان غیرقابل رزرو",
    values: [
      { value: "leave", fa: "مرخصی", note: "کل روز یا بخشی از روز" },
      { value: "block", fa: "بازه مسدود", note: "مثلاً استراحت ناهار" },
    ],
  },
  {
    name: "booking_status",
    title: "وضعیت رزرو",
    values: [
      { value: "pending", fa: "در انتظار تأیید سالن" },
      { value: "confirmed", fa: "تأیید شده" },
      { value: "completed", fa: "انجام‌شده" },
      { value: "rejected", fa: "رد شده توسط سالن" },
      { value: "cancelled_by_customer", fa: "لغو شده توسط مشتری" },
      { value: "cancelled_by_salon", fa: "لغو شده توسط سالن" },
      { value: "no_show", fa: "عدم حضور مشتری" },
      { value: "expired", fa: "منقضی", note: "تا زمان نوبت پاسخی داده نشد؛ لغو خودکار" },
    ],
  },
  {
    name: "booking_source",
    title: "منبع رزرو",
    values: [
      { value: "app", fa: "رزرو آنلاین مشتری" },
      { value: "manual", fa: "نوبت دستی (تلفنی/حضوری)" },
    ],
  },
  {
    name: "payment_plan",
    title: "نوع پرداخت",
    values: [
      { value: "full_online", fa: "پرداخت کامل آنلاین" },
      { value: "deposit", fa: "پرداخت در سالن + ودیعه ۱۰٪" },
      { value: "in_salon", fa: "پرداخت کامل در سالن", note: "فقط نوبت دستی" },
    ],
  },
  {
    name: "payment_method",
    title: "روش پرداخت آنلاین",
    values: [
      { value: "wallet", fa: "کیف پول" },
      { value: "gateway", fa: "درگاه بانکی" },
      { value: "cash", fa: "نقدی/کارتخوان در سالن" },
    ],
  },
  {
    name: "payment_purpose",
    title: "بابت پرداخت",
    values: [
      { value: "wallet_topup", fa: "شارژ کیف پول" },
      { value: "booking_deposit", fa: "ودیعهٔ رزرو" },
      { value: "booking_full", fa: "پرداخت کامل رزرو" },
    ],
  },
  {
    name: "payment_status",
    title: "وضعیت پرداخت",
    values: [
      { value: "initiated", fa: "ایجاد شده" },
      { value: "pending", fa: "منتظر بازگشت از درگاه" },
      { value: "succeeded", fa: "پرداخت موفق" },
      { value: "failed", fa: "ناموفق" },
      { value: "refunded", fa: "بازگشت داده شده" },
    ],
  },
  {
    name: "wallet_owner",
    title: "صاحب کیف پول",
    values: [
      { value: "user", fa: "کیف پول مشتری" },
      { value: "salon", fa: "کیف پول سالن" },
      { value: "platform", fa: "حساب اینو (کارمزد/امانت)" },
    ],
  },
  {
    name: "wallet_tx_type",
    title: "نوع تراکنش کیف پول",
    values: [
      { value: "top_up", fa: "شارژ کیف پول" },
      { value: "booking_payment", fa: "پرداخت رزرو" },
      { value: "refund", fa: "بازگشت وجه رزرو" },
      { value: "booking_income", fa: "درآمد نوبت", note: "واریز به کیف پول سالن پس از تسویه" },
      { value: "commission", fa: "کارمزد اینو" },
      { value: "withdrawal", fa: "برداشت به حساب" },
      { value: "adjustment", fa: "اصلاح دستی (ادمین)" },
    ],
  },
  {
    name: "escrow_status",
    title: "وضعیت امانت",
    values: [
      { value: "held", fa: "امانت نزد اینو تا پایان نوبت" },
      { value: "released", fa: "تسویه با سالن" },
      { value: "refunded", fa: "برگشت به مشتری" },
      { value: "split", fa: "تقسیم (بخشی سالن، بخشی مشتری)" },
    ],
  },
  {
    name: "withdrawal_status",
    title: "وضعیت برداشت",
    values: [
      { value: "requested", fa: "ثبت درخواست" },
      { value: "processing", fa: "در حال پردازش" },
      { value: "paid", fa: "واریز شد" },
      { value: "rejected", fa: "رد شد" },
    ],
  },
  {
    name: "discount_type",
    title: "نوع تخفیف",
    values: [
      { value: "percent", fa: "درصدی" },
      { value: "fixed", fa: "مبلغ ثابت" },
    ],
  },
  {
    name: "review_status",
    title: "وضعیت نظر",
    values: [
      { value: "published", fa: "منتشر شده" },
      { value: "reported", fa: "گزارش شده" },
      { value: "removed", fa: "حذف شده توسط پشتیبانی" },
    ],
  },
  {
    name: "report_status",
    title: "وضعیت گزارش",
    values: [
      { value: "open", fa: "باز" },
      { value: "accepted", fa: "پذیرفته (نظر حذف شد)" },
      { value: "dismissed", fa: "رد گزارش" },
    ],
  },
  {
    name: "notification_type",
    title: "نوع اعلان",
    values: [
      { value: "booking_requested", fa: "درخواست رزرو جدید (سالن)" },
      { value: "booking_confirmed", fa: "رزرو شما تأیید شد" },
      { value: "booking_rejected", fa: "رزرو رد شد" },
      { value: "booking_cancelled", fa: "رزرو لغو شد" },
      { value: "booking_reminder", fa: "یادآوری نوبت" },
      { value: "payment_succeeded", fa: "پرداخت با موفقیت انجام شد" },
      { value: "review_request", fa: "نظر خود را ثبت کنید" },
      { value: "promotion", fa: "تخفیف ویژه" },
      { value: "join_request_received", fa: "درخواست همکاری جدید" },
      { value: "join_request_result", fa: "نتیجه درخواست همکاری" },
      { value: "verification_result", fa: "نتیجه بررسی سالن/شعبه" },
      { value: "member_left", fa: "ترک همکاری متخصص" },
      { value: "payout", fa: "واریز/برداشت کیف پول سالن" },
    ],
  },
  {
    name: "channel",
    title: "کانال ارسال",
    values: [
      { value: "push", fa: "اعلان برنامه" },
      { value: "sms", fa: "پیامک" },
      { value: "in_app", fa: "داخل برنامه" },
    ],
  },
  {
    name: "media_kind",
    title: "نوع فایل",
    values: [
      { value: "avatar", fa: "عکس پروفایل", note: "JPG/PNG حداکثر ۵ مگابایت" },
      { value: "salon_logo", fa: "لوگوی سالن", note: "مربعی، حداکثر ۲ مگابایت" },
      { value: "branch_photo", fa: "تصویر شعبه" },
      { value: "portfolio", fa: "نمونه‌کار", note: "JPG/PNG/WEBP تا ۵ مگابایت" },
      { value: "receipt", fa: "رسید" },
    ],
  },
  {
    name: "cancel_actor",
    title: "طرف لغو",
    values: [
      { value: "customer", fa: "مشتری" },
      { value: "salon", fa: "سالن" },
      { value: "system", fa: "سیستم" },
    ],
  },
  {
    name: "platform_os",
    title: "سیستم‌عامل",
    values: [
      { value: "ios", fa: "iOS" },
      { value: "android", fa: "Android" },
      { value: "web", fa: "Web" },
    ],
  },
  {
    name: "admin_role",
    title: "نقش ادمین",
    values: [
      { value: "super_admin", fa: "مدیر کل" },
      { value: "reviewer", fa: "بررسی‌کننده سالن" },
      { value: "support", fa: "پشتیبانی" },
      { value: "finance", fa: "مالی" },
    ],
  },
];

export const enumMap = Object.fromEntries(enums.map((e) => [e.name, e]));
