import Link from "next/link";
import { tables, relations, domains } from "@/schema/tables";
import { enums } from "@/schema/enums";
import { endpoints } from "@/schema/api";
import { sections, screenCount } from "@/schema/screens";
import { machines } from "@/schema/flows";
import { getSeed } from "@/schema/seed";
import { Icon } from "@/components/Icon";

const toman = (n: number) => n.toLocaleString("fa-IR") + " تومان";

const actors = [
  { t: "مشتری", app: "اپ مشتری", c: "#694ffd", d: ["جستجو و فیلتر سالن روی نقشه", "رزرو چندخدمته با انتخاب متخصص", "پرداخت کامل یا ودیعه ۱۰٪ (کیف پول/درگاه)", "لغو، رزرو دوباره، ثبت نظر", "کیف پول، علاقه‌مندی، آدرس‌ها"] },
  { t: "مالک", app: "پنل سالن", c: "#c93efe", d: ["ثبت سالن و شعبه (بررسی تیم اینو)", "خدمات، قیمت و تخفیف", "تیم، درخواست همکاری، حذف عضو", "ساعات کاری سالن و تعطیلی", "کیف پول سالن و برداشت"] },
  { t: "مالک و متخصص", app: "پنل سالن", c: "#3e73fe", d: ["همه دسترسی‌های مالک", "دریافت نوبت برای خودش", "تقویم، مرخصی، بازه مسدود", "پروفایل حرفه‌ای و نمونه‌کار"] },
  { t: "متخصص", app: "پنل سالن", c: "#f97316", d: ["پیوستن به چند سالن", "تأیید/رد/انجام/عدم حضور نوبت", "فعال/غیرفعال کردن خدمات خودش", "ساعات حضور بدون تداخل بین سالن‌ها", "مشتریان من و نظرات"] },
  { t: "تیم اینو", app: "پنل ادمین (استنتاجی)", c: "#64748b", d: ["بررسی سالن/شعبه (۲۴ ساعت کاری)", "گزارش نظرات و مسدودسازی", "کدهای تخفیف و سالن ویژه", "پردازش برداشت‌ها"] },
];

const jobs = [
  ["expire_pending_bookings", "هر دقیقه", "رزروهای pending که زمانشان رسیده → expired + برگشت ودیعه"],
  ["settle_escrow", "هر ۱۵ دقیقه", "تسویه امانت نوبت‌های انجام‌شده/عدم حضور → کیف پول سالن + کارمزد"],
  ["booking_reminders", "هر ۵ دقیقه", "یادآوری پوش/پیامک قبل از نوبت"],
  ["review_requests", "ساعتی", "اعلان «نظر خود را ثبت کنید» بعد از انجام"],
  ["recompute_ratings", "رویدادی", "به‌روزرسانی avg_rating / reviews_count شعبه، متخصص و سالن"],
  ["recompute_branch_customers", "رویدادی", "به‌روزرسانی CRM بعد از هر تغییر وضعیت رزرو"],
  ["release_slot_holds", "هر دقیقه", "حذف قفل‌های منقضی‌شده"],
  ["featured_expiry", "روزانه", "پایان ویژه بودن سالن‌ها"],
  ["verification_sla", "ساعتی", "هشدار درخواست‌های بررسی نزدیک به SLA"],
];

export default function Home() {
  const seed = getSeed();
  const rows = Object.values(seed).reduce((a, r) => a + r.length, 0);
  const cols = tables.reduce((a, t) => a + t.columns.length, 0);
  const ex = seed.bookings.find((b) => b.booking_no === 1042)!;
  const stats = [
    ["جدول", tables.length, "/tables"], ["ستون", cols, "/tables"], ["رابطه FK", relations.length, "/erd"], ["Enum", enums.length, "/enums"],
    ["Endpoint", endpoints.length, "/api-docs"], ["State machine", machines.length, "/flows"], ["اسکرین Figma", screenCount, "/screens"], ["ردیف دیتای فیک", rows, "/exports"],
  ] as const;

  return (
    <div className="mx-auto max-w-[1280px] space-y-10 px-4 py-8 md:px-8">
      {/* hero */}
      <section className="relative overflow-hidden rounded-[28px] border border-line bg-surface p-7 md:p-10">
        <div className="brand-gradient pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full opacity-25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-royal opacity-15 blur-3xl" />
        <div className="relative">
          <span className="chip bg-primary-soft text-primary">Backend Blueprint · v1 · از روی Figma</span>
          <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
            نقشه کامل بک‌اند <span className="brand-text">اینو</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-8 text-ink-2">
            مارکت‌پلیس رزرو آنلاین سالن‌های زیبایی و سلامت. این سایت از بررسی {screenCount} اسکرین در {sections.length} بخشِ اپ مشتری و پنل سالن (مالک، مالک و متخصص، متخصص) ساخته شده:
            مدل داده، روابط، state machineها، API، قوانین بیزینسی، دیتای فیک و خروجی آماده برای PostgreSQL، MySQL، Prisma، Drizzle، Laravel و OpenAPI.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/erd" className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-bold text-white shadow-lg shadow-violet-500/30"><Icon name="canvas" /> باز کردن کانوای ERD</Link>
            <Link href="/exports" className="flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[14px] font-bold"><Icon name="download" /> دانلود SQL و ORM</Link>
            <Link href="/api-docs" className="flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[14px] font-bold"><Icon name="api" /> API</Link>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([l, v, h]) => (
          <Link key={l} href={h} className="card group p-4 transition hover:-translate-y-0.5">
            <div className="text-[28px] font-black tabular-nums">{v.toLocaleString("fa-IR")}</div>
            <div className="text-[12.5px] font-semibold text-muted group-hover:text-primary">{l}</div>
          </Link>
        ))}
      </section>

      {/* actors */}
      <section>
        <H2 title="بازیگران و نقش‌ها" sub="یک جدول users برای همه؛ نقش سالنی در branch_members و برای هر شعبه جدا" />
        <div className="grid gap-3 md:grid-cols-5">
          {actors.map((a) => (
            <div key={a.t} className="card p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-white" style={{ background: a.c }}>{a.t[0]}</span>
                <div><div className="text-[14px] font-extrabold">{a.t}</div><div className="text-[11px] text-muted">{a.app}</div></div>
              </div>
              <ul className="space-y-1.5 text-[12.5px] leading-6 text-ink-2">{a.d.map((x) => <li key={x} className="flex gap-1.5"><span style={{ color: a.c }}>•</span>{x}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      {/* domains */}
      <section>
        <H2 title="دامنه‌های داده" sub={`${domains.length} دامنه · روی هر جدول کلیک کنید`} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {domains.map((d) => {
            const ts = tables.filter((t) => t.domain === d.key);
            return (
              <div key={d.key} className="card relative overflow-hidden p-4">
                <span className="absolute inset-y-0 right-0 w-1" style={{ background: d.color }} />
                <div className="flex items-baseline gap-2">
                  <h3 className="text-[15px] font-extrabold" style={{ color: d.color }}>{d.title}</h3>
                  <span className="mono text-[11px] text-muted">{d.en}</span>
                </div>
                <p className="mt-1 text-[12.5px] text-ink-2">{d.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ts.map((t) => <Link key={t.name} href={`/tables/${t.name}`} className="chip mono border border-line bg-surface-2 text-[11.5px] hover:border-line-strong" dir="ltr">{t.name}</Link>)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* money example */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <H2 title="نمونه محاسبه مالی یک رزرو" sub={`رزرو شماره ${ex.booking_no} از دیتای فیک — پرداخت در سالن + ودیعه + کد تخفیف`} small />
          <dl className="mt-2 divide-y divide-line text-[13.5px]">
            {[
              ["مجموع خدمات (subtotal)", ex.subtotal], ["تخفیف VIONA10 (discount_amount)", -(ex.discount_amount as number)], ["مبلغ نهایی (total)", ex.total],
              ["ودیعه ۱۰٪ — پرداخت آنلاین (deposit_amount)", ex.deposit_amount], ["قابل پرداخت در سالن (due_in_salon)", ex.due_in_salon],
              ["بعد از انجام: کارمزد اینو", -30000], ["بعد از انجام: واریز به کیف پول سالن", (ex.deposit_amount as number) - 30000],
            ].map(([l, v]) => (
              <div key={l as string} className="flex items-center justify-between py-2.5"><dt className="text-ink-2">{l as string}</dt><dd className={`font-bold tabular-nums ${(v as number) < 0 ? "text-danger" : ""}`}>{toman(v as number)}</dd></div>
            ))}
          </dl>
        </div>
        <div className="card p-5">
          <H2 title="جاب‌های پس‌زمینه" sub="Queue (BullMQ / Sidekiq / Celery) + cron" small />
          <div className="mt-2 divide-y divide-line">
            {jobs.map(([n, f, d]) => (
              <div key={n} className="flex items-start gap-3 py-2.5">
                <span className="mono shrink-0 rounded-lg bg-surface-2 px-2 py-0.5 text-[11.5px] font-semibold" dir="ltr">{n}</span>
                <span className="text-[12.5px] leading-6 text-ink-2">{d}</span>
                <span className="mr-auto shrink-0 text-[11px] text-muted">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* decisions */}
      <section>
        <H2 title="تصمیم‌های کلیدی طراحی دیتابیس" sub="چرا مدل این شکلی است" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["شعبه = واحد رزرو", "مشتری همیشه «سالن X شعبه Y» را می‌بیند؛ خدمات، تیم، ساعات و نظرات به branch وصل‌اند و salon فقط برند (نام/لوگو/مالک) است."],
            ["عضویت به ازای هر شعبه", "branch_members نقش، عنوان شغلی، سابقه، bio و آمار را برای هر سالن جدا نگه می‌دارد؛ یک نفر می‌تواند مالک یک سالن و متخصص سالن دیگر باشد."],
            ["Snapshot در رزرو", "نام، مدت و قیمت خدمت در booking_items کپی می‌شود تا ویرایش/حذف خدمت روی نوبت‌های قبلی اثر نگذارد."],
            ["Ledger دوطرفه", "هر حرکت پول در wallet_transactions ثبت و balance کش می‌شود؛ امانت اینو و کارمزد هم کیف پول platform دارند."],
            ["جلوگیری از رزرو هم‌زمان", "slot_holds + قید EXCLUDE روی tstzrange(member_id) در PostgreSQL؛ پیام «این ساعت رزرو شد»."],
            ["زمان و پول", "همه زمان‌ها timestamptz (Asia/Tehran) و نمایش شمسی در کلاینت؛ همه مبالغ bigint به تومان."],
            ["کاربر مهمان", "نوبت دستی برای شماره جدید یک user با status=guest می‌سازد که با ثبت‌نام همان موبایل فعال می‌شود."],
            ["Denormalized counters", "avg_rating، reviews_count، bookings_count و branch_customers برای لیست‌ها و داشبورد سریع؛ با جاب رویدادی به‌روز می‌شوند."],
            ["بررسی تیم اینو", "verification_requests با payload اسنپ‌شات، یادداشت اصلاح و SLA برای ثبت سالن/شعبه/ویرایش."],
          ].map(([t, d]) => (
            <div key={t} className="card p-4">
              <div className="text-[14px] font-extrabold">{t}</div>
              <p className="mt-1.5 text-[12.5px] leading-6 text-ink-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <H2 title="فرضیات و سوالات باز برای تیم بک‌اند" sub="مواردی که در دیزاین نیست یا قطعی نشده" small />
        <ul className="mt-2 grid gap-2 text-[13px] leading-7 text-ink-2 md:grid-cols-2">
          {[
            "پنل ادمین تیم اینو در فایل نیست؛ جداول admin_users و endpointهای /v1/admin از روی نیاز استنتاج شده‌اند.",
            "کارمزد ۳۰٬۰۰۰ تومان از اعداد اسکرین‌ها استخراج شده (ثابت)؛ در commission_rules قابل تغییر است.",
            "مهلت پاسخ سالن به درخواست رزرو در دیزاین «تا زمان نوبت» است؛ شاید SLA کوتاه‌تری لازم باشد.",
            "درگاه بانکی (زرین‌پال/ملت/...) و سرویس پیامک (کاوه‌نگار/...) مشخص نیست.",
            "برگشت وجه همیشه به کیف پول است؛ برگشت به کارت بانکی در دیزاین نیست.",
            "چت آنلاین پشتیبانی فقط دکمه دارد؛ جدول تیکت/چت اضافه نشده.",
            "برند در برخی متن‌ها «ویونا» و در برخی «اینو» آمده؛ کد تخفیف VIONA10 هم از همین‌جاست.",
            "چند زبانه بودن (fa/en/tr/ar/fr) فقط برای UI است؛ محتوای سالن‌ها تک‌زبانه فرض شده.",
          ].map((x) => <li key={x} className="flex gap-2"><span className="text-warning">◆</span>{x}</li>)}
        </ul>
      </section>
    </div>
  );
}

function H2({ title, sub, small }: { title: string; sub?: string; small?: boolean }) {
  return (
    <div className={small ? "mb-1" : "mb-4"}>
      <h2 className={`${small ? "text-[16px]" : "text-[20px]"} font-extrabold`}>{title}</h2>
      {sub && <p className="mt-0.5 text-[12.5px] text-muted">{sub}</p>}
    </div>
  );
}
