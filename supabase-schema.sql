-- =============================================
-- SCHEMA - Festa Junina - Controle de Gastos
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Tabela de perfis dos participantes
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  cpf text unique not null,
  role text not null default 'comprador' check (role in ('pending', 'comprador', 'vendedor')),
  created_at timestamptz default now()
);

-- Tabela de sessões customizadas (sem Supabase Auth)
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade, -- null para admin
  token text unique not null,
  is_admin boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Tabela de compras/gastos
create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(10, 2) not null check (amount > 0),
  description text,
  created_at timestamptz default now()
);

-- Tabela de números de sorteio
create table public.raffle_tickets (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  ticket_number text unique not null,
  issued_at timestamptz default now()
);

-- =============================================
-- ÍNDICES para performance
-- =============================================

create index on public.sessions(token);
create index on public.sessions(expires_at);
create index on public.purchases(buyer_id);
create index on public.raffle_tickets(buyer_id);
create index on public.profiles(cpf);
create index on public.profiles(role);

-- =============================================
-- RLS: todas as operações passam pela service role key
-- então desabilitamos RLS (o controle é feito no servidor)
-- =============================================

-- Não habilitamos RLS pois usamos a service role key server-side.
-- O acesso do lado do cliente nunca toca o Supabase diretamente.

-- =============================================
-- Limpeza automática de sessões expiradas (opcional)
-- Execute como cron job no Supabase ou rode manualmente
-- =============================================

-- delete from public.sessions where expires_at < now();
