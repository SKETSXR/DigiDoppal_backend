ALTER TABLE "user_role" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_role" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_log" ADD COLUMN "coordinates" jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ADD COLUMN "frame_height" text;--> statement-breakpoint
ALTER TABLE "activity_log" ADD COLUMN "frame_width" text;--> statement-breakpoint
ALTER TABLE "activity_log" ADD COLUMN "threshold" text;
ALTER TABLE "activity_log" ADD COLUMN "room_id" integer;
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
