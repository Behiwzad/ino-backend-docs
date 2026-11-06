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

## خروجی‌ها (قابل curl)

`/export/<key>` با کلیدهای:
`postgres` · `mysql` · `seed-pg` · `seed-mysql` · `fixtures` · `prisma` · `drizzle` · `laravel` · `typescript` · `zod` · `jsonschema` · `openapi` · `dbml` · `mermaid`
و `/export/csv/<table>` برای هر جدول.

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
