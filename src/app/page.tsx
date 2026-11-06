import Link from "next/link";
import { tables, relations, domains } from "@/schema/tables";
import { enums } from "@/schema/enums";
import { endpoints } from "@/schema/api";
import { sections, screenCount } from "@/schema/screens";
import { machines } from "@/schema/flows";
import { getSeed } from "@/schema/seed";
import { Icon, type IconName } from "@/components/Icon";
import { LogoMark } from "@/components/Logo";

const toman = (n: number) => n.toLocaleString("fa-IR") + " تومان";

const actors = [
  { t: "مشتری", app: "اپ مشتری", c: "#694ffd", d: ["جستجو و فیلتر سالن روی نقشه", "رزرو چندخدمته با انتخاب متخصص", "پرداخت کامل یا ودیعه ۱۰٪ (کیف پول/درگاه)", "لغو، رزرو دوباره، ثبت نظر", "کیف پول، علاقه‌مندی، آدرس‌ها"] },
  { t: "مالک", app: "پنل سالن", c: "#c93efe", d: ["ثبت سالن و شعبه (بررسی تیم اینو)", "خدمات، قیمت و تخفیف", "تیم، درخواست همکاری، حذف عضو", "ساعات کاری سالن و تعطیلی", "کیف پول سالن و برداشت"] },
  { t: "مالک و متخصص", app: "پنل سالن", c: "#3e73fe", d: ["همه دسترسی‌های مالک", "دریافت نوبت برای خودش", "تقویم، مرخصی، بازه مسدود", "پروفایل حرفه‌ای و نمونه‌کار"] },
  { t: "متخصص", app: "پنل سالن", c: "#f97316", d: ["پیوستن به چند سالن", "تأیید/رد/انجام/عدم حضور نوبت", "فعال/غیرفعال کردن خدمات خودش", "ساعات حضور بدون تداخل بین سالن‌ها", "مشتریان من و نظرات"] },
  { t: "تیم اینو", app: "پنل ادمین", c: "#64748b", d: ["بررسی سالن/شعبه (۲۴ ساعت کاری)", "گزارش نظرات و مسدودسازی", "کدهای تخفیف و سالن ویژه", "پردازش برداشت‌ها"] },
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

const decisions: [string, string, IconName][] = [
  ["شعبه = واحد رزرو", "مشتری همیشه «سالن X شعبه Y» را می‌بیند؛ خدمات، تیم، ساعات و نظرات به branch وصل‌اند و salon فقط برند (نام/لوگو/مالک) است.", "route"],
  ["عضویت به ازای هر شعبه", "branch_members نقش، عنوان شغلی، سابقه، bio و آمار را برای هر سالن جدا نگه می‌دارد؛ یک نفر می‌تواند مالک یک سالن و متخصص سالن دیگر باشد.", "layers"],
  ["Snapshot در رزرو", "نام، مدت و قیمت خدمت در booking_items کپی می‌شود تا ویرایش/حذف خدمت روی نوبت‌های قبلی اثر نگذارد.", "note"],
  ["Ledger دوطرفه", "هر حرکت پول در wallet_transactions ثبت و balance کش می‌شود؛ امانت اینو و کارمزد هم کیف پول platform دارند.", "db"],
  ["جلوگیری از رزرو هم‌زمان", "slot_holds + قید EXCLUDE روی tstzrange(member_id) در PostgreSQL؛ پیام «این ساعت رزرو شد».", "rule"],
  ["زمان و پول", "همه زمان‌ها timestamptz (Asia/Tehran) و نمایش شمسی در کلاینت؛ همه مبالغ bigint به تومان.", "code"],
  ["کاربر مهمان", "نوبت دستی برای شماره جدید یک user با status=guest می‌سازد که با ثبت‌نام همان موبایل فعال می‌شود.", "key"],
  ["Denormalized counters", "avg_rating، reviews_count، bookings_count و branch_customers برای لیست‌ها و داشبورد سریع؛ با جاب رویدادی به‌روز می‌شوند.", "dashboard"],
  ["بررسی تیم اینو", "verification_requests با payload اسنپ‌شات، یادداشت اصلاح و SLA برای ثبت سالن/شعبه/ویرایش.", "list"],
];

export default function Home() {
  const seed = getSeed();
  const rows = Object.values(seed).reduce((a, r) => a + r.length, 0);
  const cols = tables.reduce((a, t) => a + t.columns.length, 0);
  const ex = seed.bookings.find((b) => b.booking_no === 1042)!;
  const stats: [string, number, string, IconName][] = [
    ["جدول", tables.length, "/tables", "table"], ["ستون", cols, "/tables", "list"], ["رابطه FK", relations.length, "/erd", "link"], ["Enum", enums.length, "/enums", "enum"],
    ["Endpoint", endpoints.length, "/api-docs", "api"], ["State machine", machines.length, "/flows", "flow"], ["صفحه اپ", screenCount, "/screens", "screen"], ["ردیف دیتای فیک", rows, "/exports", "db"],
  ];
  const money: [string, number][] = [
    ["مجموع خدمات (subtotal)", ex.subtotal as number], ["تخفیف VIONA10 (discount_amount)", -(ex.discount_amount as number)], ["مبلغ نهایی (total)", ex.total as number],
    ["ودیعه ۱۰٪ — پرداخت آنلاین (deposit_amount)", ex.deposit_amount as number], ["قابل پرداخت در سالن (due_in_salon)", ex.due_in_salon as number],
    ["بعد از انجام: کارمزد اینو", -30000], ["بعد از انجام: واریز به کیف پول سالن", (ex.deposit_amount as number) - 30000],
  ];

  return (
    <div className="mx-auto max-w-[1240px] space-y-10 px-4 py-6 md:px-8 md:py-8">
      <section className="card relative overflow-hidden p-6 md:p-10" style={{ background: "radial-gradient(120% 140% at 0% 0%, #c93efe14 0%, transparent 45%), radial-gradient(100% 120% at 100% 100%, #694ffd12 0%, transparent 50%), var(--surface)" }}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex-1">
            <span className="badge badge-violet">Backend Blueprint · v1</span>
            <h1 className="mt-4 text-[28px] font-black leading-[1.35] md:text-[44px]">
              نقشه کامل بک‌اند <span className="brand-text">اینو</span>
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-8 text-ink-2">
              مارکت‌پلیس رزرو آنلاین سالن‌های زیبایی و سلامت. مدل داده، روابط، state machineها، API، قوانین بیزینسی، دیتای فیک و خروجی آماده برای PostgreSQL، MySQL، Prisma، Drizzle، Laravel و OpenAPI — برای {screenCount} صفحه در {sections.length} بخشِ اپ مشتری و پنل سالن.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/erd" className="btn btn-primary"><Icon name="canvas" size={18} /> کانوای ERD</Link>
              <Link href="/exports" className="btn btn-stroke"><Icon name="download" size={18} /> دانلود SQL و ORM</Link>
              <Link href="/api-docs" className="btn btn-stroke"><Icon name="api" size={18} /> API</Link>
            </div>
          </div>
          <LogoMark size={128} className="hidden shrink-0 drop-shadow-[0_18px_30px_#694ffd55] md:block" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([l, v, h, ic]) => (
          <Link key={l} href={h} className="card card-hover group flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-ink-2 transition group-hover:bg-primary-soft group-hover:text-primary"><Icon name={ic} size={20} /></span>
            <span>
              <span className="block text-[24px] font-black leading-none tabular-nums">{v.toLocaleString("fa-IR")}</span>
              <span className="mt-1 block text-[12.5px] font-semibold text-muted">{l}</span>
            </span>
          </Link>
        ))}
      </section>

      <section>
        <H2 title="بازیگران و نقش‌ها" sub="یک جدول users برای همه؛ نقش سالنی در branch_members و برای هر شعبه جدا" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {actors.map((a) => (
            <div key={a.t} className="card p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl text-[15px] font-black text-white" style={{ background: a.c }}>{a.t[0]}</span>
                <div><div className="text-[14.5px] font-bold">{a.t}</div><div className="text-[11.5px] text-muted">{a.app}</div></div>
              </div>
              <ul className="space-y-1.5 text-[13px] leading-6 text-ink-2">
                {a.d.map((x) => <li key={x} className="flex gap-2"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: a.c }} />{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <H2 title="دامنه‌های داده" sub={`${domains.length} دامنه · روی هر جدول بزنید`} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {domains.map((d) => {
            const ts = tables.filter((t) => t.domain === d.key);
            return (
              <div key={d.key} className="card relative overflow-hidden p-4">
                <span className="absolute inset-y-3 right-0 w-1 rounded-l-full" style={{ background: d.color }} />
                <div className="flex items-baseline gap-2">
                  <h3 className="text-[15.5px] font-bold" style={{ color: d.color }}>{d.title}</h3>
                  <span className="mono text-[11px] text-muted">{d.en}</span>
                </div>
                <p className="mt-1 text-[13px] text-ink-2">{d.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ts.map((t) => <Link key={t.name} href={`/tables/${t.name}`} className="chip chip-link mono text-[11.5px]" dir="ltr">{t.name}</Link>)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <H2 title="نمونه محاسبه مالی یک رزرو" sub={`رزرو شماره ${ex.booking_no} از دیتای فیک — پرداخت در سالن + ودیعه + کد تخفیف`} small />
          <dl className="mt-2 divide-y divide-line text-[13.5px]">
            {money.map(([l, v]) => (
              <div key={l} className="flex items-center justify-between gap-3 py-2.5"><dt className="text-ink-2">{l}</dt><dd className={`shrink-0 font-bold tabular-nums ${v < 0 ? "text-danger" : ""}`}>{toman(v)}</dd></div>
            ))}
          </dl>
        </div>
        <div className="card p-5">
          <H2 title="جاب‌های پس‌زمینه" sub="Queue (BullMQ / Sidekiq / Celery) + cron" small />
          <div className="mt-2 divide-y divide-line">
            {jobs.map(([n, f, d]) => (
              <div key={n} className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2.5">
                <span className="mono rounded-lg bg-surface-2 px-2 py-0.5 text-[11.5px] font-semibold" dir="ltr">{n}</span>
                <span className="badge badge-gray ms-auto sm:order-last">{f}</span>
                <span className="w-full text-[13px] leading-6 text-ink-2 sm:w-auto sm:flex-1">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <H2 title="تصمیم‌های کلیدی طراحی دیتابیس" sub="چرا مدل این شکلی است" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {decisions.map(([t, d, ic]) => (
            <div key={t} className="card flex gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon name={ic} size={18} /></span>
              <div>
                <div className="text-[14.5px] font-bold">{t}</div>
                <p className="mt-1 text-[13px] leading-6 text-ink-2">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <H2 title="فرضیات و سوالات باز برای تیم بک‌اند" sub="مواردی که در طراحی محصول قطعی نشده" small />
        <ul className="mt-3 grid gap-2.5 text-[13.5px] leading-7 text-ink-2 md:grid-cols-2">
          {[
            "پنل ادمین تیم اینو طراحی نشده؛ جداول admin_users و endpointهای /v1/admin از روی نیاز استنتاج شده‌اند.",
            "کارمزد ۳۰٬۰۰۰ تومان ثابت از مبالغ صفحات استخراج شده؛ در commission_rules قابل تغییر است.",
            "مهلت پاسخ سالن به درخواست رزرو «تا زمان نوبت» است؛ شاید SLA کوتاه‌تری لازم باشد.",
            "درگاه بانکی (زرین‌پال/ملت/...) و سرویس پیامک (کاوه‌نگار/...) مشخص نیست.",
            "برگشت وجه همیشه به کیف پول است؛ برگشت به کارت بانکی پیش‌بینی نشده.",
            "چت آنلاین پشتیبانی فقط دکمه دارد؛ جدول تیکت/چت اضافه نشده.",
            "برند در برخی متن‌ها «ویونا» و در برخی «اینو» آمده؛ کد تخفیف VIONA10 هم از همین‌جاست.",
            "چند زبانه بودن (fa/en/tr/ar/fr) فقط برای UI است؛ محتوای سالن‌ها تک‌زبانه فرض شده.",
          ].map((x) => <li key={x} className="flex gap-2.5"><Icon name="info" size={18} className="mt-1 text-warning" />{x}</li>)}
        </ul>
      </section>
    </div>
  );
}

function H2({ title, sub, small }: { title: string; sub?: string; small?: boolean }) {
  return (
    <div className={small ? "mb-1" : "mb-4"}>
      <h2 className={`${small ? "text-[16.5px]" : "text-[20px]"} font-bold`}>{title}</h2>
      {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
    </div>
  );
}
