import {
  integer,
  pgTable,
  timestamp,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core';

export const rolesTable = pgTable('roles', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  can_post_login: boolean().notNull().default(true),
  can_get_my_user: boolean().notNull().default(true),
  can_get_users: boolean().notNull().default(false),
  can_post_products: boolean().notNull().default(false),
  can_post_product_with_image: boolean().notNull().default(false),
  can_get_bestsellers: boolean().notNull().default(false),
});

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  passwordUpdatedAt: timestamp({ mode: 'date', precision: 6 })
    .notNull()
    .defaultNow(),
  roleId: integer()
    .notNull()
    .references(() => rolesTable.id),
});

export const productsTable = pgTable('products', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  shopify_id: varchar({ length: 255 }).notNull().unique(),
  created_by: integer()
    .notNull()
    .references(() => usersTable.id),
  sales_count: integer().notNull().default(0),
  image_url: varchar({ length: 500 }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const apiKeysTable = pgTable('api_keys', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  key: varchar({ length: 255 }).notNull().unique(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp().notNull().defaultNow(),
  lastUsedAt: timestamp(),
});
