// Single source of truth types for the Ino backend model.
// Every view (ERD canvas, table pages, exports) is generated from these definitions.

export type ColType =
  | "bigint"
  | "int"
  | "smallint"
  | "varchar"
  | "text"
  | "bool"
  | "timestamptz"
  | "date"
  | "time"
  | "numeric"
  | "jsonb"
  | "inet"
  | "enum";

export type OnDelete = "cascade" | "restrict" | "set null";

export interface Ref {
  table: string;
  column?: string; // default "id"
  onDelete?: OnDelete;
  /** cardinality from the referencing side: many rows here -> one row there (default) or one-to-one */
  kind?: "many-to-one" | "one-to-one";
}

export interface Column {
  name: string;
  type: ColType;
  length?: number; // varchar(n)
  precision?: [number, number]; // numeric(p,s)
  enum?: string; // enum name when type === "enum"
  pk?: boolean;
  identity?: boolean; // generated always as identity
  nullable?: boolean;
  unique?: boolean;
  default?: string; // raw SQL default
  ref?: Ref;
  note?: string; // Persian explanation
  example?: string;
}

export interface Index {
  columns: string[];
  unique?: boolean;
  where?: string; // partial index predicate
  name?: string;
  note?: string;
}

export interface Check {
  name: string;
  expr: string;
  note?: string;
}

export type DomainKey =
  | "identity"
  | "geo"
  | "catalog"
  | "salon"
  | "staff"
  | "service"
  | "booking"
  | "payment"
  | "social"
  | "notify"
  | "platform";

export interface Table {
  name: string;
  domain: DomainKey;
  title: string; // Persian title
  description: string; // Persian description
  columns: Column[];
  indexes?: Index[];
  checks?: Check[];
  /** ids of app screens (see screens.ts) where this data is shown or created */
  screens?: string[];
  /** Short business rules tied to this table */
  rules?: string[];
  /** Denormalized/derived columns are recalculated by these jobs */
  derived?: string[];
}

export interface EnumValue {
  value: string;
  fa: string;
  note?: string;
}

export interface EnumDef {
  name: string;
  title: string;
  values: EnumValue[];
}

export interface Domain {
  key: DomainKey;
  title: string;
  en: string;
  color: string; // hex accent
  description: string;
}
