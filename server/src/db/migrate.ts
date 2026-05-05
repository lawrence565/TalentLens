import type { TalentLensDatabase } from './connection'

export const migrateDatabase = (database: TalentLensDatabase) => {
  database.exec(`
    create table if not exists resumes (
      id text primary key,
      file_name text not null,
      mime_type text not null,
      size integer not null,
      upload_path text not null,
      created_at text not null
    );

    create table if not exists analyses (
      id text primary key,
      resume_id text not null references resumes(id) on delete cascade,
      status text not null,
      progress integer not null,
      error text,
      started_at text,
      completed_at text,
      created_at text not null
    );

    create table if not exists reports (
      id text primary key,
      resume_id text not null references resumes(id) on delete cascade,
      analysis_id text not null unique references analyses(id) on delete cascade,
      overall_score integer not null,
      summary text not null,
      follow_up_prompts_json text not null,
      created_at text not null
    );

    create table if not exists issues (
      id text primary key,
      report_id text not null references reports(id) on delete cascade,
      title text not null,
      severity text not null,
      category text not null,
      additional_categories_json text,
      reason text not null,
      next_action text not null,
      status text not null,
      priority integer not null
    );

    create table if not exists ats_checks (
      id text primary key,
      report_id text not null references reports(id) on delete cascade,
      type text not null,
      label text not null,
      status text not null,
      reason text not null,
      next_action text not null
    );

    create table if not exists follow_ups (
      id text primary key,
      report_id text not null references reports(id) on delete cascade,
      issue_id text references issues(id) on delete set null,
      question text not null,
      answer text not null,
      next_actions_json text not null,
      created_at text not null
    );

    create table if not exists report_ratings (
      id text primary key,
      report_id text not null references reports(id) on delete cascade,
      rating integer not null,
      helped_understand_next_steps integer not null,
      feedback text,
      created_at text not null
    );

    create table if not exists analytics_events (
      id text primary key,
      name text not null,
      payload_json text not null,
      created_at text not null
    );
  `)
}
