# Ino Backend Docs

مستند فنی بک‌اند «اینو» (رزرو آنلاین سالن)، استخراج‌شده از فایل Figma «Ino App»
(اپ مشتری + پنل مالک / مالک و متخصص / متخصص).

## اجرا

```bash
npm install
npm run dev        # http://localhost:3210
```

## صفحات

| مسیر | محتوا |
| --- | --- |
| `/` | نمای کلی: نقش‌ها، دامنه‌ها، نمونه محاسبه مالی، جاب‌ها، تصمیم‌های طراحی، سوالات باز |
| `/erd` | کانوای بی‌نهایت ERD: درگ جدول و کل دامنه، Auto layout، فیلتر دامنه، جستجو، کلیدها/همه ستون‌ها، مینی‌مپ |
| `/tables/[name]` | ستون‌ها، قیدها، روابط، دیاگرام همسایه‌ها، دیتای فیک، SQL/Prisma/Drizzle/TS/Zod/Seed، APIها و اسکرین‌ها |
| `/enums` | همه enumها و محل استفاده |
| `/flows` | State machineها (رزرو، بررسی سالن، همکاری، امانت، پرداخت، برداشت) |
| `/api-docs` | Endpointهای REST به تفکیک اپ و نقش |
| `/screens` | نگاشت فریم‌های Figma به جداول و API |
| `/rules` | قوانین بیزینسی با لینک به اسکرین |
| `/exports` | دانلود همه خروجی‌ها |

## سایت زنده

**https://behiwzad.github.io/ino-backend-docs/**

هر push به `main` با GitHub Actions (`.github/workflows/deploy.yml`) سایت استاتیک را می‌سازد و روی GitHub Pages منتشر می‌کند (حدود ۱ تا ۲ دقیقه).

### استقرار خودکار

| روش | چه موقع push می‌شود |
| --- | --- |
| Claude Code (هوک `Stop` در `.claude/settings.json`) | آخر هر نوبتی که Claude در این پروژه تغییری داده |
| `npm run deploy:watch` | ۸ ثانیه بعد از آخرین ذخیره‌ی شما (تا وقتی ترمینال باز است) |
| `npm run deploy` | یک بار، دستی |

قبل از هر push، `tsc --noEmit` اجرا می‌شود؛ اگر خطا داشته باشد چیزی push نمی‌شود و سایت زنده دست نمی‌خورد. لاگ‌ها در `.auto-deploy.log`.

## خروجی‌ها (قابل curl)

فایل‌ها موقع build ساخته می‌شوند: `/export/<file>` مثل
`ino.postgres.sql` · `ino.mysql.sql` · `ino.seed.postgres.sql` · `ino.seed.mysql.sql` · `ino.fixtures.json` · `schema.prisma` · `schema.ts` (Drizzle) · `ino.types.ts` · `ino.zod.ts` · `ino.schema.json` · `ino.openapi.json` · `ino.dbml` · `ino.mmd`
و `/export/csv/<table>.csv` برای هر جدول.

## افزودن ویژگی جدید

همه چیز از `src/schema` تولید می‌شود؛ فقط همین‌جا را تغییر دهید:

- `tables.ts` — جدول/ستون/رابطه/ایندکس/قید (رابطه‌ها از `ref` خودکار ساخته می‌شوند)
- `enums.ts` — enumها
- `seed.ts` — دیتای فیک (مبالغ، امانت، کیف پول و CRM محاسبه می‌شوند)
- `api.ts` — endpointها
- `flows.ts` — state machineها
- `screens.ts` — نگاشت فریم‌های Figma
- `rules.ts` — قوانین بیزینسی

ERD، صفحات، SQL، ORMها و OpenAPI خودکار به‌روز می‌شوند.
اگر چیدمان ERD عوض شد، دکمه «چیدمان دامنه‌ای» را بزنید (چیدمان در localStorage ذخیره می‌شود).
