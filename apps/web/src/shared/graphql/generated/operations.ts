import gql from 'graphql-tag';
import * as VueApolloComposable from '@vue/apollo-composable';
import * as VueCompositionApi from 'vue';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type ReactiveFunction<TParam> = () => TParam;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  jsonb: { input: any; output: any; }
  organization_setup_status: { input: 'pending_setup' | 'completed'; output: 'pending_setup' | 'completed'; }
  smallint: { input: number; output: number; }
  timestamptz: { input: string; output: string; }
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Array_Comparison_Exp = {
  /** is the array contained in the given array value */
  _contained_in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the array contain the given value */
  _contains?: InputMaybe<Array<Scalars['String']['input']>>;
  _eq?: InputMaybe<Array<Scalars['String']['input']>>;
  _gt?: InputMaybe<Array<Scalars['String']['input']>>;
  _gte?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Array<Scalars['String']['input']>>;
  _lte?: InputMaybe<Array<Scalars['String']['input']>>;
  _neq?: InputMaybe<Array<Scalars['String']['input']>>;
  _nin?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** Normalized contact data for testimonial submitters. Enables contact management, deduplication across forms, and tracking of repeat submissions within an organization. */
export type Contacts = {
  __typename?: 'contacts';
  /** URL to profile photo or avatar image. Displayed alongside testimonials for visual social proof and authenticity. */
  avatar_url?: Maybe<Scalars['String']['output']>;
  /** Name of the company or organization where the contact works. Used for B2B testimonial displays and logo integration. */
  company_name?: Maybe<Scalars['String']['output']>;
  /** URL to the contact's company website. May be used for automated logo fetching or company verification. */
  company_website?: Maybe<Scalars['String']['output']>;
  /** Timestamp when this contact record was first created. Set automatically on insert, never modified thereafter. */
  created_at: Scalars['timestamptz']['output'];
  /** Primary identifier for the contact. Unique within each organization. Used for deduplication when same person submits multiple testimonials across different forms. */
  email: Scalars['String']['output'];
  /** Boolean flag indicating if email ownership has been confirmed via verification link. Verified contacts may receive preferential display treatment. */
  email_verified: Scalars['Boolean']['output'];
  /** Timestamp of first interaction with the organization. Set on creation and never modified. Used for cohort analysis and engagement metrics. */
  first_seen_at: Scalars['timestamptz']['output'];
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id: Scalars['String']['output'];
  /** Professional title or role (e.g., "VP of Engineering", "Founder"). Adds credibility context to testimonials, especially for B2B use cases. */
  job_title?: Maybe<Scalars['String']['output']>;
  /** Timestamp of most recent activity. Updated on each new submission or interaction. Used for identifying active vs dormant contacts. */
  last_seen_at: Scalars['timestamptz']['output'];
  /** URL to LinkedIn profile. Provides professional verification and enables social proof through platform recognition. */
  linkedin_url?: Maybe<Scalars['String']['output']>;
  /** Display name of the contact. Collected from form submission contact_info step or enriched from external data sources like LinkedIn. */
  name?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  organization: Organizations;
  /** Foreign key to organizations table. Establishes tenant boundary - all contacts are scoped to a single organization for multi-tenancy isolation. */
  organization_id: Scalars['String']['output'];
  /** Origin of this contact record: form_submission (created during testimonial submission), import (bulk CSV/API import), manual (admin created). Used for analytics and attribution. */
  source: Scalars['String']['output'];
  /** An object relationship */
  source_form?: Maybe<Forms>;
  /** Foreign key to forms table. References the first form through which this contact was acquired. Preserved even if form is later deleted (set null). */
  source_form_id?: Maybe<Scalars['String']['output']>;
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count: Scalars['Int']['output'];
  /** An array relationship */
  submissions: Array<Form_Submissions>;
  /** An aggregate relationship */
  submissions_aggregate: Form_Submissions_Aggregate;
  /** URL to Twitter/X profile. Used for social sharing integration and additional verification of contact identity. */
  twitter_url?: Maybe<Scalars['String']['output']>;
  /** Timestamp of last modification to this record. Automatically updated by database trigger on any column change. */
  updated_at: Scalars['timestamptz']['output'];
};


/** Normalized contact data for testimonial submitters. Enables contact management, deduplication across forms, and tracking of repeat submissions within an organization. */
export type ContactsSubmissionsArgs = {
  distinct_on?: InputMaybe<Array<Form_Submissions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Submissions_Order_By>>;
  where?: InputMaybe<Form_Submissions_Bool_Exp>;
};


/** Normalized contact data for testimonial submitters. Enables contact management, deduplication across forms, and tracking of repeat submissions within an organization. */
export type ContactsSubmissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Submissions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Submissions_Order_By>>;
  where?: InputMaybe<Form_Submissions_Bool_Exp>;
};

/** aggregated selection of "contacts" */
export type Contacts_Aggregate = {
  __typename?: 'contacts_aggregate';
  aggregate?: Maybe<Contacts_Aggregate_Fields>;
  nodes: Array<Contacts>;
};

export type Contacts_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Contacts_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Contacts_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Contacts_Aggregate_Bool_Exp_Count>;
};

export type Contacts_Aggregate_Bool_Exp_Bool_And = {
  arguments: Contacts_Select_Column_Contacts_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Contacts_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Contacts_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Contacts_Select_Column_Contacts_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Contacts_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Contacts_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Contacts_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Contacts_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "contacts" */
export type Contacts_Aggregate_Fields = {
  __typename?: 'contacts_aggregate_fields';
  avg?: Maybe<Contacts_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Contacts_Max_Fields>;
  min?: Maybe<Contacts_Min_Fields>;
  stddev?: Maybe<Contacts_Stddev_Fields>;
  stddev_pop?: Maybe<Contacts_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Contacts_Stddev_Samp_Fields>;
  sum?: Maybe<Contacts_Sum_Fields>;
  var_pop?: Maybe<Contacts_Var_Pop_Fields>;
  var_samp?: Maybe<Contacts_Var_Samp_Fields>;
  variance?: Maybe<Contacts_Variance_Fields>;
};


/** aggregate fields of "contacts" */
export type Contacts_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Contacts_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "contacts" */
export type Contacts_Aggregate_Order_By = {
  avg?: InputMaybe<Contacts_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Contacts_Max_Order_By>;
  min?: InputMaybe<Contacts_Min_Order_By>;
  stddev?: InputMaybe<Contacts_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Contacts_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Contacts_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Contacts_Sum_Order_By>;
  var_pop?: InputMaybe<Contacts_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Contacts_Var_Samp_Order_By>;
  variance?: InputMaybe<Contacts_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "contacts" */
export type Contacts_Arr_Rel_Insert_Input = {
  data: Array<Contacts_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Contacts_On_Conflict>;
};

/** aggregate avg on columns */
export type Contacts_Avg_Fields = {
  __typename?: 'contacts_avg_fields';
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "contacts" */
export type Contacts_Avg_Order_By = {
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "contacts". All fields are combined with a logical 'AND'. */
export type Contacts_Bool_Exp = {
  _and?: InputMaybe<Array<Contacts_Bool_Exp>>;
  _not?: InputMaybe<Contacts_Bool_Exp>;
  _or?: InputMaybe<Array<Contacts_Bool_Exp>>;
  avatar_url?: InputMaybe<String_Comparison_Exp>;
  company_name?: InputMaybe<String_Comparison_Exp>;
  company_website?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  email_verified?: InputMaybe<Boolean_Comparison_Exp>;
  first_seen_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  job_title?: InputMaybe<String_Comparison_Exp>;
  last_seen_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  linkedin_url?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  source?: InputMaybe<String_Comparison_Exp>;
  source_form?: InputMaybe<Forms_Bool_Exp>;
  source_form_id?: InputMaybe<String_Comparison_Exp>;
  submission_count?: InputMaybe<Int_Comparison_Exp>;
  submissions?: InputMaybe<Form_Submissions_Bool_Exp>;
  submissions_aggregate?: InputMaybe<Form_Submissions_Aggregate_Bool_Exp>;
  twitter_url?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "contacts" */
export enum Contacts_Constraint {
  /** unique or primary key constraint on columns "email", "organization_id" */
  ContactsOrgEmailUnique = 'contacts_org_email_unique',
  /** unique or primary key constraint on columns "id" */
  ContactsPkey = 'contacts_pkey'
}

/** input type for incrementing numeric columns in table "contacts" */
export type Contacts_Inc_Input = {
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "contacts" */
export type Contacts_Insert_Input = {
  /** URL to profile photo or avatar image. Displayed alongside testimonials for visual social proof and authenticity. */
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  /** Name of the company or organization where the contact works. Used for B2B testimonial displays and logo integration. */
  company_name?: InputMaybe<Scalars['String']['input']>;
  /** URL to the contact's company website. May be used for automated logo fetching or company verification. */
  company_website?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when this contact record was first created. Set automatically on insert, never modified thereafter. */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary identifier for the contact. Unique within each organization. Used for deduplication when same person submits multiple testimonials across different forms. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Boolean flag indicating if email ownership has been confirmed via verification link. Verified contacts may receive preferential display treatment. */
  email_verified?: InputMaybe<Scalars['Boolean']['input']>;
  /** Timestamp of first interaction with the organization. Set on creation and never modified. Used for cohort analysis and engagement metrics. */
  first_seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Professional title or role (e.g., "VP of Engineering", "Founder"). Adds credibility context to testimonials, especially for B2B use cases. */
  job_title?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp of most recent activity. Updated on each new submission or interaction. Used for identifying active vs dormant contacts. */
  last_seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** URL to LinkedIn profile. Provides professional verification and enables social proof through platform recognition. */
  linkedin_url?: InputMaybe<Scalars['String']['input']>;
  /** Display name of the contact. Collected from form submission contact_info step or enriched from external data sources like LinkedIn. */
  name?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** Foreign key to organizations table. Establishes tenant boundary - all contacts are scoped to a single organization for multi-tenancy isolation. */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Origin of this contact record: form_submission (created during testimonial submission), import (bulk CSV/API import), manual (admin created). Used for analytics and attribution. */
  source?: InputMaybe<Scalars['String']['input']>;
  source_form?: InputMaybe<Forms_Obj_Rel_Insert_Input>;
  /** Foreign key to forms table. References the first form through which this contact was acquired. Preserved even if form is later deleted (set null). */
  source_form_id?: InputMaybe<Scalars['String']['input']>;
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Scalars['Int']['input']>;
  submissions?: InputMaybe<Form_Submissions_Arr_Rel_Insert_Input>;
  /** URL to Twitter/X profile. Used for social sharing integration and additional verification of contact identity. */
  twitter_url?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp of last modification to this record. Automatically updated by database trigger on any column change. */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Contacts_Max_Fields = {
  __typename?: 'contacts_max_fields';
  /** URL to profile photo or avatar image. Displayed alongside testimonials for visual social proof and authenticity. */
  avatar_url?: Maybe<Scalars['String']['output']>;
  /** Name of the company or organization where the contact works. Used for B2B testimonial displays and logo integration. */
  company_name?: Maybe<Scalars['String']['output']>;
  /** URL to the contact's company website. May be used for automated logo fetching or company verification. */
  company_website?: Maybe<Scalars['String']['output']>;
  /** Timestamp when this contact record was first created. Set automatically on insert, never modified thereafter. */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary identifier for the contact. Unique within each organization. Used for deduplication when same person submits multiple testimonials across different forms. */
  email?: Maybe<Scalars['String']['output']>;
  /** Timestamp of first interaction with the organization. Set on creation and never modified. Used for cohort analysis and engagement metrics. */
  first_seen_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: Maybe<Scalars['String']['output']>;
  /** Professional title or role (e.g., "VP of Engineering", "Founder"). Adds credibility context to testimonials, especially for B2B use cases. */
  job_title?: Maybe<Scalars['String']['output']>;
  /** Timestamp of most recent activity. Updated on each new submission or interaction. Used for identifying active vs dormant contacts. */
  last_seen_at?: Maybe<Scalars['timestamptz']['output']>;
  /** URL to LinkedIn profile. Provides professional verification and enables social proof through platform recognition. */
  linkedin_url?: Maybe<Scalars['String']['output']>;
  /** Display name of the contact. Collected from form submission contact_info step or enriched from external data sources like LinkedIn. */
  name?: Maybe<Scalars['String']['output']>;
  /** Foreign key to organizations table. Establishes tenant boundary - all contacts are scoped to a single organization for multi-tenancy isolation. */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Origin of this contact record: form_submission (created during testimonial submission), import (bulk CSV/API import), manual (admin created). Used for analytics and attribution. */
  source?: Maybe<Scalars['String']['output']>;
  /** Foreign key to forms table. References the first form through which this contact was acquired. Preserved even if form is later deleted (set null). */
  source_form_id?: Maybe<Scalars['String']['output']>;
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: Maybe<Scalars['Int']['output']>;
  /** URL to Twitter/X profile. Used for social sharing integration and additional verification of contact identity. */
  twitter_url?: Maybe<Scalars['String']['output']>;
  /** Timestamp of last modification to this record. Automatically updated by database trigger on any column change. */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "contacts" */
export type Contacts_Max_Order_By = {
  /** URL to profile photo or avatar image. Displayed alongside testimonials for visual social proof and authenticity. */
  avatar_url?: InputMaybe<Order_By>;
  /** Name of the company or organization where the contact works. Used for B2B testimonial displays and logo integration. */
  company_name?: InputMaybe<Order_By>;
  /** URL to the contact's company website. May be used for automated logo fetching or company verification. */
  company_website?: InputMaybe<Order_By>;
  /** Timestamp when this contact record was first created. Set automatically on insert, never modified thereafter. */
  created_at?: InputMaybe<Order_By>;
  /** Primary identifier for the contact. Unique within each organization. Used for deduplication when same person submits multiple testimonials across different forms. */
  email?: InputMaybe<Order_By>;
  /** Timestamp of first interaction with the organization. Set on creation and never modified. Used for cohort analysis and engagement metrics. */
  first_seen_at?: InputMaybe<Order_By>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: InputMaybe<Order_By>;
  /** Professional title or role (e.g., "VP of Engineering", "Founder"). Adds credibility context to testimonials, especially for B2B use cases. */
  job_title?: InputMaybe<Order_By>;
  /** Timestamp of most recent activity. Updated on each new submission or interaction. Used for identifying active vs dormant contacts. */
  last_seen_at?: InputMaybe<Order_By>;
  /** URL to LinkedIn profile. Provides professional verification and enables social proof through platform recognition. */
  linkedin_url?: InputMaybe<Order_By>;
  /** Display name of the contact. Collected from form submission contact_info step or enriched from external data sources like LinkedIn. */
  name?: InputMaybe<Order_By>;
  /** Foreign key to organizations table. Establishes tenant boundary - all contacts are scoped to a single organization for multi-tenancy isolation. */
  organization_id?: InputMaybe<Order_By>;
  /** Origin of this contact record: form_submission (created during testimonial submission), import (bulk CSV/API import), manual (admin created). Used for analytics and attribution. */
  source?: InputMaybe<Order_By>;
  /** Foreign key to forms table. References the first form through which this contact was acquired. Preserved even if form is later deleted (set null). */
  source_form_id?: InputMaybe<Order_By>;
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Order_By>;
  /** URL to Twitter/X profile. Used for social sharing integration and additional verification of contact identity. */
  twitter_url?: InputMaybe<Order_By>;
  /** Timestamp of last modification to this record. Automatically updated by database trigger on any column change. */
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Contacts_Min_Fields = {
  __typename?: 'contacts_min_fields';
  /** URL to profile photo or avatar image. Displayed alongside testimonials for visual social proof and authenticity. */
  avatar_url?: Maybe<Scalars['String']['output']>;
  /** Name of the company or organization where the contact works. Used for B2B testimonial displays and logo integration. */
  company_name?: Maybe<Scalars['String']['output']>;
  /** URL to the contact's company website. May be used for automated logo fetching or company verification. */
  company_website?: Maybe<Scalars['String']['output']>;
  /** Timestamp when this contact record was first created. Set automatically on insert, never modified thereafter. */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary identifier for the contact. Unique within each organization. Used for deduplication when same person submits multiple testimonials across different forms. */
  email?: Maybe<Scalars['String']['output']>;
  /** Timestamp of first interaction with the organization. Set on creation and never modified. Used for cohort analysis and engagement metrics. */
  first_seen_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: Maybe<Scalars['String']['output']>;
  /** Professional title or role (e.g., "VP of Engineering", "Founder"). Adds credibility context to testimonials, especially for B2B use cases. */
  job_title?: Maybe<Scalars['String']['output']>;
  /** Timestamp of most recent activity. Updated on each new submission or interaction. Used for identifying active vs dormant contacts. */
  last_seen_at?: Maybe<Scalars['timestamptz']['output']>;
  /** URL to LinkedIn profile. Provides professional verification and enables social proof through platform recognition. */
  linkedin_url?: Maybe<Scalars['String']['output']>;
  /** Display name of the contact. Collected from form submission contact_info step or enriched from external data sources like LinkedIn. */
  name?: Maybe<Scalars['String']['output']>;
  /** Foreign key to organizations table. Establishes tenant boundary - all contacts are scoped to a single organization for multi-tenancy isolation. */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Origin of this contact record: form_submission (created during testimonial submission), import (bulk CSV/API import), manual (admin created). Used for analytics and attribution. */
  source?: Maybe<Scalars['String']['output']>;
  /** Foreign key to forms table. References the first form through which this contact was acquired. Preserved even if form is later deleted (set null). */
  source_form_id?: Maybe<Scalars['String']['output']>;
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: Maybe<Scalars['Int']['output']>;
  /** URL to Twitter/X profile. Used for social sharing integration and additional verification of contact identity. */
  twitter_url?: Maybe<Scalars['String']['output']>;
  /** Timestamp of last modification to this record. Automatically updated by database trigger on any column change. */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "contacts" */
export type Contacts_Min_Order_By = {
  /** URL to profile photo or avatar image. Displayed alongside testimonials for visual social proof and authenticity. */
  avatar_url?: InputMaybe<Order_By>;
  /** Name of the company or organization where the contact works. Used for B2B testimonial displays and logo integration. */
  company_name?: InputMaybe<Order_By>;
  /** URL to the contact's company website. May be used for automated logo fetching or company verification. */
  company_website?: InputMaybe<Order_By>;
  /** Timestamp when this contact record was first created. Set automatically on insert, never modified thereafter. */
  created_at?: InputMaybe<Order_By>;
  /** Primary identifier for the contact. Unique within each organization. Used for deduplication when same person submits multiple testimonials across different forms. */
  email?: InputMaybe<Order_By>;
  /** Timestamp of first interaction with the organization. Set on creation and never modified. Used for cohort analysis and engagement metrics. */
  first_seen_at?: InputMaybe<Order_By>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: InputMaybe<Order_By>;
  /** Professional title or role (e.g., "VP of Engineering", "Founder"). Adds credibility context to testimonials, especially for B2B use cases. */
  job_title?: InputMaybe<Order_By>;
  /** Timestamp of most recent activity. Updated on each new submission or interaction. Used for identifying active vs dormant contacts. */
  last_seen_at?: InputMaybe<Order_By>;
  /** URL to LinkedIn profile. Provides professional verification and enables social proof through platform recognition. */
  linkedin_url?: InputMaybe<Order_By>;
  /** Display name of the contact. Collected from form submission contact_info step or enriched from external data sources like LinkedIn. */
  name?: InputMaybe<Order_By>;
  /** Foreign key to organizations table. Establishes tenant boundary - all contacts are scoped to a single organization for multi-tenancy isolation. */
  organization_id?: InputMaybe<Order_By>;
  /** Origin of this contact record: form_submission (created during testimonial submission), import (bulk CSV/API import), manual (admin created). Used for analytics and attribution. */
  source?: InputMaybe<Order_By>;
  /** Foreign key to forms table. References the first form through which this contact was acquired. Preserved even if form is later deleted (set null). */
  source_form_id?: InputMaybe<Order_By>;
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Order_By>;
  /** URL to Twitter/X profile. Used for social sharing integration and additional verification of contact identity. */
  twitter_url?: InputMaybe<Order_By>;
  /** Timestamp of last modification to this record. Automatically updated by database trigger on any column change. */
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "contacts" */
export type Contacts_Mutation_Response = {
  __typename?: 'contacts_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Contacts>;
};

/** input type for inserting object relation for remote table "contacts" */
export type Contacts_Obj_Rel_Insert_Input = {
  data: Contacts_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Contacts_On_Conflict>;
};

/** on_conflict condition type for table "contacts" */
export type Contacts_On_Conflict = {
  constraint: Contacts_Constraint;
  update_columns?: Array<Contacts_Update_Column>;
  where?: InputMaybe<Contacts_Bool_Exp>;
};

/** Ordering options when selecting data from "contacts". */
export type Contacts_Order_By = {
  avatar_url?: InputMaybe<Order_By>;
  company_name?: InputMaybe<Order_By>;
  company_website?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  email_verified?: InputMaybe<Order_By>;
  first_seen_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  job_title?: InputMaybe<Order_By>;
  last_seen_at?: InputMaybe<Order_By>;
  linkedin_url?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  source_form?: InputMaybe<Forms_Order_By>;
  source_form_id?: InputMaybe<Order_By>;
  submission_count?: InputMaybe<Order_By>;
  submissions_aggregate?: InputMaybe<Form_Submissions_Aggregate_Order_By>;
  twitter_url?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: contacts */
export type Contacts_Pk_Columns_Input = {
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id: Scalars['String']['input'];
};

/** select columns of table "contacts" */
export enum Contacts_Select_Column {
  /** column name */
  AvatarUrl = 'avatar_url',
  /** column name */
  CompanyName = 'company_name',
  /** column name */
  CompanyWebsite = 'company_website',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  EmailVerified = 'email_verified',
  /** column name */
  FirstSeenAt = 'first_seen_at',
  /** column name */
  Id = 'id',
  /** column name */
  JobTitle = 'job_title',
  /** column name */
  LastSeenAt = 'last_seen_at',
  /** column name */
  LinkedinUrl = 'linkedin_url',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Source = 'source',
  /** column name */
  SourceFormId = 'source_form_id',
  /** column name */
  SubmissionCount = 'submission_count',
  /** column name */
  TwitterUrl = 'twitter_url',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "contacts_aggregate_bool_exp_bool_and_arguments_columns" columns of table "contacts" */
export enum Contacts_Select_Column_Contacts_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  EmailVerified = 'email_verified'
}

/** select "contacts_aggregate_bool_exp_bool_or_arguments_columns" columns of table "contacts" */
export enum Contacts_Select_Column_Contacts_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  EmailVerified = 'email_verified'
}

/** input type for updating data in table "contacts" */
export type Contacts_Set_Input = {
  /** URL to profile photo or avatar image. Displayed alongside testimonials for visual social proof and authenticity. */
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  /** Name of the company or organization where the contact works. Used for B2B testimonial displays and logo integration. */
  company_name?: InputMaybe<Scalars['String']['input']>;
  /** URL to the contact's company website. May be used for automated logo fetching or company verification. */
  company_website?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when this contact record was first created. Set automatically on insert, never modified thereafter. */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary identifier for the contact. Unique within each organization. Used for deduplication when same person submits multiple testimonials across different forms. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Boolean flag indicating if email ownership has been confirmed via verification link. Verified contacts may receive preferential display treatment. */
  email_verified?: InputMaybe<Scalars['Boolean']['input']>;
  /** Timestamp of first interaction with the organization. Set on creation and never modified. Used for cohort analysis and engagement metrics. */
  first_seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Professional title or role (e.g., "VP of Engineering", "Founder"). Adds credibility context to testimonials, especially for B2B use cases. */
  job_title?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp of most recent activity. Updated on each new submission or interaction. Used for identifying active vs dormant contacts. */
  last_seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** URL to LinkedIn profile. Provides professional verification and enables social proof through platform recognition. */
  linkedin_url?: InputMaybe<Scalars['String']['input']>;
  /** Display name of the contact. Collected from form submission contact_info step or enriched from external data sources like LinkedIn. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Foreign key to organizations table. Establishes tenant boundary - all contacts are scoped to a single organization for multi-tenancy isolation. */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Origin of this contact record: form_submission (created during testimonial submission), import (bulk CSV/API import), manual (admin created). Used for analytics and attribution. */
  source?: InputMaybe<Scalars['String']['input']>;
  /** Foreign key to forms table. References the first form through which this contact was acquired. Preserved even if form is later deleted (set null). */
  source_form_id?: InputMaybe<Scalars['String']['input']>;
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Scalars['Int']['input']>;
  /** URL to Twitter/X profile. Used for social sharing integration and additional verification of contact identity. */
  twitter_url?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp of last modification to this record. Automatically updated by database trigger on any column change. */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Contacts_Stddev_Fields = {
  __typename?: 'contacts_stddev_fields';
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "contacts" */
export type Contacts_Stddev_Order_By = {
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Contacts_Stddev_Pop_Fields = {
  __typename?: 'contacts_stddev_pop_fields';
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "contacts" */
export type Contacts_Stddev_Pop_Order_By = {
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Contacts_Stddev_Samp_Fields = {
  __typename?: 'contacts_stddev_samp_fields';
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "contacts" */
export type Contacts_Stddev_Samp_Order_By = {
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "contacts" */
export type Contacts_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Contacts_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Contacts_Stream_Cursor_Value_Input = {
  /** URL to profile photo or avatar image. Displayed alongside testimonials for visual social proof and authenticity. */
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  /** Name of the company or organization where the contact works. Used for B2B testimonial displays and logo integration. */
  company_name?: InputMaybe<Scalars['String']['input']>;
  /** URL to the contact's company website. May be used for automated logo fetching or company verification. */
  company_website?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when this contact record was first created. Set automatically on insert, never modified thereafter. */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary identifier for the contact. Unique within each organization. Used for deduplication when same person submits multiple testimonials across different forms. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Boolean flag indicating if email ownership has been confirmed via verification link. Verified contacts may receive preferential display treatment. */
  email_verified?: InputMaybe<Scalars['Boolean']['input']>;
  /** Timestamp of first interaction with the organization. Set on creation and never modified. Used for cohort analysis and engagement metrics. */
  first_seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Professional title or role (e.g., "VP of Engineering", "Founder"). Adds credibility context to testimonials, especially for B2B use cases. */
  job_title?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp of most recent activity. Updated on each new submission or interaction. Used for identifying active vs dormant contacts. */
  last_seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** URL to LinkedIn profile. Provides professional verification and enables social proof through platform recognition. */
  linkedin_url?: InputMaybe<Scalars['String']['input']>;
  /** Display name of the contact. Collected from form submission contact_info step or enriched from external data sources like LinkedIn. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Foreign key to organizations table. Establishes tenant boundary - all contacts are scoped to a single organization for multi-tenancy isolation. */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Origin of this contact record: form_submission (created during testimonial submission), import (bulk CSV/API import), manual (admin created). Used for analytics and attribution. */
  source?: InputMaybe<Scalars['String']['input']>;
  /** Foreign key to forms table. References the first form through which this contact was acquired. Preserved even if form is later deleted (set null). */
  source_form_id?: InputMaybe<Scalars['String']['input']>;
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Scalars['Int']['input']>;
  /** URL to Twitter/X profile. Used for social sharing integration and additional verification of contact identity. */
  twitter_url?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp of last modification to this record. Automatically updated by database trigger on any column change. */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Contacts_Sum_Fields = {
  __typename?: 'contacts_sum_fields';
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "contacts" */
export type Contacts_Sum_Order_By = {
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Order_By>;
};

/** update columns of table "contacts" */
export enum Contacts_Update_Column {
  /** column name */
  AvatarUrl = 'avatar_url',
  /** column name */
  CompanyName = 'company_name',
  /** column name */
  CompanyWebsite = 'company_website',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  EmailVerified = 'email_verified',
  /** column name */
  FirstSeenAt = 'first_seen_at',
  /** column name */
  Id = 'id',
  /** column name */
  JobTitle = 'job_title',
  /** column name */
  LastSeenAt = 'last_seen_at',
  /** column name */
  LinkedinUrl = 'linkedin_url',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Source = 'source',
  /** column name */
  SourceFormId = 'source_form_id',
  /** column name */
  SubmissionCount = 'submission_count',
  /** column name */
  TwitterUrl = 'twitter_url',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Contacts_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Contacts_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Contacts_Set_Input>;
  /** filter the rows which have to be updated */
  where: Contacts_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Contacts_Var_Pop_Fields = {
  __typename?: 'contacts_var_pop_fields';
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "contacts" */
export type Contacts_Var_Pop_Order_By = {
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Contacts_Var_Samp_Fields = {
  __typename?: 'contacts_var_samp_fields';
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "contacts" */
export type Contacts_Var_Samp_Order_By = {
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Contacts_Variance_Fields = {
  __typename?: 'contacts_variance_fields';
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "contacts" */
export type Contacts_Variance_Order_By = {
  /** Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers. */
  submission_count?: InputMaybe<Order_By>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** Raw form submission responses - internal data for AI assembly, not displayed on widgets */
export type Form_Question_Responses = {
  __typename?: 'form_question_responses';
  /** Boolean responses: consent checkbox (true = agreed) */
  answer_boolean?: Maybe<Scalars['Boolean']['output']>;
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: Maybe<Scalars['Int']['output']>;
  /** JSON responses: multiple choice selected values array ["opt_a", "opt_c"] */
  answer_json?: Maybe<Scalars['jsonb']['output']>;
  /** Text responses: short text, long text, email, single choice value, dropdown value */
  answer_text?: Maybe<Scalars['String']['output']>;
  /** URL responses: uploaded file URL, or validated URL input */
  answer_url?: Maybe<Scalars['String']['output']>;
  /** When customer submitted this specific response */
  answered_at: Scalars['timestamptz']['output'];
  /** Record creation timestamp. Usually same as answered_at */
  created_at: Scalars['timestamptz']['output'];
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['output'];
  /** An object relationship */
  organization: Organizations;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id: Scalars['String']['output'];
  /** An object relationship */
  question: Form_Questions;
  /** FK to form_questions - which question this responds to */
  question_id: Scalars['String']['output'];
  /** An object relationship */
  submission: Form_Submissions;
  /** FK to form_submissions - parent submission this response belongs to */
  submission_id: Scalars['String']['output'];
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at: Scalars['timestamptz']['output'];
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  updater?: Maybe<Users>;
};


/** Raw form submission responses - internal data for AI assembly, not displayed on widgets */
export type Form_Question_ResponsesAnswer_JsonArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "form_question_responses" */
export type Form_Question_Responses_Aggregate = {
  __typename?: 'form_question_responses_aggregate';
  aggregate?: Maybe<Form_Question_Responses_Aggregate_Fields>;
  nodes: Array<Form_Question_Responses>;
};

export type Form_Question_Responses_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Form_Question_Responses_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Form_Question_Responses_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Form_Question_Responses_Aggregate_Bool_Exp_Count>;
};

export type Form_Question_Responses_Aggregate_Bool_Exp_Bool_And = {
  arguments: Form_Question_Responses_Select_Column_Form_Question_Responses_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Form_Question_Responses_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Form_Question_Responses_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Form_Question_Responses_Select_Column_Form_Question_Responses_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Form_Question_Responses_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Form_Question_Responses_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Form_Question_Responses_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Form_Question_Responses_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "form_question_responses" */
export type Form_Question_Responses_Aggregate_Fields = {
  __typename?: 'form_question_responses_aggregate_fields';
  avg?: Maybe<Form_Question_Responses_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Form_Question_Responses_Max_Fields>;
  min?: Maybe<Form_Question_Responses_Min_Fields>;
  stddev?: Maybe<Form_Question_Responses_Stddev_Fields>;
  stddev_pop?: Maybe<Form_Question_Responses_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Form_Question_Responses_Stddev_Samp_Fields>;
  sum?: Maybe<Form_Question_Responses_Sum_Fields>;
  var_pop?: Maybe<Form_Question_Responses_Var_Pop_Fields>;
  var_samp?: Maybe<Form_Question_Responses_Var_Samp_Fields>;
  variance?: Maybe<Form_Question_Responses_Variance_Fields>;
};


/** aggregate fields of "form_question_responses" */
export type Form_Question_Responses_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Form_Question_Responses_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "form_question_responses" */
export type Form_Question_Responses_Aggregate_Order_By = {
  avg?: InputMaybe<Form_Question_Responses_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Form_Question_Responses_Max_Order_By>;
  min?: InputMaybe<Form_Question_Responses_Min_Order_By>;
  stddev?: InputMaybe<Form_Question_Responses_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Form_Question_Responses_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Form_Question_Responses_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Form_Question_Responses_Sum_Order_By>;
  var_pop?: InputMaybe<Form_Question_Responses_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Form_Question_Responses_Var_Samp_Order_By>;
  variance?: InputMaybe<Form_Question_Responses_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Form_Question_Responses_Append_Input = {
  /** JSON responses: multiple choice selected values array ["opt_a", "opt_c"] */
  answer_json?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "form_question_responses" */
export type Form_Question_Responses_Arr_Rel_Insert_Input = {
  data: Array<Form_Question_Responses_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Form_Question_Responses_On_Conflict>;
};

/** aggregate avg on columns */
export type Form_Question_Responses_Avg_Fields = {
  __typename?: 'form_question_responses_avg_fields';
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "form_question_responses" */
export type Form_Question_Responses_Avg_Order_By = {
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "form_question_responses". All fields are combined with a logical 'AND'. */
export type Form_Question_Responses_Bool_Exp = {
  _and?: InputMaybe<Array<Form_Question_Responses_Bool_Exp>>;
  _not?: InputMaybe<Form_Question_Responses_Bool_Exp>;
  _or?: InputMaybe<Array<Form_Question_Responses_Bool_Exp>>;
  answer_boolean?: InputMaybe<Boolean_Comparison_Exp>;
  answer_integer?: InputMaybe<Int_Comparison_Exp>;
  answer_json?: InputMaybe<Jsonb_Comparison_Exp>;
  answer_text?: InputMaybe<String_Comparison_Exp>;
  answer_url?: InputMaybe<String_Comparison_Exp>;
  answered_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  question?: InputMaybe<Form_Questions_Bool_Exp>;
  question_id?: InputMaybe<String_Comparison_Exp>;
  submission?: InputMaybe<Form_Submissions_Bool_Exp>;
  submission_id?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_by?: InputMaybe<String_Comparison_Exp>;
  updater?: InputMaybe<Users_Bool_Exp>;
};

/** unique or primary key constraints on table "form_question_responses" */
export enum Form_Question_Responses_Constraint {
  /** unique or primary key constraint on columns "id" */
  FormQuestionResponsesPkey = 'form_question_responses_pkey',
  /** unique or primary key constraint on columns "question_id", "submission_id" */
  FormQuestionResponsesUnique = 'form_question_responses_unique'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Form_Question_Responses_Delete_At_Path_Input = {
  /** JSON responses: multiple choice selected values array ["opt_a", "opt_c"] */
  answer_json?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Form_Question_Responses_Delete_Elem_Input = {
  /** JSON responses: multiple choice selected values array ["opt_a", "opt_c"] */
  answer_json?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Form_Question_Responses_Delete_Key_Input = {
  /** JSON responses: multiple choice selected values array ["opt_a", "opt_c"] */
  answer_json?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "form_question_responses" */
export type Form_Question_Responses_Inc_Input = {
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "form_question_responses" */
export type Form_Question_Responses_Insert_Input = {
  /** Boolean responses: consent checkbox (true = agreed) */
  answer_boolean?: InputMaybe<Scalars['Boolean']['input']>;
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Scalars['Int']['input']>;
  /** JSON responses: multiple choice selected values array ["opt_a", "opt_c"] */
  answer_json?: InputMaybe<Scalars['jsonb']['input']>;
  /** Text responses: short text, long text, email, single choice value, dropdown value */
  answer_text?: InputMaybe<Scalars['String']['input']>;
  /** URL responses: uploaded file URL, or validated URL input */
  answer_url?: InputMaybe<Scalars['String']['input']>;
  /** When customer submitted this specific response */
  answered_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Record creation timestamp. Usually same as answered_at */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  question?: InputMaybe<Form_Questions_Obj_Rel_Insert_Input>;
  /** FK to form_questions - which question this responds to */
  question_id?: InputMaybe<Scalars['String']['input']>;
  submission?: InputMaybe<Form_Submissions_Obj_Rel_Insert_Input>;
  /** FK to form_submissions - parent submission this response belongs to */
  submission_id?: InputMaybe<Scalars['String']['input']>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
  updater?: InputMaybe<Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Form_Question_Responses_Max_Fields = {
  __typename?: 'form_question_responses_max_fields';
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: Maybe<Scalars['Int']['output']>;
  /** Text responses: short text, long text, email, single choice value, dropdown value */
  answer_text?: Maybe<Scalars['String']['output']>;
  /** URL responses: uploaded file URL, or validated URL input */
  answer_url?: Maybe<Scalars['String']['output']>;
  /** When customer submitted this specific response */
  answered_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Record creation timestamp. Usually same as answered_at */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** FK to form_questions - which question this responds to */
  question_id?: Maybe<Scalars['String']['output']>;
  /** FK to form_submissions - parent submission this response belongs to */
  submission_id?: Maybe<Scalars['String']['output']>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "form_question_responses" */
export type Form_Question_Responses_Max_Order_By = {
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Order_By>;
  /** Text responses: short text, long text, email, single choice value, dropdown value */
  answer_text?: InputMaybe<Order_By>;
  /** URL responses: uploaded file URL, or validated URL input */
  answer_url?: InputMaybe<Order_By>;
  /** When customer submitted this specific response */
  answered_at?: InputMaybe<Order_By>;
  /** Record creation timestamp. Usually same as answered_at */
  created_at?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Order_By>;
  /** FK to form_questions - which question this responds to */
  question_id?: InputMaybe<Order_By>;
  /** FK to form_submissions - parent submission this response belongs to */
  submission_id?: InputMaybe<Order_By>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Form_Question_Responses_Min_Fields = {
  __typename?: 'form_question_responses_min_fields';
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: Maybe<Scalars['Int']['output']>;
  /** Text responses: short text, long text, email, single choice value, dropdown value */
  answer_text?: Maybe<Scalars['String']['output']>;
  /** URL responses: uploaded file URL, or validated URL input */
  answer_url?: Maybe<Scalars['String']['output']>;
  /** When customer submitted this specific response */
  answered_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Record creation timestamp. Usually same as answered_at */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** FK to form_questions - which question this responds to */
  question_id?: Maybe<Scalars['String']['output']>;
  /** FK to form_submissions - parent submission this response belongs to */
  submission_id?: Maybe<Scalars['String']['output']>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "form_question_responses" */
export type Form_Question_Responses_Min_Order_By = {
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Order_By>;
  /** Text responses: short text, long text, email, single choice value, dropdown value */
  answer_text?: InputMaybe<Order_By>;
  /** URL responses: uploaded file URL, or validated URL input */
  answer_url?: InputMaybe<Order_By>;
  /** When customer submitted this specific response */
  answered_at?: InputMaybe<Order_By>;
  /** Record creation timestamp. Usually same as answered_at */
  created_at?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Order_By>;
  /** FK to form_questions - which question this responds to */
  question_id?: InputMaybe<Order_By>;
  /** FK to form_submissions - parent submission this response belongs to */
  submission_id?: InputMaybe<Order_By>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "form_question_responses" */
export type Form_Question_Responses_Mutation_Response = {
  __typename?: 'form_question_responses_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Form_Question_Responses>;
};

/** on_conflict condition type for table "form_question_responses" */
export type Form_Question_Responses_On_Conflict = {
  constraint: Form_Question_Responses_Constraint;
  update_columns?: Array<Form_Question_Responses_Update_Column>;
  where?: InputMaybe<Form_Question_Responses_Bool_Exp>;
};

/** Ordering options when selecting data from "form_question_responses". */
export type Form_Question_Responses_Order_By = {
  answer_boolean?: InputMaybe<Order_By>;
  answer_integer?: InputMaybe<Order_By>;
  answer_json?: InputMaybe<Order_By>;
  answer_text?: InputMaybe<Order_By>;
  answer_url?: InputMaybe<Order_By>;
  answered_at?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  question?: InputMaybe<Form_Questions_Order_By>;
  question_id?: InputMaybe<Order_By>;
  submission?: InputMaybe<Form_Submissions_Order_By>;
  submission_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updater?: InputMaybe<Users_Order_By>;
};

/** primary key columns input for table: form_question_responses */
export type Form_Question_Responses_Pk_Columns_Input = {
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Form_Question_Responses_Prepend_Input = {
  /** JSON responses: multiple choice selected values array ["opt_a", "opt_c"] */
  answer_json?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "form_question_responses" */
export enum Form_Question_Responses_Select_Column {
  /** column name */
  AnswerBoolean = 'answer_boolean',
  /** column name */
  AnswerInteger = 'answer_integer',
  /** column name */
  AnswerJson = 'answer_json',
  /** column name */
  AnswerText = 'answer_text',
  /** column name */
  AnswerUrl = 'answer_url',
  /** column name */
  AnsweredAt = 'answered_at',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  QuestionId = 'question_id',
  /** column name */
  SubmissionId = 'submission_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

/** select "form_question_responses_aggregate_bool_exp_bool_and_arguments_columns" columns of table "form_question_responses" */
export enum Form_Question_Responses_Select_Column_Form_Question_Responses_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  AnswerBoolean = 'answer_boolean'
}

/** select "form_question_responses_aggregate_bool_exp_bool_or_arguments_columns" columns of table "form_question_responses" */
export enum Form_Question_Responses_Select_Column_Form_Question_Responses_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  AnswerBoolean = 'answer_boolean'
}

/** input type for updating data in table "form_question_responses" */
export type Form_Question_Responses_Set_Input = {
  /** Boolean responses: consent checkbox (true = agreed) */
  answer_boolean?: InputMaybe<Scalars['Boolean']['input']>;
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Scalars['Int']['input']>;
  /** JSON responses: multiple choice selected values array ["opt_a", "opt_c"] */
  answer_json?: InputMaybe<Scalars['jsonb']['input']>;
  /** Text responses: short text, long text, email, single choice value, dropdown value */
  answer_text?: InputMaybe<Scalars['String']['input']>;
  /** URL responses: uploaded file URL, or validated URL input */
  answer_url?: InputMaybe<Scalars['String']['input']>;
  /** When customer submitted this specific response */
  answered_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Record creation timestamp. Usually same as answered_at */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to form_questions - which question this responds to */
  question_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to form_submissions - parent submission this response belongs to */
  submission_id?: InputMaybe<Scalars['String']['input']>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Form_Question_Responses_Stddev_Fields = {
  __typename?: 'form_question_responses_stddev_fields';
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "form_question_responses" */
export type Form_Question_Responses_Stddev_Order_By = {
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Form_Question_Responses_Stddev_Pop_Fields = {
  __typename?: 'form_question_responses_stddev_pop_fields';
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "form_question_responses" */
export type Form_Question_Responses_Stddev_Pop_Order_By = {
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Form_Question_Responses_Stddev_Samp_Fields = {
  __typename?: 'form_question_responses_stddev_samp_fields';
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "form_question_responses" */
export type Form_Question_Responses_Stddev_Samp_Order_By = {
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "form_question_responses" */
export type Form_Question_Responses_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Form_Question_Responses_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Form_Question_Responses_Stream_Cursor_Value_Input = {
  /** Boolean responses: consent checkbox (true = agreed) */
  answer_boolean?: InputMaybe<Scalars['Boolean']['input']>;
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Scalars['Int']['input']>;
  /** JSON responses: multiple choice selected values array ["opt_a", "opt_c"] */
  answer_json?: InputMaybe<Scalars['jsonb']['input']>;
  /** Text responses: short text, long text, email, single choice value, dropdown value */
  answer_text?: InputMaybe<Scalars['String']['input']>;
  /** URL responses: uploaded file URL, or validated URL input */
  answer_url?: InputMaybe<Scalars['String']['input']>;
  /** When customer submitted this specific response */
  answered_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Record creation timestamp. Usually same as answered_at */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to form_questions - which question this responds to */
  question_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to form_submissions - parent submission this response belongs to */
  submission_id?: InputMaybe<Scalars['String']['input']>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Form_Question_Responses_Sum_Fields = {
  __typename?: 'form_question_responses_sum_fields';
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "form_question_responses" */
export type Form_Question_Responses_Sum_Order_By = {
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Order_By>;
};

/** update columns of table "form_question_responses" */
export enum Form_Question_Responses_Update_Column {
  /** column name */
  AnswerBoolean = 'answer_boolean',
  /** column name */
  AnswerInteger = 'answer_integer',
  /** column name */
  AnswerJson = 'answer_json',
  /** column name */
  AnswerText = 'answer_text',
  /** column name */
  AnswerUrl = 'answer_url',
  /** column name */
  AnsweredAt = 'answered_at',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  QuestionId = 'question_id',
  /** column name */
  SubmissionId = 'submission_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

export type Form_Question_Responses_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Form_Question_Responses_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Form_Question_Responses_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Form_Question_Responses_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Form_Question_Responses_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Form_Question_Responses_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Form_Question_Responses_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Form_Question_Responses_Set_Input>;
  /** filter the rows which have to be updated */
  where: Form_Question_Responses_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Form_Question_Responses_Var_Pop_Fields = {
  __typename?: 'form_question_responses_var_pop_fields';
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "form_question_responses" */
export type Form_Question_Responses_Var_Pop_Order_By = {
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Form_Question_Responses_Var_Samp_Fields = {
  __typename?: 'form_question_responses_var_samp_fields';
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "form_question_responses" */
export type Form_Question_Responses_Var_Samp_Order_By = {
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Form_Question_Responses_Variance_Fields = {
  __typename?: 'form_question_responses_variance_fields';
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "form_question_responses" */
export type Form_Question_Responses_Variance_Order_By = {
  /** Numeric responses: star rating (1-5), NPS score (0-10), scale value */
  answer_integer?: InputMaybe<Order_By>;
};

/** Form questions with typed validation - explicit columns, not JSONB */
export type Form_Questions = {
  __typename?: 'form_questions';
  /** Array of allowed MIME types for file uploads. Post-MVP */
  allowed_file_types?: Maybe<Array<Scalars['String']['output']>>;
  /** Timestamp when question was created. Immutable after insert */
  created_at: Scalars['timestamptz']['output'];
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order: Scalars['smallint']['output'];
  /** An object relationship */
  form: Forms;
  /** FK to forms - parent form this question belongs to */
  form_id: Scalars['String']['output'];
  /** Tooltip help text explaining what kind of answer is expected */
  help_text?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['output'];
  /** Soft delete flag. False = question hidden from form but answers preserved */
  is_active: Scalars['Boolean']['output'];
  /** Whether answer is mandatory. Validation enforced on submission */
  is_required: Scalars['Boolean']['output'];
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: Maybe<Scalars['Int']['output']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: Maybe<Scalars['Int']['output']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: Maybe<Scalars['Int']['output']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: Maybe<Scalars['Int']['output']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: Maybe<Scalars['Int']['output']>;
  /** An array relationship */
  options: Array<Question_Options>;
  /** An aggregate relationship */
  options_aggregate: Question_Options_Aggregate;
  /** An object relationship */
  organization: Organizations;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id: Scalars['String']['output'];
  /** Input placeholder hint (e.g., "Describe your challenge...") */
  placeholder?: Maybe<Scalars['String']['output']>;
  /** Semantic identifier unique per form (problem, solution, result, name, email). Used for answer lookup */
  question_key: Scalars['String']['output'];
  /** Display text shown to customer (e.g., "What problem were you trying to solve?") */
  question_text: Scalars['String']['output'];
  /** An object relationship */
  question_type: Question_Types;
  /** FK to question_types - determines input component and applicable validation rules */
  question_type_id: Scalars['String']['output'];
  /** An array relationship */
  responses: Array<Form_Question_Responses>;
  /** An aggregate relationship */
  responses_aggregate: Form_Question_Responses_Aggregate;
  /** Custom label for maximum value on Linear Scale (e.g., "High", "Strongly agree"). NULL uses default "High" */
  scale_max_label?: Maybe<Scalars['String']['output']>;
  /** Custom label for minimum value on Linear Scale (e.g., "Low", "Strongly disagree"). NULL uses default "Low" */
  scale_min_label?: Maybe<Scalars['String']['output']>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at: Scalars['timestamptz']['output'];
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  updater?: Maybe<Users>;
  /** Regex pattern for text validation. Used for email, URL, or custom format validation */
  validation_pattern?: Maybe<Scalars['String']['output']>;
};


/** Form questions with typed validation - explicit columns, not JSONB */
export type Form_QuestionsOptionsArgs = {
  distinct_on?: InputMaybe<Array<Question_Options_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Question_Options_Order_By>>;
  where?: InputMaybe<Question_Options_Bool_Exp>;
};


/** Form questions with typed validation - explicit columns, not JSONB */
export type Form_QuestionsOptions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Question_Options_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Question_Options_Order_By>>;
  where?: InputMaybe<Question_Options_Bool_Exp>;
};


/** Form questions with typed validation - explicit columns, not JSONB */
export type Form_QuestionsResponsesArgs = {
  distinct_on?: InputMaybe<Array<Form_Question_Responses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Question_Responses_Order_By>>;
  where?: InputMaybe<Form_Question_Responses_Bool_Exp>;
};


/** Form questions with typed validation - explicit columns, not JSONB */
export type Form_QuestionsResponses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Question_Responses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Question_Responses_Order_By>>;
  where?: InputMaybe<Form_Question_Responses_Bool_Exp>;
};

/** aggregated selection of "form_questions" */
export type Form_Questions_Aggregate = {
  __typename?: 'form_questions_aggregate';
  aggregate?: Maybe<Form_Questions_Aggregate_Fields>;
  nodes: Array<Form_Questions>;
};

export type Form_Questions_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Form_Questions_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Form_Questions_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Form_Questions_Aggregate_Bool_Exp_Count>;
};

export type Form_Questions_Aggregate_Bool_Exp_Bool_And = {
  arguments: Form_Questions_Select_Column_Form_Questions_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Form_Questions_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Form_Questions_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Form_Questions_Select_Column_Form_Questions_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Form_Questions_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Form_Questions_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Form_Questions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Form_Questions_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "form_questions" */
export type Form_Questions_Aggregate_Fields = {
  __typename?: 'form_questions_aggregate_fields';
  avg?: Maybe<Form_Questions_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Form_Questions_Max_Fields>;
  min?: Maybe<Form_Questions_Min_Fields>;
  stddev?: Maybe<Form_Questions_Stddev_Fields>;
  stddev_pop?: Maybe<Form_Questions_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Form_Questions_Stddev_Samp_Fields>;
  sum?: Maybe<Form_Questions_Sum_Fields>;
  var_pop?: Maybe<Form_Questions_Var_Pop_Fields>;
  var_samp?: Maybe<Form_Questions_Var_Samp_Fields>;
  variance?: Maybe<Form_Questions_Variance_Fields>;
};


/** aggregate fields of "form_questions" */
export type Form_Questions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Form_Questions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "form_questions" */
export type Form_Questions_Aggregate_Order_By = {
  avg?: InputMaybe<Form_Questions_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Form_Questions_Max_Order_By>;
  min?: InputMaybe<Form_Questions_Min_Order_By>;
  stddev?: InputMaybe<Form_Questions_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Form_Questions_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Form_Questions_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Form_Questions_Sum_Order_By>;
  var_pop?: InputMaybe<Form_Questions_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Form_Questions_Var_Samp_Order_By>;
  variance?: InputMaybe<Form_Questions_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "form_questions" */
export type Form_Questions_Arr_Rel_Insert_Input = {
  data: Array<Form_Questions_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Form_Questions_On_Conflict>;
};

/** aggregate avg on columns */
export type Form_Questions_Avg_Fields = {
  __typename?: 'form_questions_avg_fields';
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: Maybe<Scalars['Float']['output']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: Maybe<Scalars['Float']['output']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: Maybe<Scalars['Float']['output']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: Maybe<Scalars['Float']['output']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "form_questions" */
export type Form_Questions_Avg_Order_By = {
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Order_By>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Order_By>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Order_By>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Order_By>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "form_questions". All fields are combined with a logical 'AND'. */
export type Form_Questions_Bool_Exp = {
  _and?: InputMaybe<Array<Form_Questions_Bool_Exp>>;
  _not?: InputMaybe<Form_Questions_Bool_Exp>;
  _or?: InputMaybe<Array<Form_Questions_Bool_Exp>>;
  allowed_file_types?: InputMaybe<String_Array_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  display_order?: InputMaybe<Smallint_Comparison_Exp>;
  form?: InputMaybe<Forms_Bool_Exp>;
  form_id?: InputMaybe<String_Comparison_Exp>;
  help_text?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_required?: InputMaybe<Boolean_Comparison_Exp>;
  max_file_size_kb?: InputMaybe<Int_Comparison_Exp>;
  max_length?: InputMaybe<Int_Comparison_Exp>;
  max_value?: InputMaybe<Int_Comparison_Exp>;
  min_length?: InputMaybe<Int_Comparison_Exp>;
  min_value?: InputMaybe<Int_Comparison_Exp>;
  options?: InputMaybe<Question_Options_Bool_Exp>;
  options_aggregate?: InputMaybe<Question_Options_Aggregate_Bool_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  placeholder?: InputMaybe<String_Comparison_Exp>;
  question_key?: InputMaybe<String_Comparison_Exp>;
  question_text?: InputMaybe<String_Comparison_Exp>;
  question_type?: InputMaybe<Question_Types_Bool_Exp>;
  question_type_id?: InputMaybe<String_Comparison_Exp>;
  responses?: InputMaybe<Form_Question_Responses_Bool_Exp>;
  responses_aggregate?: InputMaybe<Form_Question_Responses_Aggregate_Bool_Exp>;
  scale_max_label?: InputMaybe<String_Comparison_Exp>;
  scale_min_label?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_by?: InputMaybe<String_Comparison_Exp>;
  updater?: InputMaybe<Users_Bool_Exp>;
  validation_pattern?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "form_questions" */
export enum Form_Questions_Constraint {
  /** unique or primary key constraint on columns "form_id", "question_key" */
  FormQuestionsKeyPerFormUnique = 'form_questions_key_per_form_unique',
  /** unique or primary key constraint on columns "form_id", "display_order" */
  FormQuestionsOrderPerFormUnique = 'form_questions_order_per_form_unique',
  /** unique or primary key constraint on columns "id" */
  FormQuestionsPkey = 'form_questions_pkey'
}

/** input type for incrementing numeric columns in table "form_questions" */
export type Form_Questions_Inc_Input = {
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "form_questions" */
export type Form_Questions_Insert_Input = {
  /** Array of allowed MIME types for file uploads. Post-MVP */
  allowed_file_types?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Timestamp when question was created. Immutable after insert */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  form?: InputMaybe<Forms_Obj_Rel_Insert_Input>;
  /** FK to forms - parent form this question belongs to */
  form_id?: InputMaybe<Scalars['String']['input']>;
  /** Tooltip help text explaining what kind of answer is expected */
  help_text?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = question hidden from form but answers preserved */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether answer is mandatory. Validation enforced on submission */
  is_required?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Scalars['Int']['input']>;
  options?: InputMaybe<Question_Options_Arr_Rel_Insert_Input>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Input placeholder hint (e.g., "Describe your challenge...") */
  placeholder?: InputMaybe<Scalars['String']['input']>;
  /** Semantic identifier unique per form (problem, solution, result, name, email). Used for answer lookup */
  question_key?: InputMaybe<Scalars['String']['input']>;
  /** Display text shown to customer (e.g., "What problem were you trying to solve?") */
  question_text?: InputMaybe<Scalars['String']['input']>;
  question_type?: InputMaybe<Question_Types_Obj_Rel_Insert_Input>;
  /** FK to question_types - determines input component and applicable validation rules */
  question_type_id?: InputMaybe<Scalars['String']['input']>;
  responses?: InputMaybe<Form_Question_Responses_Arr_Rel_Insert_Input>;
  /** Custom label for maximum value on Linear Scale (e.g., "High", "Strongly agree"). NULL uses default "High" */
  scale_max_label?: InputMaybe<Scalars['String']['input']>;
  /** Custom label for minimum value on Linear Scale (e.g., "Low", "Strongly disagree"). NULL uses default "Low" */
  scale_min_label?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
  updater?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** Regex pattern for text validation. Used for email, URL, or custom format validation */
  validation_pattern?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Form_Questions_Max_Fields = {
  __typename?: 'form_questions_max_fields';
  /** Array of allowed MIME types for file uploads. Post-MVP */
  allowed_file_types?: Maybe<Array<Scalars['String']['output']>>;
  /** Timestamp when question was created. Immutable after insert */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: Maybe<Scalars['smallint']['output']>;
  /** FK to forms - parent form this question belongs to */
  form_id?: Maybe<Scalars['String']['output']>;
  /** Tooltip help text explaining what kind of answer is expected */
  help_text?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: Maybe<Scalars['Int']['output']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: Maybe<Scalars['Int']['output']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: Maybe<Scalars['Int']['output']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: Maybe<Scalars['Int']['output']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: Maybe<Scalars['Int']['output']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Input placeholder hint (e.g., "Describe your challenge...") */
  placeholder?: Maybe<Scalars['String']['output']>;
  /** Semantic identifier unique per form (problem, solution, result, name, email). Used for answer lookup */
  question_key?: Maybe<Scalars['String']['output']>;
  /** Display text shown to customer (e.g., "What problem were you trying to solve?") */
  question_text?: Maybe<Scalars['String']['output']>;
  /** FK to question_types - determines input component and applicable validation rules */
  question_type_id?: Maybe<Scalars['String']['output']>;
  /** Custom label for maximum value on Linear Scale (e.g., "High", "Strongly agree"). NULL uses default "High" */
  scale_max_label?: Maybe<Scalars['String']['output']>;
  /** Custom label for minimum value on Linear Scale (e.g., "Low", "Strongly disagree"). NULL uses default "Low" */
  scale_min_label?: Maybe<Scalars['String']['output']>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
  /** Regex pattern for text validation. Used for email, URL, or custom format validation */
  validation_pattern?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "form_questions" */
export type Form_Questions_Max_Order_By = {
  /** Array of allowed MIME types for file uploads. Post-MVP */
  allowed_file_types?: InputMaybe<Order_By>;
  /** Timestamp when question was created. Immutable after insert */
  created_at?: InputMaybe<Order_By>;
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** FK to forms - parent form this question belongs to */
  form_id?: InputMaybe<Order_By>;
  /** Tooltip help text explaining what kind of answer is expected */
  help_text?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Order_By>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Order_By>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Order_By>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Order_By>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Order_By>;
  /** Input placeholder hint (e.g., "Describe your challenge...") */
  placeholder?: InputMaybe<Order_By>;
  /** Semantic identifier unique per form (problem, solution, result, name, email). Used for answer lookup */
  question_key?: InputMaybe<Order_By>;
  /** Display text shown to customer (e.g., "What problem were you trying to solve?") */
  question_text?: InputMaybe<Order_By>;
  /** FK to question_types - determines input component and applicable validation rules */
  question_type_id?: InputMaybe<Order_By>;
  /** Custom label for maximum value on Linear Scale (e.g., "High", "Strongly agree"). NULL uses default "High" */
  scale_max_label?: InputMaybe<Order_By>;
  /** Custom label for minimum value on Linear Scale (e.g., "Low", "Strongly disagree"). NULL uses default "Low" */
  scale_min_label?: InputMaybe<Order_By>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
  /** Regex pattern for text validation. Used for email, URL, or custom format validation */
  validation_pattern?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Form_Questions_Min_Fields = {
  __typename?: 'form_questions_min_fields';
  /** Array of allowed MIME types for file uploads. Post-MVP */
  allowed_file_types?: Maybe<Array<Scalars['String']['output']>>;
  /** Timestamp when question was created. Immutable after insert */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: Maybe<Scalars['smallint']['output']>;
  /** FK to forms - parent form this question belongs to */
  form_id?: Maybe<Scalars['String']['output']>;
  /** Tooltip help text explaining what kind of answer is expected */
  help_text?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: Maybe<Scalars['Int']['output']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: Maybe<Scalars['Int']['output']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: Maybe<Scalars['Int']['output']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: Maybe<Scalars['Int']['output']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: Maybe<Scalars['Int']['output']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Input placeholder hint (e.g., "Describe your challenge...") */
  placeholder?: Maybe<Scalars['String']['output']>;
  /** Semantic identifier unique per form (problem, solution, result, name, email). Used for answer lookup */
  question_key?: Maybe<Scalars['String']['output']>;
  /** Display text shown to customer (e.g., "What problem were you trying to solve?") */
  question_text?: Maybe<Scalars['String']['output']>;
  /** FK to question_types - determines input component and applicable validation rules */
  question_type_id?: Maybe<Scalars['String']['output']>;
  /** Custom label for maximum value on Linear Scale (e.g., "High", "Strongly agree"). NULL uses default "High" */
  scale_max_label?: Maybe<Scalars['String']['output']>;
  /** Custom label for minimum value on Linear Scale (e.g., "Low", "Strongly disagree"). NULL uses default "Low" */
  scale_min_label?: Maybe<Scalars['String']['output']>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
  /** Regex pattern for text validation. Used for email, URL, or custom format validation */
  validation_pattern?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "form_questions" */
export type Form_Questions_Min_Order_By = {
  /** Array of allowed MIME types for file uploads. Post-MVP */
  allowed_file_types?: InputMaybe<Order_By>;
  /** Timestamp when question was created. Immutable after insert */
  created_at?: InputMaybe<Order_By>;
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** FK to forms - parent form this question belongs to */
  form_id?: InputMaybe<Order_By>;
  /** Tooltip help text explaining what kind of answer is expected */
  help_text?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Order_By>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Order_By>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Order_By>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Order_By>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Order_By>;
  /** Input placeholder hint (e.g., "Describe your challenge...") */
  placeholder?: InputMaybe<Order_By>;
  /** Semantic identifier unique per form (problem, solution, result, name, email). Used for answer lookup */
  question_key?: InputMaybe<Order_By>;
  /** Display text shown to customer (e.g., "What problem were you trying to solve?") */
  question_text?: InputMaybe<Order_By>;
  /** FK to question_types - determines input component and applicable validation rules */
  question_type_id?: InputMaybe<Order_By>;
  /** Custom label for maximum value on Linear Scale (e.g., "High", "Strongly agree"). NULL uses default "High" */
  scale_max_label?: InputMaybe<Order_By>;
  /** Custom label for minimum value on Linear Scale (e.g., "Low", "Strongly disagree"). NULL uses default "Low" */
  scale_min_label?: InputMaybe<Order_By>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
  /** Regex pattern for text validation. Used for email, URL, or custom format validation */
  validation_pattern?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "form_questions" */
export type Form_Questions_Mutation_Response = {
  __typename?: 'form_questions_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Form_Questions>;
};

/** input type for inserting object relation for remote table "form_questions" */
export type Form_Questions_Obj_Rel_Insert_Input = {
  data: Form_Questions_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Form_Questions_On_Conflict>;
};

/** on_conflict condition type for table "form_questions" */
export type Form_Questions_On_Conflict = {
  constraint: Form_Questions_Constraint;
  update_columns?: Array<Form_Questions_Update_Column>;
  where?: InputMaybe<Form_Questions_Bool_Exp>;
};

/** Ordering options when selecting data from "form_questions". */
export type Form_Questions_Order_By = {
  allowed_file_types?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  display_order?: InputMaybe<Order_By>;
  form?: InputMaybe<Forms_Order_By>;
  form_id?: InputMaybe<Order_By>;
  help_text?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_required?: InputMaybe<Order_By>;
  max_file_size_kb?: InputMaybe<Order_By>;
  max_length?: InputMaybe<Order_By>;
  max_value?: InputMaybe<Order_By>;
  min_length?: InputMaybe<Order_By>;
  min_value?: InputMaybe<Order_By>;
  options_aggregate?: InputMaybe<Question_Options_Aggregate_Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  placeholder?: InputMaybe<Order_By>;
  question_key?: InputMaybe<Order_By>;
  question_text?: InputMaybe<Order_By>;
  question_type?: InputMaybe<Question_Types_Order_By>;
  question_type_id?: InputMaybe<Order_By>;
  responses_aggregate?: InputMaybe<Form_Question_Responses_Aggregate_Order_By>;
  scale_max_label?: InputMaybe<Order_By>;
  scale_min_label?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updater?: InputMaybe<Users_Order_By>;
  validation_pattern?: InputMaybe<Order_By>;
};

/** primary key columns input for table: form_questions */
export type Form_Questions_Pk_Columns_Input = {
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['input'];
};

/** select columns of table "form_questions" */
export enum Form_Questions_Select_Column {
  /** column name */
  AllowedFileTypes = 'allowed_file_types',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DisplayOrder = 'display_order',
  /** column name */
  FormId = 'form_id',
  /** column name */
  HelpText = 'help_text',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsRequired = 'is_required',
  /** column name */
  MaxFileSizeKb = 'max_file_size_kb',
  /** column name */
  MaxLength = 'max_length',
  /** column name */
  MaxValue = 'max_value',
  /** column name */
  MinLength = 'min_length',
  /** column name */
  MinValue = 'min_value',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Placeholder = 'placeholder',
  /** column name */
  QuestionKey = 'question_key',
  /** column name */
  QuestionText = 'question_text',
  /** column name */
  QuestionTypeId = 'question_type_id',
  /** column name */
  ScaleMaxLabel = 'scale_max_label',
  /** column name */
  ScaleMinLabel = 'scale_min_label',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  ValidationPattern = 'validation_pattern'
}

/** select "form_questions_aggregate_bool_exp_bool_and_arguments_columns" columns of table "form_questions" */
export enum Form_Questions_Select_Column_Form_Questions_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsRequired = 'is_required'
}

/** select "form_questions_aggregate_bool_exp_bool_or_arguments_columns" columns of table "form_questions" */
export enum Form_Questions_Select_Column_Form_Questions_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsRequired = 'is_required'
}

/** input type for updating data in table "form_questions" */
export type Form_Questions_Set_Input = {
  /** Array of allowed MIME types for file uploads. Post-MVP */
  allowed_file_types?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Timestamp when question was created. Immutable after insert */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** FK to forms - parent form this question belongs to */
  form_id?: InputMaybe<Scalars['String']['input']>;
  /** Tooltip help text explaining what kind of answer is expected */
  help_text?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = question hidden from form but answers preserved */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether answer is mandatory. Validation enforced on submission */
  is_required?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Scalars['Int']['input']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Input placeholder hint (e.g., "Describe your challenge...") */
  placeholder?: InputMaybe<Scalars['String']['input']>;
  /** Semantic identifier unique per form (problem, solution, result, name, email). Used for answer lookup */
  question_key?: InputMaybe<Scalars['String']['input']>;
  /** Display text shown to customer (e.g., "What problem were you trying to solve?") */
  question_text?: InputMaybe<Scalars['String']['input']>;
  /** FK to question_types - determines input component and applicable validation rules */
  question_type_id?: InputMaybe<Scalars['String']['input']>;
  /** Custom label for maximum value on Linear Scale (e.g., "High", "Strongly agree"). NULL uses default "High" */
  scale_max_label?: InputMaybe<Scalars['String']['input']>;
  /** Custom label for minimum value on Linear Scale (e.g., "Low", "Strongly disagree"). NULL uses default "Low" */
  scale_min_label?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
  /** Regex pattern for text validation. Used for email, URL, or custom format validation */
  validation_pattern?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Form_Questions_Stddev_Fields = {
  __typename?: 'form_questions_stddev_fields';
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: Maybe<Scalars['Float']['output']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: Maybe<Scalars['Float']['output']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: Maybe<Scalars['Float']['output']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: Maybe<Scalars['Float']['output']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "form_questions" */
export type Form_Questions_Stddev_Order_By = {
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Order_By>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Order_By>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Order_By>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Order_By>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Form_Questions_Stddev_Pop_Fields = {
  __typename?: 'form_questions_stddev_pop_fields';
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: Maybe<Scalars['Float']['output']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: Maybe<Scalars['Float']['output']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: Maybe<Scalars['Float']['output']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: Maybe<Scalars['Float']['output']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "form_questions" */
export type Form_Questions_Stddev_Pop_Order_By = {
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Order_By>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Order_By>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Order_By>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Order_By>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Form_Questions_Stddev_Samp_Fields = {
  __typename?: 'form_questions_stddev_samp_fields';
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: Maybe<Scalars['Float']['output']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: Maybe<Scalars['Float']['output']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: Maybe<Scalars['Float']['output']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: Maybe<Scalars['Float']['output']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "form_questions" */
export type Form_Questions_Stddev_Samp_Order_By = {
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Order_By>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Order_By>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Order_By>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Order_By>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "form_questions" */
export type Form_Questions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Form_Questions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Form_Questions_Stream_Cursor_Value_Input = {
  /** Array of allowed MIME types for file uploads. Post-MVP */
  allowed_file_types?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Timestamp when question was created. Immutable after insert */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** FK to forms - parent form this question belongs to */
  form_id?: InputMaybe<Scalars['String']['input']>;
  /** Tooltip help text explaining what kind of answer is expected */
  help_text?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = question hidden from form but answers preserved */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether answer is mandatory. Validation enforced on submission */
  is_required?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Scalars['Int']['input']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Input placeholder hint (e.g., "Describe your challenge...") */
  placeholder?: InputMaybe<Scalars['String']['input']>;
  /** Semantic identifier unique per form (problem, solution, result, name, email). Used for answer lookup */
  question_key?: InputMaybe<Scalars['String']['input']>;
  /** Display text shown to customer (e.g., "What problem were you trying to solve?") */
  question_text?: InputMaybe<Scalars['String']['input']>;
  /** FK to question_types - determines input component and applicable validation rules */
  question_type_id?: InputMaybe<Scalars['String']['input']>;
  /** Custom label for maximum value on Linear Scale (e.g., "High", "Strongly agree"). NULL uses default "High" */
  scale_max_label?: InputMaybe<Scalars['String']['input']>;
  /** Custom label for minimum value on Linear Scale (e.g., "Low", "Strongly disagree"). NULL uses default "Low" */
  scale_min_label?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
  /** Regex pattern for text validation. Used for email, URL, or custom format validation */
  validation_pattern?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Form_Questions_Sum_Fields = {
  __typename?: 'form_questions_sum_fields';
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: Maybe<Scalars['smallint']['output']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: Maybe<Scalars['Int']['output']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: Maybe<Scalars['Int']['output']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: Maybe<Scalars['Int']['output']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: Maybe<Scalars['Int']['output']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "form_questions" */
export type Form_Questions_Sum_Order_By = {
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Order_By>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Order_By>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Order_By>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Order_By>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Order_By>;
};

/** update columns of table "form_questions" */
export enum Form_Questions_Update_Column {
  /** column name */
  AllowedFileTypes = 'allowed_file_types',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DisplayOrder = 'display_order',
  /** column name */
  FormId = 'form_id',
  /** column name */
  HelpText = 'help_text',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsRequired = 'is_required',
  /** column name */
  MaxFileSizeKb = 'max_file_size_kb',
  /** column name */
  MaxLength = 'max_length',
  /** column name */
  MaxValue = 'max_value',
  /** column name */
  MinLength = 'min_length',
  /** column name */
  MinValue = 'min_value',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Placeholder = 'placeholder',
  /** column name */
  QuestionKey = 'question_key',
  /** column name */
  QuestionText = 'question_text',
  /** column name */
  QuestionTypeId = 'question_type_id',
  /** column name */
  ScaleMaxLabel = 'scale_max_label',
  /** column name */
  ScaleMinLabel = 'scale_min_label',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by',
  /** column name */
  ValidationPattern = 'validation_pattern'
}

export type Form_Questions_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Form_Questions_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Form_Questions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Form_Questions_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Form_Questions_Var_Pop_Fields = {
  __typename?: 'form_questions_var_pop_fields';
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: Maybe<Scalars['Float']['output']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: Maybe<Scalars['Float']['output']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: Maybe<Scalars['Float']['output']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: Maybe<Scalars['Float']['output']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "form_questions" */
export type Form_Questions_Var_Pop_Order_By = {
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Order_By>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Order_By>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Order_By>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Order_By>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Form_Questions_Var_Samp_Fields = {
  __typename?: 'form_questions_var_samp_fields';
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: Maybe<Scalars['Float']['output']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: Maybe<Scalars['Float']['output']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: Maybe<Scalars['Float']['output']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: Maybe<Scalars['Float']['output']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "form_questions" */
export type Form_Questions_Var_Samp_Order_By = {
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Order_By>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Order_By>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Order_By>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Order_By>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Form_Questions_Variance_Fields = {
  __typename?: 'form_questions_variance_fields';
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: Maybe<Scalars['Float']['output']>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: Maybe<Scalars['Float']['output']>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: Maybe<Scalars['Float']['output']>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: Maybe<Scalars['Float']['output']>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "form_questions" */
export type Form_Questions_Variance_Order_By = {
  /** Order in which question appears on form. Unique per form, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Maximum file size in kilobytes for uploads. Post-MVP */
  max_file_size_kb?: InputMaybe<Order_By>;
  /** Maximum character count for text answers. NULL = no maximum. Only for text types */
  max_length?: InputMaybe<Order_By>;
  /** Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS) */
  max_value?: InputMaybe<Order_By>;
  /** Minimum character count for text answers. NULL = no minimum. Only for text types */
  min_length?: InputMaybe<Order_By>;
  /** Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars) */
  min_value?: InputMaybe<Order_By>;
};

/** Stores step configuration per form for the timeline editor. Each step represents a screen in the testimonial collection flow (welcome, questions, consent, contact info, reward, thank you). */
export type Form_Steps = {
  __typename?: 'form_steps';
  /** JSONB payload with type-specific configuration. Structure varies by step_type. Empty for question/rating types which use form_questions table instead. */
  content: Scalars['jsonb']['output'];
  /** Timestamp when this step record was first created. Set automatically, never modified. */
  created_at: Scalars['timestamptz']['output'];
  /** Foreign key to users table. Records which user originally created this step for audit purposes. */
  created_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  creator?: Maybe<Users>;
  /** Which flow this step belongs to: shared (all paths), testimonial (positive rating), or improvement (negative rating) */
  flow_membership: Scalars['String']['output'];
  /** An object relationship */
  form: Forms;
  /** Foreign key to forms table. Identifies which form this step belongs to. Cascade deletes when parent form is removed. */
  form_id: Scalars['String']['output'];
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id: Scalars['String']['output'];
  /** Soft delete flag. False hides step from form while preserving data for historical analysis and potential restoration. */
  is_active: Scalars['Boolean']['output'];
  /** An object relationship */
  organization: Organizations;
  /** Foreign key to organizations table. Denormalized from form for efficient row-level security queries. Must match form.organization_id. */
  organization_id: Scalars['String']['output'];
  /** An object relationship */
  question?: Maybe<Form_Questions>;
  /** Foreign key to form_questions table. Required for question/rating step types to link validation config. Must be NULL for non-question types. */
  question_id?: Maybe<Scalars['String']['output']>;
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order: Scalars['smallint']['output'];
  /** Enumerated type determining step behavior: welcome (intro screen), question (text input), rating (star/scale), consent (public/private choice), contact_info (submitter details), reward (incentive), thank_you (completion). */
  step_type: Scalars['String']['output'];
  /** Array of helper text strings shown to customers during question/rating steps. Provides guidance for better quality responses. */
  tips?: Maybe<Array<Scalars['String']['output']>>;
  /** Timestamp of last modification. Automatically updated by database trigger on any column change. */
  updated_at: Scalars['timestamptz']['output'];
  /** Foreign key to users table. Records which user last modified this step for audit trail. */
  updated_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  updater?: Maybe<Users>;
};


/** Stores step configuration per form for the timeline editor. Each step represents a screen in the testimonial collection flow (welcome, questions, consent, contact info, reward, thank you). */
export type Form_StepsContentArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "form_steps" */
export type Form_Steps_Aggregate = {
  __typename?: 'form_steps_aggregate';
  aggregate?: Maybe<Form_Steps_Aggregate_Fields>;
  nodes: Array<Form_Steps>;
};

export type Form_Steps_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Form_Steps_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Form_Steps_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Form_Steps_Aggregate_Bool_Exp_Count>;
};

export type Form_Steps_Aggregate_Bool_Exp_Bool_And = {
  arguments: Form_Steps_Select_Column_Form_Steps_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Form_Steps_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Form_Steps_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Form_Steps_Select_Column_Form_Steps_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Form_Steps_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Form_Steps_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Form_Steps_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Form_Steps_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "form_steps" */
export type Form_Steps_Aggregate_Fields = {
  __typename?: 'form_steps_aggregate_fields';
  avg?: Maybe<Form_Steps_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Form_Steps_Max_Fields>;
  min?: Maybe<Form_Steps_Min_Fields>;
  stddev?: Maybe<Form_Steps_Stddev_Fields>;
  stddev_pop?: Maybe<Form_Steps_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Form_Steps_Stddev_Samp_Fields>;
  sum?: Maybe<Form_Steps_Sum_Fields>;
  var_pop?: Maybe<Form_Steps_Var_Pop_Fields>;
  var_samp?: Maybe<Form_Steps_Var_Samp_Fields>;
  variance?: Maybe<Form_Steps_Variance_Fields>;
};


/** aggregate fields of "form_steps" */
export type Form_Steps_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Form_Steps_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "form_steps" */
export type Form_Steps_Aggregate_Order_By = {
  avg?: InputMaybe<Form_Steps_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Form_Steps_Max_Order_By>;
  min?: InputMaybe<Form_Steps_Min_Order_By>;
  stddev?: InputMaybe<Form_Steps_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Form_Steps_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Form_Steps_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Form_Steps_Sum_Order_By>;
  var_pop?: InputMaybe<Form_Steps_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Form_Steps_Var_Samp_Order_By>;
  variance?: InputMaybe<Form_Steps_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Form_Steps_Append_Input = {
  /** JSONB payload with type-specific configuration. Structure varies by step_type. Empty for question/rating types which use form_questions table instead. */
  content?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "form_steps" */
export type Form_Steps_Arr_Rel_Insert_Input = {
  data: Array<Form_Steps_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Form_Steps_On_Conflict>;
};

/** aggregate avg on columns */
export type Form_Steps_Avg_Fields = {
  __typename?: 'form_steps_avg_fields';
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "form_steps" */
export type Form_Steps_Avg_Order_By = {
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "form_steps". All fields are combined with a logical 'AND'. */
export type Form_Steps_Bool_Exp = {
  _and?: InputMaybe<Array<Form_Steps_Bool_Exp>>;
  _not?: InputMaybe<Form_Steps_Bool_Exp>;
  _or?: InputMaybe<Array<Form_Steps_Bool_Exp>>;
  content?: InputMaybe<Jsonb_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_by?: InputMaybe<String_Comparison_Exp>;
  creator?: InputMaybe<Users_Bool_Exp>;
  flow_membership?: InputMaybe<String_Comparison_Exp>;
  form?: InputMaybe<Forms_Bool_Exp>;
  form_id?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  question?: InputMaybe<Form_Questions_Bool_Exp>;
  question_id?: InputMaybe<String_Comparison_Exp>;
  step_order?: InputMaybe<Smallint_Comparison_Exp>;
  step_type?: InputMaybe<String_Comparison_Exp>;
  tips?: InputMaybe<String_Array_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_by?: InputMaybe<String_Comparison_Exp>;
  updater?: InputMaybe<Users_Bool_Exp>;
};

/** unique or primary key constraints on table "form_steps" */
export enum Form_Steps_Constraint {
  /** unique or primary key constraint on columns "step_order", "form_id" */
  FormStepsFormOrderUnique = 'form_steps_form_order_unique',
  /** unique or primary key constraint on columns "id" */
  FormStepsPkey = 'form_steps_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Form_Steps_Delete_At_Path_Input = {
  /** JSONB payload with type-specific configuration. Structure varies by step_type. Empty for question/rating types which use form_questions table instead. */
  content?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Form_Steps_Delete_Elem_Input = {
  /** JSONB payload with type-specific configuration. Structure varies by step_type. Empty for question/rating types which use form_questions table instead. */
  content?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Form_Steps_Delete_Key_Input = {
  /** JSONB payload with type-specific configuration. Structure varies by step_type. Empty for question/rating types which use form_questions table instead. */
  content?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "form_steps" */
export type Form_Steps_Inc_Input = {
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Scalars['smallint']['input']>;
};

/** input type for inserting data into table "form_steps" */
export type Form_Steps_Insert_Input = {
  /** JSONB payload with type-specific configuration. Structure varies by step_type. Empty for question/rating types which use form_questions table instead. */
  content?: InputMaybe<Scalars['jsonb']['input']>;
  /** Timestamp when this step record was first created. Set automatically, never modified. */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Foreign key to users table. Records which user originally created this step for audit purposes. */
  created_by?: InputMaybe<Scalars['String']['input']>;
  creator?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** Which flow this step belongs to: shared (all paths), testimonial (positive rating), or improvement (negative rating) */
  flow_membership?: InputMaybe<Scalars['String']['input']>;
  form?: InputMaybe<Forms_Obj_Rel_Insert_Input>;
  /** Foreign key to forms table. Identifies which form this step belongs to. Cascade deletes when parent form is removed. */
  form_id?: InputMaybe<Scalars['String']['input']>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False hides step from form while preserving data for historical analysis and potential restoration. */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** Foreign key to organizations table. Denormalized from form for efficient row-level security queries. Must match form.organization_id. */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  question?: InputMaybe<Form_Questions_Obj_Rel_Insert_Input>;
  /** Foreign key to form_questions table. Required for question/rating step types to link validation config. Must be NULL for non-question types. */
  question_id?: InputMaybe<Scalars['String']['input']>;
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Enumerated type determining step behavior: welcome (intro screen), question (text input), rating (star/scale), consent (public/private choice), contact_info (submitter details), reward (incentive), thank_you (completion). */
  step_type?: InputMaybe<Scalars['String']['input']>;
  /** Array of helper text strings shown to customers during question/rating steps. Provides guidance for better quality responses. */
  tips?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Timestamp of last modification. Automatically updated by database trigger on any column change. */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Foreign key to users table. Records which user last modified this step for audit trail. */
  updated_by?: InputMaybe<Scalars['String']['input']>;
  updater?: InputMaybe<Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Form_Steps_Max_Fields = {
  __typename?: 'form_steps_max_fields';
  /** Timestamp when this step record was first created. Set automatically, never modified. */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Foreign key to users table. Records which user originally created this step for audit purposes. */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Which flow this step belongs to: shared (all paths), testimonial (positive rating), or improvement (negative rating) */
  flow_membership?: Maybe<Scalars['String']['output']>;
  /** Foreign key to forms table. Identifies which form this step belongs to. Cascade deletes when parent form is removed. */
  form_id?: Maybe<Scalars['String']['output']>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: Maybe<Scalars['String']['output']>;
  /** Foreign key to organizations table. Denormalized from form for efficient row-level security queries. Must match form.organization_id. */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Foreign key to form_questions table. Required for question/rating step types to link validation config. Must be NULL for non-question types. */
  question_id?: Maybe<Scalars['String']['output']>;
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: Maybe<Scalars['smallint']['output']>;
  /** Enumerated type determining step behavior: welcome (intro screen), question (text input), rating (star/scale), consent (public/private choice), contact_info (submitter details), reward (incentive), thank_you (completion). */
  step_type?: Maybe<Scalars['String']['output']>;
  /** Array of helper text strings shown to customers during question/rating steps. Provides guidance for better quality responses. */
  tips?: Maybe<Array<Scalars['String']['output']>>;
  /** Timestamp of last modification. Automatically updated by database trigger on any column change. */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Foreign key to users table. Records which user last modified this step for audit trail. */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "form_steps" */
export type Form_Steps_Max_Order_By = {
  /** Timestamp when this step record was first created. Set automatically, never modified. */
  created_at?: InputMaybe<Order_By>;
  /** Foreign key to users table. Records which user originally created this step for audit purposes. */
  created_by?: InputMaybe<Order_By>;
  /** Which flow this step belongs to: shared (all paths), testimonial (positive rating), or improvement (negative rating) */
  flow_membership?: InputMaybe<Order_By>;
  /** Foreign key to forms table. Identifies which form this step belongs to. Cascade deletes when parent form is removed. */
  form_id?: InputMaybe<Order_By>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: InputMaybe<Order_By>;
  /** Foreign key to organizations table. Denormalized from form for efficient row-level security queries. Must match form.organization_id. */
  organization_id?: InputMaybe<Order_By>;
  /** Foreign key to form_questions table. Required for question/rating step types to link validation config. Must be NULL for non-question types. */
  question_id?: InputMaybe<Order_By>;
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Order_By>;
  /** Enumerated type determining step behavior: welcome (intro screen), question (text input), rating (star/scale), consent (public/private choice), contact_info (submitter details), reward (incentive), thank_you (completion). */
  step_type?: InputMaybe<Order_By>;
  /** Array of helper text strings shown to customers during question/rating steps. Provides guidance for better quality responses. */
  tips?: InputMaybe<Order_By>;
  /** Timestamp of last modification. Automatically updated by database trigger on any column change. */
  updated_at?: InputMaybe<Order_By>;
  /** Foreign key to users table. Records which user last modified this step for audit trail. */
  updated_by?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Form_Steps_Min_Fields = {
  __typename?: 'form_steps_min_fields';
  /** Timestamp when this step record was first created. Set automatically, never modified. */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Foreign key to users table. Records which user originally created this step for audit purposes. */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Which flow this step belongs to: shared (all paths), testimonial (positive rating), or improvement (negative rating) */
  flow_membership?: Maybe<Scalars['String']['output']>;
  /** Foreign key to forms table. Identifies which form this step belongs to. Cascade deletes when parent form is removed. */
  form_id?: Maybe<Scalars['String']['output']>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: Maybe<Scalars['String']['output']>;
  /** Foreign key to organizations table. Denormalized from form for efficient row-level security queries. Must match form.organization_id. */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Foreign key to form_questions table. Required for question/rating step types to link validation config. Must be NULL for non-question types. */
  question_id?: Maybe<Scalars['String']['output']>;
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: Maybe<Scalars['smallint']['output']>;
  /** Enumerated type determining step behavior: welcome (intro screen), question (text input), rating (star/scale), consent (public/private choice), contact_info (submitter details), reward (incentive), thank_you (completion). */
  step_type?: Maybe<Scalars['String']['output']>;
  /** Array of helper text strings shown to customers during question/rating steps. Provides guidance for better quality responses. */
  tips?: Maybe<Array<Scalars['String']['output']>>;
  /** Timestamp of last modification. Automatically updated by database trigger on any column change. */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Foreign key to users table. Records which user last modified this step for audit trail. */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "form_steps" */
export type Form_Steps_Min_Order_By = {
  /** Timestamp when this step record was first created. Set automatically, never modified. */
  created_at?: InputMaybe<Order_By>;
  /** Foreign key to users table. Records which user originally created this step for audit purposes. */
  created_by?: InputMaybe<Order_By>;
  /** Which flow this step belongs to: shared (all paths), testimonial (positive rating), or improvement (negative rating) */
  flow_membership?: InputMaybe<Order_By>;
  /** Foreign key to forms table. Identifies which form this step belongs to. Cascade deletes when parent form is removed. */
  form_id?: InputMaybe<Order_By>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: InputMaybe<Order_By>;
  /** Foreign key to organizations table. Denormalized from form for efficient row-level security queries. Must match form.organization_id. */
  organization_id?: InputMaybe<Order_By>;
  /** Foreign key to form_questions table. Required for question/rating step types to link validation config. Must be NULL for non-question types. */
  question_id?: InputMaybe<Order_By>;
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Order_By>;
  /** Enumerated type determining step behavior: welcome (intro screen), question (text input), rating (star/scale), consent (public/private choice), contact_info (submitter details), reward (incentive), thank_you (completion). */
  step_type?: InputMaybe<Order_By>;
  /** Array of helper text strings shown to customers during question/rating steps. Provides guidance for better quality responses. */
  tips?: InputMaybe<Order_By>;
  /** Timestamp of last modification. Automatically updated by database trigger on any column change. */
  updated_at?: InputMaybe<Order_By>;
  /** Foreign key to users table. Records which user last modified this step for audit trail. */
  updated_by?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "form_steps" */
export type Form_Steps_Mutation_Response = {
  __typename?: 'form_steps_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Form_Steps>;
};

/** on_conflict condition type for table "form_steps" */
export type Form_Steps_On_Conflict = {
  constraint: Form_Steps_Constraint;
  update_columns?: Array<Form_Steps_Update_Column>;
  where?: InputMaybe<Form_Steps_Bool_Exp>;
};

/** Ordering options when selecting data from "form_steps". */
export type Form_Steps_Order_By = {
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  creator?: InputMaybe<Users_Order_By>;
  flow_membership?: InputMaybe<Order_By>;
  form?: InputMaybe<Forms_Order_By>;
  form_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  question?: InputMaybe<Form_Questions_Order_By>;
  question_id?: InputMaybe<Order_By>;
  step_order?: InputMaybe<Order_By>;
  step_type?: InputMaybe<Order_By>;
  tips?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updater?: InputMaybe<Users_Order_By>;
};

/** primary key columns input for table: form_steps */
export type Form_Steps_Pk_Columns_Input = {
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id: Scalars['String']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Form_Steps_Prepend_Input = {
  /** JSONB payload with type-specific configuration. Structure varies by step_type. Empty for question/rating types which use form_questions table instead. */
  content?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "form_steps" */
export enum Form_Steps_Select_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  FlowMembership = 'flow_membership',
  /** column name */
  FormId = 'form_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  QuestionId = 'question_id',
  /** column name */
  StepOrder = 'step_order',
  /** column name */
  StepType = 'step_type',
  /** column name */
  Tips = 'tips',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

/** select "form_steps_aggregate_bool_exp_bool_and_arguments_columns" columns of table "form_steps" */
export enum Form_Steps_Select_Column_Form_Steps_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "form_steps_aggregate_bool_exp_bool_or_arguments_columns" columns of table "form_steps" */
export enum Form_Steps_Select_Column_Form_Steps_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "form_steps" */
export type Form_Steps_Set_Input = {
  /** JSONB payload with type-specific configuration. Structure varies by step_type. Empty for question/rating types which use form_questions table instead. */
  content?: InputMaybe<Scalars['jsonb']['input']>;
  /** Timestamp when this step record was first created. Set automatically, never modified. */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Foreign key to users table. Records which user originally created this step for audit purposes. */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Which flow this step belongs to: shared (all paths), testimonial (positive rating), or improvement (negative rating) */
  flow_membership?: InputMaybe<Scalars['String']['input']>;
  /** Foreign key to forms table. Identifies which form this step belongs to. Cascade deletes when parent form is removed. */
  form_id?: InputMaybe<Scalars['String']['input']>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False hides step from form while preserving data for historical analysis and potential restoration. */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Foreign key to organizations table. Denormalized from form for efficient row-level security queries. Must match form.organization_id. */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Foreign key to form_questions table. Required for question/rating step types to link validation config. Must be NULL for non-question types. */
  question_id?: InputMaybe<Scalars['String']['input']>;
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Enumerated type determining step behavior: welcome (intro screen), question (text input), rating (star/scale), consent (public/private choice), contact_info (submitter details), reward (incentive), thank_you (completion). */
  step_type?: InputMaybe<Scalars['String']['input']>;
  /** Array of helper text strings shown to customers during question/rating steps. Provides guidance for better quality responses. */
  tips?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Timestamp of last modification. Automatically updated by database trigger on any column change. */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Foreign key to users table. Records which user last modified this step for audit trail. */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Form_Steps_Stddev_Fields = {
  __typename?: 'form_steps_stddev_fields';
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "form_steps" */
export type Form_Steps_Stddev_Order_By = {
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Form_Steps_Stddev_Pop_Fields = {
  __typename?: 'form_steps_stddev_pop_fields';
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "form_steps" */
export type Form_Steps_Stddev_Pop_Order_By = {
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Form_Steps_Stddev_Samp_Fields = {
  __typename?: 'form_steps_stddev_samp_fields';
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "form_steps" */
export type Form_Steps_Stddev_Samp_Order_By = {
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "form_steps" */
export type Form_Steps_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Form_Steps_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Form_Steps_Stream_Cursor_Value_Input = {
  /** JSONB payload with type-specific configuration. Structure varies by step_type. Empty for question/rating types which use form_questions table instead. */
  content?: InputMaybe<Scalars['jsonb']['input']>;
  /** Timestamp when this step record was first created. Set automatically, never modified. */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Foreign key to users table. Records which user originally created this step for audit purposes. */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Which flow this step belongs to: shared (all paths), testimonial (positive rating), or improvement (negative rating) */
  flow_membership?: InputMaybe<Scalars['String']['input']>;
  /** Foreign key to forms table. Identifies which form this step belongs to. Cascade deletes when parent form is removed. */
  form_id?: InputMaybe<Scalars['String']['input']>;
  /** Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification. */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False hides step from form while preserving data for historical analysis and potential restoration. */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Foreign key to organizations table. Denormalized from form for efficient row-level security queries. Must match form.organization_id. */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Foreign key to form_questions table. Required for question/rating step types to link validation config. Must be NULL for non-question types. */
  question_id?: InputMaybe<Scalars['String']['input']>;
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Enumerated type determining step behavior: welcome (intro screen), question (text input), rating (star/scale), consent (public/private choice), contact_info (submitter details), reward (incentive), thank_you (completion). */
  step_type?: InputMaybe<Scalars['String']['input']>;
  /** Array of helper text strings shown to customers during question/rating steps. Provides guidance for better quality responses. */
  tips?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Timestamp of last modification. Automatically updated by database trigger on any column change. */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Foreign key to users table. Records which user last modified this step for audit trail. */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Form_Steps_Sum_Fields = {
  __typename?: 'form_steps_sum_fields';
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: Maybe<Scalars['smallint']['output']>;
};

/** order by sum() on columns of table "form_steps" */
export type Form_Steps_Sum_Order_By = {
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Order_By>;
};

/** update columns of table "form_steps" */
export enum Form_Steps_Update_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  FlowMembership = 'flow_membership',
  /** column name */
  FormId = 'form_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  QuestionId = 'question_id',
  /** column name */
  StepOrder = 'step_order',
  /** column name */
  StepType = 'step_type',
  /** column name */
  Tips = 'tips',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

export type Form_Steps_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Form_Steps_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Form_Steps_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Form_Steps_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Form_Steps_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Form_Steps_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Form_Steps_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Form_Steps_Set_Input>;
  /** filter the rows which have to be updated */
  where: Form_Steps_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Form_Steps_Var_Pop_Fields = {
  __typename?: 'form_steps_var_pop_fields';
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "form_steps" */
export type Form_Steps_Var_Pop_Order_By = {
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Form_Steps_Var_Samp_Fields = {
  __typename?: 'form_steps_var_samp_fields';
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "form_steps" */
export type Form_Steps_Var_Samp_Order_By = {
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Form_Steps_Variance_Fields = {
  __typename?: 'form_steps_variance_fields';
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "form_steps" */
export type Form_Steps_Variance_Order_By = {
  /** Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form. */
  step_order?: InputMaybe<Order_By>;
};

/** Raw form submission event - submitter info lives here, responses in form_question_responses */
export type Form_Submissions = {
  __typename?: 'form_submissions';
  /** An object relationship */
  contact?: Maybe<Contacts>;
  /** Foreign key to contacts table. Links this submission to a normalized contact record for deduplication and contact management. NULL for legacy submissions or anonymous submissions. */
  contact_id?: Maybe<Scalars['String']['output']>;
  /** Record creation timestamp. Same as submitted_at */
  created_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  form: Forms;
  /** FK to forms - which form was submitted */
  form_id: Scalars['String']['output'];
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['output'];
  /** An object relationship */
  organization: Organizations;
  /** FK to organizations - tenant boundary for isolation */
  organization_id: Scalars['String']['output'];
  /** An array relationship */
  responses: Array<Form_Question_Responses>;
  /** An aggregate relationship */
  responses_aggregate: Form_Question_Responses_Aggregate;
  /** When customer submitted the form. Immutable */
  submitted_at: Scalars['timestamptz']['output'];
  /** An array relationship */
  testimonials: Array<Testimonials>;
  /** An aggregate relationship */
  testimonials_aggregate: Testimonials_Aggregate;
  /** Last modification. Auto-updated by trigger */
  updated_at: Scalars['timestamptz']['output'];
  /** FK to users - who made admin edits. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  updater?: Maybe<Users>;
};


/** Raw form submission event - submitter info lives here, responses in form_question_responses */
export type Form_SubmissionsResponsesArgs = {
  distinct_on?: InputMaybe<Array<Form_Question_Responses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Question_Responses_Order_By>>;
  where?: InputMaybe<Form_Question_Responses_Bool_Exp>;
};


/** Raw form submission event - submitter info lives here, responses in form_question_responses */
export type Form_SubmissionsResponses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Question_Responses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Question_Responses_Order_By>>;
  where?: InputMaybe<Form_Question_Responses_Bool_Exp>;
};


/** Raw form submission event - submitter info lives here, responses in form_question_responses */
export type Form_SubmissionsTestimonialsArgs = {
  distinct_on?: InputMaybe<Array<Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Testimonials_Order_By>>;
  where?: InputMaybe<Testimonials_Bool_Exp>;
};


/** Raw form submission event - submitter info lives here, responses in form_question_responses */
export type Form_SubmissionsTestimonials_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Testimonials_Order_By>>;
  where?: InputMaybe<Testimonials_Bool_Exp>;
};

/** aggregated selection of "form_submissions" */
export type Form_Submissions_Aggregate = {
  __typename?: 'form_submissions_aggregate';
  aggregate?: Maybe<Form_Submissions_Aggregate_Fields>;
  nodes: Array<Form_Submissions>;
};

export type Form_Submissions_Aggregate_Bool_Exp = {
  count?: InputMaybe<Form_Submissions_Aggregate_Bool_Exp_Count>;
};

export type Form_Submissions_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Form_Submissions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Form_Submissions_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "form_submissions" */
export type Form_Submissions_Aggregate_Fields = {
  __typename?: 'form_submissions_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Form_Submissions_Max_Fields>;
  min?: Maybe<Form_Submissions_Min_Fields>;
};


/** aggregate fields of "form_submissions" */
export type Form_Submissions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Form_Submissions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "form_submissions" */
export type Form_Submissions_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Form_Submissions_Max_Order_By>;
  min?: InputMaybe<Form_Submissions_Min_Order_By>;
};

/** input type for inserting array relation for remote table "form_submissions" */
export type Form_Submissions_Arr_Rel_Insert_Input = {
  data: Array<Form_Submissions_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Form_Submissions_On_Conflict>;
};

/** Boolean expression to filter rows from the table "form_submissions". All fields are combined with a logical 'AND'. */
export type Form_Submissions_Bool_Exp = {
  _and?: InputMaybe<Array<Form_Submissions_Bool_Exp>>;
  _not?: InputMaybe<Form_Submissions_Bool_Exp>;
  _or?: InputMaybe<Array<Form_Submissions_Bool_Exp>>;
  contact?: InputMaybe<Contacts_Bool_Exp>;
  contact_id?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  form?: InputMaybe<Forms_Bool_Exp>;
  form_id?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  responses?: InputMaybe<Form_Question_Responses_Bool_Exp>;
  responses_aggregate?: InputMaybe<Form_Question_Responses_Aggregate_Bool_Exp>;
  submitted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  testimonials?: InputMaybe<Testimonials_Bool_Exp>;
  testimonials_aggregate?: InputMaybe<Testimonials_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_by?: InputMaybe<String_Comparison_Exp>;
  updater?: InputMaybe<Users_Bool_Exp>;
};

/** unique or primary key constraints on table "form_submissions" */
export enum Form_Submissions_Constraint {
  /** unique or primary key constraint on columns "id" */
  FormSubmissionsPkey = 'form_submissions_pkey'
}

/** input type for inserting data into table "form_submissions" */
export type Form_Submissions_Insert_Input = {
  contact?: InputMaybe<Contacts_Obj_Rel_Insert_Input>;
  /** Foreign key to contacts table. Links this submission to a normalized contact record for deduplication and contact management. NULL for legacy submissions or anonymous submissions. */
  contact_id?: InputMaybe<Scalars['String']['input']>;
  /** Record creation timestamp. Same as submitted_at */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  form?: InputMaybe<Forms_Obj_Rel_Insert_Input>;
  /** FK to forms - which form was submitted */
  form_id?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  responses?: InputMaybe<Form_Question_Responses_Arr_Rel_Insert_Input>;
  /** When customer submitted the form. Immutable */
  submitted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  testimonials?: InputMaybe<Testimonials_Arr_Rel_Insert_Input>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who made admin edits. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
  updater?: InputMaybe<Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Form_Submissions_Max_Fields = {
  __typename?: 'form_submissions_max_fields';
  /** Foreign key to contacts table. Links this submission to a normalized contact record for deduplication and contact management. NULL for legacy submissions or anonymous submissions. */
  contact_id?: Maybe<Scalars['String']['output']>;
  /** Record creation timestamp. Same as submitted_at */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to forms - which form was submitted */
  form_id?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** When customer submitted the form. Immutable */
  submitted_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who made admin edits. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "form_submissions" */
export type Form_Submissions_Max_Order_By = {
  /** Foreign key to contacts table. Links this submission to a normalized contact record for deduplication and contact management. NULL for legacy submissions or anonymous submissions. */
  contact_id?: InputMaybe<Order_By>;
  /** Record creation timestamp. Same as submitted_at */
  created_at?: InputMaybe<Order_By>;
  /** FK to forms - which form was submitted */
  form_id?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Order_By>;
  /** When customer submitted the form. Immutable */
  submitted_at?: InputMaybe<Order_By>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - who made admin edits. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Form_Submissions_Min_Fields = {
  __typename?: 'form_submissions_min_fields';
  /** Foreign key to contacts table. Links this submission to a normalized contact record for deduplication and contact management. NULL for legacy submissions or anonymous submissions. */
  contact_id?: Maybe<Scalars['String']['output']>;
  /** Record creation timestamp. Same as submitted_at */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to forms - which form was submitted */
  form_id?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** When customer submitted the form. Immutable */
  submitted_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who made admin edits. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "form_submissions" */
export type Form_Submissions_Min_Order_By = {
  /** Foreign key to contacts table. Links this submission to a normalized contact record for deduplication and contact management. NULL for legacy submissions or anonymous submissions. */
  contact_id?: InputMaybe<Order_By>;
  /** Record creation timestamp. Same as submitted_at */
  created_at?: InputMaybe<Order_By>;
  /** FK to forms - which form was submitted */
  form_id?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Order_By>;
  /** When customer submitted the form. Immutable */
  submitted_at?: InputMaybe<Order_By>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - who made admin edits. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "form_submissions" */
export type Form_Submissions_Mutation_Response = {
  __typename?: 'form_submissions_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Form_Submissions>;
};

/** input type for inserting object relation for remote table "form_submissions" */
export type Form_Submissions_Obj_Rel_Insert_Input = {
  data: Form_Submissions_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Form_Submissions_On_Conflict>;
};

/** on_conflict condition type for table "form_submissions" */
export type Form_Submissions_On_Conflict = {
  constraint: Form_Submissions_Constraint;
  update_columns?: Array<Form_Submissions_Update_Column>;
  where?: InputMaybe<Form_Submissions_Bool_Exp>;
};

/** Ordering options when selecting data from "form_submissions". */
export type Form_Submissions_Order_By = {
  contact?: InputMaybe<Contacts_Order_By>;
  contact_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  form?: InputMaybe<Forms_Order_By>;
  form_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  responses_aggregate?: InputMaybe<Form_Question_Responses_Aggregate_Order_By>;
  submitted_at?: InputMaybe<Order_By>;
  testimonials_aggregate?: InputMaybe<Testimonials_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updater?: InputMaybe<Users_Order_By>;
};

/** primary key columns input for table: form_submissions */
export type Form_Submissions_Pk_Columns_Input = {
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['input'];
};

/** select columns of table "form_submissions" */
export enum Form_Submissions_Select_Column {
  /** column name */
  ContactId = 'contact_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FormId = 'form_id',
  /** column name */
  Id = 'id',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  SubmittedAt = 'submitted_at',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

/** input type for updating data in table "form_submissions" */
export type Form_Submissions_Set_Input = {
  /** Foreign key to contacts table. Links this submission to a normalized contact record for deduplication and contact management. NULL for legacy submissions or anonymous submissions. */
  contact_id?: InputMaybe<Scalars['String']['input']>;
  /** Record creation timestamp. Same as submitted_at */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to forms - which form was submitted */
  form_id?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** When customer submitted the form. Immutable */
  submitted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who made admin edits. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "form_submissions" */
export type Form_Submissions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Form_Submissions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Form_Submissions_Stream_Cursor_Value_Input = {
  /** Foreign key to contacts table. Links this submission to a normalized contact record for deduplication and contact management. NULL for legacy submissions or anonymous submissions. */
  contact_id?: InputMaybe<Scalars['String']['input']>;
  /** Record creation timestamp. Same as submitted_at */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to forms - which form was submitted */
  form_id?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** When customer submitted the form. Immutable */
  submitted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who made admin edits. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "form_submissions" */
export enum Form_Submissions_Update_Column {
  /** column name */
  ContactId = 'contact_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FormId = 'form_id',
  /** column name */
  Id = 'id',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  SubmittedAt = 'submitted_at',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

export type Form_Submissions_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Form_Submissions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Form_Submissions_Bool_Exp;
};

/** Testimonial collection forms - questions normalized to form_questions table */
export type Forms = {
  __typename?: 'forms';
  /** Branching configuration: { enabled: boolean, threshold: number (rating cutoff), ratingStepId: string | null (step that triggers branching) } */
  branching_config: Scalars['jsonb']['output'];
  /** An array relationship */
  contacts: Array<Contacts>;
  /** An aggregate relationship */
  contacts_aggregate: Contacts_Aggregate;
  /** Timestamp when form was created. Immutable after insert */
  created_at: Scalars['timestamptz']['output'];
  /** FK to users - user who created this form */
  created_by: Scalars['String']['output'];
  /** An object relationship */
  creator: Users;
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['output'];
  /** Soft delete flag. False = form disabled, public link returns 404 */
  is_active: Scalars['Boolean']['output'];
  /** Form display name shown in dashboard (e.g., "Product Feedback Form") */
  name: Scalars['String']['output'];
  /** An object relationship */
  organization: Organizations;
  /** FK to organizations - tenant boundary for multi-tenancy isolation */
  organization_id: Scalars['String']['output'];
  /** AI context for question generation - enables "Infer, Don't Ask" philosophy */
  product_description?: Maybe<Scalars['String']['output']>;
  /** Name of product being reviewed - used in question templates (e.g., "How did {product} help?") */
  product_name: Scalars['String']['output'];
  /** An array relationship */
  questions: Array<Form_Questions>;
  /** An aggregate relationship */
  questions_aggregate: Form_Questions_Aggregate;
  /** UI preferences only (theme colors, branding) - NOT business logic. JSONB appropriate here */
  settings: Scalars['jsonb']['output'];
  /** Form lifecycle status: draft (editing), published (public), archived (hidden) */
  status: Scalars['String']['output'];
  /** An array relationship */
  steps: Array<Form_Steps>;
  /** An aggregate relationship */
  steps_aggregate: Form_Steps_Aggregate;
  /** An array relationship */
  submissions: Array<Form_Submissions>;
  /** An aggregate relationship */
  submissions_aggregate: Form_Submissions_Aggregate;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at: Scalars['timestamptz']['output'];
  /** FK to users - user who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  updater?: Maybe<Users>;
};


/** Testimonial collection forms - questions normalized to form_questions table */
export type FormsBranching_ConfigArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** Testimonial collection forms - questions normalized to form_questions table */
export type FormsContactsArgs = {
  distinct_on?: InputMaybe<Array<Contacts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Contacts_Order_By>>;
  where?: InputMaybe<Contacts_Bool_Exp>;
};


/** Testimonial collection forms - questions normalized to form_questions table */
export type FormsContacts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Contacts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Contacts_Order_By>>;
  where?: InputMaybe<Contacts_Bool_Exp>;
};


/** Testimonial collection forms - questions normalized to form_questions table */
export type FormsQuestionsArgs = {
  distinct_on?: InputMaybe<Array<Form_Questions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Questions_Order_By>>;
  where?: InputMaybe<Form_Questions_Bool_Exp>;
};


/** Testimonial collection forms - questions normalized to form_questions table */
export type FormsQuestions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Questions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Questions_Order_By>>;
  where?: InputMaybe<Form_Questions_Bool_Exp>;
};


/** Testimonial collection forms - questions normalized to form_questions table */
export type FormsSettingsArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** Testimonial collection forms - questions normalized to form_questions table */
export type FormsStepsArgs = {
  distinct_on?: InputMaybe<Array<Form_Steps_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Steps_Order_By>>;
  where?: InputMaybe<Form_Steps_Bool_Exp>;
};


/** Testimonial collection forms - questions normalized to form_questions table */
export type FormsSteps_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Steps_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Steps_Order_By>>;
  where?: InputMaybe<Form_Steps_Bool_Exp>;
};


/** Testimonial collection forms - questions normalized to form_questions table */
export type FormsSubmissionsArgs = {
  distinct_on?: InputMaybe<Array<Form_Submissions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Submissions_Order_By>>;
  where?: InputMaybe<Form_Submissions_Bool_Exp>;
};


/** Testimonial collection forms - questions normalized to form_questions table */
export type FormsSubmissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Submissions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Submissions_Order_By>>;
  where?: InputMaybe<Form_Submissions_Bool_Exp>;
};

/** aggregated selection of "forms" */
export type Forms_Aggregate = {
  __typename?: 'forms_aggregate';
  aggregate?: Maybe<Forms_Aggregate_Fields>;
  nodes: Array<Forms>;
};

export type Forms_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Forms_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Forms_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Forms_Aggregate_Bool_Exp_Count>;
};

export type Forms_Aggregate_Bool_Exp_Bool_And = {
  arguments: Forms_Select_Column_Forms_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Forms_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Forms_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Forms_Select_Column_Forms_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Forms_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Forms_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Forms_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Forms_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "forms" */
export type Forms_Aggregate_Fields = {
  __typename?: 'forms_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Forms_Max_Fields>;
  min?: Maybe<Forms_Min_Fields>;
};


/** aggregate fields of "forms" */
export type Forms_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Forms_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "forms" */
export type Forms_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Forms_Max_Order_By>;
  min?: InputMaybe<Forms_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Forms_Append_Input = {
  /** Branching configuration: { enabled: boolean, threshold: number (rating cutoff), ratingStepId: string | null (step that triggers branching) } */
  branching_config?: InputMaybe<Scalars['jsonb']['input']>;
  /** UI preferences only (theme colors, branding) - NOT business logic. JSONB appropriate here */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "forms" */
export type Forms_Arr_Rel_Insert_Input = {
  data: Array<Forms_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Forms_On_Conflict>;
};

/** Boolean expression to filter rows from the table "forms". All fields are combined with a logical 'AND'. */
export type Forms_Bool_Exp = {
  _and?: InputMaybe<Array<Forms_Bool_Exp>>;
  _not?: InputMaybe<Forms_Bool_Exp>;
  _or?: InputMaybe<Array<Forms_Bool_Exp>>;
  branching_config?: InputMaybe<Jsonb_Comparison_Exp>;
  contacts?: InputMaybe<Contacts_Bool_Exp>;
  contacts_aggregate?: InputMaybe<Contacts_Aggregate_Bool_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_by?: InputMaybe<String_Comparison_Exp>;
  creator?: InputMaybe<Users_Bool_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  product_description?: InputMaybe<String_Comparison_Exp>;
  product_name?: InputMaybe<String_Comparison_Exp>;
  questions?: InputMaybe<Form_Questions_Bool_Exp>;
  questions_aggregate?: InputMaybe<Form_Questions_Aggregate_Bool_Exp>;
  settings?: InputMaybe<Jsonb_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  steps?: InputMaybe<Form_Steps_Bool_Exp>;
  steps_aggregate?: InputMaybe<Form_Steps_Aggregate_Bool_Exp>;
  submissions?: InputMaybe<Form_Submissions_Bool_Exp>;
  submissions_aggregate?: InputMaybe<Form_Submissions_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_by?: InputMaybe<String_Comparison_Exp>;
  updater?: InputMaybe<Users_Bool_Exp>;
};

/** unique or primary key constraints on table "forms" */
export enum Forms_Constraint {
  /** unique or primary key constraint on columns "id" */
  FormsPkey = 'forms_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Forms_Delete_At_Path_Input = {
  /** Branching configuration: { enabled: boolean, threshold: number (rating cutoff), ratingStepId: string | null (step that triggers branching) } */
  branching_config?: InputMaybe<Array<Scalars['String']['input']>>;
  /** UI preferences only (theme colors, branding) - NOT business logic. JSONB appropriate here */
  settings?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Forms_Delete_Elem_Input = {
  /** Branching configuration: { enabled: boolean, threshold: number (rating cutoff), ratingStepId: string | null (step that triggers branching) } */
  branching_config?: InputMaybe<Scalars['Int']['input']>;
  /** UI preferences only (theme colors, branding) - NOT business logic. JSONB appropriate here */
  settings?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Forms_Delete_Key_Input = {
  /** Branching configuration: { enabled: boolean, threshold: number (rating cutoff), ratingStepId: string | null (step that triggers branching) } */
  branching_config?: InputMaybe<Scalars['String']['input']>;
  /** UI preferences only (theme colors, branding) - NOT business logic. JSONB appropriate here */
  settings?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "forms" */
export type Forms_Insert_Input = {
  /** Branching configuration: { enabled: boolean, threshold: number (rating cutoff), ratingStepId: string | null (step that triggers branching) } */
  branching_config?: InputMaybe<Scalars['jsonb']['input']>;
  contacts?: InputMaybe<Contacts_Arr_Rel_Insert_Input>;
  /** Timestamp when form was created. Immutable after insert */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who created this form */
  created_by?: InputMaybe<Scalars['String']['input']>;
  creator?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = form disabled, public link returns 404 */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Form display name shown in dashboard (e.g., "Product Feedback Form") */
  name?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** FK to organizations - tenant boundary for multi-tenancy isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** AI context for question generation - enables "Infer, Don't Ask" philosophy */
  product_description?: InputMaybe<Scalars['String']['input']>;
  /** Name of product being reviewed - used in question templates (e.g., "How did {product} help?") */
  product_name?: InputMaybe<Scalars['String']['input']>;
  questions?: InputMaybe<Form_Questions_Arr_Rel_Insert_Input>;
  /** UI preferences only (theme colors, branding) - NOT business logic. JSONB appropriate here */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
  /** Form lifecycle status: draft (editing), published (public), archived (hidden) */
  status?: InputMaybe<Scalars['String']['input']>;
  steps?: InputMaybe<Form_Steps_Arr_Rel_Insert_Input>;
  submissions?: InputMaybe<Form_Submissions_Arr_Rel_Insert_Input>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
  updater?: InputMaybe<Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Forms_Max_Fields = {
  __typename?: 'forms_max_fields';
  /** Timestamp when form was created. Immutable after insert */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - user who created this form */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** Form display name shown in dashboard (e.g., "Product Feedback Form") */
  name?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for multi-tenancy isolation */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** AI context for question generation - enables "Infer, Don't Ask" philosophy */
  product_description?: Maybe<Scalars['String']['output']>;
  /** Name of product being reviewed - used in question templates (e.g., "How did {product} help?") */
  product_name?: Maybe<Scalars['String']['output']>;
  /** Form lifecycle status: draft (editing), published (public), archived (hidden) */
  status?: Maybe<Scalars['String']['output']>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - user who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "forms" */
export type Forms_Max_Order_By = {
  /** Timestamp when form was created. Immutable after insert */
  created_at?: InputMaybe<Order_By>;
  /** FK to users - user who created this form */
  created_by?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** Form display name shown in dashboard (e.g., "Product Feedback Form") */
  name?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for multi-tenancy isolation */
  organization_id?: InputMaybe<Order_By>;
  /** AI context for question generation - enables "Infer, Don't Ask" philosophy */
  product_description?: InputMaybe<Order_By>;
  /** Name of product being reviewed - used in question templates (e.g., "How did {product} help?") */
  product_name?: InputMaybe<Order_By>;
  /** Form lifecycle status: draft (editing), published (public), archived (hidden) */
  status?: InputMaybe<Order_By>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - user who last modified. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Forms_Min_Fields = {
  __typename?: 'forms_min_fields';
  /** Timestamp when form was created. Immutable after insert */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - user who created this form */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** Form display name shown in dashboard (e.g., "Product Feedback Form") */
  name?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for multi-tenancy isolation */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** AI context for question generation - enables "Infer, Don't Ask" philosophy */
  product_description?: Maybe<Scalars['String']['output']>;
  /** Name of product being reviewed - used in question templates (e.g., "How did {product} help?") */
  product_name?: Maybe<Scalars['String']['output']>;
  /** Form lifecycle status: draft (editing), published (public), archived (hidden) */
  status?: Maybe<Scalars['String']['output']>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - user who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "forms" */
export type Forms_Min_Order_By = {
  /** Timestamp when form was created. Immutable after insert */
  created_at?: InputMaybe<Order_By>;
  /** FK to users - user who created this form */
  created_by?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** Form display name shown in dashboard (e.g., "Product Feedback Form") */
  name?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for multi-tenancy isolation */
  organization_id?: InputMaybe<Order_By>;
  /** AI context for question generation - enables "Infer, Don't Ask" philosophy */
  product_description?: InputMaybe<Order_By>;
  /** Name of product being reviewed - used in question templates (e.g., "How did {product} help?") */
  product_name?: InputMaybe<Order_By>;
  /** Form lifecycle status: draft (editing), published (public), archived (hidden) */
  status?: InputMaybe<Order_By>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - user who last modified. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "forms" */
export type Forms_Mutation_Response = {
  __typename?: 'forms_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Forms>;
};

/** input type for inserting object relation for remote table "forms" */
export type Forms_Obj_Rel_Insert_Input = {
  data: Forms_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Forms_On_Conflict>;
};

/** on_conflict condition type for table "forms" */
export type Forms_On_Conflict = {
  constraint: Forms_Constraint;
  update_columns?: Array<Forms_Update_Column>;
  where?: InputMaybe<Forms_Bool_Exp>;
};

/** Ordering options when selecting data from "forms". */
export type Forms_Order_By = {
  branching_config?: InputMaybe<Order_By>;
  contacts_aggregate?: InputMaybe<Contacts_Aggregate_Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  creator?: InputMaybe<Users_Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  product_description?: InputMaybe<Order_By>;
  product_name?: InputMaybe<Order_By>;
  questions_aggregate?: InputMaybe<Form_Questions_Aggregate_Order_By>;
  settings?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  steps_aggregate?: InputMaybe<Form_Steps_Aggregate_Order_By>;
  submissions_aggregate?: InputMaybe<Form_Submissions_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updater?: InputMaybe<Users_Order_By>;
};

/** primary key columns input for table: forms */
export type Forms_Pk_Columns_Input = {
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Forms_Prepend_Input = {
  /** Branching configuration: { enabled: boolean, threshold: number (rating cutoff), ratingStepId: string | null (step that triggers branching) } */
  branching_config?: InputMaybe<Scalars['jsonb']['input']>;
  /** UI preferences only (theme colors, branding) - NOT business logic. JSONB appropriate here */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "forms" */
export enum Forms_Select_Column {
  /** column name */
  BranchingConfig = 'branching_config',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  ProductDescription = 'product_description',
  /** column name */
  ProductName = 'product_name',
  /** column name */
  Settings = 'settings',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

/** select "forms_aggregate_bool_exp_bool_and_arguments_columns" columns of table "forms" */
export enum Forms_Select_Column_Forms_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "forms_aggregate_bool_exp_bool_or_arguments_columns" columns of table "forms" */
export enum Forms_Select_Column_Forms_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "forms" */
export type Forms_Set_Input = {
  /** Branching configuration: { enabled: boolean, threshold: number (rating cutoff), ratingStepId: string | null (step that triggers branching) } */
  branching_config?: InputMaybe<Scalars['jsonb']['input']>;
  /** Timestamp when form was created. Immutable after insert */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who created this form */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = form disabled, public link returns 404 */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Form display name shown in dashboard (e.g., "Product Feedback Form") */
  name?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for multi-tenancy isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** AI context for question generation - enables "Infer, Don't Ask" philosophy */
  product_description?: InputMaybe<Scalars['String']['input']>;
  /** Name of product being reviewed - used in question templates (e.g., "How did {product} help?") */
  product_name?: InputMaybe<Scalars['String']['input']>;
  /** UI preferences only (theme colors, branding) - NOT business logic. JSONB appropriate here */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
  /** Form lifecycle status: draft (editing), published (public), archived (hidden) */
  status?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "forms" */
export type Forms_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Forms_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Forms_Stream_Cursor_Value_Input = {
  /** Branching configuration: { enabled: boolean, threshold: number (rating cutoff), ratingStepId: string | null (step that triggers branching) } */
  branching_config?: InputMaybe<Scalars['jsonb']['input']>;
  /** Timestamp when form was created. Immutable after insert */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who created this form */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = form disabled, public link returns 404 */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Form display name shown in dashboard (e.g., "Product Feedback Form") */
  name?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for multi-tenancy isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** AI context for question generation - enables "Infer, Don't Ask" philosophy */
  product_description?: InputMaybe<Scalars['String']['input']>;
  /** Name of product being reviewed - used in question templates (e.g., "How did {product} help?") */
  product_name?: InputMaybe<Scalars['String']['input']>;
  /** UI preferences only (theme colors, branding) - NOT business logic. JSONB appropriate here */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
  /** Form lifecycle status: draft (editing), published (public), archived (hidden) */
  status?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp of last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "forms" */
export enum Forms_Update_Column {
  /** column name */
  BranchingConfig = 'branching_config',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  ProductDescription = 'product_description',
  /** column name */
  ProductName = 'product_name',
  /** column name */
  Settings = 'settings',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

export type Forms_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Forms_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Forms_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Forms_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Forms_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Forms_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Forms_Set_Input>;
  /** filter the rows which have to be updated */
  where: Forms_Bool_Exp;
};

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "contacts" */
  delete_contacts?: Maybe<Contacts_Mutation_Response>;
  /** delete single row from the table: "contacts" */
  delete_contacts_by_pk?: Maybe<Contacts>;
  /** delete data from the table: "form_question_responses" */
  delete_form_question_responses?: Maybe<Form_Question_Responses_Mutation_Response>;
  /** delete single row from the table: "form_question_responses" */
  delete_form_question_responses_by_pk?: Maybe<Form_Question_Responses>;
  /** delete data from the table: "form_questions" */
  delete_form_questions?: Maybe<Form_Questions_Mutation_Response>;
  /** delete single row from the table: "form_questions" */
  delete_form_questions_by_pk?: Maybe<Form_Questions>;
  /** delete data from the table: "form_steps" */
  delete_form_steps?: Maybe<Form_Steps_Mutation_Response>;
  /** delete single row from the table: "form_steps" */
  delete_form_steps_by_pk?: Maybe<Form_Steps>;
  /** delete data from the table: "form_submissions" */
  delete_form_submissions?: Maybe<Form_Submissions_Mutation_Response>;
  /** delete single row from the table: "form_submissions" */
  delete_form_submissions_by_pk?: Maybe<Form_Submissions>;
  /** delete data from the table: "forms" */
  delete_forms?: Maybe<Forms_Mutation_Response>;
  /** delete single row from the table: "forms" */
  delete_forms_by_pk?: Maybe<Forms>;
  /** delete data from the table: "organization_plans" */
  delete_organization_plans?: Maybe<Organization_Plans_Mutation_Response>;
  /** delete single row from the table: "organization_plans" */
  delete_organization_plans_by_pk?: Maybe<Organization_Plans>;
  /** delete data from the table: "organization_roles" */
  delete_organization_roles?: Maybe<Organization_Roles_Mutation_Response>;
  /** delete single row from the table: "organization_roles" */
  delete_organization_roles_by_pk?: Maybe<Organization_Roles>;
  /** delete data from the table: "organizations" */
  delete_organizations?: Maybe<Organizations_Mutation_Response>;
  /** delete single row from the table: "organizations" */
  delete_organizations_by_pk?: Maybe<Organizations>;
  /** delete data from the table: "plan_prices" */
  delete_plan_prices?: Maybe<Plan_Prices_Mutation_Response>;
  /** delete single row from the table: "plan_prices" */
  delete_plan_prices_by_pk?: Maybe<Plan_Prices>;
  /** delete data from the table: "plan_question_types" */
  delete_plan_question_types?: Maybe<Plan_Question_Types_Mutation_Response>;
  /** delete single row from the table: "plan_question_types" */
  delete_plan_question_types_by_pk?: Maybe<Plan_Question_Types>;
  /** delete data from the table: "plans" */
  delete_plans?: Maybe<Plans_Mutation_Response>;
  /** delete single row from the table: "plans" */
  delete_plans_by_pk?: Maybe<Plans>;
  /** delete data from the table: "question_options" */
  delete_question_options?: Maybe<Question_Options_Mutation_Response>;
  /** delete single row from the table: "question_options" */
  delete_question_options_by_pk?: Maybe<Question_Options>;
  /** delete data from the table: "question_types" */
  delete_question_types?: Maybe<Question_Types_Mutation_Response>;
  /** delete single row from the table: "question_types" */
  delete_question_types_by_pk?: Maybe<Question_Types>;
  /** delete data from the table: "roles" */
  delete_roles?: Maybe<Roles_Mutation_Response>;
  /** delete single row from the table: "roles" */
  delete_roles_by_pk?: Maybe<Roles>;
  /** delete data from the table: "testimonials" */
  delete_testimonials?: Maybe<Testimonials_Mutation_Response>;
  /** delete single row from the table: "testimonials" */
  delete_testimonials_by_pk?: Maybe<Testimonials>;
  /** delete data from the table: "user_identities" */
  delete_user_identities?: Maybe<User_Identities_Mutation_Response>;
  /** delete single row from the table: "user_identities" */
  delete_user_identities_by_pk?: Maybe<User_Identities>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** delete data from the table: "widget_testimonials" */
  delete_widget_testimonials?: Maybe<Widget_Testimonials_Mutation_Response>;
  /** delete single row from the table: "widget_testimonials" */
  delete_widget_testimonials_by_pk?: Maybe<Widget_Testimonials>;
  /** delete data from the table: "widgets" */
  delete_widgets?: Maybe<Widgets_Mutation_Response>;
  /** delete single row from the table: "widgets" */
  delete_widgets_by_pk?: Maybe<Widgets>;
  /** insert data into the table: "contacts" */
  insert_contacts?: Maybe<Contacts_Mutation_Response>;
  /** insert a single row into the table: "contacts" */
  insert_contacts_one?: Maybe<Contacts>;
  /** insert data into the table: "form_question_responses" */
  insert_form_question_responses?: Maybe<Form_Question_Responses_Mutation_Response>;
  /** insert a single row into the table: "form_question_responses" */
  insert_form_question_responses_one?: Maybe<Form_Question_Responses>;
  /** insert data into the table: "form_questions" */
  insert_form_questions?: Maybe<Form_Questions_Mutation_Response>;
  /** insert a single row into the table: "form_questions" */
  insert_form_questions_one?: Maybe<Form_Questions>;
  /** insert data into the table: "form_steps" */
  insert_form_steps?: Maybe<Form_Steps_Mutation_Response>;
  /** insert a single row into the table: "form_steps" */
  insert_form_steps_one?: Maybe<Form_Steps>;
  /** insert data into the table: "form_submissions" */
  insert_form_submissions?: Maybe<Form_Submissions_Mutation_Response>;
  /** insert a single row into the table: "form_submissions" */
  insert_form_submissions_one?: Maybe<Form_Submissions>;
  /** insert data into the table: "forms" */
  insert_forms?: Maybe<Forms_Mutation_Response>;
  /** insert a single row into the table: "forms" */
  insert_forms_one?: Maybe<Forms>;
  /** insert data into the table: "organization_plans" */
  insert_organization_plans?: Maybe<Organization_Plans_Mutation_Response>;
  /** insert a single row into the table: "organization_plans" */
  insert_organization_plans_one?: Maybe<Organization_Plans>;
  /** insert data into the table: "organization_roles" */
  insert_organization_roles?: Maybe<Organization_Roles_Mutation_Response>;
  /** insert a single row into the table: "organization_roles" */
  insert_organization_roles_one?: Maybe<Organization_Roles>;
  /** insert data into the table: "organizations" */
  insert_organizations?: Maybe<Organizations_Mutation_Response>;
  /** insert a single row into the table: "organizations" */
  insert_organizations_one?: Maybe<Organizations>;
  /** insert data into the table: "plan_prices" */
  insert_plan_prices?: Maybe<Plan_Prices_Mutation_Response>;
  /** insert a single row into the table: "plan_prices" */
  insert_plan_prices_one?: Maybe<Plan_Prices>;
  /** insert data into the table: "plan_question_types" */
  insert_plan_question_types?: Maybe<Plan_Question_Types_Mutation_Response>;
  /** insert a single row into the table: "plan_question_types" */
  insert_plan_question_types_one?: Maybe<Plan_Question_Types>;
  /** insert data into the table: "plans" */
  insert_plans?: Maybe<Plans_Mutation_Response>;
  /** insert a single row into the table: "plans" */
  insert_plans_one?: Maybe<Plans>;
  /** insert data into the table: "question_options" */
  insert_question_options?: Maybe<Question_Options_Mutation_Response>;
  /** insert a single row into the table: "question_options" */
  insert_question_options_one?: Maybe<Question_Options>;
  /** insert data into the table: "question_types" */
  insert_question_types?: Maybe<Question_Types_Mutation_Response>;
  /** insert a single row into the table: "question_types" */
  insert_question_types_one?: Maybe<Question_Types>;
  /** insert data into the table: "roles" */
  insert_roles?: Maybe<Roles_Mutation_Response>;
  /** insert a single row into the table: "roles" */
  insert_roles_one?: Maybe<Roles>;
  /** insert data into the table: "testimonials" */
  insert_testimonials?: Maybe<Testimonials_Mutation_Response>;
  /** insert a single row into the table: "testimonials" */
  insert_testimonials_one?: Maybe<Testimonials>;
  /** insert data into the table: "user_identities" */
  insert_user_identities?: Maybe<User_Identities_Mutation_Response>;
  /** insert a single row into the table: "user_identities" */
  insert_user_identities_one?: Maybe<User_Identities>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<Users_Mutation_Response>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** insert data into the table: "widget_testimonials" */
  insert_widget_testimonials?: Maybe<Widget_Testimonials_Mutation_Response>;
  /** insert a single row into the table: "widget_testimonials" */
  insert_widget_testimonials_one?: Maybe<Widget_Testimonials>;
  /** insert data into the table: "widgets" */
  insert_widgets?: Maybe<Widgets_Mutation_Response>;
  /** insert a single row into the table: "widgets" */
  insert_widgets_one?: Maybe<Widgets>;
  /** update data of the table: "contacts" */
  update_contacts?: Maybe<Contacts_Mutation_Response>;
  /** update single row of the table: "contacts" */
  update_contacts_by_pk?: Maybe<Contacts>;
  /** update multiples rows of table: "contacts" */
  update_contacts_many?: Maybe<Array<Maybe<Contacts_Mutation_Response>>>;
  /** update data of the table: "form_question_responses" */
  update_form_question_responses?: Maybe<Form_Question_Responses_Mutation_Response>;
  /** update single row of the table: "form_question_responses" */
  update_form_question_responses_by_pk?: Maybe<Form_Question_Responses>;
  /** update multiples rows of table: "form_question_responses" */
  update_form_question_responses_many?: Maybe<Array<Maybe<Form_Question_Responses_Mutation_Response>>>;
  /** update data of the table: "form_questions" */
  update_form_questions?: Maybe<Form_Questions_Mutation_Response>;
  /** update single row of the table: "form_questions" */
  update_form_questions_by_pk?: Maybe<Form_Questions>;
  /** update multiples rows of table: "form_questions" */
  update_form_questions_many?: Maybe<Array<Maybe<Form_Questions_Mutation_Response>>>;
  /** update data of the table: "form_steps" */
  update_form_steps?: Maybe<Form_Steps_Mutation_Response>;
  /** update single row of the table: "form_steps" */
  update_form_steps_by_pk?: Maybe<Form_Steps>;
  /** update multiples rows of table: "form_steps" */
  update_form_steps_many?: Maybe<Array<Maybe<Form_Steps_Mutation_Response>>>;
  /** update data of the table: "form_submissions" */
  update_form_submissions?: Maybe<Form_Submissions_Mutation_Response>;
  /** update single row of the table: "form_submissions" */
  update_form_submissions_by_pk?: Maybe<Form_Submissions>;
  /** update multiples rows of table: "form_submissions" */
  update_form_submissions_many?: Maybe<Array<Maybe<Form_Submissions_Mutation_Response>>>;
  /** update data of the table: "forms" */
  update_forms?: Maybe<Forms_Mutation_Response>;
  /** update single row of the table: "forms" */
  update_forms_by_pk?: Maybe<Forms>;
  /** update multiples rows of table: "forms" */
  update_forms_many?: Maybe<Array<Maybe<Forms_Mutation_Response>>>;
  /** update data of the table: "organization_plans" */
  update_organization_plans?: Maybe<Organization_Plans_Mutation_Response>;
  /** update single row of the table: "organization_plans" */
  update_organization_plans_by_pk?: Maybe<Organization_Plans>;
  /** update multiples rows of table: "organization_plans" */
  update_organization_plans_many?: Maybe<Array<Maybe<Organization_Plans_Mutation_Response>>>;
  /** update data of the table: "organization_roles" */
  update_organization_roles?: Maybe<Organization_Roles_Mutation_Response>;
  /** update single row of the table: "organization_roles" */
  update_organization_roles_by_pk?: Maybe<Organization_Roles>;
  /** update multiples rows of table: "organization_roles" */
  update_organization_roles_many?: Maybe<Array<Maybe<Organization_Roles_Mutation_Response>>>;
  /** update data of the table: "organizations" */
  update_organizations?: Maybe<Organizations_Mutation_Response>;
  /** update single row of the table: "organizations" */
  update_organizations_by_pk?: Maybe<Organizations>;
  /** update multiples rows of table: "organizations" */
  update_organizations_many?: Maybe<Array<Maybe<Organizations_Mutation_Response>>>;
  /** update data of the table: "plan_prices" */
  update_plan_prices?: Maybe<Plan_Prices_Mutation_Response>;
  /** update single row of the table: "plan_prices" */
  update_plan_prices_by_pk?: Maybe<Plan_Prices>;
  /** update multiples rows of table: "plan_prices" */
  update_plan_prices_many?: Maybe<Array<Maybe<Plan_Prices_Mutation_Response>>>;
  /** update data of the table: "plan_question_types" */
  update_plan_question_types?: Maybe<Plan_Question_Types_Mutation_Response>;
  /** update single row of the table: "plan_question_types" */
  update_plan_question_types_by_pk?: Maybe<Plan_Question_Types>;
  /** update multiples rows of table: "plan_question_types" */
  update_plan_question_types_many?: Maybe<Array<Maybe<Plan_Question_Types_Mutation_Response>>>;
  /** update data of the table: "plans" */
  update_plans?: Maybe<Plans_Mutation_Response>;
  /** update single row of the table: "plans" */
  update_plans_by_pk?: Maybe<Plans>;
  /** update multiples rows of table: "plans" */
  update_plans_many?: Maybe<Array<Maybe<Plans_Mutation_Response>>>;
  /** update data of the table: "question_options" */
  update_question_options?: Maybe<Question_Options_Mutation_Response>;
  /** update single row of the table: "question_options" */
  update_question_options_by_pk?: Maybe<Question_Options>;
  /** update multiples rows of table: "question_options" */
  update_question_options_many?: Maybe<Array<Maybe<Question_Options_Mutation_Response>>>;
  /** update data of the table: "question_types" */
  update_question_types?: Maybe<Question_Types_Mutation_Response>;
  /** update single row of the table: "question_types" */
  update_question_types_by_pk?: Maybe<Question_Types>;
  /** update multiples rows of table: "question_types" */
  update_question_types_many?: Maybe<Array<Maybe<Question_Types_Mutation_Response>>>;
  /** update data of the table: "roles" */
  update_roles?: Maybe<Roles_Mutation_Response>;
  /** update single row of the table: "roles" */
  update_roles_by_pk?: Maybe<Roles>;
  /** update multiples rows of table: "roles" */
  update_roles_many?: Maybe<Array<Maybe<Roles_Mutation_Response>>>;
  /** update data of the table: "testimonials" */
  update_testimonials?: Maybe<Testimonials_Mutation_Response>;
  /** update single row of the table: "testimonials" */
  update_testimonials_by_pk?: Maybe<Testimonials>;
  /** update multiples rows of table: "testimonials" */
  update_testimonials_many?: Maybe<Array<Maybe<Testimonials_Mutation_Response>>>;
  /** update data of the table: "user_identities" */
  update_user_identities?: Maybe<User_Identities_Mutation_Response>;
  /** update single row of the table: "user_identities" */
  update_user_identities_by_pk?: Maybe<User_Identities>;
  /** update multiples rows of table: "user_identities" */
  update_user_identities_many?: Maybe<Array<Maybe<User_Identities_Mutation_Response>>>;
  /** update data of the table: "users" */
  update_users?: Maybe<Users_Mutation_Response>;
  /** update single row of the table: "users" */
  update_users_by_pk?: Maybe<Users>;
  /** update multiples rows of table: "users" */
  update_users_many?: Maybe<Array<Maybe<Users_Mutation_Response>>>;
  /** update data of the table: "widget_testimonials" */
  update_widget_testimonials?: Maybe<Widget_Testimonials_Mutation_Response>;
  /** update single row of the table: "widget_testimonials" */
  update_widget_testimonials_by_pk?: Maybe<Widget_Testimonials>;
  /** update multiples rows of table: "widget_testimonials" */
  update_widget_testimonials_many?: Maybe<Array<Maybe<Widget_Testimonials_Mutation_Response>>>;
  /** update data of the table: "widgets" */
  update_widgets?: Maybe<Widgets_Mutation_Response>;
  /** update single row of the table: "widgets" */
  update_widgets_by_pk?: Maybe<Widgets>;
  /** update multiples rows of table: "widgets" */
  update_widgets_many?: Maybe<Array<Maybe<Widgets_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_ContactsArgs = {
  where: Contacts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Contacts_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Form_Question_ResponsesArgs = {
  where: Form_Question_Responses_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Form_Question_Responses_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Form_QuestionsArgs = {
  where: Form_Questions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Form_Questions_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Form_StepsArgs = {
  where: Form_Steps_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Form_Steps_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Form_SubmissionsArgs = {
  where: Form_Submissions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Form_Submissions_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_FormsArgs = {
  where: Forms_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Forms_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Organization_PlansArgs = {
  where: Organization_Plans_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Organization_Plans_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Organization_RolesArgs = {
  where: Organization_Roles_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Organization_Roles_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_OrganizationsArgs = {
  where: Organizations_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Organizations_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Plan_PricesArgs = {
  where: Plan_Prices_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Plan_Prices_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Plan_Question_TypesArgs = {
  where: Plan_Question_Types_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Plan_Question_Types_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_PlansArgs = {
  where: Plans_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Plans_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Question_OptionsArgs = {
  where: Question_Options_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Question_Options_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Question_TypesArgs = {
  where: Question_Types_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Question_Types_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_RolesArgs = {
  where: Roles_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Roles_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_TestimonialsArgs = {
  where: Testimonials_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Testimonials_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_User_IdentitiesArgs = {
  where: User_Identities_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Identities_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Widget_TestimonialsArgs = {
  where: Widget_Testimonials_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Widget_Testimonials_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_WidgetsArgs = {
  where: Widgets_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Widgets_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootInsert_ContactsArgs = {
  objects: Array<Contacts_Insert_Input>;
  on_conflict?: InputMaybe<Contacts_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Contacts_OneArgs = {
  object: Contacts_Insert_Input;
  on_conflict?: InputMaybe<Contacts_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Form_Question_ResponsesArgs = {
  objects: Array<Form_Question_Responses_Insert_Input>;
  on_conflict?: InputMaybe<Form_Question_Responses_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Form_Question_Responses_OneArgs = {
  object: Form_Question_Responses_Insert_Input;
  on_conflict?: InputMaybe<Form_Question_Responses_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Form_QuestionsArgs = {
  objects: Array<Form_Questions_Insert_Input>;
  on_conflict?: InputMaybe<Form_Questions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Form_Questions_OneArgs = {
  object: Form_Questions_Insert_Input;
  on_conflict?: InputMaybe<Form_Questions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Form_StepsArgs = {
  objects: Array<Form_Steps_Insert_Input>;
  on_conflict?: InputMaybe<Form_Steps_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Form_Steps_OneArgs = {
  object: Form_Steps_Insert_Input;
  on_conflict?: InputMaybe<Form_Steps_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Form_SubmissionsArgs = {
  objects: Array<Form_Submissions_Insert_Input>;
  on_conflict?: InputMaybe<Form_Submissions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Form_Submissions_OneArgs = {
  object: Form_Submissions_Insert_Input;
  on_conflict?: InputMaybe<Form_Submissions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_FormsArgs = {
  objects: Array<Forms_Insert_Input>;
  on_conflict?: InputMaybe<Forms_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Forms_OneArgs = {
  object: Forms_Insert_Input;
  on_conflict?: InputMaybe<Forms_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Organization_PlansArgs = {
  objects: Array<Organization_Plans_Insert_Input>;
  on_conflict?: InputMaybe<Organization_Plans_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Organization_Plans_OneArgs = {
  object: Organization_Plans_Insert_Input;
  on_conflict?: InputMaybe<Organization_Plans_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Organization_RolesArgs = {
  objects: Array<Organization_Roles_Insert_Input>;
  on_conflict?: InputMaybe<Organization_Roles_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Organization_Roles_OneArgs = {
  object: Organization_Roles_Insert_Input;
  on_conflict?: InputMaybe<Organization_Roles_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_OrganizationsArgs = {
  objects: Array<Organizations_Insert_Input>;
  on_conflict?: InputMaybe<Organizations_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Organizations_OneArgs = {
  object: Organizations_Insert_Input;
  on_conflict?: InputMaybe<Organizations_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Plan_PricesArgs = {
  objects: Array<Plan_Prices_Insert_Input>;
  on_conflict?: InputMaybe<Plan_Prices_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Plan_Prices_OneArgs = {
  object: Plan_Prices_Insert_Input;
  on_conflict?: InputMaybe<Plan_Prices_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Plan_Question_TypesArgs = {
  objects: Array<Plan_Question_Types_Insert_Input>;
  on_conflict?: InputMaybe<Plan_Question_Types_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Plan_Question_Types_OneArgs = {
  object: Plan_Question_Types_Insert_Input;
  on_conflict?: InputMaybe<Plan_Question_Types_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_PlansArgs = {
  objects: Array<Plans_Insert_Input>;
  on_conflict?: InputMaybe<Plans_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Plans_OneArgs = {
  object: Plans_Insert_Input;
  on_conflict?: InputMaybe<Plans_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Question_OptionsArgs = {
  objects: Array<Question_Options_Insert_Input>;
  on_conflict?: InputMaybe<Question_Options_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Question_Options_OneArgs = {
  object: Question_Options_Insert_Input;
  on_conflict?: InputMaybe<Question_Options_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Question_TypesArgs = {
  objects: Array<Question_Types_Insert_Input>;
  on_conflict?: InputMaybe<Question_Types_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Question_Types_OneArgs = {
  object: Question_Types_Insert_Input;
  on_conflict?: InputMaybe<Question_Types_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_RolesArgs = {
  objects: Array<Roles_Insert_Input>;
  on_conflict?: InputMaybe<Roles_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Roles_OneArgs = {
  object: Roles_Insert_Input;
  on_conflict?: InputMaybe<Roles_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_TestimonialsArgs = {
  objects: Array<Testimonials_Insert_Input>;
  on_conflict?: InputMaybe<Testimonials_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Testimonials_OneArgs = {
  object: Testimonials_Insert_Input;
  on_conflict?: InputMaybe<Testimonials_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_IdentitiesArgs = {
  objects: Array<User_Identities_Insert_Input>;
  on_conflict?: InputMaybe<User_Identities_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Identities_OneArgs = {
  object: User_Identities_Insert_Input;
  on_conflict?: InputMaybe<User_Identities_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_OneArgs = {
  object: Users_Insert_Input;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Widget_TestimonialsArgs = {
  objects: Array<Widget_Testimonials_Insert_Input>;
  on_conflict?: InputMaybe<Widget_Testimonials_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Widget_Testimonials_OneArgs = {
  object: Widget_Testimonials_Insert_Input;
  on_conflict?: InputMaybe<Widget_Testimonials_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_WidgetsArgs = {
  objects: Array<Widgets_Insert_Input>;
  on_conflict?: InputMaybe<Widgets_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Widgets_OneArgs = {
  object: Widgets_Insert_Input;
  on_conflict?: InputMaybe<Widgets_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_ContactsArgs = {
  _inc?: InputMaybe<Contacts_Inc_Input>;
  _set?: InputMaybe<Contacts_Set_Input>;
  where: Contacts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Contacts_By_PkArgs = {
  _inc?: InputMaybe<Contacts_Inc_Input>;
  _set?: InputMaybe<Contacts_Set_Input>;
  pk_columns: Contacts_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Contacts_ManyArgs = {
  updates: Array<Contacts_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Form_Question_ResponsesArgs = {
  _append?: InputMaybe<Form_Question_Responses_Append_Input>;
  _delete_at_path?: InputMaybe<Form_Question_Responses_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Form_Question_Responses_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Form_Question_Responses_Delete_Key_Input>;
  _inc?: InputMaybe<Form_Question_Responses_Inc_Input>;
  _prepend?: InputMaybe<Form_Question_Responses_Prepend_Input>;
  _set?: InputMaybe<Form_Question_Responses_Set_Input>;
  where: Form_Question_Responses_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Form_Question_Responses_By_PkArgs = {
  _append?: InputMaybe<Form_Question_Responses_Append_Input>;
  _delete_at_path?: InputMaybe<Form_Question_Responses_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Form_Question_Responses_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Form_Question_Responses_Delete_Key_Input>;
  _inc?: InputMaybe<Form_Question_Responses_Inc_Input>;
  _prepend?: InputMaybe<Form_Question_Responses_Prepend_Input>;
  _set?: InputMaybe<Form_Question_Responses_Set_Input>;
  pk_columns: Form_Question_Responses_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Form_Question_Responses_ManyArgs = {
  updates: Array<Form_Question_Responses_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Form_QuestionsArgs = {
  _inc?: InputMaybe<Form_Questions_Inc_Input>;
  _set?: InputMaybe<Form_Questions_Set_Input>;
  where: Form_Questions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Form_Questions_By_PkArgs = {
  _inc?: InputMaybe<Form_Questions_Inc_Input>;
  _set?: InputMaybe<Form_Questions_Set_Input>;
  pk_columns: Form_Questions_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Form_Questions_ManyArgs = {
  updates: Array<Form_Questions_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Form_StepsArgs = {
  _append?: InputMaybe<Form_Steps_Append_Input>;
  _delete_at_path?: InputMaybe<Form_Steps_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Form_Steps_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Form_Steps_Delete_Key_Input>;
  _inc?: InputMaybe<Form_Steps_Inc_Input>;
  _prepend?: InputMaybe<Form_Steps_Prepend_Input>;
  _set?: InputMaybe<Form_Steps_Set_Input>;
  where: Form_Steps_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Form_Steps_By_PkArgs = {
  _append?: InputMaybe<Form_Steps_Append_Input>;
  _delete_at_path?: InputMaybe<Form_Steps_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Form_Steps_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Form_Steps_Delete_Key_Input>;
  _inc?: InputMaybe<Form_Steps_Inc_Input>;
  _prepend?: InputMaybe<Form_Steps_Prepend_Input>;
  _set?: InputMaybe<Form_Steps_Set_Input>;
  pk_columns: Form_Steps_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Form_Steps_ManyArgs = {
  updates: Array<Form_Steps_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Form_SubmissionsArgs = {
  _set?: InputMaybe<Form_Submissions_Set_Input>;
  where: Form_Submissions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Form_Submissions_By_PkArgs = {
  _set?: InputMaybe<Form_Submissions_Set_Input>;
  pk_columns: Form_Submissions_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Form_Submissions_ManyArgs = {
  updates: Array<Form_Submissions_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_FormsArgs = {
  _append?: InputMaybe<Forms_Append_Input>;
  _delete_at_path?: InputMaybe<Forms_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Forms_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Forms_Delete_Key_Input>;
  _prepend?: InputMaybe<Forms_Prepend_Input>;
  _set?: InputMaybe<Forms_Set_Input>;
  where: Forms_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Forms_By_PkArgs = {
  _append?: InputMaybe<Forms_Append_Input>;
  _delete_at_path?: InputMaybe<Forms_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Forms_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Forms_Delete_Key_Input>;
  _prepend?: InputMaybe<Forms_Prepend_Input>;
  _set?: InputMaybe<Forms_Set_Input>;
  pk_columns: Forms_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Forms_ManyArgs = {
  updates: Array<Forms_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Organization_PlansArgs = {
  _inc?: InputMaybe<Organization_Plans_Inc_Input>;
  _set?: InputMaybe<Organization_Plans_Set_Input>;
  where: Organization_Plans_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Organization_Plans_By_PkArgs = {
  _inc?: InputMaybe<Organization_Plans_Inc_Input>;
  _set?: InputMaybe<Organization_Plans_Set_Input>;
  pk_columns: Organization_Plans_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Organization_Plans_ManyArgs = {
  updates: Array<Organization_Plans_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Organization_RolesArgs = {
  _set?: InputMaybe<Organization_Roles_Set_Input>;
  where: Organization_Roles_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Organization_Roles_By_PkArgs = {
  _set?: InputMaybe<Organization_Roles_Set_Input>;
  pk_columns: Organization_Roles_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Organization_Roles_ManyArgs = {
  updates: Array<Organization_Roles_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_OrganizationsArgs = {
  _append?: InputMaybe<Organizations_Append_Input>;
  _delete_at_path?: InputMaybe<Organizations_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Organizations_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Organizations_Delete_Key_Input>;
  _prepend?: InputMaybe<Organizations_Prepend_Input>;
  _set?: InputMaybe<Organizations_Set_Input>;
  where: Organizations_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Organizations_By_PkArgs = {
  _append?: InputMaybe<Organizations_Append_Input>;
  _delete_at_path?: InputMaybe<Organizations_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Organizations_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Organizations_Delete_Key_Input>;
  _prepend?: InputMaybe<Organizations_Prepend_Input>;
  _set?: InputMaybe<Organizations_Set_Input>;
  pk_columns: Organizations_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Organizations_ManyArgs = {
  updates: Array<Organizations_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Plan_PricesArgs = {
  _inc?: InputMaybe<Plan_Prices_Inc_Input>;
  _set?: InputMaybe<Plan_Prices_Set_Input>;
  where: Plan_Prices_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Plan_Prices_By_PkArgs = {
  _inc?: InputMaybe<Plan_Prices_Inc_Input>;
  _set?: InputMaybe<Plan_Prices_Set_Input>;
  pk_columns: Plan_Prices_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Plan_Prices_ManyArgs = {
  updates: Array<Plan_Prices_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Plan_Question_TypesArgs = {
  _set?: InputMaybe<Plan_Question_Types_Set_Input>;
  where: Plan_Question_Types_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Plan_Question_Types_By_PkArgs = {
  _set?: InputMaybe<Plan_Question_Types_Set_Input>;
  pk_columns: Plan_Question_Types_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Plan_Question_Types_ManyArgs = {
  updates: Array<Plan_Question_Types_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_PlansArgs = {
  _inc?: InputMaybe<Plans_Inc_Input>;
  _set?: InputMaybe<Plans_Set_Input>;
  where: Plans_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Plans_By_PkArgs = {
  _inc?: InputMaybe<Plans_Inc_Input>;
  _set?: InputMaybe<Plans_Set_Input>;
  pk_columns: Plans_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Plans_ManyArgs = {
  updates: Array<Plans_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Question_OptionsArgs = {
  _inc?: InputMaybe<Question_Options_Inc_Input>;
  _set?: InputMaybe<Question_Options_Set_Input>;
  where: Question_Options_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Question_Options_By_PkArgs = {
  _inc?: InputMaybe<Question_Options_Inc_Input>;
  _set?: InputMaybe<Question_Options_Set_Input>;
  pk_columns: Question_Options_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Question_Options_ManyArgs = {
  updates: Array<Question_Options_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Question_TypesArgs = {
  _inc?: InputMaybe<Question_Types_Inc_Input>;
  _set?: InputMaybe<Question_Types_Set_Input>;
  where: Question_Types_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Question_Types_By_PkArgs = {
  _inc?: InputMaybe<Question_Types_Inc_Input>;
  _set?: InputMaybe<Question_Types_Set_Input>;
  pk_columns: Question_Types_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Question_Types_ManyArgs = {
  updates: Array<Question_Types_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_RolesArgs = {
  _set?: InputMaybe<Roles_Set_Input>;
  where: Roles_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Roles_By_PkArgs = {
  _set?: InputMaybe<Roles_Set_Input>;
  pk_columns: Roles_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Roles_ManyArgs = {
  updates: Array<Roles_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_TestimonialsArgs = {
  _append?: InputMaybe<Testimonials_Append_Input>;
  _delete_at_path?: InputMaybe<Testimonials_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Testimonials_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Testimonials_Delete_Key_Input>;
  _inc?: InputMaybe<Testimonials_Inc_Input>;
  _prepend?: InputMaybe<Testimonials_Prepend_Input>;
  _set?: InputMaybe<Testimonials_Set_Input>;
  where: Testimonials_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Testimonials_By_PkArgs = {
  _append?: InputMaybe<Testimonials_Append_Input>;
  _delete_at_path?: InputMaybe<Testimonials_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Testimonials_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Testimonials_Delete_Key_Input>;
  _inc?: InputMaybe<Testimonials_Inc_Input>;
  _prepend?: InputMaybe<Testimonials_Prepend_Input>;
  _set?: InputMaybe<Testimonials_Set_Input>;
  pk_columns: Testimonials_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Testimonials_ManyArgs = {
  updates: Array<Testimonials_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_IdentitiesArgs = {
  _append?: InputMaybe<User_Identities_Append_Input>;
  _delete_at_path?: InputMaybe<User_Identities_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<User_Identities_Delete_Elem_Input>;
  _delete_key?: InputMaybe<User_Identities_Delete_Key_Input>;
  _prepend?: InputMaybe<User_Identities_Prepend_Input>;
  _set?: InputMaybe<User_Identities_Set_Input>;
  where: User_Identities_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Identities_By_PkArgs = {
  _append?: InputMaybe<User_Identities_Append_Input>;
  _delete_at_path?: InputMaybe<User_Identities_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<User_Identities_Delete_Elem_Input>;
  _delete_key?: InputMaybe<User_Identities_Delete_Key_Input>;
  _prepend?: InputMaybe<User_Identities_Prepend_Input>;
  _set?: InputMaybe<User_Identities_Set_Input>;
  pk_columns: User_Identities_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Identities_ManyArgs = {
  updates: Array<User_Identities_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_UsersArgs = {
  _set?: InputMaybe<Users_Set_Input>;
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Users_By_PkArgs = {
  _set?: InputMaybe<Users_Set_Input>;
  pk_columns: Users_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Users_ManyArgs = {
  updates: Array<Users_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Widget_TestimonialsArgs = {
  _inc?: InputMaybe<Widget_Testimonials_Inc_Input>;
  _set?: InputMaybe<Widget_Testimonials_Set_Input>;
  where: Widget_Testimonials_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Widget_Testimonials_By_PkArgs = {
  _inc?: InputMaybe<Widget_Testimonials_Inc_Input>;
  _set?: InputMaybe<Widget_Testimonials_Set_Input>;
  pk_columns: Widget_Testimonials_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Widget_Testimonials_ManyArgs = {
  updates: Array<Widget_Testimonials_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_WidgetsArgs = {
  _append?: InputMaybe<Widgets_Append_Input>;
  _delete_at_path?: InputMaybe<Widgets_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Widgets_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Widgets_Delete_Key_Input>;
  _inc?: InputMaybe<Widgets_Inc_Input>;
  _prepend?: InputMaybe<Widgets_Prepend_Input>;
  _set?: InputMaybe<Widgets_Set_Input>;
  where: Widgets_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Widgets_By_PkArgs = {
  _append?: InputMaybe<Widgets_Append_Input>;
  _delete_at_path?: InputMaybe<Widgets_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Widgets_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Widgets_Delete_Key_Input>;
  _inc?: InputMaybe<Widgets_Inc_Input>;
  _prepend?: InputMaybe<Widgets_Prepend_Input>;
  _set?: InputMaybe<Widgets_Set_Input>;
  pk_columns: Widgets_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Widgets_ManyArgs = {
  updates: Array<Widgets_Updates>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

/** Subscription records - plan values copied at subscription time */
export type Organization_Plans = {
  __typename?: 'organization_plans';
  /** Billing frequency: monthly, yearly, lifetime */
  billing_cycle: Scalars['String']['output'];
  /** When subscription was cancelled (NULL if active) */
  cancelled_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Timestamp when record was created */
  created_at: Scalars['timestamptz']['output'];
  /** ISO 4217 currency code for this subscription */
  currency_code: Scalars['String']['output'];
  /** When current billing period ends (NULL for lifetime) */
  current_period_ends_at?: Maybe<Scalars['timestamptz']['output']>;
  /** True if any limits differ from original plan template */
  has_overrides: Scalars['Boolean']['output'];
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['output'];
  /** Form limit copied from plan (may be overridden) */
  max_forms: Scalars['Int']['output'];
  /** Member limit copied from plan (may be overridden) */
  max_members: Scalars['Int']['output'];
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials: Scalars['Int']['output'];
  /** Widget limit copied from plan (may be overridden) */
  max_widgets: Scalars['Int']['output'];
  /** An object relationship */
  organization: Organizations;
  /** Organization this subscription belongs to */
  organization_id: Scalars['String']['output'];
  /** When overrides were applied */
  overridden_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who applied the overrides */
  overridden_by?: Maybe<Scalars['String']['output']>;
  /** Audit trail: explanation for why overrides were applied */
  override_reason?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  override_user?: Maybe<Users>;
  /** An object relationship */
  plan: Plans;
  /** Reference to original plan template for analytics/reporting */
  plan_id: Scalars['String']['output'];
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit: Scalars['Int']['output'];
  /** Branding setting copied from plan (may be overridden) */
  show_branding: Scalars['Boolean']['output'];
  /** When subscription started */
  starts_at: Scalars['timestamptz']['output'];
  /** Subscription status: trial, active, cancelled, expired */
  status: Scalars['String']['output'];
  /** When trial period ends (NULL if not on trial) */
  trial_ends_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Timestamp when record was last updated */
  updated_at: Scalars['timestamptz']['output'];
};

/** aggregated selection of "organization_plans" */
export type Organization_Plans_Aggregate = {
  __typename?: 'organization_plans_aggregate';
  aggregate?: Maybe<Organization_Plans_Aggregate_Fields>;
  nodes: Array<Organization_Plans>;
};

export type Organization_Plans_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Organization_Plans_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Organization_Plans_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Organization_Plans_Aggregate_Bool_Exp_Count>;
};

export type Organization_Plans_Aggregate_Bool_Exp_Bool_And = {
  arguments: Organization_Plans_Select_Column_Organization_Plans_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Organization_Plans_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Organization_Plans_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Organization_Plans_Select_Column_Organization_Plans_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Organization_Plans_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Organization_Plans_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Organization_Plans_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Organization_Plans_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "organization_plans" */
export type Organization_Plans_Aggregate_Fields = {
  __typename?: 'organization_plans_aggregate_fields';
  avg?: Maybe<Organization_Plans_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Organization_Plans_Max_Fields>;
  min?: Maybe<Organization_Plans_Min_Fields>;
  stddev?: Maybe<Organization_Plans_Stddev_Fields>;
  stddev_pop?: Maybe<Organization_Plans_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Organization_Plans_Stddev_Samp_Fields>;
  sum?: Maybe<Organization_Plans_Sum_Fields>;
  var_pop?: Maybe<Organization_Plans_Var_Pop_Fields>;
  var_samp?: Maybe<Organization_Plans_Var_Samp_Fields>;
  variance?: Maybe<Organization_Plans_Variance_Fields>;
};


/** aggregate fields of "organization_plans" */
export type Organization_Plans_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Organization_Plans_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "organization_plans" */
export type Organization_Plans_Aggregate_Order_By = {
  avg?: InputMaybe<Organization_Plans_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Organization_Plans_Max_Order_By>;
  min?: InputMaybe<Organization_Plans_Min_Order_By>;
  stddev?: InputMaybe<Organization_Plans_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Organization_Plans_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Organization_Plans_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Organization_Plans_Sum_Order_By>;
  var_pop?: InputMaybe<Organization_Plans_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Organization_Plans_Var_Samp_Order_By>;
  variance?: InputMaybe<Organization_Plans_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "organization_plans" */
export type Organization_Plans_Arr_Rel_Insert_Input = {
  data: Array<Organization_Plans_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Organization_Plans_On_Conflict>;
};

/** aggregate avg on columns */
export type Organization_Plans_Avg_Fields = {
  __typename?: 'organization_plans_avg_fields';
  /** Form limit copied from plan (may be overridden) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "organization_plans" */
export type Organization_Plans_Avg_Order_By = {
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Order_By>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Order_By>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Order_By>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Order_By>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "organization_plans". All fields are combined with a logical 'AND'. */
export type Organization_Plans_Bool_Exp = {
  _and?: InputMaybe<Array<Organization_Plans_Bool_Exp>>;
  _not?: InputMaybe<Organization_Plans_Bool_Exp>;
  _or?: InputMaybe<Array<Organization_Plans_Bool_Exp>>;
  billing_cycle?: InputMaybe<String_Comparison_Exp>;
  cancelled_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  currency_code?: InputMaybe<String_Comparison_Exp>;
  current_period_ends_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  has_overrides?: InputMaybe<Boolean_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  max_forms?: InputMaybe<Int_Comparison_Exp>;
  max_members?: InputMaybe<Int_Comparison_Exp>;
  max_testimonials?: InputMaybe<Int_Comparison_Exp>;
  max_widgets?: InputMaybe<Int_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  overridden_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  overridden_by?: InputMaybe<String_Comparison_Exp>;
  override_reason?: InputMaybe<String_Comparison_Exp>;
  override_user?: InputMaybe<Users_Bool_Exp>;
  plan?: InputMaybe<Plans_Bool_Exp>;
  plan_id?: InputMaybe<String_Comparison_Exp>;
  price_in_base_unit?: InputMaybe<Int_Comparison_Exp>;
  show_branding?: InputMaybe<Boolean_Comparison_Exp>;
  starts_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  trial_ends_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "organization_plans" */
export enum Organization_Plans_Constraint {
  /** unique or primary key constraint on columns "organization_id" */
  IdxOrgPlansActive = 'idx_org_plans_active',
  /** unique or primary key constraint on columns "id" */
  OrganizationPlansPkey = 'organization_plans_pkey'
}

/** input type for incrementing numeric columns in table "organization_plans" */
export type Organization_Plans_Inc_Input = {
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Scalars['Int']['input']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Scalars['Int']['input']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Scalars['Int']['input']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Scalars['Int']['input']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "organization_plans" */
export type Organization_Plans_Insert_Input = {
  /** Billing frequency: monthly, yearly, lifetime */
  billing_cycle?: InputMaybe<Scalars['String']['input']>;
  /** When subscription was cancelled (NULL if active) */
  cancelled_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** ISO 4217 currency code for this subscription */
  currency_code?: InputMaybe<Scalars['String']['input']>;
  /** When current billing period ends (NULL for lifetime) */
  current_period_ends_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** True if any limits differ from original plan template */
  has_overrides?: InputMaybe<Scalars['Boolean']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Scalars['Int']['input']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Scalars['Int']['input']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Scalars['Int']['input']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Scalars['Int']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** Organization this subscription belongs to */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** When overrides were applied */
  overridden_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who applied the overrides */
  overridden_by?: InputMaybe<Scalars['String']['input']>;
  /** Audit trail: explanation for why overrides were applied */
  override_reason?: InputMaybe<Scalars['String']['input']>;
  override_user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  plan?: InputMaybe<Plans_Obj_Rel_Insert_Input>;
  /** Reference to original plan template for analytics/reporting */
  plan_id?: InputMaybe<Scalars['String']['input']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Branding setting copied from plan (may be overridden) */
  show_branding?: InputMaybe<Scalars['Boolean']['input']>;
  /** When subscription started */
  starts_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Subscription status: trial, active, cancelled, expired */
  status?: InputMaybe<Scalars['String']['input']>;
  /** When trial period ends (NULL if not on trial) */
  trial_ends_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Organization_Plans_Max_Fields = {
  __typename?: 'organization_plans_max_fields';
  /** Billing frequency: monthly, yearly, lifetime */
  billing_cycle?: Maybe<Scalars['String']['output']>;
  /** When subscription was cancelled (NULL if active) */
  cancelled_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** ISO 4217 currency code for this subscription */
  currency_code?: Maybe<Scalars['String']['output']>;
  /** When current billing period ends (NULL for lifetime) */
  current_period_ends_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Form limit copied from plan (may be overridden) */
  max_forms?: Maybe<Scalars['Int']['output']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: Maybe<Scalars['Int']['output']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: Maybe<Scalars['Int']['output']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: Maybe<Scalars['Int']['output']>;
  /** Organization this subscription belongs to */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** When overrides were applied */
  overridden_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who applied the overrides */
  overridden_by?: Maybe<Scalars['String']['output']>;
  /** Audit trail: explanation for why overrides were applied */
  override_reason?: Maybe<Scalars['String']['output']>;
  /** Reference to original plan template for analytics/reporting */
  plan_id?: Maybe<Scalars['String']['output']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: Maybe<Scalars['Int']['output']>;
  /** When subscription started */
  starts_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Subscription status: trial, active, cancelled, expired */
  status?: Maybe<Scalars['String']['output']>;
  /** When trial period ends (NULL if not on trial) */
  trial_ends_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "organization_plans" */
export type Organization_Plans_Max_Order_By = {
  /** Billing frequency: monthly, yearly, lifetime */
  billing_cycle?: InputMaybe<Order_By>;
  /** When subscription was cancelled (NULL if active) */
  cancelled_at?: InputMaybe<Order_By>;
  /** Timestamp when record was created */
  created_at?: InputMaybe<Order_By>;
  /** ISO 4217 currency code for this subscription */
  currency_code?: InputMaybe<Order_By>;
  /** When current billing period ends (NULL for lifetime) */
  current_period_ends_at?: InputMaybe<Order_By>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Order_By>;
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Order_By>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Order_By>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Order_By>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Order_By>;
  /** Organization this subscription belongs to */
  organization_id?: InputMaybe<Order_By>;
  /** When overrides were applied */
  overridden_at?: InputMaybe<Order_By>;
  /** User who applied the overrides */
  overridden_by?: InputMaybe<Order_By>;
  /** Audit trail: explanation for why overrides were applied */
  override_reason?: InputMaybe<Order_By>;
  /** Reference to original plan template for analytics/reporting */
  plan_id?: InputMaybe<Order_By>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Order_By>;
  /** When subscription started */
  starts_at?: InputMaybe<Order_By>;
  /** Subscription status: trial, active, cancelled, expired */
  status?: InputMaybe<Order_By>;
  /** When trial period ends (NULL if not on trial) */
  trial_ends_at?: InputMaybe<Order_By>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Organization_Plans_Min_Fields = {
  __typename?: 'organization_plans_min_fields';
  /** Billing frequency: monthly, yearly, lifetime */
  billing_cycle?: Maybe<Scalars['String']['output']>;
  /** When subscription was cancelled (NULL if active) */
  cancelled_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** ISO 4217 currency code for this subscription */
  currency_code?: Maybe<Scalars['String']['output']>;
  /** When current billing period ends (NULL for lifetime) */
  current_period_ends_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Form limit copied from plan (may be overridden) */
  max_forms?: Maybe<Scalars['Int']['output']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: Maybe<Scalars['Int']['output']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: Maybe<Scalars['Int']['output']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: Maybe<Scalars['Int']['output']>;
  /** Organization this subscription belongs to */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** When overrides were applied */
  overridden_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who applied the overrides */
  overridden_by?: Maybe<Scalars['String']['output']>;
  /** Audit trail: explanation for why overrides were applied */
  override_reason?: Maybe<Scalars['String']['output']>;
  /** Reference to original plan template for analytics/reporting */
  plan_id?: Maybe<Scalars['String']['output']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: Maybe<Scalars['Int']['output']>;
  /** When subscription started */
  starts_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Subscription status: trial, active, cancelled, expired */
  status?: Maybe<Scalars['String']['output']>;
  /** When trial period ends (NULL if not on trial) */
  trial_ends_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "organization_plans" */
export type Organization_Plans_Min_Order_By = {
  /** Billing frequency: monthly, yearly, lifetime */
  billing_cycle?: InputMaybe<Order_By>;
  /** When subscription was cancelled (NULL if active) */
  cancelled_at?: InputMaybe<Order_By>;
  /** Timestamp when record was created */
  created_at?: InputMaybe<Order_By>;
  /** ISO 4217 currency code for this subscription */
  currency_code?: InputMaybe<Order_By>;
  /** When current billing period ends (NULL for lifetime) */
  current_period_ends_at?: InputMaybe<Order_By>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Order_By>;
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Order_By>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Order_By>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Order_By>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Order_By>;
  /** Organization this subscription belongs to */
  organization_id?: InputMaybe<Order_By>;
  /** When overrides were applied */
  overridden_at?: InputMaybe<Order_By>;
  /** User who applied the overrides */
  overridden_by?: InputMaybe<Order_By>;
  /** Audit trail: explanation for why overrides were applied */
  override_reason?: InputMaybe<Order_By>;
  /** Reference to original plan template for analytics/reporting */
  plan_id?: InputMaybe<Order_By>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Order_By>;
  /** When subscription started */
  starts_at?: InputMaybe<Order_By>;
  /** Subscription status: trial, active, cancelled, expired */
  status?: InputMaybe<Order_By>;
  /** When trial period ends (NULL if not on trial) */
  trial_ends_at?: InputMaybe<Order_By>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "organization_plans" */
export type Organization_Plans_Mutation_Response = {
  __typename?: 'organization_plans_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Organization_Plans>;
};

/** on_conflict condition type for table "organization_plans" */
export type Organization_Plans_On_Conflict = {
  constraint: Organization_Plans_Constraint;
  update_columns?: Array<Organization_Plans_Update_Column>;
  where?: InputMaybe<Organization_Plans_Bool_Exp>;
};

/** Ordering options when selecting data from "organization_plans". */
export type Organization_Plans_Order_By = {
  billing_cycle?: InputMaybe<Order_By>;
  cancelled_at?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  currency_code?: InputMaybe<Order_By>;
  current_period_ends_at?: InputMaybe<Order_By>;
  has_overrides?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  max_forms?: InputMaybe<Order_By>;
  max_members?: InputMaybe<Order_By>;
  max_testimonials?: InputMaybe<Order_By>;
  max_widgets?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  overridden_at?: InputMaybe<Order_By>;
  overridden_by?: InputMaybe<Order_By>;
  override_reason?: InputMaybe<Order_By>;
  override_user?: InputMaybe<Users_Order_By>;
  plan?: InputMaybe<Plans_Order_By>;
  plan_id?: InputMaybe<Order_By>;
  price_in_base_unit?: InputMaybe<Order_By>;
  show_branding?: InputMaybe<Order_By>;
  starts_at?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  trial_ends_at?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: organization_plans */
export type Organization_Plans_Pk_Columns_Input = {
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['input'];
};

/** select columns of table "organization_plans" */
export enum Organization_Plans_Select_Column {
  /** column name */
  BillingCycle = 'billing_cycle',
  /** column name */
  CancelledAt = 'cancelled_at',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CurrencyCode = 'currency_code',
  /** column name */
  CurrentPeriodEndsAt = 'current_period_ends_at',
  /** column name */
  HasOverrides = 'has_overrides',
  /** column name */
  Id = 'id',
  /** column name */
  MaxForms = 'max_forms',
  /** column name */
  MaxMembers = 'max_members',
  /** column name */
  MaxTestimonials = 'max_testimonials',
  /** column name */
  MaxWidgets = 'max_widgets',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  OverriddenAt = 'overridden_at',
  /** column name */
  OverriddenBy = 'overridden_by',
  /** column name */
  OverrideReason = 'override_reason',
  /** column name */
  PlanId = 'plan_id',
  /** column name */
  PriceInBaseUnit = 'price_in_base_unit',
  /** column name */
  ShowBranding = 'show_branding',
  /** column name */
  StartsAt = 'starts_at',
  /** column name */
  Status = 'status',
  /** column name */
  TrialEndsAt = 'trial_ends_at',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "organization_plans_aggregate_bool_exp_bool_and_arguments_columns" columns of table "organization_plans" */
export enum Organization_Plans_Select_Column_Organization_Plans_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  HasOverrides = 'has_overrides',
  /** column name */
  ShowBranding = 'show_branding'
}

/** select "organization_plans_aggregate_bool_exp_bool_or_arguments_columns" columns of table "organization_plans" */
export enum Organization_Plans_Select_Column_Organization_Plans_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  HasOverrides = 'has_overrides',
  /** column name */
  ShowBranding = 'show_branding'
}

/** input type for updating data in table "organization_plans" */
export type Organization_Plans_Set_Input = {
  /** Billing frequency: monthly, yearly, lifetime */
  billing_cycle?: InputMaybe<Scalars['String']['input']>;
  /** When subscription was cancelled (NULL if active) */
  cancelled_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** ISO 4217 currency code for this subscription */
  currency_code?: InputMaybe<Scalars['String']['input']>;
  /** When current billing period ends (NULL for lifetime) */
  current_period_ends_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** True if any limits differ from original plan template */
  has_overrides?: InputMaybe<Scalars['Boolean']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Scalars['Int']['input']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Scalars['Int']['input']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Scalars['Int']['input']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Scalars['Int']['input']>;
  /** Organization this subscription belongs to */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** When overrides were applied */
  overridden_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who applied the overrides */
  overridden_by?: InputMaybe<Scalars['String']['input']>;
  /** Audit trail: explanation for why overrides were applied */
  override_reason?: InputMaybe<Scalars['String']['input']>;
  /** Reference to original plan template for analytics/reporting */
  plan_id?: InputMaybe<Scalars['String']['input']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Branding setting copied from plan (may be overridden) */
  show_branding?: InputMaybe<Scalars['Boolean']['input']>;
  /** When subscription started */
  starts_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Subscription status: trial, active, cancelled, expired */
  status?: InputMaybe<Scalars['String']['input']>;
  /** When trial period ends (NULL if not on trial) */
  trial_ends_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Organization_Plans_Stddev_Fields = {
  __typename?: 'organization_plans_stddev_fields';
  /** Form limit copied from plan (may be overridden) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "organization_plans" */
export type Organization_Plans_Stddev_Order_By = {
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Order_By>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Order_By>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Order_By>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Order_By>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Organization_Plans_Stddev_Pop_Fields = {
  __typename?: 'organization_plans_stddev_pop_fields';
  /** Form limit copied from plan (may be overridden) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "organization_plans" */
export type Organization_Plans_Stddev_Pop_Order_By = {
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Order_By>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Order_By>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Order_By>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Order_By>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Organization_Plans_Stddev_Samp_Fields = {
  __typename?: 'organization_plans_stddev_samp_fields';
  /** Form limit copied from plan (may be overridden) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "organization_plans" */
export type Organization_Plans_Stddev_Samp_Order_By = {
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Order_By>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Order_By>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Order_By>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Order_By>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "organization_plans" */
export type Organization_Plans_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Organization_Plans_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Organization_Plans_Stream_Cursor_Value_Input = {
  /** Billing frequency: monthly, yearly, lifetime */
  billing_cycle?: InputMaybe<Scalars['String']['input']>;
  /** When subscription was cancelled (NULL if active) */
  cancelled_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** ISO 4217 currency code for this subscription */
  currency_code?: InputMaybe<Scalars['String']['input']>;
  /** When current billing period ends (NULL for lifetime) */
  current_period_ends_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** True if any limits differ from original plan template */
  has_overrides?: InputMaybe<Scalars['Boolean']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Scalars['Int']['input']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Scalars['Int']['input']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Scalars['Int']['input']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Scalars['Int']['input']>;
  /** Organization this subscription belongs to */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** When overrides were applied */
  overridden_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who applied the overrides */
  overridden_by?: InputMaybe<Scalars['String']['input']>;
  /** Audit trail: explanation for why overrides were applied */
  override_reason?: InputMaybe<Scalars['String']['input']>;
  /** Reference to original plan template for analytics/reporting */
  plan_id?: InputMaybe<Scalars['String']['input']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Branding setting copied from plan (may be overridden) */
  show_branding?: InputMaybe<Scalars['Boolean']['input']>;
  /** When subscription started */
  starts_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Subscription status: trial, active, cancelled, expired */
  status?: InputMaybe<Scalars['String']['input']>;
  /** When trial period ends (NULL if not on trial) */
  trial_ends_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Organization_Plans_Sum_Fields = {
  __typename?: 'organization_plans_sum_fields';
  /** Form limit copied from plan (may be overridden) */
  max_forms?: Maybe<Scalars['Int']['output']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: Maybe<Scalars['Int']['output']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: Maybe<Scalars['Int']['output']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: Maybe<Scalars['Int']['output']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "organization_plans" */
export type Organization_Plans_Sum_Order_By = {
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Order_By>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Order_By>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Order_By>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Order_By>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Order_By>;
};

/** update columns of table "organization_plans" */
export enum Organization_Plans_Update_Column {
  /** column name */
  BillingCycle = 'billing_cycle',
  /** column name */
  CancelledAt = 'cancelled_at',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CurrencyCode = 'currency_code',
  /** column name */
  CurrentPeriodEndsAt = 'current_period_ends_at',
  /** column name */
  HasOverrides = 'has_overrides',
  /** column name */
  Id = 'id',
  /** column name */
  MaxForms = 'max_forms',
  /** column name */
  MaxMembers = 'max_members',
  /** column name */
  MaxTestimonials = 'max_testimonials',
  /** column name */
  MaxWidgets = 'max_widgets',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  OverriddenAt = 'overridden_at',
  /** column name */
  OverriddenBy = 'overridden_by',
  /** column name */
  OverrideReason = 'override_reason',
  /** column name */
  PlanId = 'plan_id',
  /** column name */
  PriceInBaseUnit = 'price_in_base_unit',
  /** column name */
  ShowBranding = 'show_branding',
  /** column name */
  StartsAt = 'starts_at',
  /** column name */
  Status = 'status',
  /** column name */
  TrialEndsAt = 'trial_ends_at',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Organization_Plans_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Organization_Plans_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Organization_Plans_Set_Input>;
  /** filter the rows which have to be updated */
  where: Organization_Plans_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Organization_Plans_Var_Pop_Fields = {
  __typename?: 'organization_plans_var_pop_fields';
  /** Form limit copied from plan (may be overridden) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "organization_plans" */
export type Organization_Plans_Var_Pop_Order_By = {
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Order_By>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Order_By>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Order_By>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Order_By>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Organization_Plans_Var_Samp_Fields = {
  __typename?: 'organization_plans_var_samp_fields';
  /** Form limit copied from plan (may be overridden) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "organization_plans" */
export type Organization_Plans_Var_Samp_Order_By = {
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Order_By>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Order_By>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Order_By>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Order_By>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Organization_Plans_Variance_Fields = {
  __typename?: 'organization_plans_variance_fields';
  /** Form limit copied from plan (may be overridden) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "organization_plans" */
export type Organization_Plans_Variance_Order_By = {
  /** Form limit copied from plan (may be overridden) */
  max_forms?: InputMaybe<Order_By>;
  /** Member limit copied from plan (may be overridden) */
  max_members?: InputMaybe<Order_By>;
  /** Testimonial limit copied from plan (may be overridden) */
  max_testimonials?: InputMaybe<Order_By>;
  /** Widget limit copied from plan (may be overridden) */
  max_widgets?: InputMaybe<Order_By>;
  /** Actual price paid in smallest currency unit (cents/paise) */
  price_in_base_unit?: InputMaybe<Order_By>;
};

/** User-Organization-Role junction - one role per user per org */
export type Organization_Roles = {
  __typename?: 'organization_roles';
  /** Timestamp when record was created */
  created_at: Scalars['timestamptz']['output'];
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['output'];
  /** When the invitation was sent */
  invited_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who invited this member to the organization */
  invited_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  inviter?: Maybe<Users>;
  /** Soft delete flag - false means membership is revoked */
  is_active: Scalars['Boolean']['output'];
  /** Whether this is the user default organization (only one per user) */
  is_default_org: Scalars['Boolean']['output'];
  /** When the user joined the organization */
  joined_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  organization: Organizations;
  /** Organization where user has this role */
  organization_id: Scalars['String']['output'];
  /** An object relationship */
  role: Roles;
  /** Role assigned to user - app must lookup by role.unique_name */
  role_id: Scalars['String']['output'];
  /** Timestamp when record was last updated */
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  user: Users;
  /** User who has this role */
  user_id: Scalars['String']['output'];
};

/** aggregated selection of "organization_roles" */
export type Organization_Roles_Aggregate = {
  __typename?: 'organization_roles_aggregate';
  aggregate?: Maybe<Organization_Roles_Aggregate_Fields>;
  nodes: Array<Organization_Roles>;
};

export type Organization_Roles_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Organization_Roles_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Organization_Roles_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Organization_Roles_Aggregate_Bool_Exp_Count>;
};

export type Organization_Roles_Aggregate_Bool_Exp_Bool_And = {
  arguments: Organization_Roles_Select_Column_Organization_Roles_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Organization_Roles_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Organization_Roles_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Organization_Roles_Select_Column_Organization_Roles_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Organization_Roles_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Organization_Roles_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Organization_Roles_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "organization_roles" */
export type Organization_Roles_Aggregate_Fields = {
  __typename?: 'organization_roles_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Organization_Roles_Max_Fields>;
  min?: Maybe<Organization_Roles_Min_Fields>;
};


/** aggregate fields of "organization_roles" */
export type Organization_Roles_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "organization_roles" */
export type Organization_Roles_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Organization_Roles_Max_Order_By>;
  min?: InputMaybe<Organization_Roles_Min_Order_By>;
};

/** input type for inserting array relation for remote table "organization_roles" */
export type Organization_Roles_Arr_Rel_Insert_Input = {
  data: Array<Organization_Roles_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Organization_Roles_On_Conflict>;
};

/** Boolean expression to filter rows from the table "organization_roles". All fields are combined with a logical 'AND'. */
export type Organization_Roles_Bool_Exp = {
  _and?: InputMaybe<Array<Organization_Roles_Bool_Exp>>;
  _not?: InputMaybe<Organization_Roles_Bool_Exp>;
  _or?: InputMaybe<Array<Organization_Roles_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  invited_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  invited_by?: InputMaybe<String_Comparison_Exp>;
  inviter?: InputMaybe<Users_Bool_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_default_org?: InputMaybe<Boolean_Comparison_Exp>;
  joined_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  role?: InputMaybe<Roles_Bool_Exp>;
  role_id?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "organization_roles" */
export enum Organization_Roles_Constraint {
  /** unique or primary key constraint on columns "user_id" */
  IdxOrgRolesOneDefault = 'idx_org_roles_one_default',
  /** unique or primary key constraint on columns "user_id", "organization_id" */
  OrgRolesUnique = 'org_roles_unique',
  /** unique or primary key constraint on columns "id" */
  OrganizationRolesPkey = 'organization_roles_pkey'
}

/** input type for inserting data into table "organization_roles" */
export type Organization_Roles_Insert_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** When the invitation was sent */
  invited_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who invited this member to the organization */
  invited_by?: InputMaybe<Scalars['String']['input']>;
  inviter?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** Soft delete flag - false means membership is revoked */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether this is the user default organization (only one per user) */
  is_default_org?: InputMaybe<Scalars['Boolean']['input']>;
  /** When the user joined the organization */
  joined_at?: InputMaybe<Scalars['timestamptz']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** Organization where user has this role */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Roles_Obj_Rel_Insert_Input>;
  /** Role assigned to user - app must lookup by role.unique_name */
  role_id?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** User who has this role */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Organization_Roles_Max_Fields = {
  __typename?: 'organization_roles_max_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** When the invitation was sent */
  invited_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who invited this member to the organization */
  invited_by?: Maybe<Scalars['String']['output']>;
  /** When the user joined the organization */
  joined_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Organization where user has this role */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Role assigned to user - app must lookup by role.unique_name */
  role_id?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who has this role */
  user_id?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "organization_roles" */
export type Organization_Roles_Max_Order_By = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Order_By>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Order_By>;
  /** When the invitation was sent */
  invited_at?: InputMaybe<Order_By>;
  /** User who invited this member to the organization */
  invited_by?: InputMaybe<Order_By>;
  /** When the user joined the organization */
  joined_at?: InputMaybe<Order_By>;
  /** Organization where user has this role */
  organization_id?: InputMaybe<Order_By>;
  /** Role assigned to user - app must lookup by role.unique_name */
  role_id?: InputMaybe<Order_By>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Order_By>;
  /** User who has this role */
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Organization_Roles_Min_Fields = {
  __typename?: 'organization_roles_min_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** When the invitation was sent */
  invited_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who invited this member to the organization */
  invited_by?: Maybe<Scalars['String']['output']>;
  /** When the user joined the organization */
  joined_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Organization where user has this role */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Role assigned to user - app must lookup by role.unique_name */
  role_id?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who has this role */
  user_id?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "organization_roles" */
export type Organization_Roles_Min_Order_By = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Order_By>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Order_By>;
  /** When the invitation was sent */
  invited_at?: InputMaybe<Order_By>;
  /** User who invited this member to the organization */
  invited_by?: InputMaybe<Order_By>;
  /** When the user joined the organization */
  joined_at?: InputMaybe<Order_By>;
  /** Organization where user has this role */
  organization_id?: InputMaybe<Order_By>;
  /** Role assigned to user - app must lookup by role.unique_name */
  role_id?: InputMaybe<Order_By>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Order_By>;
  /** User who has this role */
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "organization_roles" */
export type Organization_Roles_Mutation_Response = {
  __typename?: 'organization_roles_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Organization_Roles>;
};

/** on_conflict condition type for table "organization_roles" */
export type Organization_Roles_On_Conflict = {
  constraint: Organization_Roles_Constraint;
  update_columns?: Array<Organization_Roles_Update_Column>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};

/** Ordering options when selecting data from "organization_roles". */
export type Organization_Roles_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  invited_at?: InputMaybe<Order_By>;
  invited_by?: InputMaybe<Order_By>;
  inviter?: InputMaybe<Users_Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_default_org?: InputMaybe<Order_By>;
  joined_at?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  role?: InputMaybe<Roles_Order_By>;
  role_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: organization_roles */
export type Organization_Roles_Pk_Columns_Input = {
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['input'];
};

/** select columns of table "organization_roles" */
export enum Organization_Roles_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  InvitedAt = 'invited_at',
  /** column name */
  InvitedBy = 'invited_by',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDefaultOrg = 'is_default_org',
  /** column name */
  JoinedAt = 'joined_at',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  RoleId = 'role_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** select "organization_roles_aggregate_bool_exp_bool_and_arguments_columns" columns of table "organization_roles" */
export enum Organization_Roles_Select_Column_Organization_Roles_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDefaultOrg = 'is_default_org'
}

/** select "organization_roles_aggregate_bool_exp_bool_or_arguments_columns" columns of table "organization_roles" */
export enum Organization_Roles_Select_Column_Organization_Roles_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDefaultOrg = 'is_default_org'
}

/** input type for updating data in table "organization_roles" */
export type Organization_Roles_Set_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** When the invitation was sent */
  invited_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who invited this member to the organization */
  invited_by?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag - false means membership is revoked */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether this is the user default organization (only one per user) */
  is_default_org?: InputMaybe<Scalars['Boolean']['input']>;
  /** When the user joined the organization */
  joined_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Organization where user has this role */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Role assigned to user - app must lookup by role.unique_name */
  role_id?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who has this role */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "organization_roles" */
export type Organization_Roles_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Organization_Roles_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Organization_Roles_Stream_Cursor_Value_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** When the invitation was sent */
  invited_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who invited this member to the organization */
  invited_by?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag - false means membership is revoked */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether this is the user default organization (only one per user) */
  is_default_org?: InputMaybe<Scalars['Boolean']['input']>;
  /** When the user joined the organization */
  joined_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Organization where user has this role */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Role assigned to user - app must lookup by role.unique_name */
  role_id?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who has this role */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "organization_roles" */
export enum Organization_Roles_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  InvitedAt = 'invited_at',
  /** column name */
  InvitedBy = 'invited_by',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDefaultOrg = 'is_default_org',
  /** column name */
  JoinedAt = 'joined_at',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  RoleId = 'role_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

export type Organization_Roles_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Organization_Roles_Set_Input>;
  /** filter the rows which have to be updated */
  where: Organization_Roles_Bool_Exp;
};

/** Boolean expression to compare columns of type "organization_setup_status". All fields are combined with logical 'AND'. */
export type Organization_Setup_Status_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['organization_setup_status']['input']>;
  _gt?: InputMaybe<Scalars['organization_setup_status']['input']>;
  _gte?: InputMaybe<Scalars['organization_setup_status']['input']>;
  _in?: InputMaybe<Array<Scalars['organization_setup_status']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['organization_setup_status']['input']>;
  _lte?: InputMaybe<Scalars['organization_setup_status']['input']>;
  _neq?: InputMaybe<Scalars['organization_setup_status']['input']>;
  _nin?: InputMaybe<Array<Scalars['organization_setup_status']['input']>>;
};

/** Tenant boundary - plan subscription via organization_plans */
export type Organizations = {
  __typename?: 'organizations';
  /** Timestamp when record was created */
  created_at: Scalars['timestamptz']['output'];
  /** User who created this organization */
  created_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  creator?: Maybe<Users>;
  /** An array relationship */
  forms: Array<Forms>;
  /** An aggregate relationship */
  forms_aggregate: Forms_Aggregate;
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['output'];
  /** Soft delete flag - false means organization is deactivated */
  is_active: Scalars['Boolean']['output'];
  /** Organization logo image URL */
  logo_url?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  members: Array<Organization_Roles>;
  /** An aggregate relationship */
  members_aggregate: Organization_Roles_Aggregate;
  /** Organization display name */
  name: Scalars['String']['output'];
  /** An array relationship */
  plans: Array<Organization_Plans>;
  /** An aggregate relationship */
  plans_aggregate: Organization_Plans_Aggregate;
  /** UI preferences only (theme, locale) - not business logic */
  settings: Scalars['jsonb']['output'];
  /** Organization configuration state: pending_setup for auto-created orgs, completed after user setup */
  setup_status: Scalars['organization_setup_status']['output'];
  /** URL-friendly unique identifier for public URLs */
  slug: Scalars['String']['output'];
  /** An array relationship */
  testimonials: Array<Testimonials>;
  /** An aggregate relationship */
  testimonials_aggregate: Testimonials_Aggregate;
  /** Timestamp when record was last updated */
  updated_at: Scalars['timestamptz']['output'];
  /** An array relationship */
  widgets: Array<Widgets>;
  /** An aggregate relationship */
  widgets_aggregate: Widgets_Aggregate;
};


/** Tenant boundary - plan subscription via organization_plans */
export type OrganizationsFormsArgs = {
  distinct_on?: InputMaybe<Array<Forms_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Forms_Order_By>>;
  where?: InputMaybe<Forms_Bool_Exp>;
};


/** Tenant boundary - plan subscription via organization_plans */
export type OrganizationsForms_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Forms_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Forms_Order_By>>;
  where?: InputMaybe<Forms_Bool_Exp>;
};


/** Tenant boundary - plan subscription via organization_plans */
export type OrganizationsMembersArgs = {
  distinct_on?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Roles_Order_By>>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};


/** Tenant boundary - plan subscription via organization_plans */
export type OrganizationsMembers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Roles_Order_By>>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};


/** Tenant boundary - plan subscription via organization_plans */
export type OrganizationsPlansArgs = {
  distinct_on?: InputMaybe<Array<Organization_Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Plans_Order_By>>;
  where?: InputMaybe<Organization_Plans_Bool_Exp>;
};


/** Tenant boundary - plan subscription via organization_plans */
export type OrganizationsPlans_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organization_Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Plans_Order_By>>;
  where?: InputMaybe<Organization_Plans_Bool_Exp>;
};


/** Tenant boundary - plan subscription via organization_plans */
export type OrganizationsSettingsArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** Tenant boundary - plan subscription via organization_plans */
export type OrganizationsTestimonialsArgs = {
  distinct_on?: InputMaybe<Array<Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Testimonials_Order_By>>;
  where?: InputMaybe<Testimonials_Bool_Exp>;
};


/** Tenant boundary - plan subscription via organization_plans */
export type OrganizationsTestimonials_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Testimonials_Order_By>>;
  where?: InputMaybe<Testimonials_Bool_Exp>;
};


/** Tenant boundary - plan subscription via organization_plans */
export type OrganizationsWidgetsArgs = {
  distinct_on?: InputMaybe<Array<Widgets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widgets_Order_By>>;
  where?: InputMaybe<Widgets_Bool_Exp>;
};


/** Tenant boundary - plan subscription via organization_plans */
export type OrganizationsWidgets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Widgets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widgets_Order_By>>;
  where?: InputMaybe<Widgets_Bool_Exp>;
};

/** aggregated selection of "organizations" */
export type Organizations_Aggregate = {
  __typename?: 'organizations_aggregate';
  aggregate?: Maybe<Organizations_Aggregate_Fields>;
  nodes: Array<Organizations>;
};

export type Organizations_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Organizations_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Organizations_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Organizations_Aggregate_Bool_Exp_Count>;
};

export type Organizations_Aggregate_Bool_Exp_Bool_And = {
  arguments: Organizations_Select_Column_Organizations_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Organizations_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Organizations_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Organizations_Select_Column_Organizations_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Organizations_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Organizations_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Organizations_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Organizations_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "organizations" */
export type Organizations_Aggregate_Fields = {
  __typename?: 'organizations_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Organizations_Max_Fields>;
  min?: Maybe<Organizations_Min_Fields>;
};


/** aggregate fields of "organizations" */
export type Organizations_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Organizations_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "organizations" */
export type Organizations_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Organizations_Max_Order_By>;
  min?: InputMaybe<Organizations_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Organizations_Append_Input = {
  /** UI preferences only (theme, locale) - not business logic */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "organizations" */
export type Organizations_Arr_Rel_Insert_Input = {
  data: Array<Organizations_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Organizations_On_Conflict>;
};

/** Boolean expression to filter rows from the table "organizations". All fields are combined with a logical 'AND'. */
export type Organizations_Bool_Exp = {
  _and?: InputMaybe<Array<Organizations_Bool_Exp>>;
  _not?: InputMaybe<Organizations_Bool_Exp>;
  _or?: InputMaybe<Array<Organizations_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_by?: InputMaybe<String_Comparison_Exp>;
  creator?: InputMaybe<Users_Bool_Exp>;
  forms?: InputMaybe<Forms_Bool_Exp>;
  forms_aggregate?: InputMaybe<Forms_Aggregate_Bool_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  logo_url?: InputMaybe<String_Comparison_Exp>;
  members?: InputMaybe<Organization_Roles_Bool_Exp>;
  members_aggregate?: InputMaybe<Organization_Roles_Aggregate_Bool_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  plans?: InputMaybe<Organization_Plans_Bool_Exp>;
  plans_aggregate?: InputMaybe<Organization_Plans_Aggregate_Bool_Exp>;
  settings?: InputMaybe<Jsonb_Comparison_Exp>;
  setup_status?: InputMaybe<Organization_Setup_Status_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  testimonials?: InputMaybe<Testimonials_Bool_Exp>;
  testimonials_aggregate?: InputMaybe<Testimonials_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  widgets?: InputMaybe<Widgets_Bool_Exp>;
  widgets_aggregate?: InputMaybe<Widgets_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "organizations" */
export enum Organizations_Constraint {
  /** unique or primary key constraint on columns "slug" */
  IdxOrganizationsSlug = 'idx_organizations_slug',
  /** unique or primary key constraint on columns "id" */
  OrganizationsPkey = 'organizations_pkey',
  /** unique or primary key constraint on columns "slug" */
  OrganizationsSlugUnique = 'organizations_slug_unique'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Organizations_Delete_At_Path_Input = {
  /** UI preferences only (theme, locale) - not business logic */
  settings?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Organizations_Delete_Elem_Input = {
  /** UI preferences only (theme, locale) - not business logic */
  settings?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Organizations_Delete_Key_Input = {
  /** UI preferences only (theme, locale) - not business logic */
  settings?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "organizations" */
export type Organizations_Insert_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who created this organization */
  created_by?: InputMaybe<Scalars['String']['input']>;
  creator?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  forms?: InputMaybe<Forms_Arr_Rel_Insert_Input>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag - false means organization is deactivated */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Organization logo image URL */
  logo_url?: InputMaybe<Scalars['String']['input']>;
  members?: InputMaybe<Organization_Roles_Arr_Rel_Insert_Input>;
  /** Organization display name */
  name?: InputMaybe<Scalars['String']['input']>;
  plans?: InputMaybe<Organization_Plans_Arr_Rel_Insert_Input>;
  /** UI preferences only (theme, locale) - not business logic */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
  /** Organization configuration state: pending_setup for auto-created orgs, completed after user setup */
  setup_status?: InputMaybe<Scalars['organization_setup_status']['input']>;
  /** URL-friendly unique identifier for public URLs */
  slug?: InputMaybe<Scalars['String']['input']>;
  testimonials?: InputMaybe<Testimonials_Arr_Rel_Insert_Input>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  widgets?: InputMaybe<Widgets_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Organizations_Max_Fields = {
  __typename?: 'organizations_max_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who created this organization */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Organization logo image URL */
  logo_url?: Maybe<Scalars['String']['output']>;
  /** Organization display name */
  name?: Maybe<Scalars['String']['output']>;
  /** Organization configuration state: pending_setup for auto-created orgs, completed after user setup */
  setup_status?: Maybe<Scalars['organization_setup_status']['output']>;
  /** URL-friendly unique identifier for public URLs */
  slug?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "organizations" */
export type Organizations_Max_Order_By = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Order_By>;
  /** User who created this organization */
  created_by?: InputMaybe<Order_By>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Order_By>;
  /** Organization logo image URL */
  logo_url?: InputMaybe<Order_By>;
  /** Organization display name */
  name?: InputMaybe<Order_By>;
  /** Organization configuration state: pending_setup for auto-created orgs, completed after user setup */
  setup_status?: InputMaybe<Order_By>;
  /** URL-friendly unique identifier for public URLs */
  slug?: InputMaybe<Order_By>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Organizations_Min_Fields = {
  __typename?: 'organizations_min_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who created this organization */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Organization logo image URL */
  logo_url?: Maybe<Scalars['String']['output']>;
  /** Organization display name */
  name?: Maybe<Scalars['String']['output']>;
  /** Organization configuration state: pending_setup for auto-created orgs, completed after user setup */
  setup_status?: Maybe<Scalars['organization_setup_status']['output']>;
  /** URL-friendly unique identifier for public URLs */
  slug?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "organizations" */
export type Organizations_Min_Order_By = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Order_By>;
  /** User who created this organization */
  created_by?: InputMaybe<Order_By>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Order_By>;
  /** Organization logo image URL */
  logo_url?: InputMaybe<Order_By>;
  /** Organization display name */
  name?: InputMaybe<Order_By>;
  /** Organization configuration state: pending_setup for auto-created orgs, completed after user setup */
  setup_status?: InputMaybe<Order_By>;
  /** URL-friendly unique identifier for public URLs */
  slug?: InputMaybe<Order_By>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "organizations" */
export type Organizations_Mutation_Response = {
  __typename?: 'organizations_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Organizations>;
};

/** input type for inserting object relation for remote table "organizations" */
export type Organizations_Obj_Rel_Insert_Input = {
  data: Organizations_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Organizations_On_Conflict>;
};

/** on_conflict condition type for table "organizations" */
export type Organizations_On_Conflict = {
  constraint: Organizations_Constraint;
  update_columns?: Array<Organizations_Update_Column>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};

/** Ordering options when selecting data from "organizations". */
export type Organizations_Order_By = {
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  creator?: InputMaybe<Users_Order_By>;
  forms_aggregate?: InputMaybe<Forms_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  logo_url?: InputMaybe<Order_By>;
  members_aggregate?: InputMaybe<Organization_Roles_Aggregate_Order_By>;
  name?: InputMaybe<Order_By>;
  plans_aggregate?: InputMaybe<Organization_Plans_Aggregate_Order_By>;
  settings?: InputMaybe<Order_By>;
  setup_status?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  testimonials_aggregate?: InputMaybe<Testimonials_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
  widgets_aggregate?: InputMaybe<Widgets_Aggregate_Order_By>;
};

/** primary key columns input for table: organizations */
export type Organizations_Pk_Columns_Input = {
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Organizations_Prepend_Input = {
  /** UI preferences only (theme, locale) - not business logic */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "organizations" */
export enum Organizations_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  LogoUrl = 'logo_url',
  /** column name */
  Name = 'name',
  /** column name */
  Settings = 'settings',
  /** column name */
  SetupStatus = 'setup_status',
  /** column name */
  Slug = 'slug',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "organizations_aggregate_bool_exp_bool_and_arguments_columns" columns of table "organizations" */
export enum Organizations_Select_Column_Organizations_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "organizations_aggregate_bool_exp_bool_or_arguments_columns" columns of table "organizations" */
export enum Organizations_Select_Column_Organizations_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "organizations" */
export type Organizations_Set_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who created this organization */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag - false means organization is deactivated */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Organization logo image URL */
  logo_url?: InputMaybe<Scalars['String']['input']>;
  /** Organization display name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** UI preferences only (theme, locale) - not business logic */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
  /** Organization configuration state: pending_setup for auto-created orgs, completed after user setup */
  setup_status?: InputMaybe<Scalars['organization_setup_status']['input']>;
  /** URL-friendly unique identifier for public URLs */
  slug?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "organizations" */
export type Organizations_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Organizations_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Organizations_Stream_Cursor_Value_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who created this organization */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag - false means organization is deactivated */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Organization logo image URL */
  logo_url?: InputMaybe<Scalars['String']['input']>;
  /** Organization display name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** UI preferences only (theme, locale) - not business logic */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
  /** Organization configuration state: pending_setup for auto-created orgs, completed after user setup */
  setup_status?: InputMaybe<Scalars['organization_setup_status']['input']>;
  /** URL-friendly unique identifier for public URLs */
  slug?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "organizations" */
export enum Organizations_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  LogoUrl = 'logo_url',
  /** column name */
  Name = 'name',
  /** column name */
  Settings = 'settings',
  /** column name */
  SetupStatus = 'setup_status',
  /** column name */
  Slug = 'slug',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Organizations_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Organizations_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Organizations_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Organizations_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Organizations_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Organizations_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Organizations_Set_Input>;
  /** filter the rows which have to be updated */
  where: Organizations_Bool_Exp;
};

/** Multi-currency pricing - prices in smallest currency unit */
export type Plan_Prices = {
  __typename?: 'plan_prices';
  /** Timestamp when record was created */
  created_at: Scalars['timestamptz']['output'];
  /** ISO 4217 currency code (USD, INR, EUR) */
  currency_code: Scalars['String']['output'];
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['output'];
  /** Whether this price is currently active */
  is_active: Scalars['Boolean']['output'];
  /** An object relationship */
  plan: Plans;
  /** Reference to the plan this price belongs to */
  plan_id: Scalars['String']['output'];
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: Maybe<Scalars['Int']['output']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit: Scalars['Int']['output'];
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit: Scalars['Int']['output'];
  /** Timestamp when record was last updated */
  updated_at: Scalars['timestamptz']['output'];
};

/** aggregated selection of "plan_prices" */
export type Plan_Prices_Aggregate = {
  __typename?: 'plan_prices_aggregate';
  aggregate?: Maybe<Plan_Prices_Aggregate_Fields>;
  nodes: Array<Plan_Prices>;
};

export type Plan_Prices_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Plan_Prices_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Plan_Prices_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Plan_Prices_Aggregate_Bool_Exp_Count>;
};

export type Plan_Prices_Aggregate_Bool_Exp_Bool_And = {
  arguments: Plan_Prices_Select_Column_Plan_Prices_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Plan_Prices_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Plan_Prices_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Plan_Prices_Select_Column_Plan_Prices_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Plan_Prices_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Plan_Prices_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Plan_Prices_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Plan_Prices_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "plan_prices" */
export type Plan_Prices_Aggregate_Fields = {
  __typename?: 'plan_prices_aggregate_fields';
  avg?: Maybe<Plan_Prices_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Plan_Prices_Max_Fields>;
  min?: Maybe<Plan_Prices_Min_Fields>;
  stddev?: Maybe<Plan_Prices_Stddev_Fields>;
  stddev_pop?: Maybe<Plan_Prices_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Plan_Prices_Stddev_Samp_Fields>;
  sum?: Maybe<Plan_Prices_Sum_Fields>;
  var_pop?: Maybe<Plan_Prices_Var_Pop_Fields>;
  var_samp?: Maybe<Plan_Prices_Var_Samp_Fields>;
  variance?: Maybe<Plan_Prices_Variance_Fields>;
};


/** aggregate fields of "plan_prices" */
export type Plan_Prices_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Plan_Prices_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "plan_prices" */
export type Plan_Prices_Aggregate_Order_By = {
  avg?: InputMaybe<Plan_Prices_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Plan_Prices_Max_Order_By>;
  min?: InputMaybe<Plan_Prices_Min_Order_By>;
  stddev?: InputMaybe<Plan_Prices_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Plan_Prices_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Plan_Prices_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Plan_Prices_Sum_Order_By>;
  var_pop?: InputMaybe<Plan_Prices_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Plan_Prices_Var_Samp_Order_By>;
  variance?: InputMaybe<Plan_Prices_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "plan_prices" */
export type Plan_Prices_Arr_Rel_Insert_Input = {
  data: Array<Plan_Prices_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Plan_Prices_On_Conflict>;
};

/** aggregate avg on columns */
export type Plan_Prices_Avg_Fields = {
  __typename?: 'plan_prices_avg_fields';
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "plan_prices" */
export type Plan_Prices_Avg_Order_By = {
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Order_By>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Order_By>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "plan_prices". All fields are combined with a logical 'AND'. */
export type Plan_Prices_Bool_Exp = {
  _and?: InputMaybe<Array<Plan_Prices_Bool_Exp>>;
  _not?: InputMaybe<Plan_Prices_Bool_Exp>;
  _or?: InputMaybe<Array<Plan_Prices_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  currency_code?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  plan?: InputMaybe<Plans_Bool_Exp>;
  plan_id?: InputMaybe<String_Comparison_Exp>;
  price_lifetime_in_base_unit?: InputMaybe<Int_Comparison_Exp>;
  price_monthly_in_base_unit?: InputMaybe<Int_Comparison_Exp>;
  price_yearly_in_base_unit?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "plan_prices" */
export enum Plan_Prices_Constraint {
  /** unique or primary key constraint on columns "id" */
  PlanPricesPkey = 'plan_prices_pkey',
  /** unique or primary key constraint on columns "plan_id", "currency_code" */
  PlanPricesUnique = 'plan_prices_unique'
}

/** input type for incrementing numeric columns in table "plan_prices" */
export type Plan_Prices_Inc_Input = {
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "plan_prices" */
export type Plan_Prices_Insert_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** ISO 4217 currency code (USD, INR, EUR) */
  currency_code?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Whether this price is currently active */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  plan?: InputMaybe<Plans_Obj_Rel_Insert_Input>;
  /** Reference to the plan this price belongs to */
  plan_id?: InputMaybe<Scalars['String']['input']>;
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Plan_Prices_Max_Fields = {
  __typename?: 'plan_prices_max_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** ISO 4217 currency code (USD, INR, EUR) */
  currency_code?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Reference to the plan this price belongs to */
  plan_id?: Maybe<Scalars['String']['output']>;
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: Maybe<Scalars['Int']['output']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: Maybe<Scalars['Int']['output']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: Maybe<Scalars['Int']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "plan_prices" */
export type Plan_Prices_Max_Order_By = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Order_By>;
  /** ISO 4217 currency code (USD, INR, EUR) */
  currency_code?: InputMaybe<Order_By>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Order_By>;
  /** Reference to the plan this price belongs to */
  plan_id?: InputMaybe<Order_By>;
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Order_By>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Order_By>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Order_By>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Plan_Prices_Min_Fields = {
  __typename?: 'plan_prices_min_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** ISO 4217 currency code (USD, INR, EUR) */
  currency_code?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Reference to the plan this price belongs to */
  plan_id?: Maybe<Scalars['String']['output']>;
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: Maybe<Scalars['Int']['output']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: Maybe<Scalars['Int']['output']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: Maybe<Scalars['Int']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "plan_prices" */
export type Plan_Prices_Min_Order_By = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Order_By>;
  /** ISO 4217 currency code (USD, INR, EUR) */
  currency_code?: InputMaybe<Order_By>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Order_By>;
  /** Reference to the plan this price belongs to */
  plan_id?: InputMaybe<Order_By>;
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Order_By>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Order_By>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Order_By>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "plan_prices" */
export type Plan_Prices_Mutation_Response = {
  __typename?: 'plan_prices_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Plan_Prices>;
};

/** on_conflict condition type for table "plan_prices" */
export type Plan_Prices_On_Conflict = {
  constraint: Plan_Prices_Constraint;
  update_columns?: Array<Plan_Prices_Update_Column>;
  where?: InputMaybe<Plan_Prices_Bool_Exp>;
};

/** Ordering options when selecting data from "plan_prices". */
export type Plan_Prices_Order_By = {
  created_at?: InputMaybe<Order_By>;
  currency_code?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  plan?: InputMaybe<Plans_Order_By>;
  plan_id?: InputMaybe<Order_By>;
  price_lifetime_in_base_unit?: InputMaybe<Order_By>;
  price_monthly_in_base_unit?: InputMaybe<Order_By>;
  price_yearly_in_base_unit?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: plan_prices */
export type Plan_Prices_Pk_Columns_Input = {
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['input'];
};

/** select columns of table "plan_prices" */
export enum Plan_Prices_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CurrencyCode = 'currency_code',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  PlanId = 'plan_id',
  /** column name */
  PriceLifetimeInBaseUnit = 'price_lifetime_in_base_unit',
  /** column name */
  PriceMonthlyInBaseUnit = 'price_monthly_in_base_unit',
  /** column name */
  PriceYearlyInBaseUnit = 'price_yearly_in_base_unit',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "plan_prices_aggregate_bool_exp_bool_and_arguments_columns" columns of table "plan_prices" */
export enum Plan_Prices_Select_Column_Plan_Prices_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "plan_prices_aggregate_bool_exp_bool_or_arguments_columns" columns of table "plan_prices" */
export enum Plan_Prices_Select_Column_Plan_Prices_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "plan_prices" */
export type Plan_Prices_Set_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** ISO 4217 currency code (USD, INR, EUR) */
  currency_code?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Whether this price is currently active */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Reference to the plan this price belongs to */
  plan_id?: InputMaybe<Scalars['String']['input']>;
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Plan_Prices_Stddev_Fields = {
  __typename?: 'plan_prices_stddev_fields';
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "plan_prices" */
export type Plan_Prices_Stddev_Order_By = {
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Order_By>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Order_By>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Plan_Prices_Stddev_Pop_Fields = {
  __typename?: 'plan_prices_stddev_pop_fields';
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "plan_prices" */
export type Plan_Prices_Stddev_Pop_Order_By = {
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Order_By>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Order_By>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Plan_Prices_Stddev_Samp_Fields = {
  __typename?: 'plan_prices_stddev_samp_fields';
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "plan_prices" */
export type Plan_Prices_Stddev_Samp_Order_By = {
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Order_By>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Order_By>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "plan_prices" */
export type Plan_Prices_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Plan_Prices_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Plan_Prices_Stream_Cursor_Value_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** ISO 4217 currency code (USD, INR, EUR) */
  currency_code?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Whether this price is currently active */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Reference to the plan this price belongs to */
  plan_id?: InputMaybe<Scalars['String']['input']>;
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Scalars['Int']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Plan_Prices_Sum_Fields = {
  __typename?: 'plan_prices_sum_fields';
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: Maybe<Scalars['Int']['output']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: Maybe<Scalars['Int']['output']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "plan_prices" */
export type Plan_Prices_Sum_Order_By = {
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Order_By>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Order_By>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Order_By>;
};

/** update columns of table "plan_prices" */
export enum Plan_Prices_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CurrencyCode = 'currency_code',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  PlanId = 'plan_id',
  /** column name */
  PriceLifetimeInBaseUnit = 'price_lifetime_in_base_unit',
  /** column name */
  PriceMonthlyInBaseUnit = 'price_monthly_in_base_unit',
  /** column name */
  PriceYearlyInBaseUnit = 'price_yearly_in_base_unit',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Plan_Prices_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Plan_Prices_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Plan_Prices_Set_Input>;
  /** filter the rows which have to be updated */
  where: Plan_Prices_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Plan_Prices_Var_Pop_Fields = {
  __typename?: 'plan_prices_var_pop_fields';
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "plan_prices" */
export type Plan_Prices_Var_Pop_Order_By = {
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Order_By>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Order_By>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Plan_Prices_Var_Samp_Fields = {
  __typename?: 'plan_prices_var_samp_fields';
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "plan_prices" */
export type Plan_Prices_Var_Samp_Order_By = {
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Order_By>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Order_By>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Plan_Prices_Variance_Fields = {
  __typename?: 'plan_prices_variance_fields';
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: Maybe<Scalars['Float']['output']>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "plan_prices" */
export type Plan_Prices_Variance_Order_By = {
  /** Lifetime price in smallest currency unit (NULL if not offered) */
  price_lifetime_in_base_unit?: InputMaybe<Order_By>;
  /** Monthly price in smallest currency unit (cents/paise) */
  price_monthly_in_base_unit?: InputMaybe<Order_By>;
  /** Yearly price in smallest currency unit (cents/paise) */
  price_yearly_in_base_unit?: InputMaybe<Order_By>;
};

/** Junction table mapping plans to question_types - controls which question types are available per plan */
export type Plan_Question_Types = {
  __typename?: 'plan_question_types';
  /** Timestamp when mapping was created */
  created_at: Scalars['timestamptz']['output'];
  /** User who created the mapping (FK to users) */
  created_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  created_by_user?: Maybe<Users>;
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['output'];
  /** An object relationship */
  plan: Plans;
  /** FK to plans - the subscription plan */
  plan_id: Scalars['String']['output'];
  /** An object relationship */
  question_type: Question_Types;
  /** FK to question_types - the question type available in this plan */
  question_type_id: Scalars['String']['output'];
  /** Timestamp when mapping was last modified */
  updated_at: Scalars['timestamptz']['output'];
  /** User who last modified the mapping (FK to users) */
  updated_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  updated_by_user?: Maybe<Users>;
};

/** aggregated selection of "plan_question_types" */
export type Plan_Question_Types_Aggregate = {
  __typename?: 'plan_question_types_aggregate';
  aggregate?: Maybe<Plan_Question_Types_Aggregate_Fields>;
  nodes: Array<Plan_Question_Types>;
};

export type Plan_Question_Types_Aggregate_Bool_Exp = {
  count?: InputMaybe<Plan_Question_Types_Aggregate_Bool_Exp_Count>;
};

export type Plan_Question_Types_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Plan_Question_Types_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Plan_Question_Types_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "plan_question_types" */
export type Plan_Question_Types_Aggregate_Fields = {
  __typename?: 'plan_question_types_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Plan_Question_Types_Max_Fields>;
  min?: Maybe<Plan_Question_Types_Min_Fields>;
};


/** aggregate fields of "plan_question_types" */
export type Plan_Question_Types_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Plan_Question_Types_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "plan_question_types" */
export type Plan_Question_Types_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Plan_Question_Types_Max_Order_By>;
  min?: InputMaybe<Plan_Question_Types_Min_Order_By>;
};

/** input type for inserting array relation for remote table "plan_question_types" */
export type Plan_Question_Types_Arr_Rel_Insert_Input = {
  data: Array<Plan_Question_Types_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Plan_Question_Types_On_Conflict>;
};

/** Boolean expression to filter rows from the table "plan_question_types". All fields are combined with a logical 'AND'. */
export type Plan_Question_Types_Bool_Exp = {
  _and?: InputMaybe<Array<Plan_Question_Types_Bool_Exp>>;
  _not?: InputMaybe<Plan_Question_Types_Bool_Exp>;
  _or?: InputMaybe<Array<Plan_Question_Types_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_by?: InputMaybe<String_Comparison_Exp>;
  created_by_user?: InputMaybe<Users_Bool_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  plan?: InputMaybe<Plans_Bool_Exp>;
  plan_id?: InputMaybe<String_Comparison_Exp>;
  question_type?: InputMaybe<Question_Types_Bool_Exp>;
  question_type_id?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_by?: InputMaybe<String_Comparison_Exp>;
  updated_by_user?: InputMaybe<Users_Bool_Exp>;
};

/** unique or primary key constraints on table "plan_question_types" */
export enum Plan_Question_Types_Constraint {
  /** unique or primary key constraint on columns "id" */
  PlanQuestionTypesPkey = 'plan_question_types_pkey',
  /** unique or primary key constraint on columns "plan_id", "question_type_id" */
  PlanQuestionTypesUnique = 'plan_question_types_unique'
}

/** input type for inserting data into table "plan_question_types" */
export type Plan_Question_Types_Insert_Input = {
  /** Timestamp when mapping was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who created the mapping (FK to users) */
  created_by?: InputMaybe<Scalars['String']['input']>;
  created_by_user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  plan?: InputMaybe<Plans_Obj_Rel_Insert_Input>;
  /** FK to plans - the subscription plan */
  plan_id?: InputMaybe<Scalars['String']['input']>;
  question_type?: InputMaybe<Question_Types_Obj_Rel_Insert_Input>;
  /** FK to question_types - the question type available in this plan */
  question_type_id?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when mapping was last modified */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who last modified the mapping (FK to users) */
  updated_by?: InputMaybe<Scalars['String']['input']>;
  updated_by_user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Plan_Question_Types_Max_Fields = {
  __typename?: 'plan_question_types_max_fields';
  /** Timestamp when mapping was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who created the mapping (FK to users) */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** FK to plans - the subscription plan */
  plan_id?: Maybe<Scalars['String']['output']>;
  /** FK to question_types - the question type available in this plan */
  question_type_id?: Maybe<Scalars['String']['output']>;
  /** Timestamp when mapping was last modified */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who last modified the mapping (FK to users) */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "plan_question_types" */
export type Plan_Question_Types_Max_Order_By = {
  /** Timestamp when mapping was created */
  created_at?: InputMaybe<Order_By>;
  /** User who created the mapping (FK to users) */
  created_by?: InputMaybe<Order_By>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Order_By>;
  /** FK to plans - the subscription plan */
  plan_id?: InputMaybe<Order_By>;
  /** FK to question_types - the question type available in this plan */
  question_type_id?: InputMaybe<Order_By>;
  /** Timestamp when mapping was last modified */
  updated_at?: InputMaybe<Order_By>;
  /** User who last modified the mapping (FK to users) */
  updated_by?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Plan_Question_Types_Min_Fields = {
  __typename?: 'plan_question_types_min_fields';
  /** Timestamp when mapping was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who created the mapping (FK to users) */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** FK to plans - the subscription plan */
  plan_id?: Maybe<Scalars['String']['output']>;
  /** FK to question_types - the question type available in this plan */
  question_type_id?: Maybe<Scalars['String']['output']>;
  /** Timestamp when mapping was last modified */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User who last modified the mapping (FK to users) */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "plan_question_types" */
export type Plan_Question_Types_Min_Order_By = {
  /** Timestamp when mapping was created */
  created_at?: InputMaybe<Order_By>;
  /** User who created the mapping (FK to users) */
  created_by?: InputMaybe<Order_By>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Order_By>;
  /** FK to plans - the subscription plan */
  plan_id?: InputMaybe<Order_By>;
  /** FK to question_types - the question type available in this plan */
  question_type_id?: InputMaybe<Order_By>;
  /** Timestamp when mapping was last modified */
  updated_at?: InputMaybe<Order_By>;
  /** User who last modified the mapping (FK to users) */
  updated_by?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "plan_question_types" */
export type Plan_Question_Types_Mutation_Response = {
  __typename?: 'plan_question_types_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Plan_Question_Types>;
};

/** on_conflict condition type for table "plan_question_types" */
export type Plan_Question_Types_On_Conflict = {
  constraint: Plan_Question_Types_Constraint;
  update_columns?: Array<Plan_Question_Types_Update_Column>;
  where?: InputMaybe<Plan_Question_Types_Bool_Exp>;
};

/** Ordering options when selecting data from "plan_question_types". */
export type Plan_Question_Types_Order_By = {
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  created_by_user?: InputMaybe<Users_Order_By>;
  id?: InputMaybe<Order_By>;
  plan?: InputMaybe<Plans_Order_By>;
  plan_id?: InputMaybe<Order_By>;
  question_type?: InputMaybe<Question_Types_Order_By>;
  question_type_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updated_by_user?: InputMaybe<Users_Order_By>;
};

/** primary key columns input for table: plan_question_types */
export type Plan_Question_Types_Pk_Columns_Input = {
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['input'];
};

/** select columns of table "plan_question_types" */
export enum Plan_Question_Types_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  Id = 'id',
  /** column name */
  PlanId = 'plan_id',
  /** column name */
  QuestionTypeId = 'question_type_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

/** input type for updating data in table "plan_question_types" */
export type Plan_Question_Types_Set_Input = {
  /** Timestamp when mapping was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who created the mapping (FK to users) */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** FK to plans - the subscription plan */
  plan_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to question_types - the question type available in this plan */
  question_type_id?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when mapping was last modified */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who last modified the mapping (FK to users) */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "plan_question_types" */
export type Plan_Question_Types_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Plan_Question_Types_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Plan_Question_Types_Stream_Cursor_Value_Input = {
  /** Timestamp when mapping was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who created the mapping (FK to users) */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** FK to plans - the subscription plan */
  plan_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to question_types - the question type available in this plan */
  question_type_id?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when mapping was last modified */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User who last modified the mapping (FK to users) */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "plan_question_types" */
export enum Plan_Question_Types_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  Id = 'id',
  /** column name */
  PlanId = 'plan_id',
  /** column name */
  QuestionTypeId = 'question_type_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

export type Plan_Question_Types_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Plan_Question_Types_Set_Input>;
  /** filter the rows which have to be updated */
  where: Plan_Question_Types_Bool_Exp;
};

/** Plan templates - features/limits only, pricing in plan_prices */
export type Plans = {
  __typename?: 'plans';
  /** Timestamp when record was created */
  created_at: Scalars['timestamptz']['output'];
  /** Human-readable description of the plan */
  description?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['output'];
  /** Whether plan is available for new subscriptions */
  is_active: Scalars['Boolean']['output'];
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms: Scalars['Int']['output'];
  /** Maximum team members allowed (-1 = unlimited) */
  max_members: Scalars['Int']['output'];
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials: Scalars['Int']['output'];
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets: Scalars['Int']['output'];
  /** Display-ready label for UI (Free, Pro, Team) */
  name: Scalars['String']['output'];
  /** An array relationship */
  organization_plans: Array<Organization_Plans>;
  /** An aggregate relationship */
  organization_plans_aggregate: Organization_Plans_Aggregate;
  /** An array relationship */
  prices: Array<Plan_Prices>;
  /** An aggregate relationship */
  prices_aggregate: Plan_Prices_Aggregate;
  /** An array relationship */
  question_types: Array<Plan_Question_Types>;
  /** An aggregate relationship */
  question_types_aggregate: Plan_Question_Types_Aggregate;
  /** Whether to show "Powered by" branding on widgets */
  show_branding: Scalars['Boolean']['output'];
  /** Slug for code comparisons (free, pro, team) */
  unique_name: Scalars['String']['output'];
  /** Timestamp when record was last updated */
  updated_at: Scalars['timestamptz']['output'];
};


/** Plan templates - features/limits only, pricing in plan_prices */
export type PlansOrganization_PlansArgs = {
  distinct_on?: InputMaybe<Array<Organization_Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Plans_Order_By>>;
  where?: InputMaybe<Organization_Plans_Bool_Exp>;
};


/** Plan templates - features/limits only, pricing in plan_prices */
export type PlansOrganization_Plans_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organization_Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Plans_Order_By>>;
  where?: InputMaybe<Organization_Plans_Bool_Exp>;
};


/** Plan templates - features/limits only, pricing in plan_prices */
export type PlansPricesArgs = {
  distinct_on?: InputMaybe<Array<Plan_Prices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Prices_Order_By>>;
  where?: InputMaybe<Plan_Prices_Bool_Exp>;
};


/** Plan templates - features/limits only, pricing in plan_prices */
export type PlansPrices_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Plan_Prices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Prices_Order_By>>;
  where?: InputMaybe<Plan_Prices_Bool_Exp>;
};


/** Plan templates - features/limits only, pricing in plan_prices */
export type PlansQuestion_TypesArgs = {
  distinct_on?: InputMaybe<Array<Plan_Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Question_Types_Order_By>>;
  where?: InputMaybe<Plan_Question_Types_Bool_Exp>;
};


/** Plan templates - features/limits only, pricing in plan_prices */
export type PlansQuestion_Types_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Plan_Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Question_Types_Order_By>>;
  where?: InputMaybe<Plan_Question_Types_Bool_Exp>;
};

/** aggregated selection of "plans" */
export type Plans_Aggregate = {
  __typename?: 'plans_aggregate';
  aggregate?: Maybe<Plans_Aggregate_Fields>;
  nodes: Array<Plans>;
};

/** aggregate fields of "plans" */
export type Plans_Aggregate_Fields = {
  __typename?: 'plans_aggregate_fields';
  avg?: Maybe<Plans_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Plans_Max_Fields>;
  min?: Maybe<Plans_Min_Fields>;
  stddev?: Maybe<Plans_Stddev_Fields>;
  stddev_pop?: Maybe<Plans_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Plans_Stddev_Samp_Fields>;
  sum?: Maybe<Plans_Sum_Fields>;
  var_pop?: Maybe<Plans_Var_Pop_Fields>;
  var_samp?: Maybe<Plans_Var_Samp_Fields>;
  variance?: Maybe<Plans_Variance_Fields>;
};


/** aggregate fields of "plans" */
export type Plans_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Plans_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Plans_Avg_Fields = {
  __typename?: 'plans_avg_fields';
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "plans". All fields are combined with a logical 'AND'. */
export type Plans_Bool_Exp = {
  _and?: InputMaybe<Array<Plans_Bool_Exp>>;
  _not?: InputMaybe<Plans_Bool_Exp>;
  _or?: InputMaybe<Array<Plans_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  max_forms?: InputMaybe<Int_Comparison_Exp>;
  max_members?: InputMaybe<Int_Comparison_Exp>;
  max_testimonials?: InputMaybe<Int_Comparison_Exp>;
  max_widgets?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  organization_plans?: InputMaybe<Organization_Plans_Bool_Exp>;
  organization_plans_aggregate?: InputMaybe<Organization_Plans_Aggregate_Bool_Exp>;
  prices?: InputMaybe<Plan_Prices_Bool_Exp>;
  prices_aggregate?: InputMaybe<Plan_Prices_Aggregate_Bool_Exp>;
  question_types?: InputMaybe<Plan_Question_Types_Bool_Exp>;
  question_types_aggregate?: InputMaybe<Plan_Question_Types_Aggregate_Bool_Exp>;
  show_branding?: InputMaybe<Boolean_Comparison_Exp>;
  unique_name?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "plans" */
export enum Plans_Constraint {
  /** unique or primary key constraint on columns "id" */
  PlansPkey = 'plans_pkey',
  /** unique or primary key constraint on columns "unique_name" */
  PlansUniqueNameUnique = 'plans_unique_name_unique'
}

/** input type for incrementing numeric columns in table "plans" */
export type Plans_Inc_Input = {
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "plans" */
export type Plans_Insert_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Human-readable description of the plan */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Whether plan is available for new subscriptions */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: InputMaybe<Scalars['Int']['input']>;
  /** Display-ready label for UI (Free, Pro, Team) */
  name?: InputMaybe<Scalars['String']['input']>;
  organization_plans?: InputMaybe<Organization_Plans_Arr_Rel_Insert_Input>;
  prices?: InputMaybe<Plan_Prices_Arr_Rel_Insert_Input>;
  question_types?: InputMaybe<Plan_Question_Types_Arr_Rel_Insert_Input>;
  /** Whether to show "Powered by" branding on widgets */
  show_branding?: InputMaybe<Scalars['Boolean']['input']>;
  /** Slug for code comparisons (free, pro, team) */
  unique_name?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Plans_Max_Fields = {
  __typename?: 'plans_max_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Human-readable description of the plan */
  description?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: Maybe<Scalars['Int']['output']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: Maybe<Scalars['Int']['output']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: Maybe<Scalars['Int']['output']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: Maybe<Scalars['Int']['output']>;
  /** Display-ready label for UI (Free, Pro, Team) */
  name?: Maybe<Scalars['String']['output']>;
  /** Slug for code comparisons (free, pro, team) */
  unique_name?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Plans_Min_Fields = {
  __typename?: 'plans_min_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Human-readable description of the plan */
  description?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: Maybe<Scalars['Int']['output']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: Maybe<Scalars['Int']['output']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: Maybe<Scalars['Int']['output']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: Maybe<Scalars['Int']['output']>;
  /** Display-ready label for UI (Free, Pro, Team) */
  name?: Maybe<Scalars['String']['output']>;
  /** Slug for code comparisons (free, pro, team) */
  unique_name?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "plans" */
export type Plans_Mutation_Response = {
  __typename?: 'plans_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Plans>;
};

/** input type for inserting object relation for remote table "plans" */
export type Plans_Obj_Rel_Insert_Input = {
  data: Plans_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Plans_On_Conflict>;
};

/** on_conflict condition type for table "plans" */
export type Plans_On_Conflict = {
  constraint: Plans_Constraint;
  update_columns?: Array<Plans_Update_Column>;
  where?: InputMaybe<Plans_Bool_Exp>;
};

/** Ordering options when selecting data from "plans". */
export type Plans_Order_By = {
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  max_forms?: InputMaybe<Order_By>;
  max_members?: InputMaybe<Order_By>;
  max_testimonials?: InputMaybe<Order_By>;
  max_widgets?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization_plans_aggregate?: InputMaybe<Organization_Plans_Aggregate_Order_By>;
  prices_aggregate?: InputMaybe<Plan_Prices_Aggregate_Order_By>;
  question_types_aggregate?: InputMaybe<Plan_Question_Types_Aggregate_Order_By>;
  show_branding?: InputMaybe<Order_By>;
  unique_name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: plans */
export type Plans_Pk_Columns_Input = {
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['input'];
};

/** select columns of table "plans" */
export enum Plans_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  MaxForms = 'max_forms',
  /** column name */
  MaxMembers = 'max_members',
  /** column name */
  MaxTestimonials = 'max_testimonials',
  /** column name */
  MaxWidgets = 'max_widgets',
  /** column name */
  Name = 'name',
  /** column name */
  ShowBranding = 'show_branding',
  /** column name */
  UniqueName = 'unique_name',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "plans" */
export type Plans_Set_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Human-readable description of the plan */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Whether plan is available for new subscriptions */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: InputMaybe<Scalars['Int']['input']>;
  /** Display-ready label for UI (Free, Pro, Team) */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Whether to show "Powered by" branding on widgets */
  show_branding?: InputMaybe<Scalars['Boolean']['input']>;
  /** Slug for code comparisons (free, pro, team) */
  unique_name?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Plans_Stddev_Fields = {
  __typename?: 'plans_stddev_fields';
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Plans_Stddev_Pop_Fields = {
  __typename?: 'plans_stddev_pop_fields';
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Plans_Stddev_Samp_Fields = {
  __typename?: 'plans_stddev_samp_fields';
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "plans" */
export type Plans_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Plans_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Plans_Stream_Cursor_Value_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Human-readable description of the plan */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Whether plan is available for new subscriptions */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: InputMaybe<Scalars['Int']['input']>;
  /** Display-ready label for UI (Free, Pro, Team) */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Whether to show "Powered by" branding on widgets */
  show_branding?: InputMaybe<Scalars['Boolean']['input']>;
  /** Slug for code comparisons (free, pro, team) */
  unique_name?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Plans_Sum_Fields = {
  __typename?: 'plans_sum_fields';
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: Maybe<Scalars['Int']['output']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: Maybe<Scalars['Int']['output']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: Maybe<Scalars['Int']['output']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "plans" */
export enum Plans_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  MaxForms = 'max_forms',
  /** column name */
  MaxMembers = 'max_members',
  /** column name */
  MaxTestimonials = 'max_testimonials',
  /** column name */
  MaxWidgets = 'max_widgets',
  /** column name */
  Name = 'name',
  /** column name */
  ShowBranding = 'show_branding',
  /** column name */
  UniqueName = 'unique_name',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Plans_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Plans_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Plans_Set_Input>;
  /** filter the rows which have to be updated */
  where: Plans_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Plans_Var_Pop_Fields = {
  __typename?: 'plans_var_pop_fields';
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Plans_Var_Samp_Fields = {
  __typename?: 'plans_var_samp_fields';
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Plans_Variance_Fields = {
  __typename?: 'plans_variance_fields';
  /** Maximum collection forms allowed (-1 = unlimited) */
  max_forms?: Maybe<Scalars['Float']['output']>;
  /** Maximum team members allowed (-1 = unlimited) */
  max_members?: Maybe<Scalars['Float']['output']>;
  /** Maximum testimonials allowed (-1 = unlimited) */
  max_testimonials?: Maybe<Scalars['Float']['output']>;
  /** Maximum display widgets allowed (-1 = unlimited) */
  max_widgets?: Maybe<Scalars['Float']['output']>;
};

export type Query_Root = {
  __typename?: 'query_root';
  /** An array relationship */
  contacts: Array<Contacts>;
  /** An aggregate relationship */
  contacts_aggregate: Contacts_Aggregate;
  /** fetch data from the table: "contacts" using primary key columns */
  contacts_by_pk?: Maybe<Contacts>;
  /** fetch data from the table: "form_question_responses" */
  form_question_responses: Array<Form_Question_Responses>;
  /** fetch aggregated fields from the table: "form_question_responses" */
  form_question_responses_aggregate: Form_Question_Responses_Aggregate;
  /** fetch data from the table: "form_question_responses" using primary key columns */
  form_question_responses_by_pk?: Maybe<Form_Question_Responses>;
  /** fetch data from the table: "form_questions" */
  form_questions: Array<Form_Questions>;
  /** fetch aggregated fields from the table: "form_questions" */
  form_questions_aggregate: Form_Questions_Aggregate;
  /** fetch data from the table: "form_questions" using primary key columns */
  form_questions_by_pk?: Maybe<Form_Questions>;
  /** fetch data from the table: "form_steps" */
  form_steps: Array<Form_Steps>;
  /** fetch aggregated fields from the table: "form_steps" */
  form_steps_aggregate: Form_Steps_Aggregate;
  /** fetch data from the table: "form_steps" using primary key columns */
  form_steps_by_pk?: Maybe<Form_Steps>;
  /** fetch data from the table: "form_submissions" */
  form_submissions: Array<Form_Submissions>;
  /** fetch aggregated fields from the table: "form_submissions" */
  form_submissions_aggregate: Form_Submissions_Aggregate;
  /** fetch data from the table: "form_submissions" using primary key columns */
  form_submissions_by_pk?: Maybe<Form_Submissions>;
  /** An array relationship */
  forms: Array<Forms>;
  /** An aggregate relationship */
  forms_aggregate: Forms_Aggregate;
  /** fetch data from the table: "forms" using primary key columns */
  forms_by_pk?: Maybe<Forms>;
  /** An array relationship */
  organization_plans: Array<Organization_Plans>;
  /** An aggregate relationship */
  organization_plans_aggregate: Organization_Plans_Aggregate;
  /** fetch data from the table: "organization_plans" using primary key columns */
  organization_plans_by_pk?: Maybe<Organization_Plans>;
  /** An array relationship */
  organization_roles: Array<Organization_Roles>;
  /** An aggregate relationship */
  organization_roles_aggregate: Organization_Roles_Aggregate;
  /** fetch data from the table: "organization_roles" using primary key columns */
  organization_roles_by_pk?: Maybe<Organization_Roles>;
  /** fetch data from the table: "organizations" */
  organizations: Array<Organizations>;
  /** fetch aggregated fields from the table: "organizations" */
  organizations_aggregate: Organizations_Aggregate;
  /** fetch data from the table: "organizations" using primary key columns */
  organizations_by_pk?: Maybe<Organizations>;
  /** fetch data from the table: "plan_prices" */
  plan_prices: Array<Plan_Prices>;
  /** fetch aggregated fields from the table: "plan_prices" */
  plan_prices_aggregate: Plan_Prices_Aggregate;
  /** fetch data from the table: "plan_prices" using primary key columns */
  plan_prices_by_pk?: Maybe<Plan_Prices>;
  /** fetch data from the table: "plan_question_types" */
  plan_question_types: Array<Plan_Question_Types>;
  /** fetch aggregated fields from the table: "plan_question_types" */
  plan_question_types_aggregate: Plan_Question_Types_Aggregate;
  /** fetch data from the table: "plan_question_types" using primary key columns */
  plan_question_types_by_pk?: Maybe<Plan_Question_Types>;
  /** fetch data from the table: "plans" */
  plans: Array<Plans>;
  /** fetch aggregated fields from the table: "plans" */
  plans_aggregate: Plans_Aggregate;
  /** fetch data from the table: "plans" using primary key columns */
  plans_by_pk?: Maybe<Plans>;
  /** fetch data from the table: "question_options" */
  question_options: Array<Question_Options>;
  /** fetch aggregated fields from the table: "question_options" */
  question_options_aggregate: Question_Options_Aggregate;
  /** fetch data from the table: "question_options" using primary key columns */
  question_options_by_pk?: Maybe<Question_Options>;
  /** fetch data from the table: "question_types" */
  question_types: Array<Question_Types>;
  /** fetch aggregated fields from the table: "question_types" */
  question_types_aggregate: Question_Types_Aggregate;
  /** fetch data from the table: "question_types" using primary key columns */
  question_types_by_pk?: Maybe<Question_Types>;
  /** fetch data from the table: "roles" */
  roles: Array<Roles>;
  /** fetch aggregated fields from the table: "roles" */
  roles_aggregate: Roles_Aggregate;
  /** fetch data from the table: "roles" using primary key columns */
  roles_by_pk?: Maybe<Roles>;
  /** An array relationship */
  testimonials: Array<Testimonials>;
  /** An aggregate relationship */
  testimonials_aggregate: Testimonials_Aggregate;
  /** fetch data from the table: "testimonials" using primary key columns */
  testimonials_by_pk?: Maybe<Testimonials>;
  /** fetch data from the table: "user_identities" */
  user_identities: Array<User_Identities>;
  /** fetch aggregated fields from the table: "user_identities" */
  user_identities_aggregate: User_Identities_Aggregate;
  /** fetch data from the table: "user_identities" using primary key columns */
  user_identities_by_pk?: Maybe<User_Identities>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** fetch data from the table: "widget_testimonials" */
  widget_testimonials: Array<Widget_Testimonials>;
  /** fetch aggregated fields from the table: "widget_testimonials" */
  widget_testimonials_aggregate: Widget_Testimonials_Aggregate;
  /** fetch data from the table: "widget_testimonials" using primary key columns */
  widget_testimonials_by_pk?: Maybe<Widget_Testimonials>;
  /** An array relationship */
  widgets: Array<Widgets>;
  /** An aggregate relationship */
  widgets_aggregate: Widgets_Aggregate;
  /** fetch data from the table: "widgets" using primary key columns */
  widgets_by_pk?: Maybe<Widgets>;
};


export type Query_RootContactsArgs = {
  distinct_on?: InputMaybe<Array<Contacts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Contacts_Order_By>>;
  where?: InputMaybe<Contacts_Bool_Exp>;
};


export type Query_RootContacts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Contacts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Contacts_Order_By>>;
  where?: InputMaybe<Contacts_Bool_Exp>;
};


export type Query_RootContacts_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootForm_Question_ResponsesArgs = {
  distinct_on?: InputMaybe<Array<Form_Question_Responses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Question_Responses_Order_By>>;
  where?: InputMaybe<Form_Question_Responses_Bool_Exp>;
};


export type Query_RootForm_Question_Responses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Question_Responses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Question_Responses_Order_By>>;
  where?: InputMaybe<Form_Question_Responses_Bool_Exp>;
};


export type Query_RootForm_Question_Responses_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootForm_QuestionsArgs = {
  distinct_on?: InputMaybe<Array<Form_Questions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Questions_Order_By>>;
  where?: InputMaybe<Form_Questions_Bool_Exp>;
};


export type Query_RootForm_Questions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Questions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Questions_Order_By>>;
  where?: InputMaybe<Form_Questions_Bool_Exp>;
};


export type Query_RootForm_Questions_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootForm_StepsArgs = {
  distinct_on?: InputMaybe<Array<Form_Steps_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Steps_Order_By>>;
  where?: InputMaybe<Form_Steps_Bool_Exp>;
};


export type Query_RootForm_Steps_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Steps_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Steps_Order_By>>;
  where?: InputMaybe<Form_Steps_Bool_Exp>;
};


export type Query_RootForm_Steps_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootForm_SubmissionsArgs = {
  distinct_on?: InputMaybe<Array<Form_Submissions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Submissions_Order_By>>;
  where?: InputMaybe<Form_Submissions_Bool_Exp>;
};


export type Query_RootForm_Submissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Submissions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Submissions_Order_By>>;
  where?: InputMaybe<Form_Submissions_Bool_Exp>;
};


export type Query_RootForm_Submissions_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootFormsArgs = {
  distinct_on?: InputMaybe<Array<Forms_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Forms_Order_By>>;
  where?: InputMaybe<Forms_Bool_Exp>;
};


export type Query_RootForms_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Forms_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Forms_Order_By>>;
  where?: InputMaybe<Forms_Bool_Exp>;
};


export type Query_RootForms_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootOrganization_PlansArgs = {
  distinct_on?: InputMaybe<Array<Organization_Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Plans_Order_By>>;
  where?: InputMaybe<Organization_Plans_Bool_Exp>;
};


export type Query_RootOrganization_Plans_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organization_Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Plans_Order_By>>;
  where?: InputMaybe<Organization_Plans_Bool_Exp>;
};


export type Query_RootOrganization_Plans_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootOrganization_RolesArgs = {
  distinct_on?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Roles_Order_By>>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};


export type Query_RootOrganization_Roles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Roles_Order_By>>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};


export type Query_RootOrganization_Roles_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootOrganizationsArgs = {
  distinct_on?: InputMaybe<Array<Organizations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organizations_Order_By>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


export type Query_RootOrganizations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organizations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organizations_Order_By>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


export type Query_RootOrganizations_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootPlan_PricesArgs = {
  distinct_on?: InputMaybe<Array<Plan_Prices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Prices_Order_By>>;
  where?: InputMaybe<Plan_Prices_Bool_Exp>;
};


export type Query_RootPlan_Prices_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Plan_Prices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Prices_Order_By>>;
  where?: InputMaybe<Plan_Prices_Bool_Exp>;
};


export type Query_RootPlan_Prices_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootPlan_Question_TypesArgs = {
  distinct_on?: InputMaybe<Array<Plan_Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Question_Types_Order_By>>;
  where?: InputMaybe<Plan_Question_Types_Bool_Exp>;
};


export type Query_RootPlan_Question_Types_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Plan_Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Question_Types_Order_By>>;
  where?: InputMaybe<Plan_Question_Types_Bool_Exp>;
};


export type Query_RootPlan_Question_Types_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootPlansArgs = {
  distinct_on?: InputMaybe<Array<Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plans_Order_By>>;
  where?: InputMaybe<Plans_Bool_Exp>;
};


export type Query_RootPlans_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plans_Order_By>>;
  where?: InputMaybe<Plans_Bool_Exp>;
};


export type Query_RootPlans_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootQuestion_OptionsArgs = {
  distinct_on?: InputMaybe<Array<Question_Options_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Question_Options_Order_By>>;
  where?: InputMaybe<Question_Options_Bool_Exp>;
};


export type Query_RootQuestion_Options_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Question_Options_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Question_Options_Order_By>>;
  where?: InputMaybe<Question_Options_Bool_Exp>;
};


export type Query_RootQuestion_Options_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootQuestion_TypesArgs = {
  distinct_on?: InputMaybe<Array<Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Question_Types_Order_By>>;
  where?: InputMaybe<Question_Types_Bool_Exp>;
};


export type Query_RootQuestion_Types_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Question_Types_Order_By>>;
  where?: InputMaybe<Question_Types_Bool_Exp>;
};


export type Query_RootQuestion_Types_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootRolesArgs = {
  distinct_on?: InputMaybe<Array<Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Roles_Order_By>>;
  where?: InputMaybe<Roles_Bool_Exp>;
};


export type Query_RootRoles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Roles_Order_By>>;
  where?: InputMaybe<Roles_Bool_Exp>;
};


export type Query_RootRoles_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootTestimonialsArgs = {
  distinct_on?: InputMaybe<Array<Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Testimonials_Order_By>>;
  where?: InputMaybe<Testimonials_Bool_Exp>;
};


export type Query_RootTestimonials_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Testimonials_Order_By>>;
  where?: InputMaybe<Testimonials_Bool_Exp>;
};


export type Query_RootTestimonials_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootUser_IdentitiesArgs = {
  distinct_on?: InputMaybe<Array<User_Identities_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Identities_Order_By>>;
  where?: InputMaybe<User_Identities_Bool_Exp>;
};


export type Query_RootUser_Identities_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Identities_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Identities_Order_By>>;
  where?: InputMaybe<User_Identities_Bool_Exp>;
};


export type Query_RootUser_Identities_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootWidget_TestimonialsArgs = {
  distinct_on?: InputMaybe<Array<Widget_Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widget_Testimonials_Order_By>>;
  where?: InputMaybe<Widget_Testimonials_Bool_Exp>;
};


export type Query_RootWidget_Testimonials_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Widget_Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widget_Testimonials_Order_By>>;
  where?: InputMaybe<Widget_Testimonials_Bool_Exp>;
};


export type Query_RootWidget_Testimonials_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootWidgetsArgs = {
  distinct_on?: InputMaybe<Array<Widgets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widgets_Order_By>>;
  where?: InputMaybe<Widgets_Bool_Exp>;
};


export type Query_RootWidgets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Widgets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widgets_Order_By>>;
  where?: InputMaybe<Widgets_Bool_Exp>;
};


export type Query_RootWidgets_By_PkArgs = {
  id: Scalars['String']['input'];
};

/** Predefined choices for choice-type questions (radio, checkbox, dropdown) */
export type Question_Options = {
  __typename?: 'question_options';
  /** Timestamp when option was created. Immutable after insert */
  created_at: Scalars['timestamptz']['output'];
  /** FK to users - user who created this option */
  created_by: Scalars['String']['output'];
  /** An object relationship */
  creator: Users;
  /** Order in option list. Unique per question, starts at 1 */
  display_order: Scalars['smallint']['output'];
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['output'];
  /** Soft delete flag. False = option hidden but existing answers preserved */
  is_active: Scalars['Boolean']['output'];
  /** Pre-selected when form loads. Only one per question should be true */
  is_default: Scalars['Boolean']['output'];
  /** Display text shown to customer (e.g., "Yes, definitely!", "Not right now") */
  option_label: Scalars['String']['output'];
  /** Stored value saved in form_question_responses (e.g., "yes", "no", "maybe") */
  option_value: Scalars['String']['output'];
  /** An object relationship */
  organization: Organizations;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id: Scalars['String']['output'];
  /** An object relationship */
  question: Form_Questions;
  /** FK to form_questions - must be a choice-type question */
  question_id: Scalars['String']['output'];
};

/** aggregated selection of "question_options" */
export type Question_Options_Aggregate = {
  __typename?: 'question_options_aggregate';
  aggregate?: Maybe<Question_Options_Aggregate_Fields>;
  nodes: Array<Question_Options>;
};

export type Question_Options_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Question_Options_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Question_Options_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Question_Options_Aggregate_Bool_Exp_Count>;
};

export type Question_Options_Aggregate_Bool_Exp_Bool_And = {
  arguments: Question_Options_Select_Column_Question_Options_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Question_Options_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Question_Options_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Question_Options_Select_Column_Question_Options_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Question_Options_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Question_Options_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Question_Options_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Question_Options_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "question_options" */
export type Question_Options_Aggregate_Fields = {
  __typename?: 'question_options_aggregate_fields';
  avg?: Maybe<Question_Options_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Question_Options_Max_Fields>;
  min?: Maybe<Question_Options_Min_Fields>;
  stddev?: Maybe<Question_Options_Stddev_Fields>;
  stddev_pop?: Maybe<Question_Options_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Question_Options_Stddev_Samp_Fields>;
  sum?: Maybe<Question_Options_Sum_Fields>;
  var_pop?: Maybe<Question_Options_Var_Pop_Fields>;
  var_samp?: Maybe<Question_Options_Var_Samp_Fields>;
  variance?: Maybe<Question_Options_Variance_Fields>;
};


/** aggregate fields of "question_options" */
export type Question_Options_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Question_Options_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "question_options" */
export type Question_Options_Aggregate_Order_By = {
  avg?: InputMaybe<Question_Options_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Question_Options_Max_Order_By>;
  min?: InputMaybe<Question_Options_Min_Order_By>;
  stddev?: InputMaybe<Question_Options_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Question_Options_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Question_Options_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Question_Options_Sum_Order_By>;
  var_pop?: InputMaybe<Question_Options_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Question_Options_Var_Samp_Order_By>;
  variance?: InputMaybe<Question_Options_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "question_options" */
export type Question_Options_Arr_Rel_Insert_Input = {
  data: Array<Question_Options_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Question_Options_On_Conflict>;
};

/** aggregate avg on columns */
export type Question_Options_Avg_Fields = {
  __typename?: 'question_options_avg_fields';
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "question_options" */
export type Question_Options_Avg_Order_By = {
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "question_options". All fields are combined with a logical 'AND'. */
export type Question_Options_Bool_Exp = {
  _and?: InputMaybe<Array<Question_Options_Bool_Exp>>;
  _not?: InputMaybe<Question_Options_Bool_Exp>;
  _or?: InputMaybe<Array<Question_Options_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_by?: InputMaybe<String_Comparison_Exp>;
  creator?: InputMaybe<Users_Bool_Exp>;
  display_order?: InputMaybe<Smallint_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_default?: InputMaybe<Boolean_Comparison_Exp>;
  option_label?: InputMaybe<String_Comparison_Exp>;
  option_value?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  question?: InputMaybe<Form_Questions_Bool_Exp>;
  question_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "question_options" */
export enum Question_Options_Constraint {
  /** unique or primary key constraint on columns "question_id", "display_order" */
  QuestionOptionsOrderPerQuestionUnique = 'question_options_order_per_question_unique',
  /** unique or primary key constraint on columns "id" */
  QuestionOptionsPkey = 'question_options_pkey',
  /** unique or primary key constraint on columns "question_id", "option_value" */
  QuestionOptionsValuePerQuestionUnique = 'question_options_value_per_question_unique'
}

/** input type for incrementing numeric columns in table "question_options" */
export type Question_Options_Inc_Input = {
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
};

/** input type for inserting data into table "question_options" */
export type Question_Options_Insert_Input = {
  /** Timestamp when option was created. Immutable after insert */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who created this option */
  created_by?: InputMaybe<Scalars['String']['input']>;
  creator?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = option hidden but existing answers preserved */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Pre-selected when form loads. Only one per question should be true */
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  /** Display text shown to customer (e.g., "Yes, definitely!", "Not right now") */
  option_label?: InputMaybe<Scalars['String']['input']>;
  /** Stored value saved in form_question_responses (e.g., "yes", "no", "maybe") */
  option_value?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  question?: InputMaybe<Form_Questions_Obj_Rel_Insert_Input>;
  /** FK to form_questions - must be a choice-type question */
  question_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Question_Options_Max_Fields = {
  __typename?: 'question_options_max_fields';
  /** Timestamp when option was created. Immutable after insert */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - user who created this option */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: Maybe<Scalars['smallint']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** Display text shown to customer (e.g., "Yes, definitely!", "Not right now") */
  option_label?: Maybe<Scalars['String']['output']>;
  /** Stored value saved in form_question_responses (e.g., "yes", "no", "maybe") */
  option_value?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** FK to form_questions - must be a choice-type question */
  question_id?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "question_options" */
export type Question_Options_Max_Order_By = {
  /** Timestamp when option was created. Immutable after insert */
  created_at?: InputMaybe<Order_By>;
  /** FK to users - user who created this option */
  created_by?: InputMaybe<Order_By>;
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** Display text shown to customer (e.g., "Yes, definitely!", "Not right now") */
  option_label?: InputMaybe<Order_By>;
  /** Stored value saved in form_question_responses (e.g., "yes", "no", "maybe") */
  option_value?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Order_By>;
  /** FK to form_questions - must be a choice-type question */
  question_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Question_Options_Min_Fields = {
  __typename?: 'question_options_min_fields';
  /** Timestamp when option was created. Immutable after insert */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - user who created this option */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: Maybe<Scalars['smallint']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** Display text shown to customer (e.g., "Yes, definitely!", "Not right now") */
  option_label?: Maybe<Scalars['String']['output']>;
  /** Stored value saved in form_question_responses (e.g., "yes", "no", "maybe") */
  option_value?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** FK to form_questions - must be a choice-type question */
  question_id?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "question_options" */
export type Question_Options_Min_Order_By = {
  /** Timestamp when option was created. Immutable after insert */
  created_at?: InputMaybe<Order_By>;
  /** FK to users - user who created this option */
  created_by?: InputMaybe<Order_By>;
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** Display text shown to customer (e.g., "Yes, definitely!", "Not right now") */
  option_label?: InputMaybe<Order_By>;
  /** Stored value saved in form_question_responses (e.g., "yes", "no", "maybe") */
  option_value?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Order_By>;
  /** FK to form_questions - must be a choice-type question */
  question_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "question_options" */
export type Question_Options_Mutation_Response = {
  __typename?: 'question_options_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Question_Options>;
};

/** on_conflict condition type for table "question_options" */
export type Question_Options_On_Conflict = {
  constraint: Question_Options_Constraint;
  update_columns?: Array<Question_Options_Update_Column>;
  where?: InputMaybe<Question_Options_Bool_Exp>;
};

/** Ordering options when selecting data from "question_options". */
export type Question_Options_Order_By = {
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  creator?: InputMaybe<Users_Order_By>;
  display_order?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_default?: InputMaybe<Order_By>;
  option_label?: InputMaybe<Order_By>;
  option_value?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  question?: InputMaybe<Form_Questions_Order_By>;
  question_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: question_options */
export type Question_Options_Pk_Columns_Input = {
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['input'];
};

/** select columns of table "question_options" */
export enum Question_Options_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  DisplayOrder = 'display_order',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDefault = 'is_default',
  /** column name */
  OptionLabel = 'option_label',
  /** column name */
  OptionValue = 'option_value',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  QuestionId = 'question_id'
}

/** select "question_options_aggregate_bool_exp_bool_and_arguments_columns" columns of table "question_options" */
export enum Question_Options_Select_Column_Question_Options_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDefault = 'is_default'
}

/** select "question_options_aggregate_bool_exp_bool_or_arguments_columns" columns of table "question_options" */
export enum Question_Options_Select_Column_Question_Options_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDefault = 'is_default'
}

/** input type for updating data in table "question_options" */
export type Question_Options_Set_Input = {
  /** Timestamp when option was created. Immutable after insert */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who created this option */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = option hidden but existing answers preserved */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Pre-selected when form loads. Only one per question should be true */
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  /** Display text shown to customer (e.g., "Yes, definitely!", "Not right now") */
  option_label?: InputMaybe<Scalars['String']['input']>;
  /** Stored value saved in form_question_responses (e.g., "yes", "no", "maybe") */
  option_value?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to form_questions - must be a choice-type question */
  question_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Question_Options_Stddev_Fields = {
  __typename?: 'question_options_stddev_fields';
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "question_options" */
export type Question_Options_Stddev_Order_By = {
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Question_Options_Stddev_Pop_Fields = {
  __typename?: 'question_options_stddev_pop_fields';
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "question_options" */
export type Question_Options_Stddev_Pop_Order_By = {
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Question_Options_Stddev_Samp_Fields = {
  __typename?: 'question_options_stddev_samp_fields';
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "question_options" */
export type Question_Options_Stddev_Samp_Order_By = {
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "question_options" */
export type Question_Options_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Question_Options_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Question_Options_Stream_Cursor_Value_Input = {
  /** Timestamp when option was created. Immutable after insert */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who created this option */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = option hidden but existing answers preserved */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Pre-selected when form loads. Only one per question should be true */
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  /** Display text shown to customer (e.g., "Yes, definitely!", "Not right now") */
  option_label?: InputMaybe<Scalars['String']['input']>;
  /** Stored value saved in form_question_responses (e.g., "yes", "no", "maybe") */
  option_value?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to form_questions - must be a choice-type question */
  question_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Question_Options_Sum_Fields = {
  __typename?: 'question_options_sum_fields';
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: Maybe<Scalars['smallint']['output']>;
};

/** order by sum() on columns of table "question_options" */
export type Question_Options_Sum_Order_By = {
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** update columns of table "question_options" */
export enum Question_Options_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  DisplayOrder = 'display_order',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsDefault = 'is_default',
  /** column name */
  OptionLabel = 'option_label',
  /** column name */
  OptionValue = 'option_value',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  QuestionId = 'question_id'
}

export type Question_Options_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Question_Options_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Question_Options_Set_Input>;
  /** filter the rows which have to be updated */
  where: Question_Options_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Question_Options_Var_Pop_Fields = {
  __typename?: 'question_options_var_pop_fields';
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "question_options" */
export type Question_Options_Var_Pop_Order_By = {
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Question_Options_Var_Samp_Fields = {
  __typename?: 'question_options_var_samp_fields';
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "question_options" */
export type Question_Options_Var_Samp_Order_By = {
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Question_Options_Variance_Fields = {
  __typename?: 'question_options_variance_fields';
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "question_options" */
export type Question_Options_Variance_Order_By = {
  /** Order in option list. Unique per question, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** Question type definitions - seed data, system-defined, not user-modifiable */
export type Question_Types = {
  __typename?: 'question_types';
  /** Data type for storing answers: text, integer, boolean, decimal, json, url */
  answer_data_type: Scalars['String']['output'];
  /** An array relationship */
  available_in_plans: Array<Plan_Question_Types>;
  /** An aggregate relationship */
  available_in_plans_aggregate: Plan_Question_Types_Aggregate;
  /** Type grouping: text, rating, choice, media, special. Used for UI organization */
  category: Scalars['String']['output'];
  /** Timestamp when type was seeded. Immutable */
  created_at: Scalars['timestamptz']['output'];
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: Maybe<Scalars['Int']['output']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: Maybe<Scalars['Int']['output']>;
  /** Brief explanation of type purpose shown in form builder tooltip */
  description?: Maybe<Scalars['String']['output']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order: Scalars['smallint']['output'];
  /** Heroicons icon name for form builder UI (e.g., minus, star, calendar) */
  icon?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['output'];
  /** Vue component name for rendering (TextInput, StarRating). Maps to frontend */
  input_component: Scalars['String']['output'];
  /** Whether type is available for new questions. False hides from form builder */
  is_active: Scalars['Boolean']['output'];
  /** Display label for UI (Short Text, Star Rating). Human-readable */
  name: Scalars['String']['output'];
  /** An array relationship */
  questions: Array<Form_Questions>;
  /** An aggregate relationship */
  questions_aggregate: Form_Questions_Aggregate;
  /** Whether file type restrictions are applicable (true for media types) */
  supports_file_types: Scalars['Boolean']['output'];
  /** Whether file size limit is applicable (true for media types) */
  supports_max_file_size: Scalars['Boolean']['output'];
  /** Whether max_length validation is applicable (true for text types) */
  supports_max_length: Scalars['Boolean']['output'];
  /** Whether max_value validation is applicable (true for rating types) */
  supports_max_value: Scalars['Boolean']['output'];
  /** Whether min_length validation is applicable (true for text types) */
  supports_min_length: Scalars['Boolean']['output'];
  /** Whether min_value validation is applicable (true for rating types) */
  supports_min_value: Scalars['Boolean']['output'];
  /** Whether predefined choices are applicable (true for choice types) */
  supports_options: Scalars['Boolean']['output'];
  /** Whether regex validation is applicable (true for email, URL types) */
  supports_pattern: Scalars['Boolean']['output'];
  /** Code identifier for type lookups (text_short, rating_star). Use in code comparisons */
  unique_name: Scalars['String']['output'];
};


/** Question type definitions - seed data, system-defined, not user-modifiable */
export type Question_TypesAvailable_In_PlansArgs = {
  distinct_on?: InputMaybe<Array<Plan_Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Question_Types_Order_By>>;
  where?: InputMaybe<Plan_Question_Types_Bool_Exp>;
};


/** Question type definitions - seed data, system-defined, not user-modifiable */
export type Question_TypesAvailable_In_Plans_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Plan_Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Question_Types_Order_By>>;
  where?: InputMaybe<Plan_Question_Types_Bool_Exp>;
};


/** Question type definitions - seed data, system-defined, not user-modifiable */
export type Question_TypesQuestionsArgs = {
  distinct_on?: InputMaybe<Array<Form_Questions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Questions_Order_By>>;
  where?: InputMaybe<Form_Questions_Bool_Exp>;
};


/** Question type definitions - seed data, system-defined, not user-modifiable */
export type Question_TypesQuestions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Questions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Questions_Order_By>>;
  where?: InputMaybe<Form_Questions_Bool_Exp>;
};

/** aggregated selection of "question_types" */
export type Question_Types_Aggregate = {
  __typename?: 'question_types_aggregate';
  aggregate?: Maybe<Question_Types_Aggregate_Fields>;
  nodes: Array<Question_Types>;
};

/** aggregate fields of "question_types" */
export type Question_Types_Aggregate_Fields = {
  __typename?: 'question_types_aggregate_fields';
  avg?: Maybe<Question_Types_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Question_Types_Max_Fields>;
  min?: Maybe<Question_Types_Min_Fields>;
  stddev?: Maybe<Question_Types_Stddev_Fields>;
  stddev_pop?: Maybe<Question_Types_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Question_Types_Stddev_Samp_Fields>;
  sum?: Maybe<Question_Types_Sum_Fields>;
  var_pop?: Maybe<Question_Types_Var_Pop_Fields>;
  var_samp?: Maybe<Question_Types_Var_Samp_Fields>;
  variance?: Maybe<Question_Types_Variance_Fields>;
};


/** aggregate fields of "question_types" */
export type Question_Types_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Question_Types_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Question_Types_Avg_Fields = {
  __typename?: 'question_types_avg_fields';
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: Maybe<Scalars['Float']['output']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: Maybe<Scalars['Float']['output']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "question_types". All fields are combined with a logical 'AND'. */
export type Question_Types_Bool_Exp = {
  _and?: InputMaybe<Array<Question_Types_Bool_Exp>>;
  _not?: InputMaybe<Question_Types_Bool_Exp>;
  _or?: InputMaybe<Array<Question_Types_Bool_Exp>>;
  answer_data_type?: InputMaybe<String_Comparison_Exp>;
  available_in_plans?: InputMaybe<Plan_Question_Types_Bool_Exp>;
  available_in_plans_aggregate?: InputMaybe<Plan_Question_Types_Aggregate_Bool_Exp>;
  category?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  default_max_value?: InputMaybe<Int_Comparison_Exp>;
  default_min_value?: InputMaybe<Int_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  display_order?: InputMaybe<Smallint_Comparison_Exp>;
  icon?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  input_component?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  questions?: InputMaybe<Form_Questions_Bool_Exp>;
  questions_aggregate?: InputMaybe<Form_Questions_Aggregate_Bool_Exp>;
  supports_file_types?: InputMaybe<Boolean_Comparison_Exp>;
  supports_max_file_size?: InputMaybe<Boolean_Comparison_Exp>;
  supports_max_length?: InputMaybe<Boolean_Comparison_Exp>;
  supports_max_value?: InputMaybe<Boolean_Comparison_Exp>;
  supports_min_length?: InputMaybe<Boolean_Comparison_Exp>;
  supports_min_value?: InputMaybe<Boolean_Comparison_Exp>;
  supports_options?: InputMaybe<Boolean_Comparison_Exp>;
  supports_pattern?: InputMaybe<Boolean_Comparison_Exp>;
  unique_name?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "question_types" */
export enum Question_Types_Constraint {
  /** unique or primary key constraint on columns "id" */
  QuestionTypesPkey = 'question_types_pkey',
  /** unique or primary key constraint on columns "unique_name" */
  QuestionTypesUniqueNameUnique = 'question_types_unique_name_unique'
}

/** input type for incrementing numeric columns in table "question_types" */
export type Question_Types_Inc_Input = {
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: InputMaybe<Scalars['Int']['input']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: InputMaybe<Scalars['Int']['input']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
};

/** input type for inserting data into table "question_types" */
export type Question_Types_Insert_Input = {
  /** Data type for storing answers: text, integer, boolean, decimal, json, url */
  answer_data_type?: InputMaybe<Scalars['String']['input']>;
  available_in_plans?: InputMaybe<Plan_Question_Types_Arr_Rel_Insert_Input>;
  /** Type grouping: text, rating, choice, media, special. Used for UI organization */
  category?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when type was seeded. Immutable */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: InputMaybe<Scalars['Int']['input']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: InputMaybe<Scalars['Int']['input']>;
  /** Brief explanation of type purpose shown in form builder tooltip */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Heroicons icon name for form builder UI (e.g., minus, star, calendar) */
  icon?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Vue component name for rendering (TextInput, StarRating). Maps to frontend */
  input_component?: InputMaybe<Scalars['String']['input']>;
  /** Whether type is available for new questions. False hides from form builder */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Display label for UI (Short Text, Star Rating). Human-readable */
  name?: InputMaybe<Scalars['String']['input']>;
  questions?: InputMaybe<Form_Questions_Arr_Rel_Insert_Input>;
  /** Whether file type restrictions are applicable (true for media types) */
  supports_file_types?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether file size limit is applicable (true for media types) */
  supports_max_file_size?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether max_length validation is applicable (true for text types) */
  supports_max_length?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether max_value validation is applicable (true for rating types) */
  supports_max_value?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether min_length validation is applicable (true for text types) */
  supports_min_length?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether min_value validation is applicable (true for rating types) */
  supports_min_value?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether predefined choices are applicable (true for choice types) */
  supports_options?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether regex validation is applicable (true for email, URL types) */
  supports_pattern?: InputMaybe<Scalars['Boolean']['input']>;
  /** Code identifier for type lookups (text_short, rating_star). Use in code comparisons */
  unique_name?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Question_Types_Max_Fields = {
  __typename?: 'question_types_max_fields';
  /** Data type for storing answers: text, integer, boolean, decimal, json, url */
  answer_data_type?: Maybe<Scalars['String']['output']>;
  /** Type grouping: text, rating, choice, media, special. Used for UI organization */
  category?: Maybe<Scalars['String']['output']>;
  /** Timestamp when type was seeded. Immutable */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: Maybe<Scalars['Int']['output']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: Maybe<Scalars['Int']['output']>;
  /** Brief explanation of type purpose shown in form builder tooltip */
  description?: Maybe<Scalars['String']['output']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: Maybe<Scalars['smallint']['output']>;
  /** Heroicons icon name for form builder UI (e.g., minus, star, calendar) */
  icon?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** Vue component name for rendering (TextInput, StarRating). Maps to frontend */
  input_component?: Maybe<Scalars['String']['output']>;
  /** Display label for UI (Short Text, Star Rating). Human-readable */
  name?: Maybe<Scalars['String']['output']>;
  /** Code identifier for type lookups (text_short, rating_star). Use in code comparisons */
  unique_name?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Question_Types_Min_Fields = {
  __typename?: 'question_types_min_fields';
  /** Data type for storing answers: text, integer, boolean, decimal, json, url */
  answer_data_type?: Maybe<Scalars['String']['output']>;
  /** Type grouping: text, rating, choice, media, special. Used for UI organization */
  category?: Maybe<Scalars['String']['output']>;
  /** Timestamp when type was seeded. Immutable */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: Maybe<Scalars['Int']['output']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: Maybe<Scalars['Int']['output']>;
  /** Brief explanation of type purpose shown in form builder tooltip */
  description?: Maybe<Scalars['String']['output']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: Maybe<Scalars['smallint']['output']>;
  /** Heroicons icon name for form builder UI (e.g., minus, star, calendar) */
  icon?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** Vue component name for rendering (TextInput, StarRating). Maps to frontend */
  input_component?: Maybe<Scalars['String']['output']>;
  /** Display label for UI (Short Text, Star Rating). Human-readable */
  name?: Maybe<Scalars['String']['output']>;
  /** Code identifier for type lookups (text_short, rating_star). Use in code comparisons */
  unique_name?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "question_types" */
export type Question_Types_Mutation_Response = {
  __typename?: 'question_types_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Question_Types>;
};

/** input type for inserting object relation for remote table "question_types" */
export type Question_Types_Obj_Rel_Insert_Input = {
  data: Question_Types_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Question_Types_On_Conflict>;
};

/** on_conflict condition type for table "question_types" */
export type Question_Types_On_Conflict = {
  constraint: Question_Types_Constraint;
  update_columns?: Array<Question_Types_Update_Column>;
  where?: InputMaybe<Question_Types_Bool_Exp>;
};

/** Ordering options when selecting data from "question_types". */
export type Question_Types_Order_By = {
  answer_data_type?: InputMaybe<Order_By>;
  available_in_plans_aggregate?: InputMaybe<Plan_Question_Types_Aggregate_Order_By>;
  category?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  default_max_value?: InputMaybe<Order_By>;
  default_min_value?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  display_order?: InputMaybe<Order_By>;
  icon?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  input_component?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  questions_aggregate?: InputMaybe<Form_Questions_Aggregate_Order_By>;
  supports_file_types?: InputMaybe<Order_By>;
  supports_max_file_size?: InputMaybe<Order_By>;
  supports_max_length?: InputMaybe<Order_By>;
  supports_max_value?: InputMaybe<Order_By>;
  supports_min_length?: InputMaybe<Order_By>;
  supports_min_value?: InputMaybe<Order_By>;
  supports_options?: InputMaybe<Order_By>;
  supports_pattern?: InputMaybe<Order_By>;
  unique_name?: InputMaybe<Order_By>;
};

/** primary key columns input for table: question_types */
export type Question_Types_Pk_Columns_Input = {
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['input'];
};

/** select columns of table "question_types" */
export enum Question_Types_Select_Column {
  /** column name */
  AnswerDataType = 'answer_data_type',
  /** column name */
  Category = 'category',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DefaultMaxValue = 'default_max_value',
  /** column name */
  DefaultMinValue = 'default_min_value',
  /** column name */
  Description = 'description',
  /** column name */
  DisplayOrder = 'display_order',
  /** column name */
  Icon = 'icon',
  /** column name */
  Id = 'id',
  /** column name */
  InputComponent = 'input_component',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  SupportsFileTypes = 'supports_file_types',
  /** column name */
  SupportsMaxFileSize = 'supports_max_file_size',
  /** column name */
  SupportsMaxLength = 'supports_max_length',
  /** column name */
  SupportsMaxValue = 'supports_max_value',
  /** column name */
  SupportsMinLength = 'supports_min_length',
  /** column name */
  SupportsMinValue = 'supports_min_value',
  /** column name */
  SupportsOptions = 'supports_options',
  /** column name */
  SupportsPattern = 'supports_pattern',
  /** column name */
  UniqueName = 'unique_name'
}

/** input type for updating data in table "question_types" */
export type Question_Types_Set_Input = {
  /** Data type for storing answers: text, integer, boolean, decimal, json, url */
  answer_data_type?: InputMaybe<Scalars['String']['input']>;
  /** Type grouping: text, rating, choice, media, special. Used for UI organization */
  category?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when type was seeded. Immutable */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: InputMaybe<Scalars['Int']['input']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: InputMaybe<Scalars['Int']['input']>;
  /** Brief explanation of type purpose shown in form builder tooltip */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Heroicons icon name for form builder UI (e.g., minus, star, calendar) */
  icon?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Vue component name for rendering (TextInput, StarRating). Maps to frontend */
  input_component?: InputMaybe<Scalars['String']['input']>;
  /** Whether type is available for new questions. False hides from form builder */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Display label for UI (Short Text, Star Rating). Human-readable */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Whether file type restrictions are applicable (true for media types) */
  supports_file_types?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether file size limit is applicable (true for media types) */
  supports_max_file_size?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether max_length validation is applicable (true for text types) */
  supports_max_length?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether max_value validation is applicable (true for rating types) */
  supports_max_value?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether min_length validation is applicable (true for text types) */
  supports_min_length?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether min_value validation is applicable (true for rating types) */
  supports_min_value?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether predefined choices are applicable (true for choice types) */
  supports_options?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether regex validation is applicable (true for email, URL types) */
  supports_pattern?: InputMaybe<Scalars['Boolean']['input']>;
  /** Code identifier for type lookups (text_short, rating_star). Use in code comparisons */
  unique_name?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Question_Types_Stddev_Fields = {
  __typename?: 'question_types_stddev_fields';
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: Maybe<Scalars['Float']['output']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: Maybe<Scalars['Float']['output']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Question_Types_Stddev_Pop_Fields = {
  __typename?: 'question_types_stddev_pop_fields';
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: Maybe<Scalars['Float']['output']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: Maybe<Scalars['Float']['output']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Question_Types_Stddev_Samp_Fields = {
  __typename?: 'question_types_stddev_samp_fields';
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: Maybe<Scalars['Float']['output']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: Maybe<Scalars['Float']['output']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "question_types" */
export type Question_Types_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Question_Types_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Question_Types_Stream_Cursor_Value_Input = {
  /** Data type for storing answers: text, integer, boolean, decimal, json, url */
  answer_data_type?: InputMaybe<Scalars['String']['input']>;
  /** Type grouping: text, rating, choice, media, special. Used for UI organization */
  category?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when type was seeded. Immutable */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: InputMaybe<Scalars['Int']['input']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: InputMaybe<Scalars['Int']['input']>;
  /** Brief explanation of type purpose shown in form builder tooltip */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Heroicons icon name for form builder UI (e.g., minus, star, calendar) */
  icon?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Vue component name for rendering (TextInput, StarRating). Maps to frontend */
  input_component?: InputMaybe<Scalars['String']['input']>;
  /** Whether type is available for new questions. False hides from form builder */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Display label for UI (Short Text, Star Rating). Human-readable */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Whether file type restrictions are applicable (true for media types) */
  supports_file_types?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether file size limit is applicable (true for media types) */
  supports_max_file_size?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether max_length validation is applicable (true for text types) */
  supports_max_length?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether max_value validation is applicable (true for rating types) */
  supports_max_value?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether min_length validation is applicable (true for text types) */
  supports_min_length?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether min_value validation is applicable (true for rating types) */
  supports_min_value?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether predefined choices are applicable (true for choice types) */
  supports_options?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether regex validation is applicable (true for email, URL types) */
  supports_pattern?: InputMaybe<Scalars['Boolean']['input']>;
  /** Code identifier for type lookups (text_short, rating_star). Use in code comparisons */
  unique_name?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Question_Types_Sum_Fields = {
  __typename?: 'question_types_sum_fields';
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: Maybe<Scalars['Int']['output']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: Maybe<Scalars['Int']['output']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: Maybe<Scalars['smallint']['output']>;
};

/** update columns of table "question_types" */
export enum Question_Types_Update_Column {
  /** column name */
  AnswerDataType = 'answer_data_type',
  /** column name */
  Category = 'category',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DefaultMaxValue = 'default_max_value',
  /** column name */
  DefaultMinValue = 'default_min_value',
  /** column name */
  Description = 'description',
  /** column name */
  DisplayOrder = 'display_order',
  /** column name */
  Icon = 'icon',
  /** column name */
  Id = 'id',
  /** column name */
  InputComponent = 'input_component',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  SupportsFileTypes = 'supports_file_types',
  /** column name */
  SupportsMaxFileSize = 'supports_max_file_size',
  /** column name */
  SupportsMaxLength = 'supports_max_length',
  /** column name */
  SupportsMaxValue = 'supports_max_value',
  /** column name */
  SupportsMinLength = 'supports_min_length',
  /** column name */
  SupportsMinValue = 'supports_min_value',
  /** column name */
  SupportsOptions = 'supports_options',
  /** column name */
  SupportsPattern = 'supports_pattern',
  /** column name */
  UniqueName = 'unique_name'
}

export type Question_Types_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Question_Types_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Question_Types_Set_Input>;
  /** filter the rows which have to be updated */
  where: Question_Types_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Question_Types_Var_Pop_Fields = {
  __typename?: 'question_types_var_pop_fields';
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: Maybe<Scalars['Float']['output']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: Maybe<Scalars['Float']['output']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Question_Types_Var_Samp_Fields = {
  __typename?: 'question_types_var_samp_fields';
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: Maybe<Scalars['Float']['output']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: Maybe<Scalars['Float']['output']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Question_Types_Variance_Fields = {
  __typename?: 'question_types_variance_fields';
  /** Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS) */
  default_max_value?: Maybe<Scalars['Float']['output']>;
  /** Default minimum value when creating question (e.g., 1 for star rating) */
  default_min_value?: Maybe<Scalars['Float']['output']>;
  /** Order in form builder type picker. Lower = appears first */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** Permission definitions - explicit boolean columns for queryable permissions */
export type Roles = {
  __typename?: 'roles';
  /** Permission to delete the organization */
  can_delete_org: Scalars['Boolean']['output'];
  /** Permission to view and manage billing/subscription */
  can_manage_billing: Scalars['Boolean']['output'];
  /** Permission to create, edit, delete forms */
  can_manage_forms: Scalars['Boolean']['output'];
  /** Permission to invite, remove, change roles of org members */
  can_manage_members: Scalars['Boolean']['output'];
  /** Permission to approve, reject, edit testimonials */
  can_manage_testimonials: Scalars['Boolean']['output'];
  /** Permission to create, edit, delete widgets */
  can_manage_widgets: Scalars['Boolean']['output'];
  /** Timestamp when record was created */
  created_at: Scalars['timestamptz']['output'];
  /** Human-readable description of the role */
  description?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['output'];
  /** System roles cannot be deleted or modified by users */
  is_system_role: Scalars['Boolean']['output'];
  /** Read-only access - can view all resources but cannot modify anything */
  is_viewer: Scalars['Boolean']['output'];
  /** Display-ready label for UI (Owner, Admin, Member, Viewer) */
  name: Scalars['String']['output'];
  /** An array relationship */
  organization_roles: Array<Organization_Roles>;
  /** An aggregate relationship */
  organization_roles_aggregate: Organization_Roles_Aggregate;
  /** Unique slug for code comparisons (owner, admin, member, viewer) */
  unique_name: Scalars['String']['output'];
  /** Timestamp when record was last updated */
  updated_at: Scalars['timestamptz']['output'];
};


/** Permission definitions - explicit boolean columns for queryable permissions */
export type RolesOrganization_RolesArgs = {
  distinct_on?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Roles_Order_By>>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};


/** Permission definitions - explicit boolean columns for queryable permissions */
export type RolesOrganization_Roles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Roles_Order_By>>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};

/** aggregated selection of "roles" */
export type Roles_Aggregate = {
  __typename?: 'roles_aggregate';
  aggregate?: Maybe<Roles_Aggregate_Fields>;
  nodes: Array<Roles>;
};

/** aggregate fields of "roles" */
export type Roles_Aggregate_Fields = {
  __typename?: 'roles_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Roles_Max_Fields>;
  min?: Maybe<Roles_Min_Fields>;
};


/** aggregate fields of "roles" */
export type Roles_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Roles_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "roles". All fields are combined with a logical 'AND'. */
export type Roles_Bool_Exp = {
  _and?: InputMaybe<Array<Roles_Bool_Exp>>;
  _not?: InputMaybe<Roles_Bool_Exp>;
  _or?: InputMaybe<Array<Roles_Bool_Exp>>;
  can_delete_org?: InputMaybe<Boolean_Comparison_Exp>;
  can_manage_billing?: InputMaybe<Boolean_Comparison_Exp>;
  can_manage_forms?: InputMaybe<Boolean_Comparison_Exp>;
  can_manage_members?: InputMaybe<Boolean_Comparison_Exp>;
  can_manage_testimonials?: InputMaybe<Boolean_Comparison_Exp>;
  can_manage_widgets?: InputMaybe<Boolean_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_system_role?: InputMaybe<Boolean_Comparison_Exp>;
  is_viewer?: InputMaybe<Boolean_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  organization_roles?: InputMaybe<Organization_Roles_Bool_Exp>;
  organization_roles_aggregate?: InputMaybe<Organization_Roles_Aggregate_Bool_Exp>;
  unique_name?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "roles" */
export enum Roles_Constraint {
  /** unique or primary key constraint on columns "id" */
  RolesPkey = 'roles_pkey',
  /** unique or primary key constraint on columns "unique_name" */
  RolesUniqueNameUnique = 'roles_unique_name_unique'
}

/** input type for inserting data into table "roles" */
export type Roles_Insert_Input = {
  /** Permission to delete the organization */
  can_delete_org?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to view and manage billing/subscription */
  can_manage_billing?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to create, edit, delete forms */
  can_manage_forms?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to invite, remove, change roles of org members */
  can_manage_members?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to approve, reject, edit testimonials */
  can_manage_testimonials?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to create, edit, delete widgets */
  can_manage_widgets?: InputMaybe<Scalars['Boolean']['input']>;
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Human-readable description of the role */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** System roles cannot be deleted or modified by users */
  is_system_role?: InputMaybe<Scalars['Boolean']['input']>;
  /** Read-only access - can view all resources but cannot modify anything */
  is_viewer?: InputMaybe<Scalars['Boolean']['input']>;
  /** Display-ready label for UI (Owner, Admin, Member, Viewer) */
  name?: InputMaybe<Scalars['String']['input']>;
  organization_roles?: InputMaybe<Organization_Roles_Arr_Rel_Insert_Input>;
  /** Unique slug for code comparisons (owner, admin, member, viewer) */
  unique_name?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Roles_Max_Fields = {
  __typename?: 'roles_max_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Human-readable description of the role */
  description?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Display-ready label for UI (Owner, Admin, Member, Viewer) */
  name?: Maybe<Scalars['String']['output']>;
  /** Unique slug for code comparisons (owner, admin, member, viewer) */
  unique_name?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Roles_Min_Fields = {
  __typename?: 'roles_min_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Human-readable description of the role */
  description?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Display-ready label for UI (Owner, Admin, Member, Viewer) */
  name?: Maybe<Scalars['String']['output']>;
  /** Unique slug for code comparisons (owner, admin, member, viewer) */
  unique_name?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "roles" */
export type Roles_Mutation_Response = {
  __typename?: 'roles_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Roles>;
};

/** input type for inserting object relation for remote table "roles" */
export type Roles_Obj_Rel_Insert_Input = {
  data: Roles_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Roles_On_Conflict>;
};

/** on_conflict condition type for table "roles" */
export type Roles_On_Conflict = {
  constraint: Roles_Constraint;
  update_columns?: Array<Roles_Update_Column>;
  where?: InputMaybe<Roles_Bool_Exp>;
};

/** Ordering options when selecting data from "roles". */
export type Roles_Order_By = {
  can_delete_org?: InputMaybe<Order_By>;
  can_manage_billing?: InputMaybe<Order_By>;
  can_manage_forms?: InputMaybe<Order_By>;
  can_manage_members?: InputMaybe<Order_By>;
  can_manage_testimonials?: InputMaybe<Order_By>;
  can_manage_widgets?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_system_role?: InputMaybe<Order_By>;
  is_viewer?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization_roles_aggregate?: InputMaybe<Organization_Roles_Aggregate_Order_By>;
  unique_name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: roles */
export type Roles_Pk_Columns_Input = {
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['input'];
};

/** select columns of table "roles" */
export enum Roles_Select_Column {
  /** column name */
  CanDeleteOrg = 'can_delete_org',
  /** column name */
  CanManageBilling = 'can_manage_billing',
  /** column name */
  CanManageForms = 'can_manage_forms',
  /** column name */
  CanManageMembers = 'can_manage_members',
  /** column name */
  CanManageTestimonials = 'can_manage_testimonials',
  /** column name */
  CanManageWidgets = 'can_manage_widgets',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsSystemRole = 'is_system_role',
  /** column name */
  IsViewer = 'is_viewer',
  /** column name */
  Name = 'name',
  /** column name */
  UniqueName = 'unique_name',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "roles" */
export type Roles_Set_Input = {
  /** Permission to delete the organization */
  can_delete_org?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to view and manage billing/subscription */
  can_manage_billing?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to create, edit, delete forms */
  can_manage_forms?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to invite, remove, change roles of org members */
  can_manage_members?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to approve, reject, edit testimonials */
  can_manage_testimonials?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to create, edit, delete widgets */
  can_manage_widgets?: InputMaybe<Scalars['Boolean']['input']>;
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Human-readable description of the role */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** System roles cannot be deleted or modified by users */
  is_system_role?: InputMaybe<Scalars['Boolean']['input']>;
  /** Read-only access - can view all resources but cannot modify anything */
  is_viewer?: InputMaybe<Scalars['Boolean']['input']>;
  /** Display-ready label for UI (Owner, Admin, Member, Viewer) */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Unique slug for code comparisons (owner, admin, member, viewer) */
  unique_name?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "roles" */
export type Roles_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Roles_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Roles_Stream_Cursor_Value_Input = {
  /** Permission to delete the organization */
  can_delete_org?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to view and manage billing/subscription */
  can_manage_billing?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to create, edit, delete forms */
  can_manage_forms?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to invite, remove, change roles of org members */
  can_manage_members?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to approve, reject, edit testimonials */
  can_manage_testimonials?: InputMaybe<Scalars['Boolean']['input']>;
  /** Permission to create, edit, delete widgets */
  can_manage_widgets?: InputMaybe<Scalars['Boolean']['input']>;
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Human-readable description of the role */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** System roles cannot be deleted or modified by users */
  is_system_role?: InputMaybe<Scalars['Boolean']['input']>;
  /** Read-only access - can view all resources but cannot modify anything */
  is_viewer?: InputMaybe<Scalars['Boolean']['input']>;
  /** Display-ready label for UI (Owner, Admin, Member, Viewer) */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Unique slug for code comparisons (owner, admin, member, viewer) */
  unique_name?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "roles" */
export enum Roles_Update_Column {
  /** column name */
  CanDeleteOrg = 'can_delete_org',
  /** column name */
  CanManageBilling = 'can_manage_billing',
  /** column name */
  CanManageForms = 'can_manage_forms',
  /** column name */
  CanManageMembers = 'can_manage_members',
  /** column name */
  CanManageTestimonials = 'can_manage_testimonials',
  /** column name */
  CanManageWidgets = 'can_manage_widgets',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsSystemRole = 'is_system_role',
  /** column name */
  IsViewer = 'is_viewer',
  /** column name */
  Name = 'name',
  /** column name */
  UniqueName = 'unique_name',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Roles_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Roles_Set_Input>;
  /** filter the rows which have to be updated */
  where: Roles_Bool_Exp;
};

/** Boolean expression to compare columns of type "smallint". All fields are combined with logical 'AND'. */
export type Smallint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['smallint']['input']>;
  _gt?: InputMaybe<Scalars['smallint']['input']>;
  _gte?: InputMaybe<Scalars['smallint']['input']>;
  _in?: InputMaybe<Array<Scalars['smallint']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['smallint']['input']>;
  _lte?: InputMaybe<Scalars['smallint']['input']>;
  _neq?: InputMaybe<Scalars['smallint']['input']>;
  _nin?: InputMaybe<Array<Scalars['smallint']['input']>>;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** An array relationship */
  contacts: Array<Contacts>;
  /** An aggregate relationship */
  contacts_aggregate: Contacts_Aggregate;
  /** fetch data from the table: "contacts" using primary key columns */
  contacts_by_pk?: Maybe<Contacts>;
  /** fetch data from the table in a streaming manner: "contacts" */
  contacts_stream: Array<Contacts>;
  /** fetch data from the table: "form_question_responses" */
  form_question_responses: Array<Form_Question_Responses>;
  /** fetch aggregated fields from the table: "form_question_responses" */
  form_question_responses_aggregate: Form_Question_Responses_Aggregate;
  /** fetch data from the table: "form_question_responses" using primary key columns */
  form_question_responses_by_pk?: Maybe<Form_Question_Responses>;
  /** fetch data from the table in a streaming manner: "form_question_responses" */
  form_question_responses_stream: Array<Form_Question_Responses>;
  /** fetch data from the table: "form_questions" */
  form_questions: Array<Form_Questions>;
  /** fetch aggregated fields from the table: "form_questions" */
  form_questions_aggregate: Form_Questions_Aggregate;
  /** fetch data from the table: "form_questions" using primary key columns */
  form_questions_by_pk?: Maybe<Form_Questions>;
  /** fetch data from the table in a streaming manner: "form_questions" */
  form_questions_stream: Array<Form_Questions>;
  /** fetch data from the table: "form_steps" */
  form_steps: Array<Form_Steps>;
  /** fetch aggregated fields from the table: "form_steps" */
  form_steps_aggregate: Form_Steps_Aggregate;
  /** fetch data from the table: "form_steps" using primary key columns */
  form_steps_by_pk?: Maybe<Form_Steps>;
  /** fetch data from the table in a streaming manner: "form_steps" */
  form_steps_stream: Array<Form_Steps>;
  /** fetch data from the table: "form_submissions" */
  form_submissions: Array<Form_Submissions>;
  /** fetch aggregated fields from the table: "form_submissions" */
  form_submissions_aggregate: Form_Submissions_Aggregate;
  /** fetch data from the table: "form_submissions" using primary key columns */
  form_submissions_by_pk?: Maybe<Form_Submissions>;
  /** fetch data from the table in a streaming manner: "form_submissions" */
  form_submissions_stream: Array<Form_Submissions>;
  /** An array relationship */
  forms: Array<Forms>;
  /** An aggregate relationship */
  forms_aggregate: Forms_Aggregate;
  /** fetch data from the table: "forms" using primary key columns */
  forms_by_pk?: Maybe<Forms>;
  /** fetch data from the table in a streaming manner: "forms" */
  forms_stream: Array<Forms>;
  /** An array relationship */
  organization_plans: Array<Organization_Plans>;
  /** An aggregate relationship */
  organization_plans_aggregate: Organization_Plans_Aggregate;
  /** fetch data from the table: "organization_plans" using primary key columns */
  organization_plans_by_pk?: Maybe<Organization_Plans>;
  /** fetch data from the table in a streaming manner: "organization_plans" */
  organization_plans_stream: Array<Organization_Plans>;
  /** An array relationship */
  organization_roles: Array<Organization_Roles>;
  /** An aggregate relationship */
  organization_roles_aggregate: Organization_Roles_Aggregate;
  /** fetch data from the table: "organization_roles" using primary key columns */
  organization_roles_by_pk?: Maybe<Organization_Roles>;
  /** fetch data from the table in a streaming manner: "organization_roles" */
  organization_roles_stream: Array<Organization_Roles>;
  /** fetch data from the table: "organizations" */
  organizations: Array<Organizations>;
  /** fetch aggregated fields from the table: "organizations" */
  organizations_aggregate: Organizations_Aggregate;
  /** fetch data from the table: "organizations" using primary key columns */
  organizations_by_pk?: Maybe<Organizations>;
  /** fetch data from the table in a streaming manner: "organizations" */
  organizations_stream: Array<Organizations>;
  /** fetch data from the table: "plan_prices" */
  plan_prices: Array<Plan_Prices>;
  /** fetch aggregated fields from the table: "plan_prices" */
  plan_prices_aggregate: Plan_Prices_Aggregate;
  /** fetch data from the table: "plan_prices" using primary key columns */
  plan_prices_by_pk?: Maybe<Plan_Prices>;
  /** fetch data from the table in a streaming manner: "plan_prices" */
  plan_prices_stream: Array<Plan_Prices>;
  /** fetch data from the table: "plan_question_types" */
  plan_question_types: Array<Plan_Question_Types>;
  /** fetch aggregated fields from the table: "plan_question_types" */
  plan_question_types_aggregate: Plan_Question_Types_Aggregate;
  /** fetch data from the table: "plan_question_types" using primary key columns */
  plan_question_types_by_pk?: Maybe<Plan_Question_Types>;
  /** fetch data from the table in a streaming manner: "plan_question_types" */
  plan_question_types_stream: Array<Plan_Question_Types>;
  /** fetch data from the table: "plans" */
  plans: Array<Plans>;
  /** fetch aggregated fields from the table: "plans" */
  plans_aggregate: Plans_Aggregate;
  /** fetch data from the table: "plans" using primary key columns */
  plans_by_pk?: Maybe<Plans>;
  /** fetch data from the table in a streaming manner: "plans" */
  plans_stream: Array<Plans>;
  /** fetch data from the table: "question_options" */
  question_options: Array<Question_Options>;
  /** fetch aggregated fields from the table: "question_options" */
  question_options_aggregate: Question_Options_Aggregate;
  /** fetch data from the table: "question_options" using primary key columns */
  question_options_by_pk?: Maybe<Question_Options>;
  /** fetch data from the table in a streaming manner: "question_options" */
  question_options_stream: Array<Question_Options>;
  /** fetch data from the table: "question_types" */
  question_types: Array<Question_Types>;
  /** fetch aggregated fields from the table: "question_types" */
  question_types_aggregate: Question_Types_Aggregate;
  /** fetch data from the table: "question_types" using primary key columns */
  question_types_by_pk?: Maybe<Question_Types>;
  /** fetch data from the table in a streaming manner: "question_types" */
  question_types_stream: Array<Question_Types>;
  /** fetch data from the table: "roles" */
  roles: Array<Roles>;
  /** fetch aggregated fields from the table: "roles" */
  roles_aggregate: Roles_Aggregate;
  /** fetch data from the table: "roles" using primary key columns */
  roles_by_pk?: Maybe<Roles>;
  /** fetch data from the table in a streaming manner: "roles" */
  roles_stream: Array<Roles>;
  /** An array relationship */
  testimonials: Array<Testimonials>;
  /** An aggregate relationship */
  testimonials_aggregate: Testimonials_Aggregate;
  /** fetch data from the table: "testimonials" using primary key columns */
  testimonials_by_pk?: Maybe<Testimonials>;
  /** fetch data from the table in a streaming manner: "testimonials" */
  testimonials_stream: Array<Testimonials>;
  /** fetch data from the table: "user_identities" */
  user_identities: Array<User_Identities>;
  /** fetch aggregated fields from the table: "user_identities" */
  user_identities_aggregate: User_Identities_Aggregate;
  /** fetch data from the table: "user_identities" using primary key columns */
  user_identities_by_pk?: Maybe<User_Identities>;
  /** fetch data from the table in a streaming manner: "user_identities" */
  user_identities_stream: Array<User_Identities>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** fetch data from the table in a streaming manner: "users" */
  users_stream: Array<Users>;
  /** fetch data from the table: "widget_testimonials" */
  widget_testimonials: Array<Widget_Testimonials>;
  /** fetch aggregated fields from the table: "widget_testimonials" */
  widget_testimonials_aggregate: Widget_Testimonials_Aggregate;
  /** fetch data from the table: "widget_testimonials" using primary key columns */
  widget_testimonials_by_pk?: Maybe<Widget_Testimonials>;
  /** fetch data from the table in a streaming manner: "widget_testimonials" */
  widget_testimonials_stream: Array<Widget_Testimonials>;
  /** An array relationship */
  widgets: Array<Widgets>;
  /** An aggregate relationship */
  widgets_aggregate: Widgets_Aggregate;
  /** fetch data from the table: "widgets" using primary key columns */
  widgets_by_pk?: Maybe<Widgets>;
  /** fetch data from the table in a streaming manner: "widgets" */
  widgets_stream: Array<Widgets>;
};


export type Subscription_RootContactsArgs = {
  distinct_on?: InputMaybe<Array<Contacts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Contacts_Order_By>>;
  where?: InputMaybe<Contacts_Bool_Exp>;
};


export type Subscription_RootContacts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Contacts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Contacts_Order_By>>;
  where?: InputMaybe<Contacts_Bool_Exp>;
};


export type Subscription_RootContacts_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootContacts_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Contacts_Stream_Cursor_Input>>;
  where?: InputMaybe<Contacts_Bool_Exp>;
};


export type Subscription_RootForm_Question_ResponsesArgs = {
  distinct_on?: InputMaybe<Array<Form_Question_Responses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Question_Responses_Order_By>>;
  where?: InputMaybe<Form_Question_Responses_Bool_Exp>;
};


export type Subscription_RootForm_Question_Responses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Question_Responses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Question_Responses_Order_By>>;
  where?: InputMaybe<Form_Question_Responses_Bool_Exp>;
};


export type Subscription_RootForm_Question_Responses_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootForm_Question_Responses_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Form_Question_Responses_Stream_Cursor_Input>>;
  where?: InputMaybe<Form_Question_Responses_Bool_Exp>;
};


export type Subscription_RootForm_QuestionsArgs = {
  distinct_on?: InputMaybe<Array<Form_Questions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Questions_Order_By>>;
  where?: InputMaybe<Form_Questions_Bool_Exp>;
};


export type Subscription_RootForm_Questions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Questions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Questions_Order_By>>;
  where?: InputMaybe<Form_Questions_Bool_Exp>;
};


export type Subscription_RootForm_Questions_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootForm_Questions_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Form_Questions_Stream_Cursor_Input>>;
  where?: InputMaybe<Form_Questions_Bool_Exp>;
};


export type Subscription_RootForm_StepsArgs = {
  distinct_on?: InputMaybe<Array<Form_Steps_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Steps_Order_By>>;
  where?: InputMaybe<Form_Steps_Bool_Exp>;
};


export type Subscription_RootForm_Steps_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Steps_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Steps_Order_By>>;
  where?: InputMaybe<Form_Steps_Bool_Exp>;
};


export type Subscription_RootForm_Steps_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootForm_Steps_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Form_Steps_Stream_Cursor_Input>>;
  where?: InputMaybe<Form_Steps_Bool_Exp>;
};


export type Subscription_RootForm_SubmissionsArgs = {
  distinct_on?: InputMaybe<Array<Form_Submissions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Submissions_Order_By>>;
  where?: InputMaybe<Form_Submissions_Bool_Exp>;
};


export type Subscription_RootForm_Submissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Form_Submissions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Form_Submissions_Order_By>>;
  where?: InputMaybe<Form_Submissions_Bool_Exp>;
};


export type Subscription_RootForm_Submissions_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootForm_Submissions_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Form_Submissions_Stream_Cursor_Input>>;
  where?: InputMaybe<Form_Submissions_Bool_Exp>;
};


export type Subscription_RootFormsArgs = {
  distinct_on?: InputMaybe<Array<Forms_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Forms_Order_By>>;
  where?: InputMaybe<Forms_Bool_Exp>;
};


export type Subscription_RootForms_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Forms_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Forms_Order_By>>;
  where?: InputMaybe<Forms_Bool_Exp>;
};


export type Subscription_RootForms_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootForms_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Forms_Stream_Cursor_Input>>;
  where?: InputMaybe<Forms_Bool_Exp>;
};


export type Subscription_RootOrganization_PlansArgs = {
  distinct_on?: InputMaybe<Array<Organization_Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Plans_Order_By>>;
  where?: InputMaybe<Organization_Plans_Bool_Exp>;
};


export type Subscription_RootOrganization_Plans_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organization_Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Plans_Order_By>>;
  where?: InputMaybe<Organization_Plans_Bool_Exp>;
};


export type Subscription_RootOrganization_Plans_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootOrganization_Plans_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Organization_Plans_Stream_Cursor_Input>>;
  where?: InputMaybe<Organization_Plans_Bool_Exp>;
};


export type Subscription_RootOrganization_RolesArgs = {
  distinct_on?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Roles_Order_By>>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};


export type Subscription_RootOrganization_Roles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Roles_Order_By>>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};


export type Subscription_RootOrganization_Roles_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootOrganization_Roles_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Organization_Roles_Stream_Cursor_Input>>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};


export type Subscription_RootOrganizationsArgs = {
  distinct_on?: InputMaybe<Array<Organizations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organizations_Order_By>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


export type Subscription_RootOrganizations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organizations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organizations_Order_By>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


export type Subscription_RootOrganizations_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootOrganizations_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Organizations_Stream_Cursor_Input>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


export type Subscription_RootPlan_PricesArgs = {
  distinct_on?: InputMaybe<Array<Plan_Prices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Prices_Order_By>>;
  where?: InputMaybe<Plan_Prices_Bool_Exp>;
};


export type Subscription_RootPlan_Prices_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Plan_Prices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Prices_Order_By>>;
  where?: InputMaybe<Plan_Prices_Bool_Exp>;
};


export type Subscription_RootPlan_Prices_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootPlan_Prices_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Plan_Prices_Stream_Cursor_Input>>;
  where?: InputMaybe<Plan_Prices_Bool_Exp>;
};


export type Subscription_RootPlan_Question_TypesArgs = {
  distinct_on?: InputMaybe<Array<Plan_Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Question_Types_Order_By>>;
  where?: InputMaybe<Plan_Question_Types_Bool_Exp>;
};


export type Subscription_RootPlan_Question_Types_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Plan_Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plan_Question_Types_Order_By>>;
  where?: InputMaybe<Plan_Question_Types_Bool_Exp>;
};


export type Subscription_RootPlan_Question_Types_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootPlan_Question_Types_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Plan_Question_Types_Stream_Cursor_Input>>;
  where?: InputMaybe<Plan_Question_Types_Bool_Exp>;
};


export type Subscription_RootPlansArgs = {
  distinct_on?: InputMaybe<Array<Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plans_Order_By>>;
  where?: InputMaybe<Plans_Bool_Exp>;
};


export type Subscription_RootPlans_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Plans_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Plans_Order_By>>;
  where?: InputMaybe<Plans_Bool_Exp>;
};


export type Subscription_RootPlans_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootPlans_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Plans_Stream_Cursor_Input>>;
  where?: InputMaybe<Plans_Bool_Exp>;
};


export type Subscription_RootQuestion_OptionsArgs = {
  distinct_on?: InputMaybe<Array<Question_Options_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Question_Options_Order_By>>;
  where?: InputMaybe<Question_Options_Bool_Exp>;
};


export type Subscription_RootQuestion_Options_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Question_Options_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Question_Options_Order_By>>;
  where?: InputMaybe<Question_Options_Bool_Exp>;
};


export type Subscription_RootQuestion_Options_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootQuestion_Options_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Question_Options_Stream_Cursor_Input>>;
  where?: InputMaybe<Question_Options_Bool_Exp>;
};


export type Subscription_RootQuestion_TypesArgs = {
  distinct_on?: InputMaybe<Array<Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Question_Types_Order_By>>;
  where?: InputMaybe<Question_Types_Bool_Exp>;
};


export type Subscription_RootQuestion_Types_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Question_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Question_Types_Order_By>>;
  where?: InputMaybe<Question_Types_Bool_Exp>;
};


export type Subscription_RootQuestion_Types_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootQuestion_Types_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Question_Types_Stream_Cursor_Input>>;
  where?: InputMaybe<Question_Types_Bool_Exp>;
};


export type Subscription_RootRolesArgs = {
  distinct_on?: InputMaybe<Array<Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Roles_Order_By>>;
  where?: InputMaybe<Roles_Bool_Exp>;
};


export type Subscription_RootRoles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Roles_Order_By>>;
  where?: InputMaybe<Roles_Bool_Exp>;
};


export type Subscription_RootRoles_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootRoles_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Roles_Stream_Cursor_Input>>;
  where?: InputMaybe<Roles_Bool_Exp>;
};


export type Subscription_RootTestimonialsArgs = {
  distinct_on?: InputMaybe<Array<Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Testimonials_Order_By>>;
  where?: InputMaybe<Testimonials_Bool_Exp>;
};


export type Subscription_RootTestimonials_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Testimonials_Order_By>>;
  where?: InputMaybe<Testimonials_Bool_Exp>;
};


export type Subscription_RootTestimonials_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootTestimonials_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Testimonials_Stream_Cursor_Input>>;
  where?: InputMaybe<Testimonials_Bool_Exp>;
};


export type Subscription_RootUser_IdentitiesArgs = {
  distinct_on?: InputMaybe<Array<User_Identities_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Identities_Order_By>>;
  where?: InputMaybe<User_Identities_Bool_Exp>;
};


export type Subscription_RootUser_Identities_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Identities_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Identities_Order_By>>;
  where?: InputMaybe<User_Identities_Bool_Exp>;
};


export type Subscription_RootUser_Identities_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootUser_Identities_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Identities_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Identities_Bool_Exp>;
};


export type Subscription_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootUsers_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Users_Stream_Cursor_Input>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootWidget_TestimonialsArgs = {
  distinct_on?: InputMaybe<Array<Widget_Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widget_Testimonials_Order_By>>;
  where?: InputMaybe<Widget_Testimonials_Bool_Exp>;
};


export type Subscription_RootWidget_Testimonials_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Widget_Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widget_Testimonials_Order_By>>;
  where?: InputMaybe<Widget_Testimonials_Bool_Exp>;
};


export type Subscription_RootWidget_Testimonials_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootWidget_Testimonials_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Widget_Testimonials_Stream_Cursor_Input>>;
  where?: InputMaybe<Widget_Testimonials_Bool_Exp>;
};


export type Subscription_RootWidgetsArgs = {
  distinct_on?: InputMaybe<Array<Widgets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widgets_Order_By>>;
  where?: InputMaybe<Widgets_Bool_Exp>;
};


export type Subscription_RootWidgets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Widgets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widgets_Order_By>>;
  where?: InputMaybe<Widgets_Bool_Exp>;
};


export type Subscription_RootWidgets_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootWidgets_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Widgets_Stream_Cursor_Input>>;
  where?: InputMaybe<Widgets_Bool_Exp>;
};

/** Displayable testimonial entity - quote, rating, customer info. Widgets display these. */
export type Testimonials = {
  __typename?: 'testimonials';
  /** When approved. NULL if pending/rejected */
  approved_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who approved. NULL if pending/rejected */
  approved_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  approver?: Maybe<Users>;
  /** The testimonial quote - AI-assembled from form responses or imported text */
  content?: Maybe<Scalars['String']['output']>;
  /** When created. Immutable */
  created_at: Scalars['timestamptz']['output'];
  /** Profile photo URL displayed on widgets */
  customer_avatar_url?: Maybe<Scalars['String']['output']>;
  /** Company name displayed on widgets (e.g., "Acme Inc") */
  customer_company?: Maybe<Scalars['String']['output']>;
  /** Email for follow-up. NOT displayed on widgets */
  customer_email: Scalars['String']['output'];
  /** LinkedIn profile URL - clickable social proof link */
  customer_linkedin_url?: Maybe<Scalars['String']['output']>;
  /** Full name displayed on widgets. Copied from submission or entered for imports */
  customer_name: Scalars['String']['output'];
  /** Job title displayed on widgets (e.g., "Product Manager") */
  customer_title?: Maybe<Scalars['String']['output']>;
  /** Twitter/X profile URL - clickable social proof link */
  customer_twitter_url?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['output'];
  /** An object relationship */
  organization: Organizations;
  /** FK to organizations - tenant boundary for isolation */
  organization_id: Scalars['String']['output'];
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: Maybe<Scalars['smallint']['output']>;
  /** When rejected. NULL if pending/approved */
  rejected_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who rejected. NULL if pending/approved */
  rejected_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  rejecter?: Maybe<Users>;
  /** Internal note. Not shown to customer */
  rejection_reason?: Maybe<Scalars['String']['output']>;
  /** Origin: form (via submission), import (Twitter/LinkedIn), manual (typed by owner) */
  source: Scalars['String']['output'];
  /** Import metadata (tweet_id, original_url, etc.). JSONB appropriate here */
  source_metadata?: Maybe<Scalars['jsonb']['output']>;
  /** Workflow: pending (new), approved (shown on widgets), rejected (hidden) */
  status: Scalars['String']['output'];
  /** An object relationship */
  submission?: Maybe<Form_Submissions>;
  /** FK to form_submissions - NULL for imports/manual. Access form via submission.form_id */
  submission_id?: Maybe<Scalars['String']['output']>;
  /** Last modification. Auto-updated by trigger */
  updated_at: Scalars['timestamptz']['output'];
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  updater?: Maybe<Users>;
  /** An array relationship */
  widget_placements: Array<Widget_Testimonials>;
  /** An aggregate relationship */
  widget_placements_aggregate: Widget_Testimonials_Aggregate;
};


/** Displayable testimonial entity - quote, rating, customer info. Widgets display these. */
export type TestimonialsSource_MetadataArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** Displayable testimonial entity - quote, rating, customer info. Widgets display these. */
export type TestimonialsWidget_PlacementsArgs = {
  distinct_on?: InputMaybe<Array<Widget_Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widget_Testimonials_Order_By>>;
  where?: InputMaybe<Widget_Testimonials_Bool_Exp>;
};


/** Displayable testimonial entity - quote, rating, customer info. Widgets display these. */
export type TestimonialsWidget_Placements_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Widget_Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widget_Testimonials_Order_By>>;
  where?: InputMaybe<Widget_Testimonials_Bool_Exp>;
};

/** aggregated selection of "testimonials" */
export type Testimonials_Aggregate = {
  __typename?: 'testimonials_aggregate';
  aggregate?: Maybe<Testimonials_Aggregate_Fields>;
  nodes: Array<Testimonials>;
};

export type Testimonials_Aggregate_Bool_Exp = {
  count?: InputMaybe<Testimonials_Aggregate_Bool_Exp_Count>;
};

export type Testimonials_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Testimonials_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Testimonials_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "testimonials" */
export type Testimonials_Aggregate_Fields = {
  __typename?: 'testimonials_aggregate_fields';
  avg?: Maybe<Testimonials_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Testimonials_Max_Fields>;
  min?: Maybe<Testimonials_Min_Fields>;
  stddev?: Maybe<Testimonials_Stddev_Fields>;
  stddev_pop?: Maybe<Testimonials_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Testimonials_Stddev_Samp_Fields>;
  sum?: Maybe<Testimonials_Sum_Fields>;
  var_pop?: Maybe<Testimonials_Var_Pop_Fields>;
  var_samp?: Maybe<Testimonials_Var_Samp_Fields>;
  variance?: Maybe<Testimonials_Variance_Fields>;
};


/** aggregate fields of "testimonials" */
export type Testimonials_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Testimonials_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "testimonials" */
export type Testimonials_Aggregate_Order_By = {
  avg?: InputMaybe<Testimonials_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Testimonials_Max_Order_By>;
  min?: InputMaybe<Testimonials_Min_Order_By>;
  stddev?: InputMaybe<Testimonials_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Testimonials_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Testimonials_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Testimonials_Sum_Order_By>;
  var_pop?: InputMaybe<Testimonials_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Testimonials_Var_Samp_Order_By>;
  variance?: InputMaybe<Testimonials_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Testimonials_Append_Input = {
  /** Import metadata (tweet_id, original_url, etc.). JSONB appropriate here */
  source_metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "testimonials" */
export type Testimonials_Arr_Rel_Insert_Input = {
  data: Array<Testimonials_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Testimonials_On_Conflict>;
};

/** aggregate avg on columns */
export type Testimonials_Avg_Fields = {
  __typename?: 'testimonials_avg_fields';
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "testimonials" */
export type Testimonials_Avg_Order_By = {
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "testimonials". All fields are combined with a logical 'AND'. */
export type Testimonials_Bool_Exp = {
  _and?: InputMaybe<Array<Testimonials_Bool_Exp>>;
  _not?: InputMaybe<Testimonials_Bool_Exp>;
  _or?: InputMaybe<Array<Testimonials_Bool_Exp>>;
  approved_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  approved_by?: InputMaybe<String_Comparison_Exp>;
  approver?: InputMaybe<Users_Bool_Exp>;
  content?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  customer_avatar_url?: InputMaybe<String_Comparison_Exp>;
  customer_company?: InputMaybe<String_Comparison_Exp>;
  customer_email?: InputMaybe<String_Comparison_Exp>;
  customer_linkedin_url?: InputMaybe<String_Comparison_Exp>;
  customer_name?: InputMaybe<String_Comparison_Exp>;
  customer_title?: InputMaybe<String_Comparison_Exp>;
  customer_twitter_url?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  rating?: InputMaybe<Smallint_Comparison_Exp>;
  rejected_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  rejected_by?: InputMaybe<String_Comparison_Exp>;
  rejecter?: InputMaybe<Users_Bool_Exp>;
  rejection_reason?: InputMaybe<String_Comparison_Exp>;
  source?: InputMaybe<String_Comparison_Exp>;
  source_metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  submission?: InputMaybe<Form_Submissions_Bool_Exp>;
  submission_id?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_by?: InputMaybe<String_Comparison_Exp>;
  updater?: InputMaybe<Users_Bool_Exp>;
  widget_placements?: InputMaybe<Widget_Testimonials_Bool_Exp>;
  widget_placements_aggregate?: InputMaybe<Widget_Testimonials_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "testimonials" */
export enum Testimonials_Constraint {
  /** unique or primary key constraint on columns "id" */
  TestimonialsPkey = 'testimonials_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Testimonials_Delete_At_Path_Input = {
  /** Import metadata (tweet_id, original_url, etc.). JSONB appropriate here */
  source_metadata?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Testimonials_Delete_Elem_Input = {
  /** Import metadata (tweet_id, original_url, etc.). JSONB appropriate here */
  source_metadata?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Testimonials_Delete_Key_Input = {
  /** Import metadata (tweet_id, original_url, etc.). JSONB appropriate here */
  source_metadata?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "testimonials" */
export type Testimonials_Inc_Input = {
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Scalars['smallint']['input']>;
};

/** input type for inserting data into table "testimonials" */
export type Testimonials_Insert_Input = {
  /** When approved. NULL if pending/rejected */
  approved_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who approved. NULL if pending/rejected */
  approved_by?: InputMaybe<Scalars['String']['input']>;
  approver?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** The testimonial quote - AI-assembled from form responses or imported text */
  content?: InputMaybe<Scalars['String']['input']>;
  /** When created. Immutable */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Profile photo URL displayed on widgets */
  customer_avatar_url?: InputMaybe<Scalars['String']['input']>;
  /** Company name displayed on widgets (e.g., "Acme Inc") */
  customer_company?: InputMaybe<Scalars['String']['input']>;
  /** Email for follow-up. NOT displayed on widgets */
  customer_email?: InputMaybe<Scalars['String']['input']>;
  /** LinkedIn profile URL - clickable social proof link */
  customer_linkedin_url?: InputMaybe<Scalars['String']['input']>;
  /** Full name displayed on widgets. Copied from submission or entered for imports */
  customer_name?: InputMaybe<Scalars['String']['input']>;
  /** Job title displayed on widgets (e.g., "Product Manager") */
  customer_title?: InputMaybe<Scalars['String']['input']>;
  /** Twitter/X profile URL - clickable social proof link */
  customer_twitter_url?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Scalars['smallint']['input']>;
  /** When rejected. NULL if pending/approved */
  rejected_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who rejected. NULL if pending/approved */
  rejected_by?: InputMaybe<Scalars['String']['input']>;
  rejecter?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** Internal note. Not shown to customer */
  rejection_reason?: InputMaybe<Scalars['String']['input']>;
  /** Origin: form (via submission), import (Twitter/LinkedIn), manual (typed by owner) */
  source?: InputMaybe<Scalars['String']['input']>;
  /** Import metadata (tweet_id, original_url, etc.). JSONB appropriate here */
  source_metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** Workflow: pending (new), approved (shown on widgets), rejected (hidden) */
  status?: InputMaybe<Scalars['String']['input']>;
  submission?: InputMaybe<Form_Submissions_Obj_Rel_Insert_Input>;
  /** FK to form_submissions - NULL for imports/manual. Access form via submission.form_id */
  submission_id?: InputMaybe<Scalars['String']['input']>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
  updater?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  widget_placements?: InputMaybe<Widget_Testimonials_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Testimonials_Max_Fields = {
  __typename?: 'testimonials_max_fields';
  /** When approved. NULL if pending/rejected */
  approved_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who approved. NULL if pending/rejected */
  approved_by?: Maybe<Scalars['String']['output']>;
  /** The testimonial quote - AI-assembled from form responses or imported text */
  content?: Maybe<Scalars['String']['output']>;
  /** When created. Immutable */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Profile photo URL displayed on widgets */
  customer_avatar_url?: Maybe<Scalars['String']['output']>;
  /** Company name displayed on widgets (e.g., "Acme Inc") */
  customer_company?: Maybe<Scalars['String']['output']>;
  /** Email for follow-up. NOT displayed on widgets */
  customer_email?: Maybe<Scalars['String']['output']>;
  /** LinkedIn profile URL - clickable social proof link */
  customer_linkedin_url?: Maybe<Scalars['String']['output']>;
  /** Full name displayed on widgets. Copied from submission or entered for imports */
  customer_name?: Maybe<Scalars['String']['output']>;
  /** Job title displayed on widgets (e.g., "Product Manager") */
  customer_title?: Maybe<Scalars['String']['output']>;
  /** Twitter/X profile URL - clickable social proof link */
  customer_twitter_url?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: Maybe<Scalars['smallint']['output']>;
  /** When rejected. NULL if pending/approved */
  rejected_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who rejected. NULL if pending/approved */
  rejected_by?: Maybe<Scalars['String']['output']>;
  /** Internal note. Not shown to customer */
  rejection_reason?: Maybe<Scalars['String']['output']>;
  /** Origin: form (via submission), import (Twitter/LinkedIn), manual (typed by owner) */
  source?: Maybe<Scalars['String']['output']>;
  /** Workflow: pending (new), approved (shown on widgets), rejected (hidden) */
  status?: Maybe<Scalars['String']['output']>;
  /** FK to form_submissions - NULL for imports/manual. Access form via submission.form_id */
  submission_id?: Maybe<Scalars['String']['output']>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "testimonials" */
export type Testimonials_Max_Order_By = {
  /** When approved. NULL if pending/rejected */
  approved_at?: InputMaybe<Order_By>;
  /** FK to users - who approved. NULL if pending/rejected */
  approved_by?: InputMaybe<Order_By>;
  /** The testimonial quote - AI-assembled from form responses or imported text */
  content?: InputMaybe<Order_By>;
  /** When created. Immutable */
  created_at?: InputMaybe<Order_By>;
  /** Profile photo URL displayed on widgets */
  customer_avatar_url?: InputMaybe<Order_By>;
  /** Company name displayed on widgets (e.g., "Acme Inc") */
  customer_company?: InputMaybe<Order_By>;
  /** Email for follow-up. NOT displayed on widgets */
  customer_email?: InputMaybe<Order_By>;
  /** LinkedIn profile URL - clickable social proof link */
  customer_linkedin_url?: InputMaybe<Order_By>;
  /** Full name displayed on widgets. Copied from submission or entered for imports */
  customer_name?: InputMaybe<Order_By>;
  /** Job title displayed on widgets (e.g., "Product Manager") */
  customer_title?: InputMaybe<Order_By>;
  /** Twitter/X profile URL - clickable social proof link */
  customer_twitter_url?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Order_By>;
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Order_By>;
  /** When rejected. NULL if pending/approved */
  rejected_at?: InputMaybe<Order_By>;
  /** FK to users - who rejected. NULL if pending/approved */
  rejected_by?: InputMaybe<Order_By>;
  /** Internal note. Not shown to customer */
  rejection_reason?: InputMaybe<Order_By>;
  /** Origin: form (via submission), import (Twitter/LinkedIn), manual (typed by owner) */
  source?: InputMaybe<Order_By>;
  /** Workflow: pending (new), approved (shown on widgets), rejected (hidden) */
  status?: InputMaybe<Order_By>;
  /** FK to form_submissions - NULL for imports/manual. Access form via submission.form_id */
  submission_id?: InputMaybe<Order_By>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Testimonials_Min_Fields = {
  __typename?: 'testimonials_min_fields';
  /** When approved. NULL if pending/rejected */
  approved_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who approved. NULL if pending/rejected */
  approved_by?: Maybe<Scalars['String']['output']>;
  /** The testimonial quote - AI-assembled from form responses or imported text */
  content?: Maybe<Scalars['String']['output']>;
  /** When created. Immutable */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Profile photo URL displayed on widgets */
  customer_avatar_url?: Maybe<Scalars['String']['output']>;
  /** Company name displayed on widgets (e.g., "Acme Inc") */
  customer_company?: Maybe<Scalars['String']['output']>;
  /** Email for follow-up. NOT displayed on widgets */
  customer_email?: Maybe<Scalars['String']['output']>;
  /** LinkedIn profile URL - clickable social proof link */
  customer_linkedin_url?: Maybe<Scalars['String']['output']>;
  /** Full name displayed on widgets. Copied from submission or entered for imports */
  customer_name?: Maybe<Scalars['String']['output']>;
  /** Job title displayed on widgets (e.g., "Product Manager") */
  customer_title?: Maybe<Scalars['String']['output']>;
  /** Twitter/X profile URL - clickable social proof link */
  customer_twitter_url?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: Maybe<Scalars['smallint']['output']>;
  /** When rejected. NULL if pending/approved */
  rejected_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who rejected. NULL if pending/approved */
  rejected_by?: Maybe<Scalars['String']['output']>;
  /** Internal note. Not shown to customer */
  rejection_reason?: Maybe<Scalars['String']['output']>;
  /** Origin: form (via submission), import (Twitter/LinkedIn), manual (typed by owner) */
  source?: Maybe<Scalars['String']['output']>;
  /** Workflow: pending (new), approved (shown on widgets), rejected (hidden) */
  status?: Maybe<Scalars['String']['output']>;
  /** FK to form_submissions - NULL for imports/manual. Access form via submission.form_id */
  submission_id?: Maybe<Scalars['String']['output']>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "testimonials" */
export type Testimonials_Min_Order_By = {
  /** When approved. NULL if pending/rejected */
  approved_at?: InputMaybe<Order_By>;
  /** FK to users - who approved. NULL if pending/rejected */
  approved_by?: InputMaybe<Order_By>;
  /** The testimonial quote - AI-assembled from form responses or imported text */
  content?: InputMaybe<Order_By>;
  /** When created. Immutable */
  created_at?: InputMaybe<Order_By>;
  /** Profile photo URL displayed on widgets */
  customer_avatar_url?: InputMaybe<Order_By>;
  /** Company name displayed on widgets (e.g., "Acme Inc") */
  customer_company?: InputMaybe<Order_By>;
  /** Email for follow-up. NOT displayed on widgets */
  customer_email?: InputMaybe<Order_By>;
  /** LinkedIn profile URL - clickable social proof link */
  customer_linkedin_url?: InputMaybe<Order_By>;
  /** Full name displayed on widgets. Copied from submission or entered for imports */
  customer_name?: InputMaybe<Order_By>;
  /** Job title displayed on widgets (e.g., "Product Manager") */
  customer_title?: InputMaybe<Order_By>;
  /** Twitter/X profile URL - clickable social proof link */
  customer_twitter_url?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Order_By>;
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Order_By>;
  /** When rejected. NULL if pending/approved */
  rejected_at?: InputMaybe<Order_By>;
  /** FK to users - who rejected. NULL if pending/approved */
  rejected_by?: InputMaybe<Order_By>;
  /** Internal note. Not shown to customer */
  rejection_reason?: InputMaybe<Order_By>;
  /** Origin: form (via submission), import (Twitter/LinkedIn), manual (typed by owner) */
  source?: InputMaybe<Order_By>;
  /** Workflow: pending (new), approved (shown on widgets), rejected (hidden) */
  status?: InputMaybe<Order_By>;
  /** FK to form_submissions - NULL for imports/manual. Access form via submission.form_id */
  submission_id?: InputMaybe<Order_By>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "testimonials" */
export type Testimonials_Mutation_Response = {
  __typename?: 'testimonials_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Testimonials>;
};

/** input type for inserting object relation for remote table "testimonials" */
export type Testimonials_Obj_Rel_Insert_Input = {
  data: Testimonials_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Testimonials_On_Conflict>;
};

/** on_conflict condition type for table "testimonials" */
export type Testimonials_On_Conflict = {
  constraint: Testimonials_Constraint;
  update_columns?: Array<Testimonials_Update_Column>;
  where?: InputMaybe<Testimonials_Bool_Exp>;
};

/** Ordering options when selecting data from "testimonials". */
export type Testimonials_Order_By = {
  approved_at?: InputMaybe<Order_By>;
  approved_by?: InputMaybe<Order_By>;
  approver?: InputMaybe<Users_Order_By>;
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  customer_avatar_url?: InputMaybe<Order_By>;
  customer_company?: InputMaybe<Order_By>;
  customer_email?: InputMaybe<Order_By>;
  customer_linkedin_url?: InputMaybe<Order_By>;
  customer_name?: InputMaybe<Order_By>;
  customer_title?: InputMaybe<Order_By>;
  customer_twitter_url?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  rating?: InputMaybe<Order_By>;
  rejected_at?: InputMaybe<Order_By>;
  rejected_by?: InputMaybe<Order_By>;
  rejecter?: InputMaybe<Users_Order_By>;
  rejection_reason?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  source_metadata?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  submission?: InputMaybe<Form_Submissions_Order_By>;
  submission_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updater?: InputMaybe<Users_Order_By>;
  widget_placements_aggregate?: InputMaybe<Widget_Testimonials_Aggregate_Order_By>;
};

/** primary key columns input for table: testimonials */
export type Testimonials_Pk_Columns_Input = {
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Testimonials_Prepend_Input = {
  /** Import metadata (tweet_id, original_url, etc.). JSONB appropriate here */
  source_metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "testimonials" */
export enum Testimonials_Select_Column {
  /** column name */
  ApprovedAt = 'approved_at',
  /** column name */
  ApprovedBy = 'approved_by',
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CustomerAvatarUrl = 'customer_avatar_url',
  /** column name */
  CustomerCompany = 'customer_company',
  /** column name */
  CustomerEmail = 'customer_email',
  /** column name */
  CustomerLinkedinUrl = 'customer_linkedin_url',
  /** column name */
  CustomerName = 'customer_name',
  /** column name */
  CustomerTitle = 'customer_title',
  /** column name */
  CustomerTwitterUrl = 'customer_twitter_url',
  /** column name */
  Id = 'id',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Rating = 'rating',
  /** column name */
  RejectedAt = 'rejected_at',
  /** column name */
  RejectedBy = 'rejected_by',
  /** column name */
  RejectionReason = 'rejection_reason',
  /** column name */
  Source = 'source',
  /** column name */
  SourceMetadata = 'source_metadata',
  /** column name */
  Status = 'status',
  /** column name */
  SubmissionId = 'submission_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

/** input type for updating data in table "testimonials" */
export type Testimonials_Set_Input = {
  /** When approved. NULL if pending/rejected */
  approved_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who approved. NULL if pending/rejected */
  approved_by?: InputMaybe<Scalars['String']['input']>;
  /** The testimonial quote - AI-assembled from form responses or imported text */
  content?: InputMaybe<Scalars['String']['input']>;
  /** When created. Immutable */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Profile photo URL displayed on widgets */
  customer_avatar_url?: InputMaybe<Scalars['String']['input']>;
  /** Company name displayed on widgets (e.g., "Acme Inc") */
  customer_company?: InputMaybe<Scalars['String']['input']>;
  /** Email for follow-up. NOT displayed on widgets */
  customer_email?: InputMaybe<Scalars['String']['input']>;
  /** LinkedIn profile URL - clickable social proof link */
  customer_linkedin_url?: InputMaybe<Scalars['String']['input']>;
  /** Full name displayed on widgets. Copied from submission or entered for imports */
  customer_name?: InputMaybe<Scalars['String']['input']>;
  /** Job title displayed on widgets (e.g., "Product Manager") */
  customer_title?: InputMaybe<Scalars['String']['input']>;
  /** Twitter/X profile URL - clickable social proof link */
  customer_twitter_url?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Scalars['smallint']['input']>;
  /** When rejected. NULL if pending/approved */
  rejected_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who rejected. NULL if pending/approved */
  rejected_by?: InputMaybe<Scalars['String']['input']>;
  /** Internal note. Not shown to customer */
  rejection_reason?: InputMaybe<Scalars['String']['input']>;
  /** Origin: form (via submission), import (Twitter/LinkedIn), manual (typed by owner) */
  source?: InputMaybe<Scalars['String']['input']>;
  /** Import metadata (tweet_id, original_url, etc.). JSONB appropriate here */
  source_metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** Workflow: pending (new), approved (shown on widgets), rejected (hidden) */
  status?: InputMaybe<Scalars['String']['input']>;
  /** FK to form_submissions - NULL for imports/manual. Access form via submission.form_id */
  submission_id?: InputMaybe<Scalars['String']['input']>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Testimonials_Stddev_Fields = {
  __typename?: 'testimonials_stddev_fields';
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "testimonials" */
export type Testimonials_Stddev_Order_By = {
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Testimonials_Stddev_Pop_Fields = {
  __typename?: 'testimonials_stddev_pop_fields';
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "testimonials" */
export type Testimonials_Stddev_Pop_Order_By = {
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Testimonials_Stddev_Samp_Fields = {
  __typename?: 'testimonials_stddev_samp_fields';
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "testimonials" */
export type Testimonials_Stddev_Samp_Order_By = {
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "testimonials" */
export type Testimonials_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Testimonials_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Testimonials_Stream_Cursor_Value_Input = {
  /** When approved. NULL if pending/rejected */
  approved_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who approved. NULL if pending/rejected */
  approved_by?: InputMaybe<Scalars['String']['input']>;
  /** The testimonial quote - AI-assembled from form responses or imported text */
  content?: InputMaybe<Scalars['String']['input']>;
  /** When created. Immutable */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Profile photo URL displayed on widgets */
  customer_avatar_url?: InputMaybe<Scalars['String']['input']>;
  /** Company name displayed on widgets (e.g., "Acme Inc") */
  customer_company?: InputMaybe<Scalars['String']['input']>;
  /** Email for follow-up. NOT displayed on widgets */
  customer_email?: InputMaybe<Scalars['String']['input']>;
  /** LinkedIn profile URL - clickable social proof link */
  customer_linkedin_url?: InputMaybe<Scalars['String']['input']>;
  /** Full name displayed on widgets. Copied from submission or entered for imports */
  customer_name?: InputMaybe<Scalars['String']['input']>;
  /** Job title displayed on widgets (e.g., "Product Manager") */
  customer_title?: InputMaybe<Scalars['String']['input']>;
  /** Twitter/X profile URL - clickable social proof link */
  customer_twitter_url?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Scalars['smallint']['input']>;
  /** When rejected. NULL if pending/approved */
  rejected_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who rejected. NULL if pending/approved */
  rejected_by?: InputMaybe<Scalars['String']['input']>;
  /** Internal note. Not shown to customer */
  rejection_reason?: InputMaybe<Scalars['String']['input']>;
  /** Origin: form (via submission), import (Twitter/LinkedIn), manual (typed by owner) */
  source?: InputMaybe<Scalars['String']['input']>;
  /** Import metadata (tweet_id, original_url, etc.). JSONB appropriate here */
  source_metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** Workflow: pending (new), approved (shown on widgets), rejected (hidden) */
  status?: InputMaybe<Scalars['String']['input']>;
  /** FK to form_submissions - NULL for imports/manual. Access form via submission.form_id */
  submission_id?: InputMaybe<Scalars['String']['input']>;
  /** Last modification. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Testimonials_Sum_Fields = {
  __typename?: 'testimonials_sum_fields';
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: Maybe<Scalars['smallint']['output']>;
};

/** order by sum() on columns of table "testimonials" */
export type Testimonials_Sum_Order_By = {
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Order_By>;
};

/** update columns of table "testimonials" */
export enum Testimonials_Update_Column {
  /** column name */
  ApprovedAt = 'approved_at',
  /** column name */
  ApprovedBy = 'approved_by',
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CustomerAvatarUrl = 'customer_avatar_url',
  /** column name */
  CustomerCompany = 'customer_company',
  /** column name */
  CustomerEmail = 'customer_email',
  /** column name */
  CustomerLinkedinUrl = 'customer_linkedin_url',
  /** column name */
  CustomerName = 'customer_name',
  /** column name */
  CustomerTitle = 'customer_title',
  /** column name */
  CustomerTwitterUrl = 'customer_twitter_url',
  /** column name */
  Id = 'id',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Rating = 'rating',
  /** column name */
  RejectedAt = 'rejected_at',
  /** column name */
  RejectedBy = 'rejected_by',
  /** column name */
  RejectionReason = 'rejection_reason',
  /** column name */
  Source = 'source',
  /** column name */
  SourceMetadata = 'source_metadata',
  /** column name */
  Status = 'status',
  /** column name */
  SubmissionId = 'submission_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

export type Testimonials_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Testimonials_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Testimonials_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Testimonials_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Testimonials_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Testimonials_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Testimonials_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Testimonials_Set_Input>;
  /** filter the rows which have to be updated */
  where: Testimonials_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Testimonials_Var_Pop_Fields = {
  __typename?: 'testimonials_var_pop_fields';
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "testimonials" */
export type Testimonials_Var_Pop_Order_By = {
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Testimonials_Var_Samp_Fields = {
  __typename?: 'testimonials_var_samp_fields';
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "testimonials" */
export type Testimonials_Var_Samp_Order_By = {
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Testimonials_Variance_Fields = {
  __typename?: 'testimonials_variance_fields';
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "testimonials" */
export type Testimonials_Variance_Order_By = {
  /** Star rating 1-5. Copied from form response or entered manually */
  rating?: InputMaybe<Order_By>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** Federated auth identities - one user can have multiple providers (Supabase, Google, GitHub, etc.) */
export type User_Identities = {
  __typename?: 'user_identities';
  /** Timestamp when record was created */
  created_at: Scalars['timestamptz']['output'];
  /** Primary key (NanoID 16-char for security) */
  id: Scalars['String']['output'];
  /** Whether this is the primary login method for the user */
  is_primary: Scalars['Boolean']['output'];
  /** Auth provider name (supabase, google, github, microsoft, email) */
  provider: Scalars['String']['output'];
  /** Email from the auth provider (may differ from users.email) */
  provider_email?: Maybe<Scalars['String']['output']>;
  /** Provider-specific data (tokens, claims) - JSONB appropriate here */
  provider_metadata?: Maybe<Scalars['jsonb']['output']>;
  /** User ID from the auth provider (e.g., Supabase UUID, Google sub) */
  provider_user_id: Scalars['String']['output'];
  /** Timestamp when record was last updated */
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  user: Users;
  /** Reference to users table */
  user_id: Scalars['String']['output'];
  /** When this identity was verified */
  verified_at?: Maybe<Scalars['timestamptz']['output']>;
};


/** Federated auth identities - one user can have multiple providers (Supabase, Google, GitHub, etc.) */
export type User_IdentitiesProvider_MetadataArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "user_identities" */
export type User_Identities_Aggregate = {
  __typename?: 'user_identities_aggregate';
  aggregate?: Maybe<User_Identities_Aggregate_Fields>;
  nodes: Array<User_Identities>;
};

export type User_Identities_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<User_Identities_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<User_Identities_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<User_Identities_Aggregate_Bool_Exp_Count>;
};

export type User_Identities_Aggregate_Bool_Exp_Bool_And = {
  arguments: User_Identities_Select_Column_User_Identities_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Identities_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type User_Identities_Aggregate_Bool_Exp_Bool_Or = {
  arguments: User_Identities_Select_Column_User_Identities_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Identities_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type User_Identities_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<User_Identities_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Identities_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "user_identities" */
export type User_Identities_Aggregate_Fields = {
  __typename?: 'user_identities_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<User_Identities_Max_Fields>;
  min?: Maybe<User_Identities_Min_Fields>;
};


/** aggregate fields of "user_identities" */
export type User_Identities_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Identities_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "user_identities" */
export type User_Identities_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<User_Identities_Max_Order_By>;
  min?: InputMaybe<User_Identities_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type User_Identities_Append_Input = {
  /** Provider-specific data (tokens, claims) - JSONB appropriate here */
  provider_metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "user_identities" */
export type User_Identities_Arr_Rel_Insert_Input = {
  data: Array<User_Identities_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Identities_On_Conflict>;
};

/** Boolean expression to filter rows from the table "user_identities". All fields are combined with a logical 'AND'. */
export type User_Identities_Bool_Exp = {
  _and?: InputMaybe<Array<User_Identities_Bool_Exp>>;
  _not?: InputMaybe<User_Identities_Bool_Exp>;
  _or?: InputMaybe<Array<User_Identities_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_primary?: InputMaybe<Boolean_Comparison_Exp>;
  provider?: InputMaybe<String_Comparison_Exp>;
  provider_email?: InputMaybe<String_Comparison_Exp>;
  provider_metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  provider_user_id?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
  verified_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_identities" */
export enum User_Identities_Constraint {
  /** unique or primary key constraint on columns "user_id" */
  IdxUserIdentitiesOnePrimary = 'idx_user_identities_one_primary',
  /** unique or primary key constraint on columns "id" */
  UserIdentitiesPkey = 'user_identities_pkey',
  /** unique or primary key constraint on columns "provider", "provider_user_id" */
  UserIdentitiesProviderUnique = 'user_identities_provider_unique'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type User_Identities_Delete_At_Path_Input = {
  /** Provider-specific data (tokens, claims) - JSONB appropriate here */
  provider_metadata?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type User_Identities_Delete_Elem_Input = {
  /** Provider-specific data (tokens, claims) - JSONB appropriate here */
  provider_metadata?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type User_Identities_Delete_Key_Input = {
  /** Provider-specific data (tokens, claims) - JSONB appropriate here */
  provider_metadata?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "user_identities" */
export type User_Identities_Insert_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key (NanoID 16-char for security) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Whether this is the primary login method for the user */
  is_primary?: InputMaybe<Scalars['Boolean']['input']>;
  /** Auth provider name (supabase, google, github, microsoft, email) */
  provider?: InputMaybe<Scalars['String']['input']>;
  /** Email from the auth provider (may differ from users.email) */
  provider_email?: InputMaybe<Scalars['String']['input']>;
  /** Provider-specific data (tokens, claims) - JSONB appropriate here */
  provider_metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** User ID from the auth provider (e.g., Supabase UUID, Google sub) */
  provider_user_id?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** Reference to users table */
  user_id?: InputMaybe<Scalars['String']['input']>;
  /** When this identity was verified */
  verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type User_Identities_Max_Fields = {
  __typename?: 'user_identities_max_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary key (NanoID 16-char for security) */
  id?: Maybe<Scalars['String']['output']>;
  /** Auth provider name (supabase, google, github, microsoft, email) */
  provider?: Maybe<Scalars['String']['output']>;
  /** Email from the auth provider (may differ from users.email) */
  provider_email?: Maybe<Scalars['String']['output']>;
  /** User ID from the auth provider (e.g., Supabase UUID, Google sub) */
  provider_user_id?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Reference to users table */
  user_id?: Maybe<Scalars['String']['output']>;
  /** When this identity was verified */
  verified_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "user_identities" */
export type User_Identities_Max_Order_By = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Order_By>;
  /** Primary key (NanoID 16-char for security) */
  id?: InputMaybe<Order_By>;
  /** Auth provider name (supabase, google, github, microsoft, email) */
  provider?: InputMaybe<Order_By>;
  /** Email from the auth provider (may differ from users.email) */
  provider_email?: InputMaybe<Order_By>;
  /** User ID from the auth provider (e.g., Supabase UUID, Google sub) */
  provider_user_id?: InputMaybe<Order_By>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Order_By>;
  /** Reference to users table */
  user_id?: InputMaybe<Order_By>;
  /** When this identity was verified */
  verified_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type User_Identities_Min_Fields = {
  __typename?: 'user_identities_min_fields';
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Primary key (NanoID 16-char for security) */
  id?: Maybe<Scalars['String']['output']>;
  /** Auth provider name (supabase, google, github, microsoft, email) */
  provider?: Maybe<Scalars['String']['output']>;
  /** Email from the auth provider (may differ from users.email) */
  provider_email?: Maybe<Scalars['String']['output']>;
  /** User ID from the auth provider (e.g., Supabase UUID, Google sub) */
  provider_user_id?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Reference to users table */
  user_id?: Maybe<Scalars['String']['output']>;
  /** When this identity was verified */
  verified_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "user_identities" */
export type User_Identities_Min_Order_By = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Order_By>;
  /** Primary key (NanoID 16-char for security) */
  id?: InputMaybe<Order_By>;
  /** Auth provider name (supabase, google, github, microsoft, email) */
  provider?: InputMaybe<Order_By>;
  /** Email from the auth provider (may differ from users.email) */
  provider_email?: InputMaybe<Order_By>;
  /** User ID from the auth provider (e.g., Supabase UUID, Google sub) */
  provider_user_id?: InputMaybe<Order_By>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Order_By>;
  /** Reference to users table */
  user_id?: InputMaybe<Order_By>;
  /** When this identity was verified */
  verified_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "user_identities" */
export type User_Identities_Mutation_Response = {
  __typename?: 'user_identities_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Identities>;
};

/** on_conflict condition type for table "user_identities" */
export type User_Identities_On_Conflict = {
  constraint: User_Identities_Constraint;
  update_columns?: Array<User_Identities_Update_Column>;
  where?: InputMaybe<User_Identities_Bool_Exp>;
};

/** Ordering options when selecting data from "user_identities". */
export type User_Identities_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_primary?: InputMaybe<Order_By>;
  provider?: InputMaybe<Order_By>;
  provider_email?: InputMaybe<Order_By>;
  provider_metadata?: InputMaybe<Order_By>;
  provider_user_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  verified_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user_identities */
export type User_Identities_Pk_Columns_Input = {
  /** Primary key (NanoID 16-char for security) */
  id: Scalars['String']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type User_Identities_Prepend_Input = {
  /** Provider-specific data (tokens, claims) - JSONB appropriate here */
  provider_metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "user_identities" */
export enum User_Identities_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsPrimary = 'is_primary',
  /** column name */
  Provider = 'provider',
  /** column name */
  ProviderEmail = 'provider_email',
  /** column name */
  ProviderMetadata = 'provider_metadata',
  /** column name */
  ProviderUserId = 'provider_user_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VerifiedAt = 'verified_at'
}

/** select "user_identities_aggregate_bool_exp_bool_and_arguments_columns" columns of table "user_identities" */
export enum User_Identities_Select_Column_User_Identities_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsPrimary = 'is_primary'
}

/** select "user_identities_aggregate_bool_exp_bool_or_arguments_columns" columns of table "user_identities" */
export enum User_Identities_Select_Column_User_Identities_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsPrimary = 'is_primary'
}

/** input type for updating data in table "user_identities" */
export type User_Identities_Set_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key (NanoID 16-char for security) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Whether this is the primary login method for the user */
  is_primary?: InputMaybe<Scalars['Boolean']['input']>;
  /** Auth provider name (supabase, google, github, microsoft, email) */
  provider?: InputMaybe<Scalars['String']['input']>;
  /** Email from the auth provider (may differ from users.email) */
  provider_email?: InputMaybe<Scalars['String']['input']>;
  /** Provider-specific data (tokens, claims) - JSONB appropriate here */
  provider_metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** User ID from the auth provider (e.g., Supabase UUID, Google sub) */
  provider_user_id?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Reference to users table */
  user_id?: InputMaybe<Scalars['String']['input']>;
  /** When this identity was verified */
  verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "user_identities" */
export type User_Identities_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Identities_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Identities_Stream_Cursor_Value_Input = {
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key (NanoID 16-char for security) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Whether this is the primary login method for the user */
  is_primary?: InputMaybe<Scalars['Boolean']['input']>;
  /** Auth provider name (supabase, google, github, microsoft, email) */
  provider?: InputMaybe<Scalars['String']['input']>;
  /** Email from the auth provider (may differ from users.email) */
  provider_email?: InputMaybe<Scalars['String']['input']>;
  /** Provider-specific data (tokens, claims) - JSONB appropriate here */
  provider_metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** User ID from the auth provider (e.g., Supabase UUID, Google sub) */
  provider_user_id?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Reference to users table */
  user_id?: InputMaybe<Scalars['String']['input']>;
  /** When this identity was verified */
  verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "user_identities" */
export enum User_Identities_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsPrimary = 'is_primary',
  /** column name */
  Provider = 'provider',
  /** column name */
  ProviderEmail = 'provider_email',
  /** column name */
  ProviderMetadata = 'provider_metadata',
  /** column name */
  ProviderUserId = 'provider_user_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VerifiedAt = 'verified_at'
}

export type User_Identities_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<User_Identities_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<User_Identities_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<User_Identities_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<User_Identities_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<User_Identities_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Identities_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Identities_Bool_Exp;
};

/** Application users - provider-agnostic, no auth provider IDs stored here */
export type Users = {
  __typename?: 'users';
  /** Profile picture URL */
  avatar_url?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was created */
  created_at: Scalars['timestamptz']['output'];
  /** An array relationship */
  created_organizations: Array<Organizations>;
  /** An aggregate relationship */
  created_organizations_aggregate: Organizations_Aggregate;
  /** User display name */
  display_name?: Maybe<Scalars['String']['output']>;
  /** Primary email address - unique across all users */
  email: Scalars['String']['output'];
  /** Whether email has been verified */
  email_verified: Scalars['Boolean']['output'];
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['output'];
  /** An array relationship */
  identities: Array<User_Identities>;
  /** An aggregate relationship */
  identities_aggregate: User_Identities_Aggregate;
  /** Soft delete flag - false means user is deactivated */
  is_active: Scalars['Boolean']['output'];
  /** Timestamp of last successful login */
  last_login_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User language preference (e.g., en, en-US) */
  locale: Scalars['String']['output'];
  /** An array relationship */
  organization_memberships: Array<Organization_Roles>;
  /** An aggregate relationship */
  organization_memberships_aggregate: Organization_Roles_Aggregate;
  /** User timezone (e.g., UTC, America/New_York) */
  timezone: Scalars['String']['output'];
  /** Timestamp when record was last updated */
  updated_at: Scalars['timestamptz']['output'];
};


/** Application users - provider-agnostic, no auth provider IDs stored here */
export type UsersCreated_OrganizationsArgs = {
  distinct_on?: InputMaybe<Array<Organizations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organizations_Order_By>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


/** Application users - provider-agnostic, no auth provider IDs stored here */
export type UsersCreated_Organizations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organizations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organizations_Order_By>>;
  where?: InputMaybe<Organizations_Bool_Exp>;
};


/** Application users - provider-agnostic, no auth provider IDs stored here */
export type UsersIdentitiesArgs = {
  distinct_on?: InputMaybe<Array<User_Identities_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Identities_Order_By>>;
  where?: InputMaybe<User_Identities_Bool_Exp>;
};


/** Application users - provider-agnostic, no auth provider IDs stored here */
export type UsersIdentities_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Identities_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Identities_Order_By>>;
  where?: InputMaybe<User_Identities_Bool_Exp>;
};


/** Application users - provider-agnostic, no auth provider IDs stored here */
export type UsersOrganization_MembershipsArgs = {
  distinct_on?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Roles_Order_By>>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};


/** Application users - provider-agnostic, no auth provider IDs stored here */
export type UsersOrganization_Memberships_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organization_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Roles_Order_By>>;
  where?: InputMaybe<Organization_Roles_Bool_Exp>;
};

/** aggregated selection of "users" */
export type Users_Aggregate = {
  __typename?: 'users_aggregate';
  aggregate?: Maybe<Users_Aggregate_Fields>;
  nodes: Array<Users>;
};

/** aggregate fields of "users" */
export type Users_Aggregate_Fields = {
  __typename?: 'users_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Users_Max_Fields>;
  min?: Maybe<Users_Min_Fields>;
};


/** aggregate fields of "users" */
export type Users_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  avatar_url?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_organizations?: InputMaybe<Organizations_Bool_Exp>;
  created_organizations_aggregate?: InputMaybe<Organizations_Aggregate_Bool_Exp>;
  display_name?: InputMaybe<String_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  email_verified?: InputMaybe<Boolean_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  identities?: InputMaybe<User_Identities_Bool_Exp>;
  identities_aggregate?: InputMaybe<User_Identities_Aggregate_Bool_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  last_login_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  locale?: InputMaybe<String_Comparison_Exp>;
  organization_memberships?: InputMaybe<Organization_Roles_Bool_Exp>;
  organization_memberships_aggregate?: InputMaybe<Organization_Roles_Aggregate_Bool_Exp>;
  timezone?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "users" */
export enum Users_Constraint {
  /** unique or primary key constraint on columns "email" */
  UsersEmailUnique = 'users_email_unique',
  /** unique or primary key constraint on columns "id" */
  UsersPkey = 'users_pkey'
}

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  /** Profile picture URL */
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_organizations?: InputMaybe<Organizations_Arr_Rel_Insert_Input>;
  /** User display name */
  display_name?: InputMaybe<Scalars['String']['input']>;
  /** Primary email address - unique across all users */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Whether email has been verified */
  email_verified?: InputMaybe<Scalars['Boolean']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  identities?: InputMaybe<User_Identities_Arr_Rel_Insert_Input>;
  /** Soft delete flag - false means user is deactivated */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Timestamp of last successful login */
  last_login_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User language preference (e.g., en, en-US) */
  locale?: InputMaybe<Scalars['String']['input']>;
  organization_memberships?: InputMaybe<Organization_Roles_Arr_Rel_Insert_Input>;
  /** User timezone (e.g., UTC, America/New_York) */
  timezone?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  __typename?: 'users_max_fields';
  /** Profile picture URL */
  avatar_url?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User display name */
  display_name?: Maybe<Scalars['String']['output']>;
  /** Primary email address - unique across all users */
  email?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Timestamp of last successful login */
  last_login_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User language preference (e.g., en, en-US) */
  locale?: Maybe<Scalars['String']['output']>;
  /** User timezone (e.g., UTC, America/New_York) */
  timezone?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  __typename?: 'users_min_fields';
  /** Profile picture URL */
  avatar_url?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was created */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User display name */
  display_name?: Maybe<Scalars['String']['output']>;
  /** Primary email address - unique across all users */
  email?: Maybe<Scalars['String']['output']>;
  /** Primary key (NanoID 12-char) */
  id?: Maybe<Scalars['String']['output']>;
  /** Timestamp of last successful login */
  last_login_at?: Maybe<Scalars['timestamptz']['output']>;
  /** User language preference (e.g., en, en-US) */
  locale?: Maybe<Scalars['String']['output']>;
  /** User timezone (e.g., UTC, America/New_York) */
  timezone?: Maybe<Scalars['String']['output']>;
  /** Timestamp when record was last updated */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "users" */
export type Users_Mutation_Response = {
  __typename?: 'users_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Users>;
};

/** input type for inserting object relation for remote table "users" */
export type Users_Obj_Rel_Insert_Input = {
  data: Users_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

/** on_conflict condition type for table "users" */
export type Users_On_Conflict = {
  constraint: Users_Constraint;
  update_columns?: Array<Users_Update_Column>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** Ordering options when selecting data from "users". */
export type Users_Order_By = {
  avatar_url?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_organizations_aggregate?: InputMaybe<Organizations_Aggregate_Order_By>;
  display_name?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  email_verified?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  identities_aggregate?: InputMaybe<User_Identities_Aggregate_Order_By>;
  is_active?: InputMaybe<Order_By>;
  last_login_at?: InputMaybe<Order_By>;
  locale?: InputMaybe<Order_By>;
  organization_memberships_aggregate?: InputMaybe<Organization_Roles_Aggregate_Order_By>;
  timezone?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: users */
export type Users_Pk_Columns_Input = {
  /** Primary key (NanoID 12-char) */
  id: Scalars['String']['input'];
};

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  AvatarUrl = 'avatar_url',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Email = 'email',
  /** column name */
  EmailVerified = 'email_verified',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  LastLoginAt = 'last_login_at',
  /** column name */
  Locale = 'locale',
  /** column name */
  Timezone = 'timezone',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "users" */
export type Users_Set_Input = {
  /** Profile picture URL */
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User display name */
  display_name?: InputMaybe<Scalars['String']['input']>;
  /** Primary email address - unique across all users */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Whether email has been verified */
  email_verified?: InputMaybe<Scalars['Boolean']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag - false means user is deactivated */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Timestamp of last successful login */
  last_login_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User language preference (e.g., en, en-US) */
  locale?: InputMaybe<Scalars['String']['input']>;
  /** User timezone (e.g., UTC, America/New_York) */
  timezone?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "users" */
export type Users_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Users_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Users_Stream_Cursor_Value_Input = {
  /** Profile picture URL */
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was created */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User display name */
  display_name?: InputMaybe<Scalars['String']['input']>;
  /** Primary email address - unique across all users */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Whether email has been verified */
  email_verified?: InputMaybe<Scalars['Boolean']['input']>;
  /** Primary key (NanoID 12-char) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag - false means user is deactivated */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Timestamp of last successful login */
  last_login_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** User language preference (e.g., en, en-US) */
  locale?: InputMaybe<Scalars['String']['input']>;
  /** User timezone (e.g., UTC, America/New_York) */
  timezone?: InputMaybe<Scalars['String']['input']>;
  /** Timestamp when record was last updated */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "users" */
export enum Users_Update_Column {
  /** column name */
  AvatarUrl = 'avatar_url',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Email = 'email',
  /** column name */
  EmailVerified = 'email_verified',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  LastLoginAt = 'last_login_at',
  /** column name */
  Locale = 'locale',
  /** column name */
  Timezone = 'timezone',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Users_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Users_Set_Input>;
  /** filter the rows which have to be updated */
  where: Users_Bool_Exp;
};

/** Widget-Testimonial many-to-many junction with ordering and featured flag */
export type Widget_Testimonials = {
  __typename?: 'widget_testimonials';
  /** When testimonial was added to widget */
  added_at: Scalars['timestamptz']['output'];
  /** FK to users - who added this. NULL if auto-added on approval */
  added_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  added_by_user?: Maybe<Users>;
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order: Scalars['smallint']['output'];
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['output'];
  /** Highlighted/pinned testimonial. Shows differently in UI (e.g., larger card) */
  is_featured: Scalars['Boolean']['output'];
  /** An object relationship */
  organization: Organizations;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id: Scalars['String']['output'];
  /** An object relationship */
  testimonial: Testimonials;
  /** FK to testimonials - which testimonial is displayed */
  testimonial_id: Scalars['String']['output'];
  /** An object relationship */
  widget: Widgets;
  /** FK to widgets - which widget contains this testimonial */
  widget_id: Scalars['String']['output'];
};

/** aggregated selection of "widget_testimonials" */
export type Widget_Testimonials_Aggregate = {
  __typename?: 'widget_testimonials_aggregate';
  aggregate?: Maybe<Widget_Testimonials_Aggregate_Fields>;
  nodes: Array<Widget_Testimonials>;
};

export type Widget_Testimonials_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Widget_Testimonials_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Widget_Testimonials_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Widget_Testimonials_Aggregate_Bool_Exp_Count>;
};

export type Widget_Testimonials_Aggregate_Bool_Exp_Bool_And = {
  arguments: Widget_Testimonials_Select_Column_Widget_Testimonials_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Widget_Testimonials_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Widget_Testimonials_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Widget_Testimonials_Select_Column_Widget_Testimonials_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Widget_Testimonials_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Widget_Testimonials_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Widget_Testimonials_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Widget_Testimonials_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "widget_testimonials" */
export type Widget_Testimonials_Aggregate_Fields = {
  __typename?: 'widget_testimonials_aggregate_fields';
  avg?: Maybe<Widget_Testimonials_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Widget_Testimonials_Max_Fields>;
  min?: Maybe<Widget_Testimonials_Min_Fields>;
  stddev?: Maybe<Widget_Testimonials_Stddev_Fields>;
  stddev_pop?: Maybe<Widget_Testimonials_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Widget_Testimonials_Stddev_Samp_Fields>;
  sum?: Maybe<Widget_Testimonials_Sum_Fields>;
  var_pop?: Maybe<Widget_Testimonials_Var_Pop_Fields>;
  var_samp?: Maybe<Widget_Testimonials_Var_Samp_Fields>;
  variance?: Maybe<Widget_Testimonials_Variance_Fields>;
};


/** aggregate fields of "widget_testimonials" */
export type Widget_Testimonials_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Widget_Testimonials_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "widget_testimonials" */
export type Widget_Testimonials_Aggregate_Order_By = {
  avg?: InputMaybe<Widget_Testimonials_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Widget_Testimonials_Max_Order_By>;
  min?: InputMaybe<Widget_Testimonials_Min_Order_By>;
  stddev?: InputMaybe<Widget_Testimonials_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Widget_Testimonials_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Widget_Testimonials_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Widget_Testimonials_Sum_Order_By>;
  var_pop?: InputMaybe<Widget_Testimonials_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Widget_Testimonials_Var_Samp_Order_By>;
  variance?: InputMaybe<Widget_Testimonials_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "widget_testimonials" */
export type Widget_Testimonials_Arr_Rel_Insert_Input = {
  data: Array<Widget_Testimonials_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Widget_Testimonials_On_Conflict>;
};

/** aggregate avg on columns */
export type Widget_Testimonials_Avg_Fields = {
  __typename?: 'widget_testimonials_avg_fields';
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "widget_testimonials" */
export type Widget_Testimonials_Avg_Order_By = {
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "widget_testimonials". All fields are combined with a logical 'AND'. */
export type Widget_Testimonials_Bool_Exp = {
  _and?: InputMaybe<Array<Widget_Testimonials_Bool_Exp>>;
  _not?: InputMaybe<Widget_Testimonials_Bool_Exp>;
  _or?: InputMaybe<Array<Widget_Testimonials_Bool_Exp>>;
  added_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  added_by?: InputMaybe<String_Comparison_Exp>;
  added_by_user?: InputMaybe<Users_Bool_Exp>;
  display_order?: InputMaybe<Smallint_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_featured?: InputMaybe<Boolean_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  testimonial?: InputMaybe<Testimonials_Bool_Exp>;
  testimonial_id?: InputMaybe<String_Comparison_Exp>;
  widget?: InputMaybe<Widgets_Bool_Exp>;
  widget_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "widget_testimonials" */
export enum Widget_Testimonials_Constraint {
  /** unique or primary key constraint on columns "display_order", "widget_id" */
  WidgetTestimonialsOrderUnique = 'widget_testimonials_order_unique',
  /** unique or primary key constraint on columns "id" */
  WidgetTestimonialsPkey = 'widget_testimonials_pkey',
  /** unique or primary key constraint on columns "widget_id", "testimonial_id" */
  WidgetTestimonialsUnique = 'widget_testimonials_unique'
}

/** input type for incrementing numeric columns in table "widget_testimonials" */
export type Widget_Testimonials_Inc_Input = {
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
};

/** input type for inserting data into table "widget_testimonials" */
export type Widget_Testimonials_Insert_Input = {
  /** When testimonial was added to widget */
  added_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who added this. NULL if auto-added on approval */
  added_by?: InputMaybe<Scalars['String']['input']>;
  added_by_user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Highlighted/pinned testimonial. Shows differently in UI (e.g., larger card) */
  is_featured?: InputMaybe<Scalars['Boolean']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  testimonial?: InputMaybe<Testimonials_Obj_Rel_Insert_Input>;
  /** FK to testimonials - which testimonial is displayed */
  testimonial_id?: InputMaybe<Scalars['String']['input']>;
  widget?: InputMaybe<Widgets_Obj_Rel_Insert_Input>;
  /** FK to widgets - which widget contains this testimonial */
  widget_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Widget_Testimonials_Max_Fields = {
  __typename?: 'widget_testimonials_max_fields';
  /** When testimonial was added to widget */
  added_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who added this. NULL if auto-added on approval */
  added_by?: Maybe<Scalars['String']['output']>;
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: Maybe<Scalars['smallint']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** FK to testimonials - which testimonial is displayed */
  testimonial_id?: Maybe<Scalars['String']['output']>;
  /** FK to widgets - which widget contains this testimonial */
  widget_id?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "widget_testimonials" */
export type Widget_Testimonials_Max_Order_By = {
  /** When testimonial was added to widget */
  added_at?: InputMaybe<Order_By>;
  /** FK to users - who added this. NULL if auto-added on approval */
  added_by?: InputMaybe<Order_By>;
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Order_By>;
  /** FK to testimonials - which testimonial is displayed */
  testimonial_id?: InputMaybe<Order_By>;
  /** FK to widgets - which widget contains this testimonial */
  widget_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Widget_Testimonials_Min_Fields = {
  __typename?: 'widget_testimonials_min_fields';
  /** When testimonial was added to widget */
  added_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who added this. NULL if auto-added on approval */
  added_by?: Maybe<Scalars['String']['output']>;
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: Maybe<Scalars['smallint']['output']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** FK to testimonials - which testimonial is displayed */
  testimonial_id?: Maybe<Scalars['String']['output']>;
  /** FK to widgets - which widget contains this testimonial */
  widget_id?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "widget_testimonials" */
export type Widget_Testimonials_Min_Order_By = {
  /** When testimonial was added to widget */
  added_at?: InputMaybe<Order_By>;
  /** FK to users - who added this. NULL if auto-added on approval */
  added_by?: InputMaybe<Order_By>;
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Order_By>;
  /** FK to testimonials - which testimonial is displayed */
  testimonial_id?: InputMaybe<Order_By>;
  /** FK to widgets - which widget contains this testimonial */
  widget_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "widget_testimonials" */
export type Widget_Testimonials_Mutation_Response = {
  __typename?: 'widget_testimonials_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Widget_Testimonials>;
};

/** on_conflict condition type for table "widget_testimonials" */
export type Widget_Testimonials_On_Conflict = {
  constraint: Widget_Testimonials_Constraint;
  update_columns?: Array<Widget_Testimonials_Update_Column>;
  where?: InputMaybe<Widget_Testimonials_Bool_Exp>;
};

/** Ordering options when selecting data from "widget_testimonials". */
export type Widget_Testimonials_Order_By = {
  added_at?: InputMaybe<Order_By>;
  added_by?: InputMaybe<Order_By>;
  added_by_user?: InputMaybe<Users_Order_By>;
  display_order?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_featured?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  testimonial?: InputMaybe<Testimonials_Order_By>;
  testimonial_id?: InputMaybe<Order_By>;
  widget?: InputMaybe<Widgets_Order_By>;
  widget_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: widget_testimonials */
export type Widget_Testimonials_Pk_Columns_Input = {
  /** Primary key - NanoID 12-char unique identifier */
  id: Scalars['String']['input'];
};

/** select columns of table "widget_testimonials" */
export enum Widget_Testimonials_Select_Column {
  /** column name */
  AddedAt = 'added_at',
  /** column name */
  AddedBy = 'added_by',
  /** column name */
  DisplayOrder = 'display_order',
  /** column name */
  Id = 'id',
  /** column name */
  IsFeatured = 'is_featured',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  TestimonialId = 'testimonial_id',
  /** column name */
  WidgetId = 'widget_id'
}

/** select "widget_testimonials_aggregate_bool_exp_bool_and_arguments_columns" columns of table "widget_testimonials" */
export enum Widget_Testimonials_Select_Column_Widget_Testimonials_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsFeatured = 'is_featured'
}

/** select "widget_testimonials_aggregate_bool_exp_bool_or_arguments_columns" columns of table "widget_testimonials" */
export enum Widget_Testimonials_Select_Column_Widget_Testimonials_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsFeatured = 'is_featured'
}

/** input type for updating data in table "widget_testimonials" */
export type Widget_Testimonials_Set_Input = {
  /** When testimonial was added to widget */
  added_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who added this. NULL if auto-added on approval */
  added_by?: InputMaybe<Scalars['String']['input']>;
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Highlighted/pinned testimonial. Shows differently in UI (e.g., larger card) */
  is_featured?: InputMaybe<Scalars['Boolean']['input']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to testimonials - which testimonial is displayed */
  testimonial_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to widgets - which widget contains this testimonial */
  widget_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Widget_Testimonials_Stddev_Fields = {
  __typename?: 'widget_testimonials_stddev_fields';
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "widget_testimonials" */
export type Widget_Testimonials_Stddev_Order_By = {
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Widget_Testimonials_Stddev_Pop_Fields = {
  __typename?: 'widget_testimonials_stddev_pop_fields';
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "widget_testimonials" */
export type Widget_Testimonials_Stddev_Pop_Order_By = {
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Widget_Testimonials_Stddev_Samp_Fields = {
  __typename?: 'widget_testimonials_stddev_samp_fields';
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "widget_testimonials" */
export type Widget_Testimonials_Stddev_Samp_Order_By = {
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "widget_testimonials" */
export type Widget_Testimonials_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Widget_Testimonials_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Widget_Testimonials_Stream_Cursor_Value_Input = {
  /** When testimonial was added to widget */
  added_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who added this. NULL if auto-added on approval */
  added_by?: InputMaybe<Scalars['String']['input']>;
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Scalars['smallint']['input']>;
  /** Primary key - NanoID 12-char unique identifier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Highlighted/pinned testimonial. Shows differently in UI (e.g., larger card) */
  is_featured?: InputMaybe<Scalars['Boolean']['input']>;
  /** FK to organizations - tenant boundary for Hasura row-level permissions */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to testimonials - which testimonial is displayed */
  testimonial_id?: InputMaybe<Scalars['String']['input']>;
  /** FK to widgets - which widget contains this testimonial */
  widget_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Widget_Testimonials_Sum_Fields = {
  __typename?: 'widget_testimonials_sum_fields';
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: Maybe<Scalars['smallint']['output']>;
};

/** order by sum() on columns of table "widget_testimonials" */
export type Widget_Testimonials_Sum_Order_By = {
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** update columns of table "widget_testimonials" */
export enum Widget_Testimonials_Update_Column {
  /** column name */
  AddedAt = 'added_at',
  /** column name */
  AddedBy = 'added_by',
  /** column name */
  DisplayOrder = 'display_order',
  /** column name */
  Id = 'id',
  /** column name */
  IsFeatured = 'is_featured',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  TestimonialId = 'testimonial_id',
  /** column name */
  WidgetId = 'widget_id'
}

export type Widget_Testimonials_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Widget_Testimonials_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Widget_Testimonials_Set_Input>;
  /** filter the rows which have to be updated */
  where: Widget_Testimonials_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Widget_Testimonials_Var_Pop_Fields = {
  __typename?: 'widget_testimonials_var_pop_fields';
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "widget_testimonials" */
export type Widget_Testimonials_Var_Pop_Order_By = {
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Widget_Testimonials_Var_Samp_Fields = {
  __typename?: 'widget_testimonials_var_samp_fields';
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "widget_testimonials" */
export type Widget_Testimonials_Var_Samp_Order_By = {
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Widget_Testimonials_Variance_Fields = {
  __typename?: 'widget_testimonials_variance_fields';
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "widget_testimonials" */
export type Widget_Testimonials_Variance_Order_By = {
  /** Order in widget display. Unique per widget, starts at 1 */
  display_order?: InputMaybe<Order_By>;
};

/** Embeddable widgets - testimonial selections in junction table */
export type Widgets = {
  __typename?: 'widgets';
  /** Timestamp when widget was created. Immutable */
  created_at: Scalars['timestamptz']['output'];
  /** FK to users - user who created this widget */
  created_by: Scalars['String']['output'];
  /** An object relationship */
  creator: Users;
  /** Primary key - NanoID 12-char unique identifier. Used in embed code */
  id: Scalars['String']['output'];
  /** Soft delete flag. False = embed script returns empty widget */
  is_active: Scalars['Boolean']['output'];
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: Maybe<Scalars['smallint']['output']>;
  /** Display name in dashboard (e.g., "Homepage Carousel", "Footer Wall") */
  name: Scalars['String']['output'];
  /** An object relationship */
  organization: Organizations;
  /** FK to organizations - tenant boundary for isolation */
  organization_id: Scalars['String']['output'];
  /** Type-specific UI settings - JSONB appropriate. E.g., carousel_speed, columns */
  settings: Scalars['jsonb']['output'];
  /** Whether to display customer avatar/photo */
  show_avatar: Scalars['Boolean']['output'];
  /** Whether to display customer company name below name */
  show_company: Scalars['Boolean']['output'];
  /** Whether to display submission dates. Usually false for evergreen feel */
  show_dates: Scalars['Boolean']['output'];
  /** Whether to display star ratings on testimonial cards */
  show_ratings: Scalars['Boolean']['output'];
  /** An array relationship */
  testimonial_placements: Array<Widget_Testimonials>;
  /** An aggregate relationship */
  testimonial_placements_aggregate: Widget_Testimonials_Aggregate;
  /** Color scheme: light (white bg) or dark (dark bg) */
  theme: Scalars['String']['output'];
  /** Layout type: wall_of_love (grid), carousel (slider), single_quote (featured) */
  type: Scalars['String']['output'];
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at: Scalars['timestamptz']['output'];
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  updater?: Maybe<Users>;
};


/** Embeddable widgets - testimonial selections in junction table */
export type WidgetsSettingsArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** Embeddable widgets - testimonial selections in junction table */
export type WidgetsTestimonial_PlacementsArgs = {
  distinct_on?: InputMaybe<Array<Widget_Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widget_Testimonials_Order_By>>;
  where?: InputMaybe<Widget_Testimonials_Bool_Exp>;
};


/** Embeddable widgets - testimonial selections in junction table */
export type WidgetsTestimonial_Placements_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Widget_Testimonials_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Widget_Testimonials_Order_By>>;
  where?: InputMaybe<Widget_Testimonials_Bool_Exp>;
};

/** aggregated selection of "widgets" */
export type Widgets_Aggregate = {
  __typename?: 'widgets_aggregate';
  aggregate?: Maybe<Widgets_Aggregate_Fields>;
  nodes: Array<Widgets>;
};

export type Widgets_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Widgets_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Widgets_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Widgets_Aggregate_Bool_Exp_Count>;
};

export type Widgets_Aggregate_Bool_Exp_Bool_And = {
  arguments: Widgets_Select_Column_Widgets_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Widgets_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Widgets_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Widgets_Select_Column_Widgets_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Widgets_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Widgets_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Widgets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Widgets_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "widgets" */
export type Widgets_Aggregate_Fields = {
  __typename?: 'widgets_aggregate_fields';
  avg?: Maybe<Widgets_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Widgets_Max_Fields>;
  min?: Maybe<Widgets_Min_Fields>;
  stddev?: Maybe<Widgets_Stddev_Fields>;
  stddev_pop?: Maybe<Widgets_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Widgets_Stddev_Samp_Fields>;
  sum?: Maybe<Widgets_Sum_Fields>;
  var_pop?: Maybe<Widgets_Var_Pop_Fields>;
  var_samp?: Maybe<Widgets_Var_Samp_Fields>;
  variance?: Maybe<Widgets_Variance_Fields>;
};


/** aggregate fields of "widgets" */
export type Widgets_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Widgets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "widgets" */
export type Widgets_Aggregate_Order_By = {
  avg?: InputMaybe<Widgets_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Widgets_Max_Order_By>;
  min?: InputMaybe<Widgets_Min_Order_By>;
  stddev?: InputMaybe<Widgets_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Widgets_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Widgets_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Widgets_Sum_Order_By>;
  var_pop?: InputMaybe<Widgets_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Widgets_Var_Samp_Order_By>;
  variance?: InputMaybe<Widgets_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Widgets_Append_Input = {
  /** Type-specific UI settings - JSONB appropriate. E.g., carousel_speed, columns */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "widgets" */
export type Widgets_Arr_Rel_Insert_Input = {
  data: Array<Widgets_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Widgets_On_Conflict>;
};

/** aggregate avg on columns */
export type Widgets_Avg_Fields = {
  __typename?: 'widgets_avg_fields';
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "widgets" */
export type Widgets_Avg_Order_By = {
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "widgets". All fields are combined with a logical 'AND'. */
export type Widgets_Bool_Exp = {
  _and?: InputMaybe<Array<Widgets_Bool_Exp>>;
  _not?: InputMaybe<Widgets_Bool_Exp>;
  _or?: InputMaybe<Array<Widgets_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_by?: InputMaybe<String_Comparison_Exp>;
  creator?: InputMaybe<Users_Bool_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  max_display?: InputMaybe<Smallint_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organizations_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  settings?: InputMaybe<Jsonb_Comparison_Exp>;
  show_avatar?: InputMaybe<Boolean_Comparison_Exp>;
  show_company?: InputMaybe<Boolean_Comparison_Exp>;
  show_dates?: InputMaybe<Boolean_Comparison_Exp>;
  show_ratings?: InputMaybe<Boolean_Comparison_Exp>;
  testimonial_placements?: InputMaybe<Widget_Testimonials_Bool_Exp>;
  testimonial_placements_aggregate?: InputMaybe<Widget_Testimonials_Aggregate_Bool_Exp>;
  theme?: InputMaybe<String_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_by?: InputMaybe<String_Comparison_Exp>;
  updater?: InputMaybe<Users_Bool_Exp>;
};

/** unique or primary key constraints on table "widgets" */
export enum Widgets_Constraint {
  /** unique or primary key constraint on columns "id" */
  WidgetsPkey = 'widgets_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Widgets_Delete_At_Path_Input = {
  /** Type-specific UI settings - JSONB appropriate. E.g., carousel_speed, columns */
  settings?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Widgets_Delete_Elem_Input = {
  /** Type-specific UI settings - JSONB appropriate. E.g., carousel_speed, columns */
  settings?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Widgets_Delete_Key_Input = {
  /** Type-specific UI settings - JSONB appropriate. E.g., carousel_speed, columns */
  settings?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "widgets" */
export type Widgets_Inc_Input = {
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Scalars['smallint']['input']>;
};

/** input type for inserting data into table "widgets" */
export type Widgets_Insert_Input = {
  /** Timestamp when widget was created. Immutable */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who created this widget */
  created_by?: InputMaybe<Scalars['String']['input']>;
  creator?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** Primary key - NanoID 12-char unique identifier. Used in embed code */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = embed script returns empty widget */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Scalars['smallint']['input']>;
  /** Display name in dashboard (e.g., "Homepage Carousel", "Footer Wall") */
  name?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organizations_Obj_Rel_Insert_Input>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Type-specific UI settings - JSONB appropriate. E.g., carousel_speed, columns */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
  /** Whether to display customer avatar/photo */
  show_avatar?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether to display customer company name below name */
  show_company?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether to display submission dates. Usually false for evergreen feel */
  show_dates?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether to display star ratings on testimonial cards */
  show_ratings?: InputMaybe<Scalars['Boolean']['input']>;
  testimonial_placements?: InputMaybe<Widget_Testimonials_Arr_Rel_Insert_Input>;
  /** Color scheme: light (white bg) or dark (dark bg) */
  theme?: InputMaybe<Scalars['String']['input']>;
  /** Layout type: wall_of_love (grid), carousel (slider), single_quote (featured) */
  type?: InputMaybe<Scalars['String']['input']>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
  updater?: InputMaybe<Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Widgets_Max_Fields = {
  __typename?: 'widgets_max_fields';
  /** Timestamp when widget was created. Immutable */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - user who created this widget */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier. Used in embed code */
  id?: Maybe<Scalars['String']['output']>;
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: Maybe<Scalars['smallint']['output']>;
  /** Display name in dashboard (e.g., "Homepage Carousel", "Footer Wall") */
  name?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Color scheme: light (white bg) or dark (dark bg) */
  theme?: Maybe<Scalars['String']['output']>;
  /** Layout type: wall_of_love (grid), carousel (slider), single_quote (featured) */
  type?: Maybe<Scalars['String']['output']>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "widgets" */
export type Widgets_Max_Order_By = {
  /** Timestamp when widget was created. Immutable */
  created_at?: InputMaybe<Order_By>;
  /** FK to users - user who created this widget */
  created_by?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier. Used in embed code */
  id?: InputMaybe<Order_By>;
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Order_By>;
  /** Display name in dashboard (e.g., "Homepage Carousel", "Footer Wall") */
  name?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Order_By>;
  /** Color scheme: light (white bg) or dark (dark bg) */
  theme?: InputMaybe<Order_By>;
  /** Layout type: wall_of_love (grid), carousel (slider), single_quote (featured) */
  type?: InputMaybe<Order_By>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Widgets_Min_Fields = {
  __typename?: 'widgets_min_fields';
  /** Timestamp when widget was created. Immutable */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - user who created this widget */
  created_by?: Maybe<Scalars['String']['output']>;
  /** Primary key - NanoID 12-char unique identifier. Used in embed code */
  id?: Maybe<Scalars['String']['output']>;
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: Maybe<Scalars['smallint']['output']>;
  /** Display name in dashboard (e.g., "Homepage Carousel", "Footer Wall") */
  name?: Maybe<Scalars['String']['output']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: Maybe<Scalars['String']['output']>;
  /** Color scheme: light (white bg) or dark (dark bg) */
  theme?: Maybe<Scalars['String']['output']>;
  /** Layout type: wall_of_love (grid), carousel (slider), single_quote (featured) */
  type?: Maybe<Scalars['String']['output']>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "widgets" */
export type Widgets_Min_Order_By = {
  /** Timestamp when widget was created. Immutable */
  created_at?: InputMaybe<Order_By>;
  /** FK to users - user who created this widget */
  created_by?: InputMaybe<Order_By>;
  /** Primary key - NanoID 12-char unique identifier. Used in embed code */
  id?: InputMaybe<Order_By>;
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Order_By>;
  /** Display name in dashboard (e.g., "Homepage Carousel", "Footer Wall") */
  name?: InputMaybe<Order_By>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Order_By>;
  /** Color scheme: light (white bg) or dark (dark bg) */
  theme?: InputMaybe<Order_By>;
  /** Layout type: wall_of_love (grid), carousel (slider), single_quote (featured) */
  type?: InputMaybe<Order_By>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: InputMaybe<Order_By>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "widgets" */
export type Widgets_Mutation_Response = {
  __typename?: 'widgets_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Widgets>;
};

/** input type for inserting object relation for remote table "widgets" */
export type Widgets_Obj_Rel_Insert_Input = {
  data: Widgets_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Widgets_On_Conflict>;
};

/** on_conflict condition type for table "widgets" */
export type Widgets_On_Conflict = {
  constraint: Widgets_Constraint;
  update_columns?: Array<Widgets_Update_Column>;
  where?: InputMaybe<Widgets_Bool_Exp>;
};

/** Ordering options when selecting data from "widgets". */
export type Widgets_Order_By = {
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  creator?: InputMaybe<Users_Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  max_display?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organizations_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  settings?: InputMaybe<Order_By>;
  show_avatar?: InputMaybe<Order_By>;
  show_company?: InputMaybe<Order_By>;
  show_dates?: InputMaybe<Order_By>;
  show_ratings?: InputMaybe<Order_By>;
  testimonial_placements_aggregate?: InputMaybe<Widget_Testimonials_Aggregate_Order_By>;
  theme?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  updated_by?: InputMaybe<Order_By>;
  updater?: InputMaybe<Users_Order_By>;
};

/** primary key columns input for table: widgets */
export type Widgets_Pk_Columns_Input = {
  /** Primary key - NanoID 12-char unique identifier. Used in embed code */
  id: Scalars['String']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Widgets_Prepend_Input = {
  /** Type-specific UI settings - JSONB appropriate. E.g., carousel_speed, columns */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "widgets" */
export enum Widgets_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  MaxDisplay = 'max_display',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Settings = 'settings',
  /** column name */
  ShowAvatar = 'show_avatar',
  /** column name */
  ShowCompany = 'show_company',
  /** column name */
  ShowDates = 'show_dates',
  /** column name */
  ShowRatings = 'show_ratings',
  /** column name */
  Theme = 'theme',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

/** select "widgets_aggregate_bool_exp_bool_and_arguments_columns" columns of table "widgets" */
export enum Widgets_Select_Column_Widgets_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  ShowAvatar = 'show_avatar',
  /** column name */
  ShowCompany = 'show_company',
  /** column name */
  ShowDates = 'show_dates',
  /** column name */
  ShowRatings = 'show_ratings'
}

/** select "widgets_aggregate_bool_exp_bool_or_arguments_columns" columns of table "widgets" */
export enum Widgets_Select_Column_Widgets_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active',
  /** column name */
  ShowAvatar = 'show_avatar',
  /** column name */
  ShowCompany = 'show_company',
  /** column name */
  ShowDates = 'show_dates',
  /** column name */
  ShowRatings = 'show_ratings'
}

/** input type for updating data in table "widgets" */
export type Widgets_Set_Input = {
  /** Timestamp when widget was created. Immutable */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who created this widget */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier. Used in embed code */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = embed script returns empty widget */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Scalars['smallint']['input']>;
  /** Display name in dashboard (e.g., "Homepage Carousel", "Footer Wall") */
  name?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Type-specific UI settings - JSONB appropriate. E.g., carousel_speed, columns */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
  /** Whether to display customer avatar/photo */
  show_avatar?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether to display customer company name below name */
  show_company?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether to display submission dates. Usually false for evergreen feel */
  show_dates?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether to display star ratings on testimonial cards */
  show_ratings?: InputMaybe<Scalars['Boolean']['input']>;
  /** Color scheme: light (white bg) or dark (dark bg) */
  theme?: InputMaybe<Scalars['String']['input']>;
  /** Layout type: wall_of_love (grid), carousel (slider), single_quote (featured) */
  type?: InputMaybe<Scalars['String']['input']>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Widgets_Stddev_Fields = {
  __typename?: 'widgets_stddev_fields';
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "widgets" */
export type Widgets_Stddev_Order_By = {
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Widgets_Stddev_Pop_Fields = {
  __typename?: 'widgets_stddev_pop_fields';
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "widgets" */
export type Widgets_Stddev_Pop_Order_By = {
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Widgets_Stddev_Samp_Fields = {
  __typename?: 'widgets_stddev_samp_fields';
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "widgets" */
export type Widgets_Stddev_Samp_Order_By = {
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "widgets" */
export type Widgets_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Widgets_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Widgets_Stream_Cursor_Value_Input = {
  /** Timestamp when widget was created. Immutable */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - user who created this widget */
  created_by?: InputMaybe<Scalars['String']['input']>;
  /** Primary key - NanoID 12-char unique identifier. Used in embed code */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Soft delete flag. False = embed script returns empty widget */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Scalars['smallint']['input']>;
  /** Display name in dashboard (e.g., "Homepage Carousel", "Footer Wall") */
  name?: InputMaybe<Scalars['String']['input']>;
  /** FK to organizations - tenant boundary for isolation */
  organization_id?: InputMaybe<Scalars['String']['input']>;
  /** Type-specific UI settings - JSONB appropriate. E.g., carousel_speed, columns */
  settings?: InputMaybe<Scalars['jsonb']['input']>;
  /** Whether to display customer avatar/photo */
  show_avatar?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether to display customer company name below name */
  show_company?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether to display submission dates. Usually false for evergreen feel */
  show_dates?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether to display star ratings on testimonial cards */
  show_ratings?: InputMaybe<Scalars['Boolean']['input']>;
  /** Color scheme: light (white bg) or dark (dark bg) */
  theme?: InputMaybe<Scalars['String']['input']>;
  /** Layout type: wall_of_love (grid), carousel (slider), single_quote (featured) */
  type?: InputMaybe<Scalars['String']['input']>;
  /** Last modification timestamp. Auto-updated by trigger */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** FK to users - who last modified. NULL until first update */
  updated_by?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Widgets_Sum_Fields = {
  __typename?: 'widgets_sum_fields';
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: Maybe<Scalars['smallint']['output']>;
};

/** order by sum() on columns of table "widgets" */
export type Widgets_Sum_Order_By = {
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Order_By>;
};

/** update columns of table "widgets" */
export enum Widgets_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  MaxDisplay = 'max_display',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Settings = 'settings',
  /** column name */
  ShowAvatar = 'show_avatar',
  /** column name */
  ShowCompany = 'show_company',
  /** column name */
  ShowDates = 'show_dates',
  /** column name */
  ShowRatings = 'show_ratings',
  /** column name */
  Theme = 'theme',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpdatedBy = 'updated_by'
}

export type Widgets_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Widgets_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Widgets_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Widgets_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Widgets_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Widgets_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Widgets_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Widgets_Set_Input>;
  /** filter the rows which have to be updated */
  where: Widgets_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Widgets_Var_Pop_Fields = {
  __typename?: 'widgets_var_pop_fields';
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "widgets" */
export type Widgets_Var_Pop_Order_By = {
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Widgets_Var_Samp_Fields = {
  __typename?: 'widgets_var_samp_fields';
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "widgets" */
export type Widgets_Var_Samp_Order_By = {
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Widgets_Variance_Fields = {
  __typename?: 'widgets_variance_fields';
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "widgets" */
export type Widgets_Variance_Order_By = {
  /** Maximum testimonials to display. NULL = show all selected */
  max_display?: InputMaybe<Order_By>;
};

export type FormBasicFragment = { __typename?: 'forms', id: string, name: string, product_name: string, product_description?: string | null, settings: any, branching_config: any, status: string, is_active: boolean, organization_id: string, created_by: string, created_at: string, updated_at: string, organization: { __typename?: 'organizations', id: string, logo_url?: string | null } };

export type CreateFormMutationVariables = Exact<{
  form: Forms_Insert_Input;
}>;


export type CreateFormMutation = { __typename?: 'mutation_root', insert_forms_one?: { __typename?: 'forms', id: string, name: string, product_name: string, organization_id: string, created_at: string } | null };

export type DeleteFormMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteFormMutation = { __typename?: 'mutation_root', update_forms_by_pk?: { __typename?: 'forms', id: string, is_active: boolean } | null };

export type PublishFormMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type PublishFormMutation = { __typename?: 'mutation_root', update_forms_by_pk?: { __typename?: 'forms', id: string, status: string, updated_at: string } | null };

export type UpdateFormMutationVariables = Exact<{
  id: Scalars['String']['input'];
  changes: Forms_Set_Input;
}>;


export type UpdateFormMutation = { __typename?: 'mutation_root', update_forms_by_pk?: { __typename?: 'forms', id: string, name: string, product_name: string, product_description?: string | null, settings: any, branching_config: any, is_active: boolean, updated_at: string } | null };

export type UpdateFormAutoSaveMutationVariables = Exact<{
  id: Scalars['String']['input'];
  changes: Forms_Set_Input;
}>;


export type UpdateFormAutoSaveMutation = { __typename?: 'mutation_root', update_forms_by_pk?: { __typename?: 'forms', id: string, status: string, updated_at: string } | null };

export type GetFormQueryVariables = Exact<{
  formId: Scalars['String']['input'];
}>;


export type GetFormQuery = { __typename?: 'query_root', forms_by_pk?: { __typename?: 'forms', id: string, name: string, product_name: string, product_description?: string | null, settings: any, branching_config: any, status: string, is_active: boolean, organization_id: string, created_by: string, created_at: string, updated_at: string, organization: { __typename?: 'organizations', id: string, logo_url?: string | null } } | null };

export type GetFormsQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type GetFormsQuery = { __typename?: 'query_root', forms: Array<{ __typename?: 'forms', id: string, name: string, product_name: string, product_description?: string | null, settings: any, branching_config: any, status: string, is_active: boolean, organization_id: string, created_by: string, created_at: string, updated_at: string, organization: { __typename?: 'organizations', id: string, logo_url?: string | null } }> };

export type FormQuestionBasicFragment = { __typename?: 'form_questions', id: string, form_id: string, organization_id: string, question_type_id: string, question_key: string, question_text: string, placeholder?: string | null, help_text?: string | null, display_order: number, is_required: boolean, min_length?: number | null, max_length?: number | null, min_value?: number | null, max_value?: number | null, validation_pattern?: string | null, allowed_file_types?: Array<string> | null, max_file_size_kb?: number | null, is_active: boolean, created_at: string, updated_at: string, question_type: { __typename?: 'question_types', id: string, unique_name: string, name: string, category: string, input_component: string } };

export type FormQuestionWithOptionsFragment = { __typename?: 'form_questions', scale_min_label?: string | null, scale_max_label?: string | null, id: string, form_id: string, organization_id: string, question_type_id: string, question_key: string, question_text: string, placeholder?: string | null, help_text?: string | null, display_order: number, is_required: boolean, min_length?: number | null, max_length?: number | null, min_value?: number | null, max_value?: number | null, validation_pattern?: string | null, allowed_file_types?: Array<string> | null, max_file_size_kb?: number | null, is_active: boolean, created_at: string, updated_at: string, options: Array<{ __typename?: 'question_options', id: string, question_id: string, option_value: string, option_label: string, display_order: number, is_default: boolean, is_active: boolean }>, question_type: { __typename?: 'question_types', id: string, unique_name: string, name: string, category: string, input_component: string } };

export type QuestionOptionBasicFragment = { __typename?: 'question_options', id: string, question_id: string, option_value: string, option_label: string, display_order: number, is_default: boolean, is_active: boolean };

export type CreateFormQuestionMutationVariables = Exact<{
  input: Form_Questions_Insert_Input;
}>;


export type CreateFormQuestionMutation = { __typename?: 'mutation_root', insert_form_questions_one?: { __typename?: 'form_questions', id: string, form_id: string, organization_id: string, question_type_id: string, question_key: string, question_text: string, placeholder?: string | null, help_text?: string | null, display_order: number, is_required: boolean, min_length?: number | null, max_length?: number | null, min_value?: number | null, max_value?: number | null, validation_pattern?: string | null, allowed_file_types?: Array<string> | null, max_file_size_kb?: number | null, is_active: boolean, created_at: string, updated_at: string, question_type: { __typename?: 'question_types', id: string, unique_name: string, name: string, category: string, input_component: string } } | null };

export type CreateFormQuestionsMutationVariables = Exact<{
  inputs: Array<Form_Questions_Insert_Input> | Form_Questions_Insert_Input;
}>;


export type CreateFormQuestionsMutation = { __typename?: 'mutation_root', insert_form_questions?: { __typename?: 'form_questions_mutation_response', returning: Array<{ __typename?: 'form_questions', id: string, form_id: string, organization_id: string, question_type_id: string, question_key: string, question_text: string, placeholder?: string | null, help_text?: string | null, display_order: number, is_required: boolean, min_length?: number | null, max_length?: number | null, min_value?: number | null, max_value?: number | null, validation_pattern?: string | null, allowed_file_types?: Array<string> | null, max_file_size_kb?: number | null, is_active: boolean, created_at: string, updated_at: string, question_type: { __typename?: 'question_types', id: string, unique_name: string, name: string, category: string, input_component: string } }> } | null };

export type DeactivateFormQuestionsMutationVariables = Exact<{
  formId: Scalars['String']['input'];
}>;


export type DeactivateFormQuestionsMutation = { __typename?: 'mutation_root', update_form_questions?: { __typename?: 'form_questions_mutation_response', affected_rows: number } | null };

export type DeleteFormQuestionMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteFormQuestionMutation = { __typename?: 'mutation_root', update_form_questions_by_pk?: { __typename?: 'form_questions', id: string, is_active: boolean } | null };

export type ReorderFormQuestionsMutationVariables = Exact<{
  updates: Array<Form_Questions_Updates> | Form_Questions_Updates;
}>;


export type ReorderFormQuestionsMutation = { __typename?: 'mutation_root', update_form_questions_many?: Array<{ __typename?: 'form_questions_mutation_response', returning: Array<{ __typename?: 'form_questions', id: string, display_order: number }> } | null> | null };

export type UpdateFormQuestionMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: Form_Questions_Set_Input;
}>;


export type UpdateFormQuestionMutation = { __typename?: 'mutation_root', update_form_questions_by_pk?: { __typename?: 'form_questions', id: string, form_id: string, organization_id: string, question_type_id: string, question_key: string, question_text: string, placeholder?: string | null, help_text?: string | null, display_order: number, is_required: boolean, min_length?: number | null, max_length?: number | null, min_value?: number | null, max_value?: number | null, validation_pattern?: string | null, allowed_file_types?: Array<string> | null, max_file_size_kb?: number | null, is_active: boolean, created_at: string, updated_at: string, question_type: { __typename?: 'question_types', id: string, unique_name: string, name: string, category: string, input_component: string } } | null };

export type GetFormQuestionsQueryVariables = Exact<{
  formId: Scalars['String']['input'];
}>;


export type GetFormQuestionsQuery = { __typename?: 'query_root', form_questions: Array<{ __typename?: 'form_questions', id: string, form_id: string, organization_id: string, question_type_id: string, question_key: string, question_text: string, placeholder?: string | null, help_text?: string | null, display_order: number, is_required: boolean, min_length?: number | null, max_length?: number | null, min_value?: number | null, max_value?: number | null, validation_pattern?: string | null, allowed_file_types?: Array<string> | null, max_file_size_kb?: number | null, is_active: boolean, created_at: string, updated_at: string, question_type: { __typename?: 'question_types', id: string, unique_name: string, name: string, category: string, input_component: string } }> };

export type FormStepBasicFragment = { __typename?: 'form_steps', id: string, form_id: string, step_type: string, step_order: number, question_id?: string | null, content: any, tips?: Array<string> | null, flow_membership: string, is_active: boolean, created_at: string, updated_at: string };

export type CreateFormStepsMutationVariables = Exact<{
  inputs: Array<Form_Steps_Insert_Input> | Form_Steps_Insert_Input;
}>;


export type CreateFormStepsMutation = { __typename?: 'mutation_root', insert_form_steps?: { __typename?: 'form_steps_mutation_response', returning: Array<{ __typename?: 'form_steps', id: string, form_id: string, step_type: string, step_order: number, question_id?: string | null, content: any, tips?: Array<string> | null, flow_membership: string, is_active: boolean, created_at: string, updated_at: string }> } | null };

export type DeleteFormStepsMutationVariables = Exact<{
  ids: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type DeleteFormStepsMutation = { __typename?: 'mutation_root', delete_form_steps?: { __typename?: 'form_steps_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'form_steps', id: string }> } | null };

export type UpdateFormStepMutationVariables = Exact<{
  id: Scalars['String']['input'];
  changes: Form_Steps_Set_Input;
}>;


export type UpdateFormStepMutation = { __typename?: 'mutation_root', update_form_steps_by_pk?: { __typename?: 'form_steps', id: string, flow_membership: string, step_order: number, content: any, tips?: Array<string> | null, updated_at: string } | null };

export type UpsertFormStepsMutationVariables = Exact<{
  inputs: Array<Form_Steps_Insert_Input> | Form_Steps_Insert_Input;
}>;


export type UpsertFormStepsMutation = { __typename?: 'mutation_root', insert_form_steps?: { __typename?: 'form_steps_mutation_response', returning: Array<{ __typename?: 'form_steps', id: string, form_id: string, step_type: string, step_order: number, question_id?: string | null, content: any, tips?: Array<string> | null, flow_membership: string, is_active: boolean, created_at: string, updated_at: string }> } | null };

export type GetFormStepsQueryVariables = Exact<{
  formId: Scalars['String']['input'];
}>;


export type GetFormStepsQuery = { __typename?: 'query_root', form_steps: Array<{ __typename?: 'form_steps', id: string, form_id: string, step_type: string, step_order: number, question_id?: string | null, content: any, tips?: Array<string> | null, flow_membership: string, is_active: boolean, created_at: string, updated_at: string, question?: { __typename?: 'form_questions', scale_min_label?: string | null, scale_max_label?: string | null, id: string, form_id: string, organization_id: string, question_type_id: string, question_key: string, question_text: string, placeholder?: string | null, help_text?: string | null, display_order: number, is_required: boolean, min_length?: number | null, max_length?: number | null, min_value?: number | null, max_value?: number | null, validation_pattern?: string | null, allowed_file_types?: Array<string> | null, max_file_size_kb?: number | null, is_active: boolean, created_at: string, updated_at: string, options: Array<{ __typename?: 'question_options', id: string, question_id: string, option_value: string, option_label: string, display_order: number, is_default: boolean, is_active: boolean }>, question_type: { __typename?: 'question_types', id: string, unique_name: string, name: string, category: string, input_component: string } } | null }> };

export type OrganizationBasicFragment = { __typename?: 'organizations', id: string, name: string, slug: string, logo_url?: string | null, setup_status: 'pending_setup' | 'completed', is_active: boolean, settings: any, created_at: string, updated_at: string, plans: Array<{ __typename?: 'organization_plans', id: string, plan_id: string, status: string, plan: { __typename?: 'plans', id: string, unique_name: string, name: string, question_types: Array<{ __typename?: 'plan_question_types', question_type: { __typename?: 'question_types', id: string, unique_name: string, name: string, category: string, description?: string | null, icon?: string | null, input_component: string, answer_data_type: string, display_order: number, supports_options: boolean } }> } }> };

export type UpdateOrganizationMutationVariables = Exact<{
  id: Scalars['String']['input'];
  changes: Organizations_Set_Input;
}>;


export type UpdateOrganizationMutation = { __typename?: 'mutation_root', update_organizations_by_pk?: { __typename?: 'organizations', id: string, name: string, slug: string, logo_url?: string | null, setup_status: 'pending_setup' | 'completed', is_active: boolean, settings: any, updated_at: string } | null };

export type CheckSlugAvailabilityQueryVariables = Exact<{
  slug: Scalars['String']['input'];
  excludeOrganizationId: Scalars['String']['input'];
}>;


export type CheckSlugAvailabilityQuery = { __typename?: 'query_root', organizations: Array<{ __typename?: 'organizations', id: string }> };

export type GetOrganizationQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type GetOrganizationQuery = { __typename?: 'query_root', organizations_by_pk?: { __typename?: 'organizations', id: string, name: string, slug: string, logo_url?: string | null, setup_status: 'pending_setup' | 'completed', is_active: boolean, settings: any, created_at: string, updated_at: string, plans: Array<{ __typename?: 'organization_plans', id: string, plan_id: string, status: string, plan: { __typename?: 'plans', id: string, unique_name: string, name: string, question_types: Array<{ __typename?: 'plan_question_types', question_type: { __typename?: 'question_types', id: string, unique_name: string, name: string, category: string, description?: string | null, icon?: string | null, input_component: string, answer_data_type: string, display_order: number, supports_options: boolean } }> } }> } | null };

export type GetUserDefaultOrganizationQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GetUserDefaultOrganizationQuery = { __typename?: 'query_root', organization_roles: Array<{ __typename?: 'organization_roles', id: string, is_default_org: boolean, organization: { __typename?: 'organizations', id: string, name: string, slug: string, logo_url?: string | null, setup_status: 'pending_setup' | 'completed', is_active: boolean, settings: any, created_at: string, updated_at: string, plans: Array<{ __typename?: 'organization_plans', id: string, plan_id: string, status: string, plan: { __typename?: 'plans', id: string, unique_name: string, name: string, question_types: Array<{ __typename?: 'plan_question_types', question_type: { __typename?: 'question_types', id: string, unique_name: string, name: string, category: string, description?: string | null, icon?: string | null, input_component: string, answer_data_type: string, display_order: number, supports_options: boolean } }> } }> }, role: { __typename?: 'roles', id: string, unique_name: string, name: string, can_manage_forms: boolean, can_manage_testimonials: boolean, can_manage_widgets: boolean, can_manage_members: boolean, can_manage_billing: boolean, can_delete_org: boolean, is_viewer: boolean } }> };

export type PlanBasicFragment = { __typename?: 'plans', id: string, unique_name: string, name: string, description?: string | null, max_forms: number, max_members: number, max_testimonials: number, max_widgets: number, show_branding: boolean, is_active: boolean, created_at: string, updated_at: string };

export type GetPlanQueryVariables = Exact<{
  planId: Scalars['String']['input'];
}>;


export type GetPlanQuery = { __typename?: 'query_root', plans_by_pk?: { __typename?: 'plans', id: string, unique_name: string, name: string, description?: string | null, max_forms: number, max_members: number, max_testimonials: number, max_widgets: number, show_branding: boolean, is_active: boolean, created_at: string, updated_at: string } | null };

export type GetPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPlansQuery = { __typename?: 'query_root', plans: Array<{ __typename?: 'plans', id: string, unique_name: string, name: string, description?: string | null, max_forms: number, max_members: number, max_testimonials: number, max_widgets: number, show_branding: boolean, is_active: boolean, created_at: string, updated_at: string }> };

export type QuestionTypeBasicFragment = { __typename?: 'question_types', id: string, unique_name: string, name: string, description?: string | null, category: string, input_component: string, answer_data_type: string, display_order: number, is_active: boolean, supports_min_length: boolean, supports_max_length: boolean, supports_min_value: boolean, supports_max_value: boolean, supports_options: boolean, supports_pattern: boolean, supports_file_types: boolean, supports_max_file_size: boolean, default_min_value?: number | null, default_max_value?: number | null };

export type GetQuestionTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetQuestionTypesQuery = { __typename?: 'query_root', question_types: Array<{ __typename?: 'question_types', id: string, unique_name: string, name: string, description?: string | null, category: string, input_component: string, answer_data_type: string, display_order: number, is_active: boolean, supports_min_length: boolean, supports_max_length: boolean, supports_min_value: boolean, supports_max_value: boolean, supports_options: boolean, supports_pattern: boolean, supports_file_types: boolean, supports_max_file_size: boolean, default_min_value?: number | null, default_max_value?: number | null }> };

export type TestimonialBasicFragment = { __typename?: 'testimonials', id: string, organization_id: string, submission_id?: string | null, status: string, content?: string | null, rating?: number | null, customer_name: string, customer_email: string, customer_title?: string | null, customer_company?: string | null, customer_avatar_url?: string | null, customer_linkedin_url?: string | null, customer_twitter_url?: string | null, source: string, approved_by?: string | null, approved_at?: string | null, rejected_by?: string | null, rejected_at?: string | null, rejection_reason?: string | null, created_at: string, updated_at: string };

export type GetTestimonialQueryVariables = Exact<{
  testimonialId: Scalars['String']['input'];
}>;


export type GetTestimonialQuery = { __typename?: 'query_root', testimonials_by_pk?: { __typename?: 'testimonials', id: string, organization_id: string, submission_id?: string | null, status: string, content?: string | null, rating?: number | null, customer_name: string, customer_email: string, customer_title?: string | null, customer_company?: string | null, customer_avatar_url?: string | null, customer_linkedin_url?: string | null, customer_twitter_url?: string | null, source: string, approved_by?: string | null, approved_at?: string | null, rejected_by?: string | null, rejected_at?: string | null, rejection_reason?: string | null, created_at: string, updated_at: string } | null };

export type GetTestimonialsQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetTestimonialsQuery = { __typename?: 'query_root', testimonials: Array<{ __typename?: 'testimonials', id: string, organization_id: string, submission_id?: string | null, status: string, content?: string | null, rating?: number | null, customer_name: string, customer_email: string, customer_title?: string | null, customer_company?: string | null, customer_avatar_url?: string | null, customer_linkedin_url?: string | null, customer_twitter_url?: string | null, source: string, approved_by?: string | null, approved_at?: string | null, rejected_by?: string | null, rejected_at?: string | null, rejection_reason?: string | null, created_at: string, updated_at: string }> };

export type GetTestimonialsStatsQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type GetTestimonialsStatsQuery = { __typename?: 'query_root', total: { __typename?: 'testimonials_aggregate', aggregate?: { __typename?: 'testimonials_aggregate_fields', count: number } | null }, pending: { __typename?: 'testimonials_aggregate', aggregate?: { __typename?: 'testimonials_aggregate_fields', count: number } | null }, approved: { __typename?: 'testimonials_aggregate', aggregate?: { __typename?: 'testimonials_aggregate_fields', count: number } | null }, rejected: { __typename?: 'testimonials_aggregate', aggregate?: { __typename?: 'testimonials_aggregate_fields', count: number } | null } };

export type UserBasicFragment = { __typename?: 'users', id: string, email: string, display_name?: string | null, avatar_url?: string | null, email_verified: boolean, locale: string, timezone: string, is_active: boolean, last_login_at?: string | null, created_at: string, updated_at: string };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['String']['input'];
  changes: Users_Set_Input;
}>;


export type UpdateUserMutation = { __typename?: 'mutation_root', update_users_by_pk?: { __typename?: 'users', id: string, email: string, display_name?: string | null, avatar_url?: string | null, locale: string, timezone: string, updated_at: string } | null };

export type GetUserQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GetUserQuery = { __typename?: 'query_root', users_by_pk?: { __typename?: 'users', id: string, email: string, display_name?: string | null, avatar_url?: string | null, email_verified: boolean, locale: string, timezone: string, is_active: boolean, last_login_at?: string | null, created_at: string, updated_at: string } | null };

export type WidgetBasicFragment = { __typename?: 'widgets', id: string, organization_id: string, created_by: string, name: string, type: string, theme: string, show_ratings: boolean, show_dates: boolean, show_company: boolean, show_avatar: boolean, max_display?: number | null, settings: any, is_active: boolean, created_at: string, updated_at: string };

export type GetWidgetQueryVariables = Exact<{
  widgetId: Scalars['String']['input'];
}>;


export type GetWidgetQuery = { __typename?: 'query_root', widgets_by_pk?: { __typename?: 'widgets', id: string, organization_id: string, created_by: string, name: string, type: string, theme: string, show_ratings: boolean, show_dates: boolean, show_company: boolean, show_avatar: boolean, max_display?: number | null, settings: any, is_active: boolean, created_at: string, updated_at: string } | null };

export type GetWidgetsQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type GetWidgetsQuery = { __typename?: 'query_root', widgets: Array<{ __typename?: 'widgets', id: string, organization_id: string, created_by: string, name: string, type: string, theme: string, show_ratings: boolean, show_dates: boolean, show_company: boolean, show_avatar: boolean, max_display?: number | null, settings: any, is_active: boolean, created_at: string, updated_at: string }> };

export type GetDashboardStatsQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type GetDashboardStatsQuery = { __typename?: 'query_root', forms_aggregate: { __typename?: 'forms_aggregate', aggregate?: { __typename?: 'forms_aggregate_fields', count: number } | null }, testimonials_aggregate: { __typename?: 'testimonials_aggregate', aggregate?: { __typename?: 'testimonials_aggregate_fields', count: number } | null }, pending_testimonials: { __typename?: 'testimonials_aggregate', aggregate?: { __typename?: 'testimonials_aggregate_fields', count: number } | null }, widgets_aggregate: { __typename?: 'widgets_aggregate', aggregate?: { __typename?: 'widgets_aggregate_fields', count: number } | null } };

export const FormBasicFragmentDoc = gql`
    fragment FormBasic on forms {
  id
  name
  product_name
  product_description
  settings
  branching_config
  status
  is_active
  organization_id
  created_by
  created_at
  updated_at
  organization {
    id
    logo_url
  }
}
    `;
export const FormQuestionBasicFragmentDoc = gql`
    fragment FormQuestionBasic on form_questions {
  id
  form_id
  organization_id
  question_type_id
  question_key
  question_text
  placeholder
  help_text
  display_order
  is_required
  min_length
  max_length
  min_value
  max_value
  validation_pattern
  allowed_file_types
  max_file_size_kb
  is_active
  created_at
  updated_at
  question_type {
    id
    unique_name
    name
    category
    input_component
  }
}
    `;
export const QuestionOptionBasicFragmentDoc = gql`
    fragment QuestionOptionBasic on question_options {
  id
  question_id
  option_value
  option_label
  display_order
  is_default
  is_active
}
    `;
export const FormQuestionWithOptionsFragmentDoc = gql`
    fragment FormQuestionWithOptions on form_questions {
  ...FormQuestionBasic
  scale_min_label
  scale_max_label
  options(order_by: {display_order: asc}, where: {is_active: {_eq: true}}) {
    ...QuestionOptionBasic
  }
}
    ${FormQuestionBasicFragmentDoc}
${QuestionOptionBasicFragmentDoc}`;
export const FormStepBasicFragmentDoc = gql`
    fragment FormStepBasic on form_steps {
  id
  form_id
  step_type
  step_order
  question_id
  content
  tips
  flow_membership
  is_active
  created_at
  updated_at
}
    `;
export const OrganizationBasicFragmentDoc = gql`
    fragment OrganizationBasic on organizations {
  id
  name
  slug
  logo_url
  setup_status
  is_active
  settings
  created_at
  updated_at
  plans(where: {status: {_eq: "active"}}, limit: 1) {
    id
    plan_id
    status
    plan {
      id
      unique_name
      name
      question_types {
        question_type {
          id
          unique_name
          name
          category
          description
          icon
          input_component
          answer_data_type
          display_order
          supports_options
        }
      }
    }
  }
}
    `;
export const PlanBasicFragmentDoc = gql`
    fragment PlanBasic on plans {
  id
  unique_name
  name
  description
  max_forms
  max_members
  max_testimonials
  max_widgets
  show_branding
  is_active
  created_at
  updated_at
}
    `;
export const QuestionTypeBasicFragmentDoc = gql`
    fragment QuestionTypeBasic on question_types {
  id
  unique_name
  name
  description
  category
  input_component
  answer_data_type
  display_order
  is_active
  supports_min_length
  supports_max_length
  supports_min_value
  supports_max_value
  supports_options
  supports_pattern
  supports_file_types
  supports_max_file_size
  default_min_value
  default_max_value
}
    `;
export const TestimonialBasicFragmentDoc = gql`
    fragment TestimonialBasic on testimonials {
  id
  organization_id
  submission_id
  status
  content
  rating
  customer_name
  customer_email
  customer_title
  customer_company
  customer_avatar_url
  customer_linkedin_url
  customer_twitter_url
  source
  approved_by
  approved_at
  rejected_by
  rejected_at
  rejection_reason
  created_at
  updated_at
}
    `;
export const UserBasicFragmentDoc = gql`
    fragment UserBasic on users {
  id
  email
  display_name
  avatar_url
  email_verified
  locale
  timezone
  is_active
  last_login_at
  created_at
  updated_at
}
    `;
export const WidgetBasicFragmentDoc = gql`
    fragment WidgetBasic on widgets {
  id
  organization_id
  created_by
  name
  type
  theme
  show_ratings
  show_dates
  show_company
  show_avatar
  max_display
  settings
  is_active
  created_at
  updated_at
}
    `;
export const CreateFormDocument = gql`
    mutation CreateForm($form: forms_insert_input!) {
  insert_forms_one(object: $form) {
    id
    name
    product_name
    organization_id
    created_at
  }
}
    `;

/**
 * __useCreateFormMutation__
 *
 * To run a mutation, you first call `useCreateFormMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useCreateFormMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useCreateFormMutation({
 *   variables: {
 *     form: // value for 'form'
 *   },
 * });
 */
export function useCreateFormMutation(options: VueApolloComposable.UseMutationOptions<CreateFormMutation, CreateFormMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<CreateFormMutation, CreateFormMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<CreateFormMutation, CreateFormMutationVariables>(CreateFormDocument, options);
}
export type CreateFormMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<CreateFormMutation, CreateFormMutationVariables>;
export const DeleteFormDocument = gql`
    mutation DeleteForm($id: String!) {
  update_forms_by_pk(pk_columns: {id: $id}, _set: {is_active: false}) {
    id
    is_active
  }
}
    `;

/**
 * __useDeleteFormMutation__
 *
 * To run a mutation, you first call `useDeleteFormMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFormMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useDeleteFormMutation({
 *   variables: {
 *     id: // value for 'id'
 *   },
 * });
 */
export function useDeleteFormMutation(options: VueApolloComposable.UseMutationOptions<DeleteFormMutation, DeleteFormMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<DeleteFormMutation, DeleteFormMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<DeleteFormMutation, DeleteFormMutationVariables>(DeleteFormDocument, options);
}
export type DeleteFormMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<DeleteFormMutation, DeleteFormMutationVariables>;
export const PublishFormDocument = gql`
    mutation PublishForm($id: String!) {
  update_forms_by_pk(pk_columns: {id: $id}, _set: {status: "published"}) {
    id
    status
    updated_at
  }
}
    `;

/**
 * __usePublishFormMutation__
 *
 * To run a mutation, you first call `usePublishFormMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `usePublishFormMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = usePublishFormMutation({
 *   variables: {
 *     id: // value for 'id'
 *   },
 * });
 */
export function usePublishFormMutation(options: VueApolloComposable.UseMutationOptions<PublishFormMutation, PublishFormMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<PublishFormMutation, PublishFormMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<PublishFormMutation, PublishFormMutationVariables>(PublishFormDocument, options);
}
export type PublishFormMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<PublishFormMutation, PublishFormMutationVariables>;
export const UpdateFormDocument = gql`
    mutation UpdateForm($id: String!, $changes: forms_set_input!) {
  update_forms_by_pk(pk_columns: {id: $id}, _set: $changes) {
    id
    name
    product_name
    product_description
    settings
    branching_config
    is_active
    updated_at
  }
}
    `;

/**
 * __useUpdateFormMutation__
 *
 * To run a mutation, you first call `useUpdateFormMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useUpdateFormMutation({
 *   variables: {
 *     id: // value for 'id'
 *     changes: // value for 'changes'
 *   },
 * });
 */
export function useUpdateFormMutation(options: VueApolloComposable.UseMutationOptions<UpdateFormMutation, UpdateFormMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateFormMutation, UpdateFormMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<UpdateFormMutation, UpdateFormMutationVariables>(UpdateFormDocument, options);
}
export type UpdateFormMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<UpdateFormMutation, UpdateFormMutationVariables>;
export const UpdateFormAutoSaveDocument = gql`
    mutation UpdateFormAutoSave($id: String!, $changes: forms_set_input!) {
  update_forms_by_pk(pk_columns: {id: $id}, _set: $changes) {
    id
    status
    updated_at
  }
}
    `;

/**
 * __useUpdateFormAutoSaveMutation__
 *
 * To run a mutation, you first call `useUpdateFormAutoSaveMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormAutoSaveMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useUpdateFormAutoSaveMutation({
 *   variables: {
 *     id: // value for 'id'
 *     changes: // value for 'changes'
 *   },
 * });
 */
export function useUpdateFormAutoSaveMutation(options: VueApolloComposable.UseMutationOptions<UpdateFormAutoSaveMutation, UpdateFormAutoSaveMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateFormAutoSaveMutation, UpdateFormAutoSaveMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<UpdateFormAutoSaveMutation, UpdateFormAutoSaveMutationVariables>(UpdateFormAutoSaveDocument, options);
}
export type UpdateFormAutoSaveMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<UpdateFormAutoSaveMutation, UpdateFormAutoSaveMutationVariables>;
export const GetFormDocument = gql`
    query GetForm($formId: String!) {
  forms_by_pk(id: $formId) {
    ...FormBasic
  }
}
    ${FormBasicFragmentDoc}`;

/**
 * __useGetFormQuery__
 *
 * To run a query within a Vue component, call `useGetFormQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetFormQuery({
 *   formId: // value for 'formId'
 * });
 */
export function useGetFormQuery(variables: GetFormQueryVariables | VueCompositionApi.Ref<GetFormQueryVariables> | ReactiveFunction<GetFormQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetFormQuery, GetFormQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetFormQuery, GetFormQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetFormQuery, GetFormQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetFormQuery, GetFormQueryVariables>(GetFormDocument, variables, options);
}
export function useGetFormLazyQuery(variables?: GetFormQueryVariables | VueCompositionApi.Ref<GetFormQueryVariables> | ReactiveFunction<GetFormQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetFormQuery, GetFormQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetFormQuery, GetFormQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetFormQuery, GetFormQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetFormQuery, GetFormQueryVariables>(GetFormDocument, variables, options);
}
export type GetFormQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetFormQuery, GetFormQueryVariables>;
export const GetFormsDocument = gql`
    query GetForms($organizationId: String!) {
  forms(
    where: {organization_id: {_eq: $organizationId}, is_active: {_eq: true}}
    order_by: {created_at: desc}
  ) {
    ...FormBasic
  }
}
    ${FormBasicFragmentDoc}`;

/**
 * __useGetFormsQuery__
 *
 * To run a query within a Vue component, call `useGetFormsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetFormsQuery({
 *   organizationId: // value for 'organizationId'
 * });
 */
export function useGetFormsQuery(variables: GetFormsQueryVariables | VueCompositionApi.Ref<GetFormsQueryVariables> | ReactiveFunction<GetFormsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetFormsQuery, GetFormsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetFormsQuery, GetFormsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetFormsQuery, GetFormsQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetFormsQuery, GetFormsQueryVariables>(GetFormsDocument, variables, options);
}
export function useGetFormsLazyQuery(variables?: GetFormsQueryVariables | VueCompositionApi.Ref<GetFormsQueryVariables> | ReactiveFunction<GetFormsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetFormsQuery, GetFormsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetFormsQuery, GetFormsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetFormsQuery, GetFormsQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetFormsQuery, GetFormsQueryVariables>(GetFormsDocument, variables, options);
}
export type GetFormsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetFormsQuery, GetFormsQueryVariables>;
export const CreateFormQuestionDocument = gql`
    mutation CreateFormQuestion($input: form_questions_insert_input!) {
  insert_form_questions_one(object: $input) {
    ...FormQuestionBasic
  }
}
    ${FormQuestionBasicFragmentDoc}`;

/**
 * __useCreateFormQuestionMutation__
 *
 * To run a mutation, you first call `useCreateFormQuestionMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useCreateFormQuestionMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useCreateFormQuestionMutation({
 *   variables: {
 *     input: // value for 'input'
 *   },
 * });
 */
export function useCreateFormQuestionMutation(options: VueApolloComposable.UseMutationOptions<CreateFormQuestionMutation, CreateFormQuestionMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<CreateFormQuestionMutation, CreateFormQuestionMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<CreateFormQuestionMutation, CreateFormQuestionMutationVariables>(CreateFormQuestionDocument, options);
}
export type CreateFormQuestionMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<CreateFormQuestionMutation, CreateFormQuestionMutationVariables>;
export const CreateFormQuestionsDocument = gql`
    mutation CreateFormQuestions($inputs: [form_questions_insert_input!]!) {
  insert_form_questions(objects: $inputs) {
    returning {
      ...FormQuestionBasic
    }
  }
}
    ${FormQuestionBasicFragmentDoc}`;

/**
 * __useCreateFormQuestionsMutation__
 *
 * To run a mutation, you first call `useCreateFormQuestionsMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useCreateFormQuestionsMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useCreateFormQuestionsMutation({
 *   variables: {
 *     inputs: // value for 'inputs'
 *   },
 * });
 */
export function useCreateFormQuestionsMutation(options: VueApolloComposable.UseMutationOptions<CreateFormQuestionsMutation, CreateFormQuestionsMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<CreateFormQuestionsMutation, CreateFormQuestionsMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<CreateFormQuestionsMutation, CreateFormQuestionsMutationVariables>(CreateFormQuestionsDocument, options);
}
export type CreateFormQuestionsMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<CreateFormQuestionsMutation, CreateFormQuestionsMutationVariables>;
export const DeactivateFormQuestionsDocument = gql`
    mutation DeactivateFormQuestions($formId: String!) {
  update_form_questions(
    where: {form_id: {_eq: $formId}, is_active: {_eq: true}}
    _set: {is_active: false}
  ) {
    affected_rows
  }
}
    `;

/**
 * __useDeactivateFormQuestionsMutation__
 *
 * To run a mutation, you first call `useDeactivateFormQuestionsMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useDeactivateFormQuestionsMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useDeactivateFormQuestionsMutation({
 *   variables: {
 *     formId: // value for 'formId'
 *   },
 * });
 */
export function useDeactivateFormQuestionsMutation(options: VueApolloComposable.UseMutationOptions<DeactivateFormQuestionsMutation, DeactivateFormQuestionsMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<DeactivateFormQuestionsMutation, DeactivateFormQuestionsMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<DeactivateFormQuestionsMutation, DeactivateFormQuestionsMutationVariables>(DeactivateFormQuestionsDocument, options);
}
export type DeactivateFormQuestionsMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<DeactivateFormQuestionsMutation, DeactivateFormQuestionsMutationVariables>;
export const DeleteFormQuestionDocument = gql`
    mutation DeleteFormQuestion($id: String!) {
  update_form_questions_by_pk(pk_columns: {id: $id}, _set: {is_active: false}) {
    id
    is_active
  }
}
    `;

/**
 * __useDeleteFormQuestionMutation__
 *
 * To run a mutation, you first call `useDeleteFormQuestionMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFormQuestionMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useDeleteFormQuestionMutation({
 *   variables: {
 *     id: // value for 'id'
 *   },
 * });
 */
export function useDeleteFormQuestionMutation(options: VueApolloComposable.UseMutationOptions<DeleteFormQuestionMutation, DeleteFormQuestionMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<DeleteFormQuestionMutation, DeleteFormQuestionMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<DeleteFormQuestionMutation, DeleteFormQuestionMutationVariables>(DeleteFormQuestionDocument, options);
}
export type DeleteFormQuestionMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<DeleteFormQuestionMutation, DeleteFormQuestionMutationVariables>;
export const ReorderFormQuestionsDocument = gql`
    mutation ReorderFormQuestions($updates: [form_questions_updates!]!) {
  update_form_questions_many(updates: $updates) {
    returning {
      id
      display_order
    }
  }
}
    `;

/**
 * __useReorderFormQuestionsMutation__
 *
 * To run a mutation, you first call `useReorderFormQuestionsMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useReorderFormQuestionsMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useReorderFormQuestionsMutation({
 *   variables: {
 *     updates: // value for 'updates'
 *   },
 * });
 */
export function useReorderFormQuestionsMutation(options: VueApolloComposable.UseMutationOptions<ReorderFormQuestionsMutation, ReorderFormQuestionsMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<ReorderFormQuestionsMutation, ReorderFormQuestionsMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<ReorderFormQuestionsMutation, ReorderFormQuestionsMutationVariables>(ReorderFormQuestionsDocument, options);
}
export type ReorderFormQuestionsMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<ReorderFormQuestionsMutation, ReorderFormQuestionsMutationVariables>;
export const UpdateFormQuestionDocument = gql`
    mutation UpdateFormQuestion($id: String!, $input: form_questions_set_input!) {
  update_form_questions_by_pk(pk_columns: {id: $id}, _set: $input) {
    ...FormQuestionBasic
  }
}
    ${FormQuestionBasicFragmentDoc}`;

/**
 * __useUpdateFormQuestionMutation__
 *
 * To run a mutation, you first call `useUpdateFormQuestionMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormQuestionMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useUpdateFormQuestionMutation({
 *   variables: {
 *     id: // value for 'id'
 *     input: // value for 'input'
 *   },
 * });
 */
export function useUpdateFormQuestionMutation(options: VueApolloComposable.UseMutationOptions<UpdateFormQuestionMutation, UpdateFormQuestionMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateFormQuestionMutation, UpdateFormQuestionMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<UpdateFormQuestionMutation, UpdateFormQuestionMutationVariables>(UpdateFormQuestionDocument, options);
}
export type UpdateFormQuestionMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<UpdateFormQuestionMutation, UpdateFormQuestionMutationVariables>;
export const GetFormQuestionsDocument = gql`
    query GetFormQuestions($formId: String!) {
  form_questions(
    where: {form_id: {_eq: $formId}, is_active: {_eq: true}}
    order_by: {display_order: asc}
  ) {
    ...FormQuestionBasic
  }
}
    ${FormQuestionBasicFragmentDoc}`;

/**
 * __useGetFormQuestionsQuery__
 *
 * To run a query within a Vue component, call `useGetFormQuestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormQuestionsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetFormQuestionsQuery({
 *   formId: // value for 'formId'
 * });
 */
export function useGetFormQuestionsQuery(variables: GetFormQuestionsQueryVariables | VueCompositionApi.Ref<GetFormQuestionsQueryVariables> | ReactiveFunction<GetFormQuestionsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetFormQuestionsQuery, GetFormQuestionsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetFormQuestionsQuery, GetFormQuestionsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetFormQuestionsQuery, GetFormQuestionsQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetFormQuestionsQuery, GetFormQuestionsQueryVariables>(GetFormQuestionsDocument, variables, options);
}
export function useGetFormQuestionsLazyQuery(variables?: GetFormQuestionsQueryVariables | VueCompositionApi.Ref<GetFormQuestionsQueryVariables> | ReactiveFunction<GetFormQuestionsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetFormQuestionsQuery, GetFormQuestionsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetFormQuestionsQuery, GetFormQuestionsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetFormQuestionsQuery, GetFormQuestionsQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetFormQuestionsQuery, GetFormQuestionsQueryVariables>(GetFormQuestionsDocument, variables, options);
}
export type GetFormQuestionsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetFormQuestionsQuery, GetFormQuestionsQueryVariables>;
export const CreateFormStepsDocument = gql`
    mutation CreateFormSteps($inputs: [form_steps_insert_input!]!) {
  insert_form_steps(objects: $inputs) {
    returning {
      ...FormStepBasic
    }
  }
}
    ${FormStepBasicFragmentDoc}`;

/**
 * __useCreateFormStepsMutation__
 *
 * To run a mutation, you first call `useCreateFormStepsMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useCreateFormStepsMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useCreateFormStepsMutation({
 *   variables: {
 *     inputs: // value for 'inputs'
 *   },
 * });
 */
export function useCreateFormStepsMutation(options: VueApolloComposable.UseMutationOptions<CreateFormStepsMutation, CreateFormStepsMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<CreateFormStepsMutation, CreateFormStepsMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<CreateFormStepsMutation, CreateFormStepsMutationVariables>(CreateFormStepsDocument, options);
}
export type CreateFormStepsMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<CreateFormStepsMutation, CreateFormStepsMutationVariables>;
export const DeleteFormStepsDocument = gql`
    mutation DeleteFormSteps($ids: [String!]!) {
  delete_form_steps(where: {id: {_in: $ids}}) {
    affected_rows
    returning {
      id
    }
  }
}
    `;

/**
 * __useDeleteFormStepsMutation__
 *
 * To run a mutation, you first call `useDeleteFormStepsMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFormStepsMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useDeleteFormStepsMutation({
 *   variables: {
 *     ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteFormStepsMutation(options: VueApolloComposable.UseMutationOptions<DeleteFormStepsMutation, DeleteFormStepsMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<DeleteFormStepsMutation, DeleteFormStepsMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<DeleteFormStepsMutation, DeleteFormStepsMutationVariables>(DeleteFormStepsDocument, options);
}
export type DeleteFormStepsMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<DeleteFormStepsMutation, DeleteFormStepsMutationVariables>;
export const UpdateFormStepDocument = gql`
    mutation UpdateFormStep($id: String!, $changes: form_steps_set_input!) {
  update_form_steps_by_pk(pk_columns: {id: $id}, _set: $changes) {
    id
    flow_membership
    step_order
    content
    tips
    updated_at
  }
}
    `;

/**
 * __useUpdateFormStepMutation__
 *
 * To run a mutation, you first call `useUpdateFormStepMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormStepMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useUpdateFormStepMutation({
 *   variables: {
 *     id: // value for 'id'
 *     changes: // value for 'changes'
 *   },
 * });
 */
export function useUpdateFormStepMutation(options: VueApolloComposable.UseMutationOptions<UpdateFormStepMutation, UpdateFormStepMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateFormStepMutation, UpdateFormStepMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<UpdateFormStepMutation, UpdateFormStepMutationVariables>(UpdateFormStepDocument, options);
}
export type UpdateFormStepMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<UpdateFormStepMutation, UpdateFormStepMutationVariables>;
export const UpsertFormStepsDocument = gql`
    mutation UpsertFormSteps($inputs: [form_steps_insert_input!]!) {
  insert_form_steps(
    objects: $inputs
    on_conflict: {constraint: form_steps_pkey, update_columns: [step_order, content, tips, flow_membership, is_active, updated_by]}
  ) {
    returning {
      ...FormStepBasic
    }
  }
}
    ${FormStepBasicFragmentDoc}`;

/**
 * __useUpsertFormStepsMutation__
 *
 * To run a mutation, you first call `useUpsertFormStepsMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useUpsertFormStepsMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useUpsertFormStepsMutation({
 *   variables: {
 *     inputs: // value for 'inputs'
 *   },
 * });
 */
export function useUpsertFormStepsMutation(options: VueApolloComposable.UseMutationOptions<UpsertFormStepsMutation, UpsertFormStepsMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpsertFormStepsMutation, UpsertFormStepsMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<UpsertFormStepsMutation, UpsertFormStepsMutationVariables>(UpsertFormStepsDocument, options);
}
export type UpsertFormStepsMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<UpsertFormStepsMutation, UpsertFormStepsMutationVariables>;
export const GetFormStepsDocument = gql`
    query GetFormSteps($formId: String!) {
  form_steps(where: {form_id: {_eq: $formId}}, order_by: {step_order: asc}) {
    ...FormStepBasic
    question {
      ...FormQuestionWithOptions
    }
  }
}
    ${FormStepBasicFragmentDoc}
${FormQuestionWithOptionsFragmentDoc}`;

/**
 * __useGetFormStepsQuery__
 *
 * To run a query within a Vue component, call `useGetFormStepsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormStepsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetFormStepsQuery({
 *   formId: // value for 'formId'
 * });
 */
export function useGetFormStepsQuery(variables: GetFormStepsQueryVariables | VueCompositionApi.Ref<GetFormStepsQueryVariables> | ReactiveFunction<GetFormStepsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetFormStepsQuery, GetFormStepsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetFormStepsQuery, GetFormStepsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetFormStepsQuery, GetFormStepsQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetFormStepsQuery, GetFormStepsQueryVariables>(GetFormStepsDocument, variables, options);
}
export function useGetFormStepsLazyQuery(variables?: GetFormStepsQueryVariables | VueCompositionApi.Ref<GetFormStepsQueryVariables> | ReactiveFunction<GetFormStepsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetFormStepsQuery, GetFormStepsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetFormStepsQuery, GetFormStepsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetFormStepsQuery, GetFormStepsQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetFormStepsQuery, GetFormStepsQueryVariables>(GetFormStepsDocument, variables, options);
}
export type GetFormStepsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetFormStepsQuery, GetFormStepsQueryVariables>;
export const UpdateOrganizationDocument = gql`
    mutation UpdateOrganization($id: String!, $changes: organizations_set_input!) {
  update_organizations_by_pk(pk_columns: {id: $id}, _set: $changes) {
    id
    name
    slug
    logo_url
    setup_status
    is_active
    settings
    updated_at
  }
}
    `;

/**
 * __useUpdateOrganizationMutation__
 *
 * To run a mutation, you first call `useUpdateOrganizationMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOrganizationMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useUpdateOrganizationMutation({
 *   variables: {
 *     id: // value for 'id'
 *     changes: // value for 'changes'
 *   },
 * });
 */
export function useUpdateOrganizationMutation(options: VueApolloComposable.UseMutationOptions<UpdateOrganizationMutation, UpdateOrganizationMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>(UpdateOrganizationDocument, options);
}
export type UpdateOrganizationMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;
export const CheckSlugAvailabilityDocument = gql`
    query CheckSlugAvailability($slug: String!, $excludeOrganizationId: String!) {
  organizations(
    where: {slug: {_eq: $slug}, id: {_neq: $excludeOrganizationId}, is_active: {_eq: true}}
    limit: 1
  ) {
    id
  }
}
    `;

/**
 * __useCheckSlugAvailabilityQuery__
 *
 * To run a query within a Vue component, call `useCheckSlugAvailabilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckSlugAvailabilityQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useCheckSlugAvailabilityQuery({
 *   slug: // value for 'slug'
 *   excludeOrganizationId: // value for 'excludeOrganizationId'
 * });
 */
export function useCheckSlugAvailabilityQuery(variables: CheckSlugAvailabilityQueryVariables | VueCompositionApi.Ref<CheckSlugAvailabilityQueryVariables> | ReactiveFunction<CheckSlugAvailabilityQueryVariables>, options: VueApolloComposable.UseQueryOptions<CheckSlugAvailabilityQuery, CheckSlugAvailabilityQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<CheckSlugAvailabilityQuery, CheckSlugAvailabilityQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<CheckSlugAvailabilityQuery, CheckSlugAvailabilityQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<CheckSlugAvailabilityQuery, CheckSlugAvailabilityQueryVariables>(CheckSlugAvailabilityDocument, variables, options);
}
export function useCheckSlugAvailabilityLazyQuery(variables?: CheckSlugAvailabilityQueryVariables | VueCompositionApi.Ref<CheckSlugAvailabilityQueryVariables> | ReactiveFunction<CheckSlugAvailabilityQueryVariables>, options: VueApolloComposable.UseQueryOptions<CheckSlugAvailabilityQuery, CheckSlugAvailabilityQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<CheckSlugAvailabilityQuery, CheckSlugAvailabilityQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<CheckSlugAvailabilityQuery, CheckSlugAvailabilityQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<CheckSlugAvailabilityQuery, CheckSlugAvailabilityQueryVariables>(CheckSlugAvailabilityDocument, variables, options);
}
export type CheckSlugAvailabilityQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<CheckSlugAvailabilityQuery, CheckSlugAvailabilityQueryVariables>;
export const GetOrganizationDocument = gql`
    query GetOrganization($organizationId: String!) {
  organizations_by_pk(id: $organizationId) {
    ...OrganizationBasic
  }
}
    ${OrganizationBasicFragmentDoc}`;

/**
 * __useGetOrganizationQuery__
 *
 * To run a query within a Vue component, call `useGetOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetOrganizationQuery({
 *   organizationId: // value for 'organizationId'
 * });
 */
export function useGetOrganizationQuery(variables: GetOrganizationQueryVariables | VueCompositionApi.Ref<GetOrganizationQueryVariables> | ReactiveFunction<GetOrganizationQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetOrganizationQuery, GetOrganizationQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetOrganizationQuery, GetOrganizationQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetOrganizationQuery, GetOrganizationQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetOrganizationQuery, GetOrganizationQueryVariables>(GetOrganizationDocument, variables, options);
}
export function useGetOrganizationLazyQuery(variables?: GetOrganizationQueryVariables | VueCompositionApi.Ref<GetOrganizationQueryVariables> | ReactiveFunction<GetOrganizationQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetOrganizationQuery, GetOrganizationQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetOrganizationQuery, GetOrganizationQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetOrganizationQuery, GetOrganizationQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetOrganizationQuery, GetOrganizationQueryVariables>(GetOrganizationDocument, variables, options);
}
export type GetOrganizationQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetOrganizationQuery, GetOrganizationQueryVariables>;
export const GetUserDefaultOrganizationDocument = gql`
    query GetUserDefaultOrganization($userId: String!) {
  organization_roles(
    where: {user_id: {_eq: $userId}, is_default_org: {_eq: true}, is_active: {_eq: true}}
    limit: 1
  ) {
    id
    is_default_org
    organization {
      ...OrganizationBasic
    }
    role {
      id
      unique_name
      name
      can_manage_forms
      can_manage_testimonials
      can_manage_widgets
      can_manage_members
      can_manage_billing
      can_delete_org
      is_viewer
    }
  }
}
    ${OrganizationBasicFragmentDoc}`;

/**
 * __useGetUserDefaultOrganizationQuery__
 *
 * To run a query within a Vue component, call `useGetUserDefaultOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDefaultOrganizationQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetUserDefaultOrganizationQuery({
 *   userId: // value for 'userId'
 * });
 */
export function useGetUserDefaultOrganizationQuery(variables: GetUserDefaultOrganizationQueryVariables | VueCompositionApi.Ref<GetUserDefaultOrganizationQueryVariables> | ReactiveFunction<GetUserDefaultOrganizationQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetUserDefaultOrganizationQuery, GetUserDefaultOrganizationQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetUserDefaultOrganizationQuery, GetUserDefaultOrganizationQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetUserDefaultOrganizationQuery, GetUserDefaultOrganizationQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetUserDefaultOrganizationQuery, GetUserDefaultOrganizationQueryVariables>(GetUserDefaultOrganizationDocument, variables, options);
}
export function useGetUserDefaultOrganizationLazyQuery(variables?: GetUserDefaultOrganizationQueryVariables | VueCompositionApi.Ref<GetUserDefaultOrganizationQueryVariables> | ReactiveFunction<GetUserDefaultOrganizationQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetUserDefaultOrganizationQuery, GetUserDefaultOrganizationQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetUserDefaultOrganizationQuery, GetUserDefaultOrganizationQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetUserDefaultOrganizationQuery, GetUserDefaultOrganizationQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetUserDefaultOrganizationQuery, GetUserDefaultOrganizationQueryVariables>(GetUserDefaultOrganizationDocument, variables, options);
}
export type GetUserDefaultOrganizationQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetUserDefaultOrganizationQuery, GetUserDefaultOrganizationQueryVariables>;
export const GetPlanDocument = gql`
    query GetPlan($planId: String!) {
  plans_by_pk(id: $planId) {
    ...PlanBasic
  }
}
    ${PlanBasicFragmentDoc}`;

/**
 * __useGetPlanQuery__
 *
 * To run a query within a Vue component, call `useGetPlanQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPlanQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetPlanQuery({
 *   planId: // value for 'planId'
 * });
 */
export function useGetPlanQuery(variables: GetPlanQueryVariables | VueCompositionApi.Ref<GetPlanQueryVariables> | ReactiveFunction<GetPlanQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetPlanQuery, GetPlanQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetPlanQuery, GetPlanQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetPlanQuery, GetPlanQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetPlanQuery, GetPlanQueryVariables>(GetPlanDocument, variables, options);
}
export function useGetPlanLazyQuery(variables?: GetPlanQueryVariables | VueCompositionApi.Ref<GetPlanQueryVariables> | ReactiveFunction<GetPlanQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetPlanQuery, GetPlanQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetPlanQuery, GetPlanQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetPlanQuery, GetPlanQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetPlanQuery, GetPlanQueryVariables>(GetPlanDocument, variables, options);
}
export type GetPlanQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetPlanQuery, GetPlanQueryVariables>;
export const GetPlansDocument = gql`
    query GetPlans {
  plans(where: {is_active: {_eq: true}}, order_by: {name: asc}) {
    ...PlanBasic
  }
}
    ${PlanBasicFragmentDoc}`;

/**
 * __useGetPlansQuery__
 *
 * To run a query within a Vue component, call `useGetPlansQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPlansQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetPlansQuery();
 */
export function useGetPlansQuery(options: VueApolloComposable.UseQueryOptions<GetPlansQuery, GetPlansQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetPlansQuery, GetPlansQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetPlansQuery, GetPlansQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetPlansQuery, GetPlansQueryVariables>(GetPlansDocument, {}, options);
}
export function useGetPlansLazyQuery(options: VueApolloComposable.UseQueryOptions<GetPlansQuery, GetPlansQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetPlansQuery, GetPlansQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetPlansQuery, GetPlansQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetPlansQuery, GetPlansQueryVariables>(GetPlansDocument, {}, options);
}
export type GetPlansQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetPlansQuery, GetPlansQueryVariables>;
export const GetQuestionTypesDocument = gql`
    query GetQuestionTypes {
  question_types(where: {is_active: {_eq: true}}, order_by: {display_order: asc}) {
    ...QuestionTypeBasic
  }
}
    ${QuestionTypeBasicFragmentDoc}`;

/**
 * __useGetQuestionTypesQuery__
 *
 * To run a query within a Vue component, call `useGetQuestionTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionTypesQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetQuestionTypesQuery();
 */
export function useGetQuestionTypesQuery(options: VueApolloComposable.UseQueryOptions<GetQuestionTypesQuery, GetQuestionTypesQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetQuestionTypesQuery, GetQuestionTypesQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetQuestionTypesQuery, GetQuestionTypesQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetQuestionTypesQuery, GetQuestionTypesQueryVariables>(GetQuestionTypesDocument, {}, options);
}
export function useGetQuestionTypesLazyQuery(options: VueApolloComposable.UseQueryOptions<GetQuestionTypesQuery, GetQuestionTypesQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetQuestionTypesQuery, GetQuestionTypesQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetQuestionTypesQuery, GetQuestionTypesQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetQuestionTypesQuery, GetQuestionTypesQueryVariables>(GetQuestionTypesDocument, {}, options);
}
export type GetQuestionTypesQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetQuestionTypesQuery, GetQuestionTypesQueryVariables>;
export const GetTestimonialDocument = gql`
    query GetTestimonial($testimonialId: String!) {
  testimonials_by_pk(id: $testimonialId) {
    ...TestimonialBasic
  }
}
    ${TestimonialBasicFragmentDoc}`;

/**
 * __useGetTestimonialQuery__
 *
 * To run a query within a Vue component, call `useGetTestimonialQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestimonialQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetTestimonialQuery({
 *   testimonialId: // value for 'testimonialId'
 * });
 */
export function useGetTestimonialQuery(variables: GetTestimonialQueryVariables | VueCompositionApi.Ref<GetTestimonialQueryVariables> | ReactiveFunction<GetTestimonialQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTestimonialQuery, GetTestimonialQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTestimonialQuery, GetTestimonialQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTestimonialQuery, GetTestimonialQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetTestimonialQuery, GetTestimonialQueryVariables>(GetTestimonialDocument, variables, options);
}
export function useGetTestimonialLazyQuery(variables?: GetTestimonialQueryVariables | VueCompositionApi.Ref<GetTestimonialQueryVariables> | ReactiveFunction<GetTestimonialQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTestimonialQuery, GetTestimonialQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTestimonialQuery, GetTestimonialQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTestimonialQuery, GetTestimonialQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetTestimonialQuery, GetTestimonialQueryVariables>(GetTestimonialDocument, variables, options);
}
export type GetTestimonialQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetTestimonialQuery, GetTestimonialQueryVariables>;
export const GetTestimonialsDocument = gql`
    query GetTestimonials($organizationId: String!, $limit: Int) {
  testimonials(
    where: {organization_id: {_eq: $organizationId}}
    order_by: {created_at: desc}
    limit: $limit
  ) {
    ...TestimonialBasic
  }
}
    ${TestimonialBasicFragmentDoc}`;

/**
 * __useGetTestimonialsQuery__
 *
 * To run a query within a Vue component, call `useGetTestimonialsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestimonialsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetTestimonialsQuery({
 *   organizationId: // value for 'organizationId'
 *   limit: // value for 'limit'
 * });
 */
export function useGetTestimonialsQuery(variables: GetTestimonialsQueryVariables | VueCompositionApi.Ref<GetTestimonialsQueryVariables> | ReactiveFunction<GetTestimonialsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTestimonialsQuery, GetTestimonialsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTestimonialsQuery, GetTestimonialsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTestimonialsQuery, GetTestimonialsQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetTestimonialsQuery, GetTestimonialsQueryVariables>(GetTestimonialsDocument, variables, options);
}
export function useGetTestimonialsLazyQuery(variables?: GetTestimonialsQueryVariables | VueCompositionApi.Ref<GetTestimonialsQueryVariables> | ReactiveFunction<GetTestimonialsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTestimonialsQuery, GetTestimonialsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTestimonialsQuery, GetTestimonialsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTestimonialsQuery, GetTestimonialsQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetTestimonialsQuery, GetTestimonialsQueryVariables>(GetTestimonialsDocument, variables, options);
}
export type GetTestimonialsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetTestimonialsQuery, GetTestimonialsQueryVariables>;
export const GetTestimonialsStatsDocument = gql`
    query GetTestimonialsStats($organizationId: String!) {
  total: testimonials_aggregate(where: {organization_id: {_eq: $organizationId}}) {
    aggregate {
      count
    }
  }
  pending: testimonials_aggregate(
    where: {organization_id: {_eq: $organizationId}, status: {_eq: "pending"}}
  ) {
    aggregate {
      count
    }
  }
  approved: testimonials_aggregate(
    where: {organization_id: {_eq: $organizationId}, status: {_eq: "approved"}}
  ) {
    aggregate {
      count
    }
  }
  rejected: testimonials_aggregate(
    where: {organization_id: {_eq: $organizationId}, status: {_eq: "rejected"}}
  ) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetTestimonialsStatsQuery__
 *
 * To run a query within a Vue component, call `useGetTestimonialsStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestimonialsStatsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetTestimonialsStatsQuery({
 *   organizationId: // value for 'organizationId'
 * });
 */
export function useGetTestimonialsStatsQuery(variables: GetTestimonialsStatsQueryVariables | VueCompositionApi.Ref<GetTestimonialsStatsQueryVariables> | ReactiveFunction<GetTestimonialsStatsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTestimonialsStatsQuery, GetTestimonialsStatsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTestimonialsStatsQuery, GetTestimonialsStatsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTestimonialsStatsQuery, GetTestimonialsStatsQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetTestimonialsStatsQuery, GetTestimonialsStatsQueryVariables>(GetTestimonialsStatsDocument, variables, options);
}
export function useGetTestimonialsStatsLazyQuery(variables?: GetTestimonialsStatsQueryVariables | VueCompositionApi.Ref<GetTestimonialsStatsQueryVariables> | ReactiveFunction<GetTestimonialsStatsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTestimonialsStatsQuery, GetTestimonialsStatsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTestimonialsStatsQuery, GetTestimonialsStatsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTestimonialsStatsQuery, GetTestimonialsStatsQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetTestimonialsStatsQuery, GetTestimonialsStatsQueryVariables>(GetTestimonialsStatsDocument, variables, options);
}
export type GetTestimonialsStatsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetTestimonialsStatsQuery, GetTestimonialsStatsQueryVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($id: String!, $changes: users_set_input!) {
  update_users_by_pk(pk_columns: {id: $id}, _set: $changes) {
    id
    email
    display_name
    avatar_url
    locale
    timezone
    updated_at
  }
}
    `;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useUpdateUserMutation({
 *   variables: {
 *     id: // value for 'id'
 *     changes: // value for 'changes'
 *   },
 * });
 */
export function useUpdateUserMutation(options: VueApolloComposable.UseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
}
export type UpdateUserMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<UpdateUserMutation, UpdateUserMutationVariables>;
export const GetUserDocument = gql`
    query GetUser($userId: String!) {
  users_by_pk(id: $userId) {
    ...UserBasic
  }
}
    ${UserBasicFragmentDoc}`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a Vue component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetUserQuery({
 *   userId: // value for 'userId'
 * });
 */
export function useGetUserQuery(variables: GetUserQueryVariables | VueCompositionApi.Ref<GetUserQueryVariables> | ReactiveFunction<GetUserQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetUserQuery, GetUserQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetUserQuery, GetUserQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetUserQuery, GetUserQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, variables, options);
}
export function useGetUserLazyQuery(variables?: GetUserQueryVariables | VueCompositionApi.Ref<GetUserQueryVariables> | ReactiveFunction<GetUserQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetUserQuery, GetUserQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetUserQuery, GetUserQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetUserQuery, GetUserQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, variables, options);
}
export type GetUserQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetUserQuery, GetUserQueryVariables>;
export const GetWidgetDocument = gql`
    query GetWidget($widgetId: String!) {
  widgets_by_pk(id: $widgetId) {
    ...WidgetBasic
  }
}
    ${WidgetBasicFragmentDoc}`;

/**
 * __useGetWidgetQuery__
 *
 * To run a query within a Vue component, call `useGetWidgetQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWidgetQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetWidgetQuery({
 *   widgetId: // value for 'widgetId'
 * });
 */
export function useGetWidgetQuery(variables: GetWidgetQueryVariables | VueCompositionApi.Ref<GetWidgetQueryVariables> | ReactiveFunction<GetWidgetQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetWidgetQuery, GetWidgetQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetWidgetQuery, GetWidgetQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetWidgetQuery, GetWidgetQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetWidgetQuery, GetWidgetQueryVariables>(GetWidgetDocument, variables, options);
}
export function useGetWidgetLazyQuery(variables?: GetWidgetQueryVariables | VueCompositionApi.Ref<GetWidgetQueryVariables> | ReactiveFunction<GetWidgetQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetWidgetQuery, GetWidgetQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetWidgetQuery, GetWidgetQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetWidgetQuery, GetWidgetQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetWidgetQuery, GetWidgetQueryVariables>(GetWidgetDocument, variables, options);
}
export type GetWidgetQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetWidgetQuery, GetWidgetQueryVariables>;
export const GetWidgetsDocument = gql`
    query GetWidgets($organizationId: String!) {
  widgets(
    where: {organization_id: {_eq: $organizationId}}
    order_by: {created_at: desc}
  ) {
    ...WidgetBasic
  }
}
    ${WidgetBasicFragmentDoc}`;

/**
 * __useGetWidgetsQuery__
 *
 * To run a query within a Vue component, call `useGetWidgetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWidgetsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetWidgetsQuery({
 *   organizationId: // value for 'organizationId'
 * });
 */
export function useGetWidgetsQuery(variables: GetWidgetsQueryVariables | VueCompositionApi.Ref<GetWidgetsQueryVariables> | ReactiveFunction<GetWidgetsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetWidgetsQuery, GetWidgetsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetWidgetsQuery, GetWidgetsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetWidgetsQuery, GetWidgetsQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetWidgetsQuery, GetWidgetsQueryVariables>(GetWidgetsDocument, variables, options);
}
export function useGetWidgetsLazyQuery(variables?: GetWidgetsQueryVariables | VueCompositionApi.Ref<GetWidgetsQueryVariables> | ReactiveFunction<GetWidgetsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetWidgetsQuery, GetWidgetsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetWidgetsQuery, GetWidgetsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetWidgetsQuery, GetWidgetsQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetWidgetsQuery, GetWidgetsQueryVariables>(GetWidgetsDocument, variables, options);
}
export type GetWidgetsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetWidgetsQuery, GetWidgetsQueryVariables>;
export const GetDashboardStatsDocument = gql`
    query GetDashboardStats($organizationId: String!) {
  forms_aggregate(
    where: {organization_id: {_eq: $organizationId}, is_active: {_eq: true}}
  ) {
    aggregate {
      count
    }
  }
  testimonials_aggregate(where: {organization_id: {_eq: $organizationId}}) {
    aggregate {
      count
    }
  }
  pending_testimonials: testimonials_aggregate(
    where: {organization_id: {_eq: $organizationId}, status: {_eq: "pending"}}
  ) {
    aggregate {
      count
    }
  }
  widgets_aggregate(
    where: {organization_id: {_eq: $organizationId}, is_active: {_eq: true}}
  ) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetDashboardStatsQuery__
 *
 * To run a query within a Vue component, call `useGetDashboardStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDashboardStatsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetDashboardStatsQuery({
 *   organizationId: // value for 'organizationId'
 * });
 */
export function useGetDashboardStatsQuery(variables: GetDashboardStatsQueryVariables | VueCompositionApi.Ref<GetDashboardStatsQueryVariables> | ReactiveFunction<GetDashboardStatsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>(GetDashboardStatsDocument, variables, options);
}
export function useGetDashboardStatsLazyQuery(variables?: GetDashboardStatsQueryVariables | VueCompositionApi.Ref<GetDashboardStatsQueryVariables> | ReactiveFunction<GetDashboardStatsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>(GetDashboardStatsDocument, variables, options);
}
export type GetDashboardStatsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>;