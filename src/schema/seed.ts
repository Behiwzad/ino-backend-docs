/* Deterministic, FK-consistent fake data built from the names/values that appear in the app screens.
   Derived tables (booking money, escrow, wallets, ledger, CRM aggregates) are computed, not hand-typed. */

export type Row = Record<string, string | number | boolean | null | object>;
export type Seed = Record<string, Row[]>;

const TZ = "+03:30";
const ts = (date: string, time = "10:00") => `${date}T${time}:00${TZ}`;
const addMin = (iso: string, min: number) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + min);
  // format back in Tehran offset
  const t = new Date(d.getTime() + 210 * 60000);
  return t.toISOString().slice(0, 19) + TZ;
};
const addHours = (iso: string, h: number) => addMin(iso, h * 60);

export function buildSeed(): Seed {
  const S: Seed = {};

  /* ───── catalog ───── */
  const salonTypes = [
    ["beauty_salon", "سالن زیبایی", "Beauty Salon", true],
    ["hair_salon", "سالن مو", "Hair Salon", true],
    ["barber", "آرایشگاه مردانه", "Barbershop", true],
    ["nail_salon", "سالن ناخن", "Nail Salon", true],
    ["skin_care", "مراقبت پوست", "Skin Care", true],
    ["laser", "مرکز لیزر مو", "Laser Center", true],
    ["massage", "مرکز ماساژ", "Massage Center", false],
    ["spa", "اسپا و سونا", "Spa & Sauna", false],
    ["wellness", "مرکز سلامت", "Wellness Center", false],
    ["physio", "فیزیوتراپی", "Physiotherapy", false],
    ["dental", "دندانپزشکی", "Dentistry", false],
    ["gym", "باشگاه ورزشی", "Fitness", false],
    ["pet", "خدمات حیوانات خانگی", "Pet Services", false],
  ] as const;
  S.salon_types = salonTypes.map(([slug, fa, en, f], i) => ({ id: i + 1, slug, name_fa: fa, name_en: en, icon: slug, sort: i + 1, is_featured: f }));
  const T = (slug: string) => salonTypes.findIndex((s) => s[0] === slug) + 1;

  S.languages = [
    ["fa", "فارسی", "فارسی"], ["en", "انگلیسی", "English"], ["az", "آذری", "Azərbaycan"], ["tr", "ترکی استانبولی", "Türkçe"],
    ["ar", "عربی", "العربية"], ["ku", "کردی", "Kurdî"], ["fr", "فرانسوی", "Français"], ["de", "آلمانی", "Deutsch"], ["ru", "روسی", "Русский"],
  ].map(([code, name_fa, native_name]) => ({ code, name_fa, native_name }));

  const templates = [
    ["کوتاهی مو", "hair_salon"], ["میکاپ عروس", "beauty_salon"], ["ژلیش ناخن", "nail_salon"], ["فید مو", "barber"], ["مشاوره تغذیه", "wellness"],
    ["ماساژ سوئدی", "massage"], ["فیشیال", "skin_care"], ["سونا", "spa"], ["فیزیوتراپی", "physio"], ["سفید کردن دندان", "dental"],
    ["آرایش حیوانات", "pet"], ["تمرین شخصی", "gym"], ["لیزر مو", "laser"], ["رنگ مو", "hair_salon"],
  ];
  S.service_templates = templates.map(([name, t], i) => ({ id: i + 1, salon_type_id: T(t), name, slug: `tpl-${i + 1}`, is_top: i < 13, sort: i + 1 }));

  /* ───── geo ───── */
  S.provinces = [
    { id: 1, name: "البرز", slug: "alborz" }, { id: 2, name: "تهران", slug: "tehran" }, { id: 3, name: "آذربایجان شرقی", slug: "east-azarbaijan" },
    { id: 4, name: "خراسان رضوی", slug: "razavi-khorasan" }, { id: 5, name: "اصفهان", slug: "isfahan" }, { id: 6, name: "فارس", slug: "fars" },
    { id: 7, name: "گیلان", slug: "gilan" }, { id: 8, name: "قم", slug: "qom" }, { id: 9, name: "خوزستان", slug: "khuzestan" },
  ];
  const cities: [string, string, number, number, number][] = [
    ["کرج", "karaj", 1, 35.8327, 50.9915], ["تهران", "tehran", 2, 35.6892, 51.389], ["تبریز", "tabriz", 3, 38.0962, 46.2738],
    ["مشهد", "mashhad", 4, 36.2605, 59.6168], ["اصفهان", "isfahan", 5, 32.6539, 51.666], ["شیراز", "shiraz", 6, 29.5918, 52.5837],
    ["رشت", "rasht", 7, 37.2808, 49.5832], ["قم", "qom", 8, 34.6416, 50.8746], ["اهواز", "ahvaz", 9, 31.3183, 48.6706],
  ];
  S.cities = cities.map(([name, slug, p, la, ln], i) => ({ id: i + 1, province_id: p, name, slug, lat: la, lng: ln, is_active: true }));

  /* ───── media ───── */
  const media: Row[] = [];
  const addMedia = (kind: string, name: string, by: number | null, size = 245760) => {
    const id = media.length + 1;
    media.push({ id, uploaded_by: by, kind, storage_key: `${kind}/${id}-${name}`, url: `https://cdn.ino.app/${kind}/${id}-${name}`, mime: name.endsWith(".png") ? "image/png" : "image/jpeg", size_bytes: size, width: 1080, height: 1080, original_name: name, created_at: ts("2026-06-01"), deleted_at: null });
    return id;
  };

  /* ───── users ───── */
  type U = [string, string, "female" | "male", string, string | null];
  const people: U[] = [
    ["سارا", "محمدی", "female", "+989123456782", "sara.mhd@gmail.com"], // 1 customer
    ["مهسا", "کریمی", "female", "+989121000001", "mahsa@example.com"], // 2 owner+expert
    ["نیلوفر", "قاسمی", "female", "+989121000002", null], // 3 owner royal
    ["یاسمن", "کیانی", "female", "+989121000012", null], // 4 expert aria
    ["کیانا", "مرادی", "female", "+989121000013", null], // 5 expert aria
    ["ترانه", "موسوی", "female", "+989121000014", null], // 6 expert aria
    ["مریم", "احمدی", "female", "+989123456789", null], // 7 join request
    ["الناز", "رضایی", "female", "+989121000016", null], // 8 customer + join request
    ["نازنین", "احمدی", "female", "+989173456789", null], // 9
    ["سپیده", "نیک‌نام", "female", "+989173030871", null], // 10
    ["آیدا", "شریفی", "female", "+989121000020", null], // 11
    ["هانیه", "کریم‌پور", "female", "+989183076079", null], // 12
    ["نسترن", "عباسی", "female", "+989159658384", null], // 13
    ["زهرا", "کاظمی", "female", "+989121000023", null], // 14
    ["النا", "رستمی", "female", "+989121000024", null], // 15
    ["نگار", "محمدی", "female", "+989121000025", null], // 16
    ["ترانه", "علوی", "female", "+989121000026", null], // 17
    ["فاطمه", "اسدی", "female", "+989121000027", null], // 18
    ["امیر", "حسینی", "male", "+989121000028", null], // 19 owner barber
    ["زهرا", "صادقی", "female", "+989121000029", null], // 20 owner derma
    ["شیرین", "نیلی", "female", "+989121000030", null], // 21 owner nilland
    ["سارا", "رضایی", "female", "+989352210400", null], // 22 guest (manual booking)
    ["نیوشا", "پرنیان", "female", "+989121000032", null], // 23 owner princess (pending)
  ];
  S.users = people.map(([fn, ln, g, m, email], i) => {
    const id = i + 1;
    const avatar = addMedia("avatar", `u${id}.jpg`, id);
    return {
      id, mobile: m, first_name: fn, last_name: ln, full_name_en: null, gender: g, email,
      birth_date: id === 2 ? "1995-04-12" : null, avatar_media_id: avatar,
      instagram: id === 2 ? "mahsa.karimi.hair" : null, locale: "fa",
      status: id === 22 ? "guest" : "active", blocked_reason: null,
      profile_completed_at: id === 22 ? null : ts("2026-05-10"), terms_accepted_at: id === 22 ? null : ts("2026-05-10"),
      last_login_at: id === 22 ? null : ts("2026-10-19", "08:30"), created_at: ts("2026-05-10"), updated_at: ts("2026-10-19"), deleted_at: null,
    };
  });
  (S.users[1] as Row).full_name_en = "Mahsa Karimi";
  const userName = (id: number) => `${people[id - 1][0]} ${people[id - 1][1]}`;

  S.user_settings = S.users.map((u) => ({ user_id: u.id as number, push_enabled: true, sms_enabled: true, dark_mode: u.id === 2, location_enabled: u.id === 1, onboarding_done: u.id !== 22, updated_at: ts("2026-10-01") }));
  S.user_languages = [
    [2, "fa", "native"], [2, "az", "fluent"], [2, "en", "intermediate"], [4, "fa", "native"], [5, "fa", "native"], [5, "en", "fluent"], [6, "fa", "native"],
  ].map(([u, c, l], i) => ({ id: i + 1, user_id: u, language_code: c, level: l, created_at: ts("2026-06-01") }));

  S.otp_codes = [
    { id: 1, mobile: "+989123456782", purpose: "login", user_id: 1, code_hash: "sha256$9f2c…", attempts: 0, expires_at: ts("2026-10-19", "08:32"), locked_until: null, consumed_at: ts("2026-10-19", "08:30"), ip: "5.120.33.10", created_at: ts("2026-10-19", "08:30") },
    { id: 2, mobile: "+989121000001", purpose: "login", user_id: 2, code_hash: "sha256$1ab0…", attempts: 5, expires_at: ts("2026-10-18", "21:02"), locked_until: ts("2026-10-18", "21:10"), consumed_at: null, ip: "5.120.33.11", created_at: ts("2026-10-18", "21:00") },
    { id: 3, mobile: "+989123456700", purpose: "change_mobile", user_id: 1, code_hash: "sha256$77e1…", attempts: 1, expires_at: ts("2026-10-19", "09:02"), locked_until: null, consumed_at: null, ip: "5.120.33.10", created_at: ts("2026-10-19", "09:00") },
    { id: 4, mobile: "+989121000032", purpose: "signup", user_id: null, code_hash: "sha256$c0de…", attempts: 0, expires_at: ts("2026-10-14", "10:02"), locked_until: null, consumed_at: ts("2026-10-14", "10:01"), ip: "151.238.4.2", created_at: ts("2026-10-14", "10:00") },
  ];
  S.auth_sessions = [
    [1, "customer", "iPhone 15 Pro", "ios", "iOS 18.6", "کرج", "2026-10-19T09:41"],
    [1, "customer", "Samsung Galaxy S24", "android", "Android 15", "تهران", "2026-10-19T10:42"],
    [1, "customer", "Google Pixel 9", "android", "Android 16", "کرج", "2026-10-18T18:27"],
    [2, "staff", "iPhone 14", "ios", "iOS 18.6", "کرج", "2026-10-19T09:00"],
    [3, "staff", "Samsung Galaxy A55", "android", "Android 15", "کرج", "2026-10-19T08:10"],
  ].map(([u, app, dn, os, ver, city, last], i) => ({
    id: i + 1, user_id: u, app, device_name: dn, os, os_version: ver, app_version: "2.4.1", refresh_token_hash: `rt_${i + 1}_hash`, push_token: `fcm_${i + 1}`,
    ip: `5.120.33.${10 + i}`, city, last_active_at: `${last}:00${TZ}`, expires_at: ts("2027-01-19"), revoked_at: null, created_at: ts("2026-09-01"),
  }));

  S.user_addresses = [
    { id: 1, user_id: 1, label: "خانه", address_line: "کرج، گوهردشت، خیابان داریوش", city_id: 1, lat: 35.8221, lng: 50.9386, is_default: true, created_at: ts("2026-06-01"), updated_at: ts("2026-06-01") },
    { id: 2, user_id: 1, label: "محل کار", address_line: "کرج، میدان سپاه، بلوار جمهوری", city_id: 1, lat: 35.8105, lng: 50.9772, is_default: false, created_at: ts("2026-06-01"), updated_at: ts("2026-06-01") },
    { id: 3, user_id: 8, label: "خیابان اصلی گوهردشت", address_line: "کرج، گوهردشت، خیابان آزادی (اصلی)", city_id: 1, lat: 35.8262, lng: 50.9451, is_default: true, created_at: ts("2026-07-01"), updated_at: ts("2026-07-01") },
  ];
  S.search_history = [
    { id: 1, user_id: 1, query: "سالن مو", location_label: "کرج، گوهردشت", lat: 35.8221, lng: 50.9386, time_filter: "any", salon_type_id: T("hair_salon"), created_at: ts("2026-10-18", "20:00") },
    { id: 2, user_id: 1, query: "کوتاهی مو بلند", location_label: "موقعیت فعلی", lat: 35.83, lng: 50.95, time_filter: "tomorrow_morning", salon_type_id: null, created_at: ts("2026-10-17", "19:00") },
    { id: 3, user_id: 1, query: null, location_label: "جهانشهر", lat: 35.81, lng: 50.98, time_filter: "afternoon", salon_type_id: T("nail_salon"), created_at: ts("2026-10-16", "12:00") },
  ];

  /* ───── salons & branches ───── */
  const salonsDef: [string, string, number, string, string | null][] = [
    ["سالن زیبایی آریا", "beauty_salon", 2, "active", "ariabeauty"],
    ["سالن زیبایی رویال", "hair_salon", 3, "active", "royal.salon"],
    ["سالن ناخن نیلند", "nail_salon", 21, "active", null],
    ["آرایشگاه مردانه جنتلمن", "barber", 19, "active", "gentleman.barber"],
    ["کلینیک پوست درما", "skin_care", 20, "active", null],
    ["سالن زیبایی پرنسس", "beauty_salon", 23, "pending_review", null],
  ];
  S.salons = salonsDef.map(([name, type, owner, status, ig], i) => ({
    id: i + 1, code: `SAL-${String(i + 1).padStart(4, "0")}`, owner_id: owner, salon_type_id: T(type), name,
    logo_media_id: addMedia("salon_logo", `logo-${i + 1}.png`, owner, 491520), instagram: ig, website: null, description: null, status,
    is_featured: i === 1, featured_until: i === 1 ? ts("2026-11-30") : null, avg_rating: 0, reviews_count: 0, bookings_count: 0,
    created_at: ts("2026-05-20"), updated_at: ts("2026-10-15"), deleted_at: null,
  }));

  type B = [number, string, string, string, string, number, number, string, string, number, number];
  const branchesDef: B[] = [
    [1, "گوهردشت", "026-34567890", "گوهردشت، فاز ۲", "کرج، گوهردشت، بلوار جمهوری", 35.8231, 50.9412, "female", "active", 4.8, 450],
    [1, "جهانشهر", "026-32221100", "جهانشهر، بلوار جمهوری", "کرج، جهانشهر، بلوار جمهوری", 35.8102, 50.9805, "female", "active", 4.6, 440],
    [2, "عظیمیه", "026-32550011", "عظیمیه، میدان مهران", "کرج، عظیمیه، میدان مهران", 35.8396, 50.9621, "female", "active", 4.9, 620],
    [2, "مهرشهر", "026-33401122", "مهرشهر، بلوار ارم", "کرج، مهرشهر، بلوار ارم", 35.8159, 50.8849, "female", "pending_review", 0, 0],
    [3, "جهانشهر", "026-32229988", "جهانشهر، بلوار مولانا", "کرج، جهانشهر، بلوار مولانا", 35.8121, 50.9744, "female", "active", 4.8, 490],
    [4, "گوهردشت", "026-34401010", "گوهردشت، خیابان اصلی", "کرج، گوهردشت، خیابان اصلی", 35.8262, 50.9451, "male", "active", 4.7, 320],
    [4, "فردیس", "026-36601212", "فردیس، فلکه دوم", "کرج، فردیس، فلکه دوم", 35.7291, 50.9842, "male", "active", 4.5, 330],
    [5, "گوهردشت", "026-34490909", "گوهردشت، بلوار موذن", "کرج، گوهردشت، بلوار موذن", 35.8289, 50.9369, "both", "active", 4.7, 120],
    [6, "عظیمیه", "026-32557788", "عظیمیه، خیابان کسری", "کرج، عظیمیه، خیابان کسری", 35.8411, 50.9555, "female", "pending_review", 0, 0],
  ];
  S.branches = branchesDef.map(([salon, name, phone, nb, addr, la, ln, g, status, r, rc], i) => ({
    id: i + 1, code: `BR-${String(i + 1).padStart(4, "0")}`, salon_id: salon, name, phone, city_id: 1, neighborhood: nb, address: addr, lat: la, lng: ln,
    timezone: "Asia/Tehran", gender_target: g, about: i === 0 ? "شعبه تخصصی خدمات مو با ارائه کوتاهی، رنگ، استایل و مراقبت‌های حرفه‌ای مو." : null,
    instagram: i === 0 ? "ariabeauty" : null, cover_media_id: null, status, deposit_percent: 10, free_cancel_hours: 24, auto_confirm: false,
    avg_rating: r, reviews_count: rc, bookings_count: 0, completed_count: i === 0 ? 3200 : Math.round(rc * 4.5), created_at: ts("2026-05-20"), updated_at: ts("2026-10-15"), deleted_at: null,
  }));
  S.branch_categories = [
    [1, "hair_salon"], [1, "beauty_salon"], [2, "hair_salon"], [3, "hair_salon"], [5, "nail_salon"], [6, "barber"], [7, "barber"], [8, "skin_care"], [8, "laser"],
  ].map(([b, t]) => ({ branch_id: b, salon_type_id: T(t as string) }));
  S.branch_media = [];
  for (let b = 1; b <= 3; b++) for (let k = 0; k < 3; k++) {
    const m = addMedia("branch_photo", `b${b}-${k + 1}.jpg`, 2);
    S.branch_media.push({ id: S.branch_media.length + 1, branch_id: b, media_id: m, sort: k, is_cover: k === 0, created_at: ts("2026-06-02") });
    if (k === 0) (S.branches[b - 1] as Row).cover_media_id = m;
  }
  const days = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];
  S.branch_working_hours = [];
  S.branches.forEach((b) => days.forEach((d) => {
    const closed = d === "fri";
    const thu = d === "thu";
    S.branch_working_hours.push({ id: S.branch_working_hours.length + 1, branch_id: b.id as number, weekday: d, is_closed: closed, opens_at: closed ? null : thu ? "09:00" : "10:00", closes_at: closed ? null : thu ? "17:00" : "18:30" });
  }));
  S.branch_closures = [{ id: 1, branch_id: 1, date: "2026-10-23", reason: "تعطیل رسمی", created_by: 2, created_at: ts("2026-10-01") }];

  /* ───── admins ───── */
  S.admin_users = [
    { id: 1, email: "reviewer@ino.app", name: "تیم بررسی اینو", role: "reviewer", password_hash: "argon2id$…", is_active: true, last_login_at: ts("2026-10-19", "09:00"), created_at: ts("2026-01-01") },
    { id: 2, email: "support@ino.app", name: "پشتیبانی اینو", role: "support", password_hash: "argon2id$…", is_active: true, last_login_at: ts("2026-10-19", "09:10"), created_at: ts("2026-01-01") },
    { id: 3, email: "finance@ino.app", name: "واحد مالی", role: "finance", password_hash: "argon2id$…", is_active: true, last_login_at: null, created_at: ts("2026-01-01") },
  ];

  S.verification_requests = [
    { id: 1, type: "create_salon", salon_id: 1, branch_id: 1, requested_by: 2, status: "approved", requested_role: "owner_expert", requested_job_title: "متخصص رنگ و لایت مو", payload: { name: "سالن زیبایی آریا", branch: "گوهردشت" }, reviewer_id: 1, reviewer_note: null, submitted_at: ts("2026-08-04", "10:24"), reviewed_at: ts("2026-08-05", "09:00"), cancelled_at: null, sla_due_at: ts("2026-08-05", "10:24"), created_at: ts("2026-08-04", "10:24") },
    { id: 2, type: "add_branch", salon_id: 1, branch_id: 2, requested_by: 2, status: "approved", requested_role: "owner_expert", requested_job_title: null, payload: { branch: "جهانشهر" }, reviewer_id: 1, reviewer_note: null, submitted_at: ts("2026-10-06", "10:30"), reviewed_at: ts("2026-10-07", "11:00"), cancelled_at: null, sla_due_at: ts("2026-10-07", "10:30"), created_at: ts("2026-10-06", "10:30") },
    { id: 3, type: "add_branch", salon_id: 2, branch_id: 4, requested_by: 3, status: "in_review", requested_role: "owner", requested_job_title: null, payload: { branch: "مهرشهر" }, reviewer_id: null, reviewer_note: null, submitted_at: ts("2026-10-19", "10:30"), reviewed_at: null, cancelled_at: null, sla_due_at: ts("2026-10-20", "10:30"), created_at: ts("2026-10-19", "10:30") },
    { id: 4, type: "create_salon", salon_id: 6, branch_id: 9, requested_by: 23, status: "needs_changes", requested_role: "owner", requested_job_title: null, payload: { name: "سالن زیبایی پرنسس" }, reviewer_id: 1, reviewer_note: "آدرس روی نقشه با آدرس واردشده یکی نیست. لطفاً موقعیت شعبه را دوباره روی نقشه انتخاب کنید.", submitted_at: ts("2026-10-14", "10:24"), reviewed_at: ts("2026-10-19", "14:10"), cancelled_at: null, sla_due_at: ts("2026-10-15", "10:24"), created_at: ts("2026-10-14", "10:24") },
    { id: 5, type: "add_branch", salon_id: 1, branch_id: null, requested_by: 2, status: "cancelled", requested_role: "owner_expert", requested_job_title: null, payload: { branch: "جهانشهر ۲", hours: "شنبه تا پنج‌شنبه · ۱۰:۰۰ تا ۱۹:۰۰" }, reviewer_id: null, reviewer_note: null, submitted_at: ts("2026-10-06", "10:30"), reviewed_at: null, cancelled_at: ts("2026-10-19", "11:45"), sla_due_at: null, created_at: ts("2026-10-06", "10:30") },
  ];

  /* ───── staff ───── */
  S.join_requests = [
    { id: 1, branch_id: 3, user_id: 2, job_title: "متخصص رنگ و مش مو", employment_type: "part_time", message: "در رنگ و مش تجربه دارم.", status: "accepted", reject_reason: null, reviewed_by: 3, reviewed_at: ts("2026-08-08"), cancelled_at: null, created_at: ts("2026-08-07", "10:30") },
    { id: 2, branch_id: 1, user_id: 7, job_title: "متخصص رنگ و لایت", employment_type: "full_time", message: "در رنگ و بالیاژ تخصص دارم و از هفته‌ی بعد می‌توانم شروع کنم.", status: "pending", reject_reason: null, reviewed_by: null, reviewed_at: null, cancelled_at: null, created_at: ts("2026-10-19", "09:30") },
    { id: 3, branch_id: 1, user_id: 8, job_title: "میکاپ آرتیست", employment_type: "part_time", message: "در کاشت، ژلیش و طراحی ناخن تجربه دارم.", status: "pending", reject_reason: null, reviewed_by: null, reviewed_at: null, cancelled_at: null, created_at: ts("2026-10-18", "18:20") },
    { id: 4, branch_id: 3, user_id: 5, job_title: "متخصص رنگ و مش مو", employment_type: "full_time", message: null, status: "rejected", reject_reason: "در حال حاضر برای این شعبه نیروی جدید نیاز نداریم. ممنون از درخواستتان.", reviewed_by: 3, reviewed_at: ts("2026-10-07"), cancelled_at: null, created_at: ts("2026-10-05") },
  ];
  type M = [number, number, string, string, string, number, string, number, number];
  const membersDef: M[] = [
    [1, 2, "owner_expert", "متخصص رنگ و مش مو", "full_time", 7, "active", 4.9, 215], // 1
    [1, 4, "expert", "متخصص کوتاهی و استایل مو", "full_time", 7, "active", 4.8, 120], // 2
    [1, 5, "expert", "متخصص کراتین و احیای مو", "full_time", 4, "on_leave", 4.7, 80], // 3
    [1, 6, "expert", "متخصص شینیون و براشینگ مو", "part_time", 3, "active", 4.9, 60], // 4
    [2, 2, "owner_expert", "متخصص رنگ و مش مو", "full_time", 7, "active", 4.6, 40], // 5
    [3, 3, "owner", "مدیر سالن", "full_time", 10, "active", 0, 0], // 6
    [3, 2, "expert", "متخصص رنگ و مش مو", "part_time", 7, "active", 4.9, 10], // 7
    [5, 21, "owner_expert", "متخصص کاشت ناخن", "full_time", 5, "active", 4.8, 490], // 8
    [6, 19, "owner_expert", "آرایشگر مردانه", "full_time", 9, "active", 4.7, 320], // 9
    [8, 20, "owner_expert", "متخصص مراقبت پوست", "full_time", 6, "active", 4.7, 120], // 10
    [7, 19, "owner", "مدیر شعبه", "full_time", 9, "active", 0, 0], // 11
  ];
  S.branch_members = membersDef.map(([b, u, role, jt, et, y, ws, r, rc], i) => ({
    id: i + 1, branch_id: b, user_id: u, role, is_bookable: role !== "owner", job_title: jt, employment_type: et, years_experience: y,
    bio: i === 0 ? "متخصص رنگ و مش با تمرکز بر تکنیک‌های مدرن هایلایت، بالیاژ و ایجاد تناژهای طبیعی متناسب با چهره‌ی مشتریان." : null,
    work_status: ws, status: "active", join_request_id: i === 6 ? 1 : null, avg_rating: r, reviews_count: rc, completed_count: i === 0 ? 248 : rc * 5, clients_count: i === 0 ? 250 : rc * 3,
    joined_at: i === 6 ? ts("2026-08-08") : ts("2026-05-20"), left_at: null, removed_by: null, created_at: ts("2026-05-20"), updated_at: ts("2026-10-15"),
  }));
  S.staff_working_hours = [];
  S.branch_members.filter((m) => m.is_bookable).forEach((m) => days.forEach((d) => {
    const off = d === "fri" || (m.id === 7 && d !== "tue" && d !== "sat");
    const partial = m.id === 1 && d === "sat";
    S.staff_working_hours.push({ id: S.staff_working_hours.length + 1, member_id: m.id as number, weekday: d, is_off: off, starts_at: off ? null : partial ? "10:00" : d === "thu" ? "09:00" : "10:00", ends_at: off ? null : partial ? "14:00" : d === "thu" ? "13:00" : "18:30" });
  }));
  S.time_offs = [
    { id: 1, member_id: 1, kind: "block", date: "2026-10-19", starts_at: "13:30", ends_at: "14:30", reason: "استراحت ناهار", created_by: 2, created_at: ts("2026-10-18"), updated_at: ts("2026-10-18") },
    { id: 2, member_id: 1, kind: "leave", date: "2026-10-25", starts_at: null, ends_at: null, reason: null, created_by: 2, created_at: ts("2026-10-10"), updated_at: ts("2026-10-10") },
    { id: 3, member_id: 1, kind: "block", date: "2026-10-24", starts_at: "10:00", ends_at: "11:30", reason: "کار شخصی", created_by: 2, created_at: ts("2026-10-12"), updated_at: ts("2026-10-12") },
    { id: 4, member_id: 3, kind: "leave", date: "2026-10-19", starts_at: null, ends_at: null, reason: "استراحت", created_by: 5, created_at: ts("2026-10-15"), updated_at: ts("2026-10-15") },
  ];

  /* ───── services ───── */
  const cats: [number, string][] = [
    [1, "کوتاهی"], [1, "رنگ"], [1, "مراقبت و درمان"], [1, "استایل و حالت‌دهی"], [1, "اکستنشن"],
    [2, "کوتاهی"], [2, "رنگ"], [3, "رنگ"], [3, "مو عروس"], [5, "ناخن"], [6, "اصلاح"], [8, "پوست"],
  ];
  S.service_categories = cats.map(([b, n], i) => ({ id: i + 1, branch_id: b, name: n, sort: i }));
  type SV = [number, number, string, number, number, number, number | null, number[]];
  // [branch, category, name, duration, price, buffer, discount, memberIds]
  const svc: SV[] = [
    [1, 1, "کوتاهی موی ساده", 45, 250000, 0, null, [1, 2]], // 1
    [1, 1, "کوتاهی ژورنالی", 60, 350000, 0, null, [1, 2]], // 2
    [1, 1, "کوتاهی مو بلند", 75, 450000, 0, null, [1, 2]], // 3
    [1, 1, "کوتاهی کودک", 30, 180000, 0, null, [2]], // 4
    [1, 2, "رنگ ریشه", 90, 1200000, 0, null, [1, 3]], // 5
    [1, 2, "مش و بالیاژ", 150, 3200000, 15, 20, [1, 3]], // 6
    [1, 3, "کراتین مو", 120, 2800000, 0, null, [1, 3]], // 7
    [1, 4, "براشینگ", 45, 450000, 0, null, [1, 4]], // 8
    [1, 5, "اکستنشن کلیپسی", 60, 900000, 0, null, [4]], // 9
    [2, 6, "کوتاهی مو بلند", 75, 450000, 0, null, [5]], // 10
    [2, 6, "کوتاهی کودک", 30, 180000, 0, null, [5]], // 11
    [2, 7, "رنگ ریشه", 90, 1200000, 0, null, [5]], // 12
    [3, 8, "مش و بالیاژ", 150, 3000000, 15, null, [7]], // 13
    [3, 9, "شینیون عروس", 120, 4500000, 0, null, [7]], // 14
    [5, 10, "ژلیش ناخن", 45, 450000, 0, null, [8]], // 15
    [5, 10, "کاشت ناخن", 120, 900000, 0, null, [8]], // 16
    [6, 11, "فید مو", 45, 250000, 0, null, [9]], // 17
    [6, 11, "اصلاح صورت", 20, 120000, 0, null, [9]], // 18
    [8, 12, "فیشیال", 60, 800000, 0, null, [10]], // 19
  ];
  S.services = svc.map(([b, c, n, d, p, buf, disc], i) => ({
    id: i + 1, branch_id: b, category_id: c, template_id: n.includes("کوتاهی") ? 1 : n.includes("ژلیش") ? 3 : n.includes("فید") ? 4 : n.includes("فیشیال") ? 7 : n.includes("رنگ") || n.includes("مش") ? 14 : null,
    name: n, description: i === 5 ? "شامل مشاوره رنگ، دکلره و تونر. برای موهای بلند زمان بیشتری لازم است." : null,
    duration_min: d, buffer_min: buf, price: p, discount_percent: disc, final_price: disc ? Math.round(p * (100 - disc) / 100) : p,
    is_active: true, sort: i, created_at: ts("2026-06-01"), updated_at: ts("2026-10-01"), deleted_at: null,
  }));
  S.member_services = svc.flatMap(([b], i) => svc[i][7].map((m) => ({ member_id: m, service_id: i + 1, is_enabled: !(m === 3 && i + 1 === 7), assigned_by: S.salons[(S.branches[b - 1].salon_id as number) - 1].owner_id as number, created_at: ts("2026-06-01") })));

  S.portfolio_items = [
    "بالیاژ عسلی روی پایه قهوه‌ای تیره", "هایلایت شامپاینی", "رنگ مسی گرم", "کوتاهی لایه‌ای بلند", "بالیاژ خاکستری با تونر",
  ].map((c, i) => ({ id: i + 1, member_id: i < 4 ? 1 : 7, media_id: addMedia("portfolio", `pf-${i + 1}.webp`, 2), caption: c, service_id: i === 3 ? 3 : 6, sort: i, created_at: ts("2026-07-01") }));

  /* ───── lookup: cancel reasons, commission, discounts ───── */
  S.cancel_reasons = [
    ["conflict", "salon", "تداخل با نوبت دیگر", true], ["personal", "salon", "مشکل شخصی یا بیماری", false], ["not_ready", "salon", "عدم آمادگی برای انجام خدمت", true],
    ["out_of_hours", "salon", "درخواست خارج از ساعات کاری من است", true], ["other", "salon", "سایر", true], ["customer_changed_plan", "customer", "تغییر برنامه", false], ["auto_expired", "system", "عدم پاسخ سالن تا زمان نوبت", false],
  ].map(([code, actor, label, rej], i) => ({ code, actor, label, for_reject: rej, sort: i }));
  S.commission_rules = [{ id: 1, salon_type_id: null, flat_amount: 30000, percent: 0, effective_from: ts("2026-01-01"), effective_to: null, created_at: ts("2026-01-01") }];
  S.discount_codes = [
    { id: 1, code: "VIONA10", type: "percent", value: 10, max_discount: 200000, min_subtotal: null, salon_id: null, starts_at: ts("2026-09-01"), ends_at: ts("2026-12-31"), usage_limit: 5000, per_user_limit: 1, used_count: 0, is_active: true, created_at: ts("2026-09-01") },
    { id: 2, code: "ARIA20", type: "percent", value: 20, max_discount: 500000, min_subtotal: 500000, salon_id: 1, starts_at: ts("2026-10-01"), ends_at: ts("2026-10-31"), usage_limit: 200, per_user_limit: 1, used_count: 0, is_active: true, created_at: ts("2026-10-01") },
  ];
  const COMMISSION = 30000;

  /* ───── bookings (computed money) ───── */
  type BK = {
    no: number; branch: number; customer: number; items: [number, number][]; date: string; time: string; status: string;
    plan: "full_online" | "deposit" | "in_salon"; method: "wallet" | "gateway" | "cash" | null; source?: "app" | "manual"; code?: number; late?: boolean; reason?: string;
  };
  const bks: BK[] = [
    { no: 1030, branch: 2, customer: 1, items: [[10, 5], [11, 5]], date: "2026-09-21", time: "17:00", status: "completed", plan: "deposit", method: "wallet" },
    { no: 1031, branch: 3, customer: 1, items: [[13, 7]], date: "2026-09-01", time: "14:30", status: "cancelled_by_customer", plan: "deposit", method: "wallet", reason: "customer_changed_plan" },
    { no: 1032, branch: 3, customer: 1, items: [[14, 7]], date: "2026-09-16", time: "10:00", status: "rejected", plan: "deposit", method: "gateway", reason: "out_of_hours" },
    { no: 1033, branch: 1, customer: 1, items: [[5, 1]], date: "2026-08-27", time: "11:00", status: "completed", plan: "deposit", method: "wallet" },
    { no: 1034, branch: 1, customer: 1, items: [[6, 1]], date: "2026-09-19", time: "11:00", status: "completed", plan: "full_online", method: "wallet" },
    { no: 1035, branch: 1, customer: 16, items: [[8, 4]], date: "2026-10-19", time: "09:00", status: "completed", plan: "in_salon", method: "cash", source: "manual" },
    { no: 1036, branch: 1, customer: 17, items: [[7, 3]], date: "2026-10-17", time: "11:00", status: "completed", plan: "full_online", method: "gateway" },
    { no: 1039, branch: 1, customer: 12, items: [[2, 2], [1, 2]], date: "2026-10-18", time: "12:00", status: "cancelled_by_customer", plan: "deposit", method: "gateway", late: true, reason: "customer_changed_plan" },
    { no: 1040, branch: 1, customer: 13, items: [[8, 1]], date: "2026-10-18", time: "15:00", status: "no_show", plan: "deposit", method: "gateway" },
    { no: 1041, branch: 1, customer: 9, items: [[8, 1]], date: "2026-10-19", time: "09:00", status: "completed", plan: "deposit", method: "gateway" },
    { no: 1042, branch: 1, customer: 1, items: [[5, 1], [8, 1]], date: "2026-10-19", time: "11:00", status: "confirmed", plan: "deposit", method: "wallet", code: 1 },
    { no: 1043, branch: 1, customer: 8, items: [[6, 1]], date: "2026-10-19", time: "14:30", status: "confirmed", plan: "full_online", method: "gateway" },
    { no: 1044, branch: 1, customer: 10, items: [[2, 1]], date: "2026-10-20", time: "10:00", status: "pending", plan: "deposit", method: "gateway" },
    { no: 1045, branch: 1, customer: 11, items: [[5, 1], [2, 1]], date: "2026-10-21", time: "16:00", status: "pending", plan: "deposit", method: "wallet" },
    { no: 1046, branch: 1, customer: 15, items: [[9, 4]], date: "2026-10-22", time: "11:30", status: "confirmed", plan: "deposit", method: "gateway" },
    { no: 1047, branch: 1, customer: 14, items: [[6, 1]], date: "2026-10-17", time: "13:00", status: "completed", plan: "deposit", method: "gateway" },
    { no: 1048, branch: 5, customer: 1, items: [[15, 8]], date: "2026-10-24", time: "18:00", status: "pending", plan: "deposit", method: "wallet" },
    { no: 1049, branch: 1, customer: 22, items: [[3, 1], [5, 1]], date: "2026-10-20", time: "11:30", status: "confirmed", plan: "in_salon", method: "cash", source: "manual" },
    { no: 1050, branch: 6, customer: 19, items: [[17, 9]], date: "2026-10-12", time: "18:00", status: "cancelled_by_salon", plan: "deposit", method: "wallet", reason: "personal" },
  ];

  S.bookings = []; S.booking_items = []; S.booking_status_logs = []; S.payments = []; S.escrow_holds = []; S.discount_redemptions = [];
  const branchOwner = (b: number) => S.salons[(S.branches[b - 1].salon_id as number) - 1].owner_id as number;
  bks.forEach((bk, idx) => {
    const id = idx + 1;
    const start = ts(bk.date, bk.time);
    let cursor = start;
    let subtotal = 0, dur = 0;
    bk.items.forEach(([sid, mid], k) => {
      const s = S.services[sid - 1];
      const d = s.duration_min as number, buf = s.buffer_min as number;
      const end = addMin(cursor, d);
      S.booking_items.push({ id: S.booking_items.length + 1, booking_id: id, service_id: sid, member_id: mid, any_expert: k === 0 && bk.no === 1046, service_name: s.name, duration_min: d, buffer_min: buf, price: s.price, final_price: s.final_price, start_at: cursor, end_at: end, is_active: !/cancelled|rejected|expired/.test(bk.status), sort: k });
      subtotal += s.final_price as number; dur += d; cursor = addMin(end, buf);
    });
    const end = addMin(start, dur);
    let discount = 0;
    if (bk.code) { discount = Math.min(Math.round((subtotal * (S.discount_codes[bk.code - 1].value as number)) / 100), S.discount_codes[bk.code - 1].max_discount as number); (S.discount_codes[bk.code - 1] as Row).used_count = 1; }
    const total = subtotal - discount;
    const depPct = 10;
    const deposit = bk.plan === "deposit" ? Math.round((total * depPct) / 100) : 0;
    const paidOnline = bk.plan === "full_online" ? total : deposit;
    const dueInSalon = total - paidOnline;
    const salonCancelled = ["cancelled_by_salon", "rejected", "expired"].includes(bk.status);
    const earlyCustomerCancel = bk.status === "cancelled_by_customer" && !bk.late;
    const penalized = bk.status === "no_show" || (bk.status === "cancelled_by_customer" && bk.late);
    const settled = bk.status === "completed" || penalized;
    const commission = settled && paidOnline > 0 ? COMMISSION : settled && bk.source === "manual" ? 0 : 0;
    let payout = 0, refund = 0;
    if (bk.status === "completed") payout = paidOnline - commission;
    else if (penalized) { const keep = bk.plan === "full_online" ? Math.round(total * 0.1) : deposit; payout = keep - commission; refund = paidOnline - keep; }
    else if (salonCancelled || earlyCustomerCancel) refund = paidOnline;
    const created = addHours(start, -72);
    S.bookings.push({
      id, booking_no: bk.no, branch_id: bk.branch, customer_id: bk.customer, source: bk.source ?? "app", created_by: bk.source === "manual" ? 2 : bk.customer,
      status: bk.status, start_at: start, end_at: end, total_duration_min: dur, subtotal, discount_code_id: bk.code ?? null, discount_amount: discount, total,
      payment_plan: bk.plan, payment_method: bk.method, deposit_percent: bk.plan === "deposit" ? depPct : 0, deposit_amount: deposit, paid_online: paidOnline, due_in_salon: dueInSalon,
      commission_amount: commission, salon_payout: payout, refund_amount: refund, free_cancel_until: addHours(start, -24), respond_by: bk.status === "pending" ? start : null,
      confirmed_at: ["confirmed", "completed", "no_show", "cancelled_by_salon"].includes(bk.status) || bk.late ? addHours(created, 1) : null,
      completed_at: bk.status === "completed" ? end : null,
      cancelled_at: bk.status.startsWith("cancelled") || bk.status === "rejected" ? (bk.late ? addHours(start, -2) : addHours(start, -48)) : null,
      cancelled_by: bk.status === "cancelled_by_customer" ? "customer" : salonCancelled ? "salon" : null, cancel_reason_code: bk.reason ?? null, cancel_note: null,
      is_late_cancel: !!bk.late, customer_note: null, created_at: created, updated_at: addHours(start, 1),
    });
    // status logs
    const actorOwner = branchOwner(bk.branch);
    const log = (from: string | null, to: string, actor: number | null, type: string, at: string) => S.booking_status_logs.push({ id: S.booking_status_logs.length + 1, booking_id: id, from_status: from, to_status: to, actor_id: actor, actor_type: type, note: null, created_at: at });
    log(null, bk.source === "manual" ? "confirmed" : "pending", bk.source === "manual" ? 2 : bk.customer, bk.source === "manual" ? "salon" : "customer", created);
    if (bk.source !== "manual" && bk.status !== "pending" && bk.status !== "rejected") log("pending", "confirmed", actorOwner, "salon", addHours(created, 1));
    if (bk.status === "rejected") log("pending", "rejected", actorOwner, "salon", addHours(start, -48));
    if (!["pending", "confirmed", "rejected"].includes(bk.status)) log("confirmed", bk.status, bk.status === "cancelled_by_customer" ? bk.customer : actorOwner, bk.status === "cancelled_by_customer" ? "customer" : "salon", bk.status === "completed" ? end : addHours(start, bk.late ? -2 : 1));
    // payment
    if (paidOnline > 0) {
      const pid = S.payments.length + 1;
      S.payments.push({ id: pid, user_id: bk.customer, booking_id: id, purpose: bk.plan === "full_online" ? "booking_full" : "booking_deposit", method: bk.method, amount: paidOnline, status: "succeeded", gateway: bk.method === "gateway" ? "zarinpal" : null, authority: bk.method === "gateway" ? `A0000${8000 + id}` : null, tracking_code: String(8473926150 + id), card_pan_masked: bk.method === "gateway" ? "6037-99**-****-1234" : null, paid_at: addMin(created, 3), raw_callback: null, created_at: created, updated_at: addMin(created, 3) });
      S.escrow_holds.push({ id: S.escrow_holds.length + 1, booking_id: id, amount: paidOnline, status: settled ? (refund > 0 ? "split" : "released") : salonCancelled || earlyCustomerCancel ? "refunded" : "held", released_to_salon: payout, refunded_to_customer: refund, commission, settle_at: addHours(end, 24), settled_at: settled || refund ? addHours(end, 24) : null, created_at: addMin(created, 3) });
    }
    if (bk.code) S.discount_redemptions.push({ id: S.discount_redemptions.length + 1, discount_code_id: bk.code, user_id: bk.customer, booking_id: id, amount: discount, created_at: created });
  });

  S.slot_holds = [{ id: 1, member_id: 1, user_id: 16, start_at: ts("2026-10-22", "15:00"), end_at: ts("2026-10-22", "16:00"), expires_at: ts("2026-10-19", "09:51"), created_at: ts("2026-10-19", "09:41") }];

  /* ───── wallets & ledger ───── */
  S.wallets = [
    { id: 1, owner_type: "platform", user_id: null, salon_id: null, balance: 0, currency: "IRT", is_locked: false, created_at: ts("2026-01-01"), updated_at: ts("2026-10-19") },
    { id: 2, owner_type: "platform", user_id: null, salon_id: null, balance: 0, currency: "IRT", is_locked: false, created_at: ts("2026-01-01"), updated_at: ts("2026-10-19") },
  ];
  const userWallet: Record<number, number> = {}, salonWallet: Record<number, number> = {};
  S.users.filter((u) => u.status !== "guest").forEach((u) => { const id = S.wallets.length + 1; userWallet[u.id as number] = id; S.wallets.push({ id, owner_type: "user", user_id: u.id, salon_id: null, balance: 0, currency: "IRT", is_locked: false, created_at: u.created_at, updated_at: ts("2026-10-19") }); });
  S.salons.forEach((s) => { const id = S.wallets.length + 1; salonWallet[s.id as number] = id; S.wallets.push({ id, owner_type: "salon", user_id: null, salon_id: s.id, balance: 0, currency: "IRT", is_locked: false, created_at: s.created_at, updated_at: ts("2026-10-19") }); });
  S.wallet_transactions = [];
  const bal: Record<number, number> = {};
  const tx = (wallet: number, type: string, amount: number, at: string, desc: string, refs: { booking_id?: number; payment_id?: number; withdrawal_id?: number } = {}) => {
    bal[wallet] = (bal[wallet] ?? 0) + amount;
    S.wallet_transactions.push({ id: S.wallet_transactions.length + 1, wallet_id: wallet, type, amount, balance_after: bal[wallet], booking_id: refs.booking_id ?? null, payment_id: refs.payment_id ?? null, withdrawal_id: refs.withdrawal_id ?? null, description: desc, idempotency_key: `tx-${S.wallet_transactions.length + 1}`, created_at: at });
  };
  // customer top-ups (gateway payments)
  const topups: [number, number, string][] = [[1, 3000000, "2026-08-20"], [1, 500000, "2026-10-14"], [11, 1000000, "2026-10-01"], [19, 500000, "2026-10-01"]];
  topups.forEach(([u, amt, d]) => {
    const pid = S.payments.length + 1;
    S.payments.push({ id: pid, user_id: u, booking_id: null, purpose: "wallet_topup", method: "gateway", amount: amt, status: "succeeded", gateway: "zarinpal", authority: `T0000${pid}`, tracking_code: String(9000000000 + pid), card_pan_masked: "6037-99**-****-1234", paid_at: ts(d, "12:00"), raw_callback: null, created_at: ts(d, "11:58"), updated_at: ts(d, "12:00") });
    tx(userWallet[u], "top_up", amt, ts(d, "12:00"), "شارژ کیف پول", { payment_id: pid });
  });
  S.payments.push({ id: S.payments.length + 1, user_id: 8, booking_id: null, purpose: "wallet_topup", method: "gateway", amount: 250000, status: "failed", gateway: "zarinpal", authority: "T00FAIL", tracking_code: null, card_pan_masked: null, paid_at: null, raw_callback: { Status: "NOK" }, created_at: ts("2026-10-18", "20:00"), updated_at: ts("2026-10-18", "20:05") });
  // booking money flow
  const sortedBookings = [...S.bookings].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  sortedBookings.forEach((b) => {
    const pay = S.payments.find((p) => p.booking_id === b.id);
    const salonId = S.branches[(b.branch_id as number) - 1].salon_id as number;
    const salonName = S.salons[salonId - 1].name as string;
    if (!pay) return;
    if (b.payment_method === "wallet") tx(userWallet[b.customer_id as number], "booking_payment", -(pay.amount as number), pay.paid_at as string, `پرداخت رزرو — ${salonName}`, { booking_id: b.id as number, payment_id: pay.id as number });
    tx(1, "booking_payment", pay.amount as number, pay.paid_at as string, `امانت رزرو ${b.booking_no}`, { booking_id: b.id as number, payment_id: pay.id as number });
    const settleAt = addHours(b.end_at as string, 24);
    if ((b.refund_amount as number) > 0) {
      tx(1, "refund", -(b.refund_amount as number), settleAt, `برگشت امانت ${b.booking_no}`, { booking_id: b.id as number });
      tx(userWallet[b.customer_id as number], "refund", b.refund_amount as number, settleAt, "بازگشت وجه رزرو", { booking_id: b.id as number });
    }
    if ((b.salon_payout as number) > 0 || (b.commission_amount as number) > 0) {
      tx(1, "booking_income", -((b.salon_payout as number) + (b.commission_amount as number)), settleAt, `تسویه امانت ${b.booking_no}`, { booking_id: b.id as number });
      if ((b.commission_amount as number) > 0) tx(2, "commission", b.commission_amount as number, settleAt, `کارمزد رزرو ${b.booking_no}`, { booking_id: b.id as number });
      if ((b.salon_payout as number) > 0) tx(salonWallet[salonId], "booking_income", b.salon_payout as number, settleAt, `درآمد نوبت · ${userName(b.customer_id as number)}`, { booking_id: b.id as number });
    }
  });
  S.bank_accounts = [
    { id: 1, salon_id: 1, bank_name: "بانک ملت", iban: "IR120120000000004521000001", card_masked: "4521****", holder_name: "مهسا کریمی", is_default: true, verified_at: ts("2026-06-01"), created_at: ts("2026-06-01") },
    { id: 2, salon_id: 2, bank_name: "بانک سامان", iban: "IR560560000000007788000002", card_masked: "6219****", holder_name: "نیلوفر قاسمی", is_default: true, verified_at: ts("2026-06-01"), created_at: ts("2026-06-01") },
  ];
  S.withdrawals = [];
  const w1 = Math.floor((bal[salonWallet[1]] ?? 0) / 2 / 100000) * 100000;
  if (w1 > 0) {
    S.withdrawals.push({ id: 1, wallet_id: salonWallet[1], bank_account_id: 1, amount: w1, status: "paid", requested_by: 2, bank_tracking: "PAYA-778812", paid_at: ts("2026-10-19", "16:00"), created_at: ts("2026-10-19", "12:00") });
    tx(salonWallet[1], "withdrawal", -w1, ts("2026-10-19", "12:00"), "برداشت به حساب · بانک ملت · ۴۵۲۱****", { withdrawal_id: 1 });
  }
  S.withdrawals.push({ id: S.withdrawals.length + 1, wallet_id: salonWallet[1], bank_account_id: 1, amount: 100000, status: "requested", requested_by: 2, bank_tracking: null, paid_at: null, created_at: ts("2026-10-19", "18:00") });
  S.wallets.forEach((w) => ((w as Row).balance = bal[w.id as number] ?? 0));

  /* ───── reviews / crm ───── */
  S.reviews = [];
  const reviewTexts = ["خیلی راضی بودم، رنگ دقیقاً همونی شد که می‌خواستم.", "برخورد عالی و محیط تمیز.", "کمی تأخیر داشتند ولی نتیجه عالی بود.", "بهترین بالیاژی که تا حالا داشتم!", "براشینگ سریع و تمیز."];
  S.bookings.filter((b) => b.status === "completed" && b.source === "app").forEach((b, i) => {
    const item = S.booking_items.find((it) => it.booking_id === b.id)!;
    S.reviews.push({ id: i + 1, booking_id: b.id, customer_id: b.customer_id, branch_id: b.branch_id, member_id: item.member_id, rating: i === 2 ? 4 : 5, comment: reviewTexts[i % reviewTexts.length], is_anonymous: i === 1, status: i === 2 ? "reported" : "published", created_at: addHours(b.end_at as string, 5), updated_at: addHours(b.end_at as string, 5) });
  });
  S.review_reports = S.reviews.filter((r) => r.status === "reported").map((r, i) => ({ id: i + 1, review_id: r.id, reporter_id: 2, reason: "نظر مربوط به این سالن نیست", status: "open", handled_by: null, handled_at: null, created_at: addHours(r.created_at as string, 2) }));
  S.favorites = [{ user_id: 1, branch_id: 2, created_at: ts("2026-07-01") }, { user_id: 1, branch_id: 5, created_at: ts("2026-07-03") }, { user_id: 8, branch_id: 1, created_at: ts("2026-08-01") }];

  const crm = new Map<string, Row>();
  S.bookings.forEach((b) => {
    const key = `${b.branch_id}:${b.customer_id}`;
    const r = crm.get(key) ?? { id: crm.size + 1, branch_id: b.branch_id, customer_id: b.customer_id, first_visit_at: null, last_visit_at: null, completed_count: 0, no_show_count: 0, cancel_count: 0, total_spent: 0, next_booking_id: null, is_loyal: false, created_at: b.created_at, updated_at: ts("2026-10-19") };
    if (b.status === "completed") {
      r.completed_count = (r.completed_count as number) + 1; r.total_spent = (r.total_spent as number) + (b.total as number);
      if (!r.first_visit_at || String(b.start_at) < String(r.first_visit_at)) r.first_visit_at = b.start_at;
      if (!r.last_visit_at || String(b.start_at) > String(r.last_visit_at)) r.last_visit_at = b.start_at;
    }
    if (b.status === "no_show") r.no_show_count = (r.no_show_count as number) + 1;
    if (String(b.status).startsWith("cancelled")) r.cancel_count = (r.cancel_count as number) + 1;
    if (["confirmed", "pending"].includes(b.status as string) && !r.next_booking_id) r.next_booking_id = b.id;
    r.is_loyal = (r.completed_count as number) >= 3;
    crm.set(key, r);
  });
  S.branch_customers = [...crm.values()];
  const saraAtAria = S.branch_customers.find((r) => r.branch_id === 1 && r.customer_id === 1);
  S.customer_notes = saraAtAria ? [{ id: 1, branch_customer_id: saraAtAria.id, author_member_id: 1, body: "حساسیت به آمونیاک، رنگ قبلی: ۷.۱", created_at: ts("2026-09-19"), updated_at: ts("2026-09-19") }] : [];

  /* ───── notifications / sms ───── */
  S.notifications = [
    [1, "customer", "booking_confirmed", "رزرو شما تأیید شد", "نوبت شما در سالن زیبایی آریا برای دوشنبه ساعت ۱۱:۰۰ ثبت نهایی شد.", { booking_id: 11 }, "2026-10-17T14:30"],
    [1, "customer", "payment_succeeded", "پرداخت با موفقیت انجام شد", "مبلغ بیعانه بابت رزرو شما با موفقیت از کیف پول کسر شد.", { booking_id: 11 }, "2026-10-16T11:00"],
    [1, "customer", "promotion", "تخفیف ویژه برای شما", "تا پایان هفته از ۲۰٪ تخفیف روی خدمات منتخب سالن‌های ویژه استفاده کنید.", null, "2026-10-11T10:00"],
    [1, "customer", "review_request", "نظر خود را ثبت کنید", "تجربه خود از آخرین رزرو را ثبت کرده و با دیگران به اشتراک بگذارید.", { booking_id: 1 }, "2026-09-21T20:00"],
    [2, "staff", "booking_requested", "درخواست رزرو جدید", "سپیده نیک‌نام برای سه‌شنبه ۲۸ مهر · ۱۰:۰۰ درخواست رزرو داد.", { booking_id: 13 }, "2026-10-17T10:00"],
    [2, "staff", "join_request_received", "۲ درخواست همکاری جدید", "یاسمن کیانی و ۱ نفر دیگر درخواست همکاری فرستاده‌اند.", { branch_id: 1 }, "2026-10-19T09:30"],
    [23, "staff", "verification_result", "سالن شما تأیید نشد", "برای فعال شدن سالن، آدرس را اصلاح کنید و دوباره بفرستید.", { verification_request_id: 4 }, "2026-10-19T14:10"],
  ].map(([u, app, type, title, body, data, at], i) => ({ id: i + 1, user_id: u, app, type, title, body, data, read_at: i > 1 ? `${at}:00${TZ}` : null, pushed_at: `${at}:00${TZ}`, created_at: `${at}:00${TZ}` }));
  S.sms_messages = [
    ["+989123456782", 1, "otp_login", { code: "****" }], ["+989173030871", 10, "booking_confirmed", { booking_no: 1044 }],
    ["+989352210400", 22, "manual_booking_created", { booking_no: 1049 }], ["+989121000028", 19, "booking_cancelled_by_salon", { booking_no: 1050 }],
  ].map(([m, u, t, p], i) => ({ id: i + 1, mobile: m, user_id: u, template: t, params: p, provider: "kavenegar", provider_ref: `kv-${1000 + i}`, status: "delivered", created_at: ts("2026-10-19", `0${8 + i}:00`) }));

  /* ───── platform ───── */
  S.faqs = ["چگونه رزرو کنم؟", "چگونه رزرو را لغو کنم؟", "چگونه پرداخت انجام می‌شود؟", "چگونه با پشتیبانی ارتباط برقرار کنم؟"].map((q, i) => ({ id: i + 1, app: "customer", question: q, answer: "پاسخ نمونه برای این سوال.", sort: i, is_active: true }));
  S.app_releases = [
    { id: 1, app: "customer", os: "ios", version: "2.4.1", is_force_update: false, changelog: "بهبود رزرو", released_at: ts("2026-06-01") },
    { id: 2, app: "customer", os: "android", version: "2.4.1", is_force_update: false, changelog: "بهبود رزرو", released_at: ts("2026-06-01") },
    { id: 3, app: "staff", os: "ios", version: "1.0.0", is_force_update: false, changelog: "انتشار اولیه پنل سالن", released_at: ts("2026-10-01") },
  ];
  S.audit_logs = [
    { id: 1, actor_user_id: 2, actor_admin_id: null, action: "service.update", entity: "services", entity_id: 6, diff: { discount_percent: [null, 20] }, ip: "5.120.33.13", created_at: ts("2026-10-01") },
    { id: 2, actor_user_id: null, actor_admin_id: 1, action: "verification.approve", entity: "verification_requests", entity_id: 1, diff: { status: ["in_review", "approved"] }, ip: "10.0.0.5", created_at: ts("2026-08-05", "09:00") },
    { id: 3, actor_user_id: 2, actor_admin_id: null, action: "salon.rename", entity: "salons", entity_id: 1, diff: { name: ["سالن زیبایی آریا", "سالن زیبایی آریا"] }, ip: "5.120.33.13", created_at: ts("2026-10-15") },
  ];

  /* ───── final denormalized counters ───── */
  S.salons.forEach((s) => {
    const bs = S.branches.filter((b) => b.salon_id === s.id && (b.reviews_count as number) > 0);
    const rc = bs.reduce((a, b) => a + (b.reviews_count as number), 0);
    (s as Row).reviews_count = rc;
    (s as Row).avg_rating = rc ? Math.round((bs.reduce((a, b) => a + (b.avg_rating as number) * (b.reviews_count as number), 0) / rc) * 10) / 10 : 0;
    (s as Row).bookings_count = S.bookings.filter((b) => S.branches[(b.branch_id as number) - 1].salon_id === s.id).length;
  });
  S.branches.forEach((b) => ((b as Row).bookings_count = S.bookings.filter((x) => x.branch_id === b.id).length));
  S.media_files = media;
  return S;
}

let cached: Seed | null = null;
export function getSeed(): Seed {
  if (!cached) cached = buildSeed();
  return cached;
}
