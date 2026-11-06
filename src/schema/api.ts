export type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export type Auth = "public" | "customer" | "staff" | "owner" | "expert" | "admin";

export interface Endpoint {
  method: Method;
  path: string;
  group: string;
  auth: Auth;
  summary: string;
  tables: string[];
  body?: Record<string, string>;
  query?: Record<string, string>;
  returns?: string;
  errors?: string[];
}

export const apiGroups: { key: string; title: string; app: "shared" | "customer" | "staff" | "admin" }[] = [
  { key: "auth", title: "احراز هویت", app: "shared" },
  { key: "me", title: "پروفایل و حساب", app: "shared" },
  { key: "explore", title: "کشف و جستجو", app: "customer" },
  { key: "salon-public", title: "صفحه سالن / متخصص", app: "customer" },
  { key: "booking", title: "فرآیند رزرو", app: "customer" },
  { key: "wallet", title: "کیف پول و پرداخت", app: "customer" },
  { key: "customer-misc", title: "علاقه‌مندی، آدرس، اعلان", app: "customer" },
  { key: "onboarding", title: "ثبت سالن و پیوستن", app: "staff" },
  { key: "staff-home", title: "خانه پنل", app: "staff" },
  { key: "staff-bookings", title: "مدیریت رزروها", app: "staff" },
  { key: "calendar", title: "تقویم، ساعات و مرخصی", app: "staff" },
  { key: "services", title: "خدمات و قیمت‌ها", app: "staff" },
  { key: "team", title: "تیم و درخواست‌ها", app: "staff" },
  { key: "crm", title: "مشتریان و نظرات", app: "staff" },
  { key: "pro-profile", title: "پروفایل حرفه‌ای و نمونه‌کار", app: "staff" },
  { key: "salon-admin", title: "اطلاعات سالن و شعبه", app: "staff" },
  { key: "income", title: "درآمد و برداشت", app: "staff" },
  { key: "admin", title: "پنل تیم اینو", app: "admin" },
];

const E = (method: Method, path: string, group: string, auth: Auth, summary: string, tables: string[], extra: Partial<Endpoint> = {}): Endpoint => ({ method, path, group, auth, summary, tables, ...extra });

export const endpoints: Endpoint[] = [
  /* auth */
  E("POST", "/v1/auth/otp", "auth", "public", "ارسال کد تایید (ثبت‌نام/ورود)", ["otp_codes", "sms_messages", "users"], { body: { mobile: "string(+98…)", purpose: "signup|login", app: "customer|staff" }, returns: "{ expires_in: 120, resend_in: 120 }", errors: ["INVALID_MOBILE", "USER_EXISTS", "USER_NOT_FOUND", "RATE_LIMITED", "ACCOUNT_BLOCKED"] }),
  E("POST", "/v1/auth/otp/verify", "auth", "public", "تایید کد و صدور توکن", ["otp_codes", "users", "auth_sessions"], { body: { mobile: "string", code: "string(4)", device: "{name, os, os_version, push_token}" }, returns: "{ access_token, refresh_token, user, needs_profile: bool }", errors: ["WRONG_CODE", "CODE_EXPIRED", "TOO_MANY_ATTEMPTS(10m lock)"] }),
  E("POST", "/v1/auth/refresh", "auth", "public", "تمدید توکن", ["auth_sessions"], { body: { refresh_token: "string" } }),
  E("POST", "/v1/auth/logout", "auth", "customer", "خروج از حساب (نشست فعلی)", ["auth_sessions"]),
  /* me */
  E("GET", "/v1/me", "me", "customer", "پروفایل کاربر + موجودی کیف پول + نقش‌ها", ["users", "wallets", "branch_members"]),
  E("PATCH", "/v1/me", "me", "customer", "تکمیل/ویرایش پروفایل", ["users", "user_languages"], { body: { first_name: "string", last_name: "string", gender: "female|male", email: "string?", birth_date: "date?", instagram: "string?", languages: "[{code, level}]?" } }),
  E("PUT", "/v1/me/avatar", "me", "customer", "آپلود/حذف عکس پروفایل", ["media_files", "users"], { body: { media_id: "bigint|null" } }),
  E("GET", "/v1/me/settings", "me", "customer", "دریافت تنظیمات", ["user_settings"]),
  E("PATCH", "/v1/me/settings", "me", "customer", "تغییر سوییچ‌ها و زبان", ["user_settings", "users"], { body: { push_enabled: "bool", sms_enabled: "bool", dark_mode: "bool", location_enabled: "bool", locale: "fa|en|tr|ar|fr" } }),
  E("POST", "/v1/me/mobile/change", "me", "customer", "ارسال کد به شماره جدید", ["otp_codes"], { body: { new_mobile: "string" } }),
  E("POST", "/v1/me/mobile/verify", "me", "customer", "تایید و تغییر شماره", ["otp_codes", "users"], { body: { new_mobile: "string", code: "string" } }),
  E("GET", "/v1/me/sessions", "me", "customer", "دستگاه‌های متصل", ["auth_sessions"]),
  E("DELETE", "/v1/me/sessions/{id}", "me", "customer", "قطع دسترسی یک دستگاه", ["auth_sessions"]),
  E("DELETE", "/v1/me/sessions", "me", "customer", "خروج از سایر دستگاه‌ها", ["auth_sessions"]),
  E("GET", "/v1/me/deletion-check", "me", "customer", "بررسی امکان حذف حساب", ["bookings"], { returns: "{ allowed: bool, reason?: 'ACTIVE_BOOKINGS' }" }),
  E("DELETE", "/v1/me", "me", "customer", "حذف حساب (غیرقابل بازگشت)", ["users", "favorites", "wallets", "auth_sessions"], { body: { confirm: "true" }, errors: ["ACTIVE_BOOKINGS"] }),
  /* explore */
  E("GET", "/v1/home", "explore", "customer", "خانه: انواع سالن، پیشنهادی، ویژه، نزدیک، متخصصین برتر", ["salon_types", "salons", "branches", "branch_members"], { query: { lat: "number", lng: "number" } }),
  E("GET", "/v1/salon-types", "explore", "public", "انواع سالن", ["salon_types"]),
  E("GET", "/v1/search", "explore", "customer", "جستجوی خدمات، سالن‌ها و متخصصین", ["branches", "services", "branch_members", "search_history"], { query: { q: "string", tab: "all|services|salons|experts", lat: "number", lng: "number", type: "salon_type slug", date: "date?", time_window: "morning|afternoon|evening|custom", gender: "female|male|all", max_price: "number", sort: "nearest|top_rated|relevant", page: "int" } }),
  E("GET", "/v1/search/map", "explore", "customer", "نتایج روی نقشه (bbox)", ["branches"], { query: { bbox: "minLng,minLat,maxLng,maxLat", "...filters": "" } }),
  E("GET", "/v1/search/recent", "explore", "customer", "جستجوهای اخیر", ["search_history"]),
  E("DELETE", "/v1/search/recent", "explore", "customer", "پاک کردن جستجوهای اخیر", ["search_history"]),
  E("GET", "/v1/geo/cities", "explore", "public", "لیست شهرها", ["cities", "provinces"]),
  E("GET", "/v1/geo/autocomplete", "explore", "customer", "جستجوی آدرس (proxy سرویس نقشه)", [], { query: { q: "string", city_id: "bigint" } }),
  /* salon public */
  E("GET", "/v1/branches/{id}", "salon-public", "public", "صفحه سالن (شعبه): هدر، درباره ما، ساعات، آدرس، آمار", ["branches", "salons", "branch_working_hours", "branch_media"]),
  E("GET", "/v1/branches/{id}/services", "salon-public", "public", "خدمات به تفکیک دسته", ["services", "service_categories"]),
  E("GET", "/v1/branches/{id}/experts", "salon-public", "public", "متخصصین شعبه", ["branch_members", "users"], { query: { service_ids: "bigint[]?" } }),
  E("GET", "/v1/branches/{id}/reviews", "salon-public", "public", "نظرات شعبه", ["reviews"], { query: { rating: "1..5?", page: "int" } }),
  E("GET", "/v1/branches/{id}/portfolio", "salon-public", "public", "نمونه کارها", ["portfolio_items", "branch_media"]),
  E("GET", "/v1/branches/{id}/nearby", "salon-public", "public", "سالن‌های نزدیک", ["branches"]),
  E("GET", "/v1/experts/{member_id}", "salon-public", "public", "پروفایل متخصص: نمایه، خدمات، نمونه‌کار، نظرات", ["branch_members", "users", "user_languages", "member_services", "portfolio_items", "reviews"]),
  /* booking */
  E("POST", "/v1/booking/availability", "booking", "customer", "روزها و اسلات‌های خالی برای خدمات انتخابی", ["branch_working_hours", "staff_working_hours", "time_offs", "booking_items", "slot_holds", "branch_closures"], { body: { branch_id: "bigint", items: "[{service_id, member_id|null}]", from: "date", days: "int(7)" }, returns: "{ days:[{date, slots:['10:00','10:15',…]}] }", errors: ["SALON_CLOSED"] }),
  E("POST", "/v1/booking/hold", "booking", "customer", "قفل موقت اسلات قبل از پرداخت", ["slot_holds"], { body: { branch_id: "bigint", items: "[{service_id, member_id|null}]", start_at: "timestamptz" }, returns: "{ hold_id, expires_at, assigned_members }", errors: ["SLOT_TAKEN", "TIME_CONFLICT"] }),
  E("POST", "/v1/booking/quote", "booking", "customer", "بررسی رزرو: جمع، تخفیف، ودیعه", ["services", "discount_codes", "branches"], { body: { hold_id: "bigint", discount_code: "string?", payment_plan: "full_online|deposit" }, returns: "{ subtotal, discount, total, deposit, pay_now, due_in_salon, free_cancel_until }", errors: ["INVALID_CODE", "CODE_EXPIRED"] }),
  E("POST", "/v1/bookings", "booking", "customer", "ثبت رزرو و شروع پرداخت", ["bookings", "booking_items", "payments", "wallet_transactions", "escrow_holds", "discount_redemptions", "slot_holds", "booking_status_logs"], { body: { hold_id: "bigint", payment_plan: "full_online|deposit", payment_method: "wallet|gateway", discount_code: "string?" }, returns: "{ booking, payment: { redirect_url? } }", errors: ["INSUFFICIENT_BALANCE", "HOLD_EXPIRED", "SLOT_TAKEN"] }),
  E("POST", "/v1/payments/callback/{gateway}", "booking", "public", "بازگشت از درگاه بانکی", ["payments", "escrow_holds", "wallet_transactions", "bookings"]),
  E("GET", "/v1/bookings", "booking", "customer", "رزروهای من (آینده/گذشته)", ["bookings", "booking_items", "branches"], { query: { tab: "upcoming|past" } }),
  E("GET", "/v1/bookings/{id}", "booking", "customer", "جزئیات رزرو + سیاست لغو", ["bookings", "booking_items", "payments"]),
  E("POST", "/v1/bookings/{id}/cancel", "booking", "customer", "لغو رزرو توسط مشتری", ["bookings", "escrow_holds", "wallet_transactions", "booking_status_logs", "notifications"], { returns: "{ refund_amount, is_late }" }),
  E("POST", "/v1/bookings/{id}/rebook", "booking", "customer", "رزرو دوباره (پر کردن سبد)", ["bookings", "booking_items"]),
  E("GET", "/v1/payments/{id}/receipt", "booking", "customer", "رسید پرداخت", ["payments"]),
  E("POST", "/v1/bookings/{id}/review", "booking", "customer", "ثبت نظر", ["reviews", "branches", "branch_members"], { body: { rating: "1..5", comment: "string(≤200)?", is_anonymous: "bool" }, errors: ["NOT_COMPLETED", "ALREADY_REVIEWED"] }),
  /* wallet */
  E("GET", "/v1/wallet", "wallet", "customer", "موجودی کیف پول", ["wallets"]),
  E("GET", "/v1/wallet/transactions", "wallet", "customer", "تراکنش‌ها (همه/واریز/برداشت)", ["wallet_transactions"], { query: { direction: "all|in|out", cursor: "string" } }),
  E("POST", "/v1/wallet/topup", "wallet", "customer", "افزایش موجودی از درگاه", ["payments"], { body: { amount: "bigint (250k…3M presets)" }, returns: "{ redirect_url }" }),
  /* customer misc */
  E("GET", "/v1/favorites", "customer-misc", "customer", "علاقه‌مندی‌ها", ["favorites", "branches"]),
  E("PUT", "/v1/favorites/{branch_id}", "customer-misc", "customer", "افزودن به علاقه‌مندی", ["favorites"]),
  E("DELETE", "/v1/favorites/{branch_id}", "customer-misc", "customer", "حذف از علاقه‌مندی", ["favorites"]),
  E("GET", "/v1/addresses", "customer-misc", "customer", "آدرس‌های من", ["user_addresses"]),
  E("POST", "/v1/addresses", "customer-misc", "customer", "افزودن آدرس دلخواه", ["user_addresses"], { body: { label: "string(≤100)", address_line: "string", lat: "number", lng: "number" } }),
  E("PATCH", "/v1/addresses/{id}", "customer-misc", "customer", "ویرایش آدرس", ["user_addresses"]),
  E("DELETE", "/v1/addresses/{id}", "customer-misc", "customer", "حذف آدرس", ["user_addresses"]),
  E("GET", "/v1/notifications", "customer-misc", "customer", "اعلان‌ها", ["notifications"]),
  E("POST", "/v1/notifications/read", "customer-misc", "customer", "خوانده شدن اعلان‌ها", ["notifications"]),
  E("GET", "/v1/support/faqs", "customer-misc", "public", "سوالات متداول", ["faqs"]),
  E("GET", "/v1/app/version", "customer-misc", "public", "نسخه برنامه / آپدیت اجباری", ["app_releases"]),
  /* staff onboarding */
  E("GET", "/v1/staff/my-salons", "onboarding", "staff", "سالن‌های من + نقش در هر شعبه (Salon Switcher)", ["branch_members", "branches", "salons"]),
  E("POST", "/v1/staff/salons", "onboarding", "staff", "ثبت سالن (۴ مرحله) و ارسال برای بررسی", ["salons", "branches", "branch_working_hours", "verification_requests", "branch_members", "media_files"], { body: { salon_type_id: "bigint", name: "string", logo_media_id: "bigint?", branch: "{name, phone, city_id, address, lat, lng, gender_target}", hours: "[{weekday, is_closed, opens_at, closes_at}]×7", role: "owner_expert|owner", job_title: "string?" }, errors: ["NAME_REQUIRED", "INVALID_HOURS", "ALL_CLOSED"] }),
  E("POST", "/v1/staff/salons/{id}/branches", "onboarding", "owner", "افزودن شعبه (۳ مرحله)", ["branches", "branch_working_hours", "verification_requests"]),
  E("GET", "/v1/staff/requests", "onboarding", "staff", "درخواست‌های من (ثبت سالن، شعبه، همکاری)", ["verification_requests", "join_requests"], { query: { status: "pending|all" } }),
  E("GET", "/v1/staff/verification-requests/{id}", "onboarding", "staff", "وضعیت بررسی (تایم‌لاین)", ["verification_requests"]),
  E("PATCH", "/v1/staff/verification-requests/{id}", "onboarding", "staff", "اصلاح و ارسال دوباره", ["verification_requests", "salons", "branches"]),
  E("POST", "/v1/staff/verification-requests/{id}/cancel", "onboarding", "staff", "لغو ثبت سالن/شعبه", ["verification_requests", "salons", "branches"]),
  E("GET", "/v1/staff/join/search", "onboarding", "staff", "جستجوی سالن برای پیوستن", ["branches", "salons", "join_requests"], { query: { city_id: "bigint", q: "string", type: "slug" } }),
  E("POST", "/v1/staff/join-requests", "onboarding", "staff", "ارسال درخواست همکاری", ["join_requests", "notifications"], { body: { branch_id: "bigint", job_title: "string", employment_type: "full_time|part_time|freelance", message: "string?" }, errors: ["JOB_TITLE_REQUIRED", "PENDING_EXISTS", "OWN_SALON"] }),
  E("POST", "/v1/staff/join-requests/{id}/cancel", "onboarding", "staff", "لغو درخواست همکاری", ["join_requests"]),
  E("POST", "/v1/staff/memberships/{id}/leave", "onboarding", "expert", "ترک سالن", ["branch_members", "notifications"]),
  /* staff home */
  E("GET", "/v1/staff/branches/{id}/dashboard", "staff-home", "staff", "خانه: آمار، درخواست‌های در انتظار، نوبت بعدی، برنامه امروز، مدیریت سالن، چک‌لیست راه‌اندازی", ["bookings", "branch_members", "join_requests", "wallet_transactions"]),
  E("PATCH", "/v1/staff/memberships/{id}/work-status", "staff-home", "expert", "وضعیت کاری من (فعال/مرخصی/غیرفعال)", ["branch_members"], { body: { work_status: "active|on_leave|inactive" } }),
  /* staff bookings */
  E("GET", "/v1/staff/branches/{id}/bookings", "staff-bookings", "staff", "رزروها: در انتظار، امروز، آینده، انجام‌شده، لغو و رد", ["bookings", "booking_items", "users"], { query: { tab: "pending|today|upcoming|completed|cancelled", q: "customer name", mine: "bool" } }),
  E("GET", "/v1/staff/bookings/{id}", "staff-bookings", "staff", "جزئیات رزرو + خلاصه مالی سالن", ["bookings", "booking_items", "payments", "escrow_holds"]),
  E("POST", "/v1/staff/bookings/{id}/confirm", "staff-bookings", "staff", "تأیید رزرو (پیامک به مشتری)", ["bookings", "booking_status_logs", "notifications", "sms_messages"]),
  E("POST", "/v1/staff/bookings/{id}/reject", "staff-bookings", "staff", "رد درخواست رزرو", ["bookings", "escrow_holds", "wallet_transactions"], { body: { reason_code: "string", note: "string?" } }),
  E("POST", "/v1/staff/bookings/{id}/cancel", "staff-bookings", "staff", "لغو نوبت توسط سالن (برگشت کامل)", ["bookings", "escrow_holds", "wallet_transactions"], { body: { reason_code: "string", note: "string?" } }),
  E("POST", "/v1/staff/bookings/{id}/complete", "staff-bookings", "staff", "ثبت انجام (تسویه امانت)", ["bookings", "escrow_holds", "wallet_transactions", "branch_customers", "notifications"]),
  E("POST", "/v1/staff/bookings/{id}/no-show", "staff-bookings", "staff", "ثبت عدم حضور مشتری", ["bookings", "escrow_holds", "wallet_transactions", "branch_customers"]),
  E("POST", "/v1/staff/branches/{id}/manual-bookings", "staff-bookings", "staff", "ثبت نوبت دستی (مشتری جدید/قبلی)", ["bookings", "booking_items", "users", "branch_customers", "sms_messages"], { body: { mobile: "string", name: "string?(new customer)", items: "[{service_id, member_id}]", start_at: "timestamptz" }, errors: ["NO_FREE_TIME", "SERVICES_TOO_LONG"] }),
  E("GET", "/v1/staff/customers/lookup", "staff-bookings", "staff", "یافتن مشتری با شماره", ["users", "branch_customers"], { query: { branch_id: "bigint", mobile: "string" } }),
  /* calendar */
  E("GET", "/v1/staff/branches/{id}/calendar", "calendar", "staff", "تقویم روز/هفته (نوبت‌ها، مسدود، مرخصی، تعطیلی)", ["bookings", "booking_items", "time_offs", "branch_working_hours", "staff_working_hours", "branch_closures"], { query: { date: "date", member_id: "bigint?|all" } }),
  E("GET", "/v1/staff/branches/{id}/calendar/month", "calendar", "staff", "تقویم کامل ماه (روزهای دارای نوبت / تعطیل)", ["bookings", "branch_working_hours"]),
  E("POST", "/v1/staff/time-offs", "calendar", "staff", "ثبت مرخصی / مسدود کردن بازه", ["time_offs"], { body: { member_id: "bigint", kind: "leave|block", date: "date", starts_at: "time?", ends_at: "time?", reason: "string?" }, errors: ["OVERLAPS_BOOKING"] }),
  E("PATCH", "/v1/staff/time-offs/{id}", "calendar", "staff", "ویرایش بازه مسدود", ["time_offs"]),
  E("DELETE", "/v1/staff/time-offs/{id}", "calendar", "staff", "حذف بازه/مرخصی", ["time_offs"]),
  E("GET", "/v1/staff/memberships/{id}/hours", "calendar", "staff", "برنامه هفتگی من + ساعات سالن", ["staff_working_hours", "branch_working_hours"]),
  E("PUT", "/v1/staff/memberships/{id}/hours", "calendar", "staff", "ویرایش ساعات حضور من", ["staff_working_hours"], { errors: ["OUTSIDE_BRANCH_HOURS", "CONFLICT_OTHER_SALON"] }),
  E("PUT", "/v1/staff/branches/{id}/hours", "calendar", "owner", "ویرایش ساعات کاری سالن", ["branch_working_hours"], { returns: "{ affected_bookings: [] }" }),
  /* services */
  E("GET", "/v1/staff/branches/{id}/services", "services", "staff", "خدمات و قیمت‌ها (مالک: همه / متخصص: خدمات من)", ["services", "service_categories", "member_services"], { query: { q: "string", category_id: "bigint" } }),
  E("POST", "/v1/staff/branches/{id}/services", "services", "owner", "افزودن خدمت", ["services", "member_services"], { body: { name: "string", category_id: "bigint", duration_min: "int", buffer_min: "int", description: "string?", price: "bigint", discount_percent: "int?", member_ids: "bigint[]" } }),
  E("PATCH", "/v1/staff/services/{id}", "services", "owner", "ویرایش خدمت", ["services", "member_services", "audit_logs"]),
  E("DELETE", "/v1/staff/services/{id}", "services", "owner", "حذف خدمت (soft)", ["services"]),
  E("PATCH", "/v1/staff/memberships/{id}/services/{service_id}", "services", "expert", "فعال/غیرفعال کردن خدمت برای خودم", ["member_services"], { body: { is_enabled: "bool" } }),
  /* team */
  E("GET", "/v1/staff/branches/{id}/team", "team", "owner", "تیم و متخصص‌ها", ["branch_members", "users"]),
  E("GET", "/v1/staff/members/{id}", "team", "owner", "جزئیات عضو", ["branch_members", "member_services", "staff_working_hours", "time_offs"]),
  E("PATCH", "/v1/staff/members/{id}", "team", "owner", "ویرایش اطلاعات همکاری", ["branch_members"]),
  E("DELETE", "/v1/staff/members/{id}", "team", "owner", "حذف از تیم", ["branch_members", "bookings"], { returns: "{ upcoming_bookings: 8 }", errors: ["HAS_UPCOMING_BOOKINGS"] }),
  E("GET", "/v1/staff/branches/{id}/join-requests", "team", "owner", "درخواست‌های همکاری", ["join_requests", "users"]),
  E("POST", "/v1/staff/join-requests/{id}/accept", "team", "owner", "پذیرش (با امکان تغییر عنوان/نوع همکاری)", ["join_requests", "branch_members", "notifications"], { body: { job_title: "string", employment_type: "enum" } }),
  E("POST", "/v1/staff/join-requests/{id}/reject", "team", "owner", "رد درخواست", ["join_requests", "notifications"], { body: { reason: "string?" } }),
  /* crm */
  E("GET", "/v1/staff/branches/{id}/customers", "crm", "staff", "مشتریان (همه/وفادار/نوبت پیش رو/جدید)", ["branch_customers", "users"], { query: { segment: "all|loyal|upcoming|new", q: "name|mobile", sort: "most_bookings|recent" } }),
  E("GET", "/v1/staff/branch-customers/{id}", "crm", "staff", "پرونده مشتری", ["branch_customers", "bookings", "booking_items", "customer_notes"]),
  E("PUT", "/v1/staff/branch-customers/{id}/note", "crm", "staff", "یادداشت خصوصی", ["customer_notes"]),
  E("GET", "/v1/staff/branches/{id}/reviews", "crm", "staff", "نظرات مشتریان (فیلتر ستاره)", ["reviews"], { query: { rating: "1..5?", member_id: "bigint?" } }),
  E("POST", "/v1/staff/reviews/{id}/report", "crm", "staff", "گزارش نظر", ["review_reports", "reviews"]),
  /* pro profile */
  E("PATCH", "/v1/staff/memberships/{id}/profile", "pro-profile", "expert", "ویرایش پروفایل حرفه‌ای در این سالن", ["branch_members"], { body: { job_title: "string", years_experience: "int", bio: "string" } }),
  E("GET", "/v1/staff/memberships/{id}/portfolio", "pro-profile", "expert", "نمونه‌کارها", ["portfolio_items"]),
  E("POST", "/v1/staff/memberships/{id}/portfolio", "pro-profile", "expert", "افزودن نمونه‌کار", ["portfolio_items", "media_files"], { body: { media_id: "bigint", caption: "string?" } }),
  E("PATCH", "/v1/staff/portfolio/{id}", "pro-profile", "expert", "ویرایش توضیح نمونه‌کار", ["portfolio_items"]),
  E("PUT", "/v1/staff/memberships/{id}/portfolio/order", "pro-profile", "expert", "ذخیره ترتیب", ["portfolio_items"], { body: { ids: "bigint[]" } }),
  E("DELETE", "/v1/staff/portfolio/{id}", "pro-profile", "expert", "حذف نمونه‌کار", ["portfolio_items"]),
  E("POST", "/v1/media", "pro-profile", "staff", "آپلود فایل (presigned)", ["media_files"], { body: { kind: "avatar|salon_logo|branch_photo|portfolio", mime: "string", size: "int" }, errors: ["FILE_TOO_LARGE", "UNSUPPORTED_TYPE"] }),
  /* salon admin */
  E("GET", "/v1/staff/salons/{id}", "salon-admin", "owner", "اطلاعات کلی سالن + شعبه‌ها", ["salons", "branches"]),
  E("PATCH", "/v1/staff/salons/{id}", "salon-admin", "owner", "تغییر نام/لوگو (همه شعبه‌ها)", ["salons", "audit_logs"]),
  E("PATCH", "/v1/staff/branches/{id}", "salon-admin", "owner", "ویرایش شعبه (درباره، آدرس، تماس، نوع خدمات)", ["branches", "branch_categories"]),
  E("POST", "/v1/staff/branches/{id}/media", "salon-admin", "owner", "افزودن تصویر شعبه / انتخاب کاور", ["branch_media"]),
  E("DELETE", "/v1/staff/branches/{id}", "salon-admin", "owner", "حذف شعبه", ["branches", "branch_members"], { errors: ["HAS_UPCOMING_BOOKINGS"] }),
  /* income */
  E("GET", "/v1/staff/salons/{id}/wallet", "income", "owner", "کیف پول سالن + نمودار درآمد + نرخ تکمیل", ["wallets", "wallet_transactions", "bookings"], { query: { range: "week|month|year" } }),
  E("GET", "/v1/staff/salons/{id}/wallet/transactions", "income", "owner", "تراکنش‌ها", ["wallet_transactions"]),
  E("POST", "/v1/staff/salons/{id}/withdrawals", "income", "owner", "درخواست برداشت", ["withdrawals", "wallet_transactions", "bank_accounts"], { body: { amount: "bigint", bank_account_id: "bigint" }, errors: ["INSUFFICIENT_BALANCE"] }),
  /* admin */
  E("GET", "/v1/admin/verification-requests", "admin", "admin", "صف بررسی سالن/شعبه", ["verification_requests"]),
  E("POST", "/v1/admin/verification-requests/{id}/decide", "admin", "admin", "تأیید / نیاز به اصلاح / رد", ["verification_requests", "salons", "branches", "notifications"], { body: { decision: "approve|needs_changes|reject", note: "string?" } }),
  E("GET", "/v1/admin/review-reports", "admin", "admin", "گزارش‌های نظر", ["review_reports", "reviews"]),
  E("POST", "/v1/admin/review-reports/{id}/resolve", "admin", "admin", "حذف نظر / رد گزارش", ["review_reports", "reviews"]),
  E("POST", "/v1/admin/users/{id}/block", "admin", "admin", "مسدود کردن حساب", ["users", "auth_sessions"]),
  E("POST", "/v1/admin/discount-codes", "admin", "admin", "ساخت کد تخفیف", ["discount_codes"]),
  E("PATCH", "/v1/admin/withdrawals/{id}", "admin", "admin", "پردازش برداشت", ["withdrawals", "wallet_transactions"]),
  E("PATCH", "/v1/admin/salons/{id}/featured", "admin", "admin", "ویژه کردن سالن", ["salons"]),
];
