-- V2: AI quota tracking on profiles + token logging on api_usage_log

-- AI quota on profiles (100 Sonnet + 20 Opus per month default)
alter table public.profiles
  add column if not exists ai_quota_monthly int not null default 100,
  add column if not exists ai_quota_used int not null default 0,
  add column if not exists ai_quota_reset_at timestamptz not null default date_trunc('month', now()) + interval '1 month';

-- Token tracking on api_usage_log
alter table public.api_usage_log
  add column if not exists tokens_input int,
  add column if not exists tokens_output int,
  add column if not exists cost_usd numeric(8,6),
  add column if not exists model text,
  add column if not exists prompt_type text;

-- Index for monthly usage queries
create index if not exists idx_usage_log_user_created
  on public.api_usage_log (user_id, created_at);

create index if not exists idx_usage_log_source
  on public.api_usage_log (source) where source = 'ai-proxy';

-- Helper: check if user has AI quota remaining
create or replace function public.has_ai_quota(uid uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = uid
      and ai_quota_used < ai_quota_monthly
      and (ai_quota_reset_at <= now() or ai_quota_used < ai_quota_monthly)
  );
$$ language sql security definer stable;

-- Helper: increment AI usage counter
create or replace function public.increment_ai_usage(uid uuid)
returns void as $$
begin
  -- Reset counter if past reset date
  update public.profiles
  set ai_quota_used = 0,
      ai_quota_reset_at = date_trunc('month', now()) + interval '1 month'
  where id = uid and ai_quota_reset_at <= now();

  -- Increment
  update public.profiles
  set ai_quota_used = ai_quota_used + 1
  where id = uid;
end;
$$ language plpgsql security definer;
