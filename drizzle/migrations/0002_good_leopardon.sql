CREATE TABLE "sensors" (
	"id" serial PRIMARY KEY NOT NULL,
	"serial_number" text NOT NULL,
	"name" text NOT NULL,
	"alert_profile" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sensors_serial_number_unique" UNIQUE("serial_number")
);