ALTER TABLE "users" ALTER COLUMN "passwordUpdatedAt" SET DATA TYPE timestamp (6);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "passwordUpdatedAt" SET DEFAULT now();