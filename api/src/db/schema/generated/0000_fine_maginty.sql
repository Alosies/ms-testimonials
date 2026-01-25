-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."organization_setup_status" AS ENUM('pending_setup', 'completed');--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"unique_name" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"can_manage_forms" boolean DEFAULT false NOT NULL,
	"can_manage_testimonials" boolean DEFAULT false NOT NULL,
	"can_manage_widgets" boolean DEFAULT false NOT NULL,
	"can_manage_members" boolean DEFAULT false NOT NULL,
	"can_manage_billing" boolean DEFAULT false NOT NULL,
	"can_delete_org" boolean DEFAULT false NOT NULL,
	"is_viewer" boolean DEFAULT false NOT NULL,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_unique_name_unique" UNIQUE("unique_name")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"unique_name" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"max_testimonials" integer NOT NULL,
	"max_forms" integer NOT NULL,
	"max_widgets" integer NOT NULL,
	"max_members" integer NOT NULL,
	"show_branding" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_unique_name_unique" UNIQUE("unique_name")
);
--> statement-breakpoint
CREATE TABLE "plan_prices" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"plan_id" text NOT NULL,
	"currency_code" varchar(3) DEFAULT 'USD' NOT NULL,
	"price_monthly_in_base_unit" integer DEFAULT 0 NOT NULL,
	"price_yearly_in_base_unit" integer DEFAULT 0 NOT NULL,
	"price_lifetime_in_base_unit" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_prices_unique" UNIQUE("plan_id","currency_code"),
	CONSTRAINT "plan_prices_currency_check" CHECK ((currency_code)::text ~ '^[A-Z]{3}$'::text)
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(100) NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"setup_status" "organization_setup_status" DEFAULT 'completed' NOT NULL,
	"logo_id" text,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organizations_slug_format" CHECK ((slug)::text ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'::text)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"locale" text DEFAULT 'en' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_locale_check" CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'::text)
);
--> statement-breakpoint
CREATE TABLE "user_identities" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_16() NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"provider_email" text,
	"provider_metadata" jsonb,
	"is_primary" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_identities_provider_unique" UNIQUE("provider","provider_user_id"),
	CONSTRAINT "user_identities_provider_check" CHECK (provider = ANY (ARRAY['supabase'::text, 'google'::text, 'github'::text, 'microsoft'::text, 'email'::text]))
);
--> statement-breakpoint
CREATE TABLE "organization_plans" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"billing_cycle" text NOT NULL,
	"currency_code" varchar(3) DEFAULT 'USD' NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"current_period_ends_at" timestamp with time zone,
	"trial_ends_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"max_forms" integer NOT NULL,
	"max_testimonials" integer NOT NULL,
	"max_widgets" integer NOT NULL,
	"max_members" integer NOT NULL,
	"show_branding" boolean NOT NULL,
	"price_in_base_unit" integer NOT NULL,
	"has_overrides" boolean DEFAULT false NOT NULL,
	"override_reason" text,
	"overridden_by" text,
	"overridden_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_plans_billing_check" CHECK (billing_cycle = ANY (ARRAY['monthly'::text, 'yearly'::text, 'lifetime'::text])),
	CONSTRAINT "org_plans_currency_check" CHECK ((currency_code)::text ~ '^[A-Z]{3}$'::text),
	CONSTRAINT "org_plans_status_check" CHECK (status = ANY (ARRAY['trial'::text, 'active'::text, 'cancelled'::text, 'expired'::text]))
);
--> statement-breakpoint
CREATE TABLE "organization_roles" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"role_id" text NOT NULL,
	"is_default_org" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"invited_by" text,
	"invited_at" timestamp with time zone,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_roles_unique" UNIQUE("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text,
	"name" text NOT NULL,
	"product_name" text NOT NULL,
	"product_description" text,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"branching_config" jsonb DEFAULT '{"enabled":false,"threshold":4,"ratingStepId":null}'::jsonb NOT NULL,
	CONSTRAINT "chk_forms_status" CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))
);
--> statement-breakpoint
CREATE TABLE "question_types" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"unique_name" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(30) NOT NULL,
	"description" text,
	"input_component" varchar(50) NOT NULL,
	"answer_data_type" varchar(20) NOT NULL,
	"supports_min_length" boolean DEFAULT false NOT NULL,
	"supports_max_length" boolean DEFAULT false NOT NULL,
	"supports_min_value" boolean DEFAULT false NOT NULL,
	"supports_max_value" boolean DEFAULT false NOT NULL,
	"supports_pattern" boolean DEFAULT false NOT NULL,
	"supports_options" boolean DEFAULT false NOT NULL,
	"supports_file_types" boolean DEFAULT false NOT NULL,
	"supports_max_file_size" boolean DEFAULT false NOT NULL,
	"default_min_value" integer,
	"default_max_value" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"icon" varchar(50),
	CONSTRAINT "question_types_unique_name_unique" UNIQUE("unique_name"),
	CONSTRAINT "question_types_answer_type_check" CHECK ((answer_data_type)::text = ANY ((ARRAY['text'::character varying, 'integer'::character varying, 'boolean'::character varying, 'decimal'::character varying, 'json'::character varying, 'url'::character varying])::text[])),
	CONSTRAINT "question_types_category_check" CHECK ((category)::text = ANY ((ARRAY['text'::character varying, 'rating'::character varying, 'choice'::character varying, 'media'::character varying, 'special'::character varying, 'input'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "form_questions" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"question_type_id" text NOT NULL,
	"question_key" varchar(50) NOT NULL,
	"question_text" text NOT NULL,
	"placeholder" text,
	"help_text" text,
	"display_order" smallint NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"min_length" integer,
	"max_length" integer,
	"min_value" integer,
	"max_value" integer,
	"validation_pattern" text,
	"allowed_file_types" text[],
	"max_file_size_kb" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"scale_min_label" text,
	"scale_max_label" text,
	"step_id" text,
	CONSTRAINT "form_questions_key_format" CHECK ((question_key)::text ~ '^[a-z][a-z0-9_]*$'::text),
	CONSTRAINT "form_questions_length_check" CHECK ((min_length IS NULL) OR (max_length IS NULL) OR (min_length <= max_length)),
	CONSTRAINT "form_questions_value_check" CHECK ((min_value IS NULL) OR (max_value IS NULL) OR (min_value <= max_value))
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"question_id" text NOT NULL,
	"option_value" varchar(100) NOT NULL,
	"option_label" text NOT NULL,
	"display_order" smallint NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	CONSTRAINT "question_options_value_per_question_unique" UNIQUE("question_id","option_value"),
	CONSTRAINT "question_options_order_per_question_unique" UNIQUE("question_id","display_order")
);
--> statement-breakpoint
CREATE TABLE "form_question_responses" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"submission_id" text NOT NULL,
	"question_id" text NOT NULL,
	"answer_text" text,
	"answer_integer" integer,
	"answer_boolean" boolean,
	"answer_json" jsonb,
	"answer_url" text,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "form_question_responses_unique" UNIQUE("submission_id","question_id"),
	CONSTRAINT "form_question_responses_has_value" CHECK ((answer_text IS NOT NULL) OR (answer_integer IS NOT NULL) OR (answer_boolean IS NOT NULL) OR (answer_json IS NOT NULL) OR (answer_url IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "widgets" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"created_by" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"show_ratings" boolean DEFAULT true NOT NULL,
	"show_dates" boolean DEFAULT false NOT NULL,
	"show_company" boolean DEFAULT true NOT NULL,
	"show_avatar" boolean DEFAULT true NOT NULL,
	"max_display" smallint,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "widgets_theme_check" CHECK (theme = ANY (ARRAY['light'::text, 'dark'::text])),
	CONSTRAINT "widgets_type_check" CHECK (type = ANY (ARRAY['wall_of_love'::text, 'carousel'::text, 'single_quote'::text]))
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"submission_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"content" text,
	"rating" smallint,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_title" text,
	"customer_company" text,
	"customer_avatar_url" text,
	"customer_linkedin_url" text,
	"customer_twitter_url" text,
	"source" text DEFAULT 'form' NOT NULL,
	"source_metadata" jsonb,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"rejected_by" text,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "testimonials_email_format" CHECK (customer_email ~* '^.+@.+\..+$'::text),
	CONSTRAINT "testimonials_linkedin_url_format" CHECK ((customer_linkedin_url IS NULL) OR (customer_linkedin_url ~* '^https?://(www\.)?linkedin\.com/'::text)),
	CONSTRAINT "testimonials_rating_check" CHECK ((rating IS NULL) OR ((rating >= 1) AND (rating <= 5))),
	CONSTRAINT "testimonials_source_check" CHECK (source = ANY (ARRAY['form'::text, 'import'::text, 'manual'::text])),
	CONSTRAINT "testimonials_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
	CONSTRAINT "testimonials_twitter_url_format" CHECK ((customer_twitter_url IS NULL) OR (customer_twitter_url ~* '^https?://(www\.)?(twitter\.com|x\.com)/'::text))
);
--> statement-breakpoint
CREATE TABLE "widget_testimonials" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"widget_id" text NOT NULL,
	"testimonial_id" text NOT NULL,
	"display_order" smallint NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"added_by" text,
	CONSTRAINT "widget_testimonials_unique" UNIQUE("widget_id","testimonial_id"),
	CONSTRAINT "widget_testimonials_order_unique" UNIQUE("widget_id","display_order")
);
--> statement-breakpoint
CREATE TABLE "plan_question_types" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"plan_id" text NOT NULL,
	"question_type_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_by" text,
	CONSTRAINT "plan_question_types_unique" UNIQUE("plan_id","question_type_id")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
	"avatar_url" text,
	"job_title" text,
	"company_name" text,
	"company_website" text,
	"linkedin_url" text,
	"twitter_url" text,
	"source" text DEFAULT 'form_submission' NOT NULL,
	"source_form_id" text,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submission_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contacts_org_email_unique" UNIQUE("organization_id","email"),
	CONSTRAINT "contacts_source_check" CHECK (source = ANY (ARRAY['form_submission'::text, 'import'::text, 'manual'::text]))
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"form_id" text NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"contact_id" text
);
--> statement-breakpoint
CREATE TABLE "media_entity_types" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"code" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text NOT NULL,
	"target_table" text NOT NULL,
	"target_column" text DEFAULT 'id' NOT NULL,
	"allowed_mime_types" text[] NOT NULL,
	"max_file_size_bytes" bigint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_by" text,
	CONSTRAINT "media_entity_types_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "form_steps" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"step_type" text NOT NULL,
	"step_order" smallint NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tips" text[] DEFAULT '{""}',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_by" text,
	"flow_membership" text DEFAULT 'shared' NOT NULL,
	"flow_id" text NOT NULL,
	CONSTRAINT "form_steps_flow_order_unique" UNIQUE("step_order","flow_id"),
	CONSTRAINT "form_steps_step_type_check" CHECK (step_type = ANY (ARRAY['welcome'::text, 'question'::text, 'rating'::text, 'consent'::text, 'contact_info'::text, 'reward'::text, 'thank_you'::text]))
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size_bytes" bigint NOT NULL,
	"storage_provider" text DEFAULT 'aws_s3' NOT NULL,
	"storage_bucket" text NOT NULL,
	"storage_path" text NOT NULL,
	"storage_region" text,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"processing_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"width" integer,
	"height" integer,
	"duration_seconds" numeric,
	"thumbnail_path" text,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_media_duration_non_negative" CHECK ((duration_seconds IS NULL) OR (duration_seconds >= (0)::numeric)),
	CONSTRAINT "chk_media_file_size_positive" CHECK (file_size_bytes > 0),
	CONSTRAINT "chk_media_height_positive" CHECK ((height IS NULL) OR (height > 0)),
	CONSTRAINT "chk_media_status" CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'ready'::text, 'failed'::text, 'deleted'::text])),
	CONSTRAINT "chk_media_width_positive" CHECK ((width IS NULL) OR (width > 0))
);
--> statement-breakpoint
CREATE TABLE "form_analytics_events" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"organization_id" text NOT NULL,
	"form_id" text NOT NULL,
	"session_id" text NOT NULL,
	"event_type" text NOT NULL,
	"step_index" integer,
	"step_id" text,
	"step_type" text,
	"event_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_analytics_events_event_type_check" CHECK (event_type = ANY (ARRAY['form_started'::text, 'step_completed'::text, 'step_skipped'::text, 'form_submitted'::text, 'form_abandoned'::text, 'form_resumed'::text]))
);
--> statement-breakpoint
CREATE TABLE "flows" (
	"id" text PRIMARY KEY DEFAULT generate_nanoid_12() NOT NULL,
	"form_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"flow_type" text NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"branch_question_id" text,
	"branch_field" text,
	"branch_operator" text,
	"branch_value" jsonb,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "flows_form_name_unique" UNIQUE("form_id","name"),
	CONSTRAINT "chk_flows_branch_field" CHECK ((branch_field IS NULL) OR (branch_field = ANY (ARRAY['answer_integer'::text, 'answer_text'::text, 'answer_boolean'::text, 'answer_json'::text]))),
	CONSTRAINT "chk_flows_branch_operator" CHECK ((branch_operator IS NULL) OR (branch_operator = ANY (ARRAY['equals'::text, 'not_equals'::text, 'greater_than'::text, 'greater_than_or_equal_to'::text, 'less_than'::text, 'less_than_or_equal_to'::text, 'between'::text, 'is_one_of'::text, 'contains'::text, 'is_empty'::text]))),
	CONSTRAINT "chk_flows_branch_requires_conditions" CHECK (CHECK (
CASE
    WHEN (flow_type = 'branch'::text) THEN ((branch_question_id IS NOT NULL) AND (branch_operator IS NOT NULL))
    ELSE true
END)),
	CONSTRAINT "chk_flows_condition_completeness" CHECK (((flow_type = 'shared'::text) AND (branch_question_id IS NULL) AND (branch_field IS NULL) AND (branch_operator IS NULL) AND (branch_value IS NULL)) OR ((flow_type = 'branch'::text) AND (branch_question_id IS NOT NULL) AND (branch_field IS NOT NULL) AND (branch_operator IS NOT NULL))),
	CONSTRAINT "chk_flows_primary_no_branch" CHECK ((NOT is_primary) OR ((branch_question_id IS NULL) AND (branch_operator IS NULL) AND (branch_value IS NULL))),
	CONSTRAINT "flows_flow_type_check" CHECK (flow_type = ANY (ARRAY['shared'::text, 'branch'::text]))
);
--> statement-breakpoint
ALTER TABLE "plan_prices" ADD CONSTRAINT "plan_prices_plan_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "fk_organizations_logo_id" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_plans" ADD CONSTRAINT "org_plans_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_plans" ADD CONSTRAINT "org_plans_overridden_by_fk" FOREIGN KEY ("overridden_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_plans" ADD CONSTRAINT "org_plans_plan_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_roles" ADD CONSTRAINT "org_roles_invited_by_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_roles" ADD CONSTRAINT "org_roles_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_roles" ADD CONSTRAINT "org_roles_role_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_roles" ADD CONSTRAINT "org_roles_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_updated_by_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_questions" ADD CONSTRAINT "fk_form_questions_step_id" FOREIGN KEY ("step_id") REFERENCES "public"."form_steps"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "form_questions" ADD CONSTRAINT "form_questions_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_questions" ADD CONSTRAINT "form_questions_type_fk" FOREIGN KEY ("question_type_id") REFERENCES "public"."question_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_questions" ADD CONSTRAINT "form_questions_updated_by_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_fk" FOREIGN KEY ("question_id") REFERENCES "public"."form_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_question_responses" ADD CONSTRAINT "form_question_responses_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_question_responses" ADD CONSTRAINT "form_question_responses_question_fk" FOREIGN KEY ("question_id") REFERENCES "public"."form_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_question_responses" ADD CONSTRAINT "form_question_responses_submission_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_question_responses" ADD CONSTRAINT "form_question_responses_updated_by_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_updated_by_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_approved_by_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_rejected_by_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_submission_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_updated_by_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_testimonials" ADD CONSTRAINT "widget_testimonials_added_by_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_testimonials" ADD CONSTRAINT "widget_testimonials_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_testimonials" ADD CONSTRAINT "widget_testimonials_testimonial_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_testimonials" ADD CONSTRAINT "widget_testimonials_widget_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_question_types" ADD CONSTRAINT "plan_question_types_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "plan_question_types" ADD CONSTRAINT "plan_question_types_plan_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "plan_question_types" ADD CONSTRAINT "plan_question_types_question_type_fk" FOREIGN KEY ("question_type_id") REFERENCES "public"."question_types"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "plan_question_types" ADD CONSTRAINT "plan_question_types_updated_by_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "fk_contacts_organization_id" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "fk_contacts_source_form_id" FOREIGN KEY ("source_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "fk_form_submissions_contact_id" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_updated_by_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_entity_types" ADD CONSTRAINT "media_entity_types_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_entity_types" ADD CONSTRAINT "media_entity_types_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_steps" ADD CONSTRAINT "fk_form_steps_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "form_steps" ADD CONSTRAINT "fk_form_steps_flow_id" FOREIGN KEY ("flow_id") REFERENCES "public"."flows"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "form_steps" ADD CONSTRAINT "fk_form_steps_organization_id" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "form_steps" ADD CONSTRAINT "fk_form_steps_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "fk_media_entity_type" FOREIGN KEY ("entity_type") REFERENCES "public"."media_entity_types"("code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "fk_media_organization_id" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "fk_media_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "form_analytics_events" ADD CONSTRAINT "form_analytics_events_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_analytics_events" ADD CONSTRAINT "form_analytics_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flows" ADD CONSTRAINT "fk_flows_branch_question" FOREIGN KEY ("branch_question_id") REFERENCES "public"."form_questions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "flows" ADD CONSTRAINT "fk_flows_form_id" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "flows" ADD CONSTRAINT "fk_flows_organization_id" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_plans_active" ON "plans" USING btree ("id" text_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_plans_unique_name" ON "plans" USING btree ("unique_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_plan_prices_currency" ON "plan_prices" USING btree ("currency_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_plan_prices_plan" ON "plan_prices" USING btree ("plan_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_organizations_active" ON "organizations" USING btree ("id" text_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_organizations_created_by" ON "organizations" USING btree ("created_by" text_ops);--> statement-breakpoint
CREATE INDEX "idx_organizations_logo_id" ON "organizations" USING btree ("logo_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_organizations_slug" ON "organizations" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_active" ON "users" USING btree ("id" text_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_user_identities_lookup" ON "user_identities" USING btree ("provider" text_ops,"provider_user_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_identities_one_primary" ON "user_identities" USING btree ("user_id" text_ops) WHERE (is_primary = true);--> statement-breakpoint
CREATE INDEX "idx_user_identities_user" ON "user_identities" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_org_plans_active" ON "organization_plans" USING btree ("organization_id" text_ops) WHERE (status = ANY (ARRAY['trial'::text, 'active'::text]));--> statement-breakpoint
CREATE INDEX "idx_org_plans_expiring" ON "organization_plans" USING btree ("current_period_ends_at" timestamptz_ops) WHERE ((status = 'active'::text) AND (current_period_ends_at IS NOT NULL));--> statement-breakpoint
CREATE INDEX "idx_org_plans_org" ON "organization_plans" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_org_plans_plan" ON "organization_plans" USING btree ("plan_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_org_plans_status" ON "organization_plans" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_org_roles_active" ON "organization_roles" USING btree ("user_id" text_ops,"organization_id" text_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_org_roles_one_default" ON "organization_roles" USING btree ("user_id" text_ops) WHERE (is_default_org = true);--> statement-breakpoint
CREATE INDEX "idx_org_roles_org" ON "organization_roles" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_org_roles_role" ON "organization_roles" USING btree ("role_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_org_roles_user" ON "organization_roles" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_forms_active" ON "forms" USING btree ("organization_id" text_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_forms_org" ON "forms" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_forms_organization_status" ON "forms" USING btree ("organization_id" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_question_types_category" ON "question_types" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_questions_org" ON "form_questions" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_questions_step_id" ON "form_questions" USING btree ("step_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_form_questions_step_id_unique" ON "form_questions" USING btree ("step_id" text_ops) WHERE (step_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_form_questions_type" ON "form_questions" USING btree ("question_type_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_question_options_order" ON "question_options" USING btree ("question_id" int2_ops,"display_order" text_ops);--> statement-breakpoint
CREATE INDEX "idx_question_options_org" ON "question_options" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_question_options_question" ON "question_options" USING btree ("question_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_question_responses_org" ON "form_question_responses" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_question_responses_question" ON "form_question_responses" USING btree ("question_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_question_responses_rating" ON "form_question_responses" USING btree ("question_id" int4_ops,"answer_integer" int4_ops) WHERE (answer_integer IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_form_question_responses_submission" ON "form_question_responses" USING btree ("submission_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_widgets_active" ON "widgets" USING btree ("organization_id" text_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_widgets_org" ON "widgets" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_testimonials_approved" ON "testimonials" USING btree ("organization_id" timestamptz_ops,"created_at" text_ops) WHERE (status = 'approved'::text);--> statement-breakpoint
CREATE INDEX "idx_testimonials_org" ON "testimonials" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_testimonials_status" ON "testimonials" USING btree ("organization_id" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_testimonials_submission" ON "testimonials" USING btree ("submission_id" text_ops) WHERE (submission_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_widget_testimonials_order" ON "widget_testimonials" USING btree ("widget_id" int2_ops,"display_order" text_ops);--> statement-breakpoint
CREATE INDEX "idx_widget_testimonials_org" ON "widget_testimonials" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_widget_testimonials_testimonial" ON "widget_testimonials" USING btree ("testimonial_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_widget_testimonials_widget" ON "widget_testimonials" USING btree ("widget_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_plan_question_types_plan_id" ON "plan_question_types" USING btree ("plan_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_plan_question_types_question_type_id" ON "plan_question_types" USING btree ("question_type_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_contacts_email" ON "contacts" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_contacts_last_seen_at" ON "contacts" USING btree ("last_seen_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_contacts_organization_id" ON "contacts" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_submissions_contact_id" ON "form_submissions" USING btree ("contact_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_submissions_form" ON "form_submissions" USING btree ("form_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_submissions_org" ON "form_submissions" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_submissions_submitted" ON "form_submissions" USING btree ("organization_id" text_ops,"submitted_at" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_steps_flow_id" ON "form_steps" USING btree ("flow_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_steps_flow_order" ON "form_steps" USING btree ("flow_id" text_ops,"step_order" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_steps_organization_id" ON "form_steps" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_media_created_at" ON "media" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_media_entity" ON "media" USING btree ("entity_type" text_ops,"entity_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_media_organization_id" ON "media" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_media_status" ON "media" USING btree ("status" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_media_storage_path" ON "media" USING btree ("storage_bucket" text_ops,"storage_path" text_ops);--> statement-breakpoint
CREATE INDEX "idx_media_uploaded_by" ON "media" USING btree ("uploaded_by" text_ops) WHERE (uploaded_by IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_form_analytics_event_type" ON "form_analytics_events" USING btree ("organization_id" text_ops,"event_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_analytics_form" ON "form_analytics_events" USING btree ("form_id" timestamptz_ops,"created_at" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_analytics_org" ON "form_analytics_events" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_form_analytics_session" ON "form_analytics_events" USING btree ("session_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_flows_branch_question_id" ON "flows" USING btree ("branch_question_id" text_ops) WHERE (branch_question_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_flows_form_id" ON "flows" USING btree ("form_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_flows_form_order" ON "flows" USING btree ("form_id" int2_ops,"display_order" text_ops);--> statement-breakpoint
CREATE INDEX "idx_flows_organization_id" ON "flows" USING btree ("organization_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_flows_primary_per_form" ON "flows" USING btree ("form_id" text_ops) WHERE (is_primary = true);
*/