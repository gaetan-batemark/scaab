-- API cache
create table if not exists public.api_cache (
  key text primary key,
  value jsonb not null,
  source text,
  endpoint text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index idx_api_cache_expires on public.api_cache (expires_at);

-- API usage log
create table if not exists public.api_usage_log (
  id bigserial primary key,
  source text not null,
  endpoint text,
  status int,
  latency_ms int,
  user_id uuid,
  created_at timestamptz not null default now()
);
