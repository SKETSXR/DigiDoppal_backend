CREATE TABLE "activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"data" text NOT NULL,
	"datetime" text,
	"status" varchar(20) DEFAULT 'no_face' NOT NULL,
	"identity" varchar(255),
	"confidence" double precision,
	"distance" double precision,
	"file_path" text,
	"user_id" integer,
	"camera_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "status_check" CHECK ("activity_log"."status" IN ('verified', 'no_face', 'unknown'))
);
--> statement-breakpoint
CREATE TABLE "camera" (
	"id" serial PRIMARY KEY NOT NULL,
	"camera_number" varchar(50) NOT NULL,
	"camera_name" varchar(100) NOT NULL,
	"company_name" varchar(100),
	"room_id" integer,
	"is_on" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "humidity" (
	"id" serial PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"sensor_id" integer,
	"humidity" text,
	"datetime" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE TABLE "prediction" (
	"id" serial PRIMARY KEY NOT NULL,
	"datetime" timestamp DEFAULT now() NOT NULL,
	"temperature_prediction" double precision,
	"max_temperature_prediction" double precision,
	"min_temperature_prediction" double precision,
	"max_humidity_prediction" double precision,
	"min_humidity_prediction" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"image" text NOT NULL,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "temperature" (
	"id" serial PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"sensor_id" integer,
	"temperature" text,
	"datetime" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"photo" text,
	"password" text NOT NULL,
	"role_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_auth" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"device_info" text,
	"location" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_camera_id_camera_id_fk" FOREIGN KEY ("camera_id") REFERENCES "public"."camera"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camera" ADD CONSTRAINT "camera_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "humidity" ADD CONSTRAINT "humidity_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "temperature" ADD CONSTRAINT "temperature_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_user_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."user_role"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_auth" ADD CONSTRAINT "user_auth_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;