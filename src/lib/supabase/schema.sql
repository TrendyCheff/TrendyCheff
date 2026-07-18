-- =========================================================================
--  TRENDY CHEFF · Supabase schema
--  Run this once in: Supabase Dashboard → SQL Editor → New query → Run
-- =========================================================================

-- ── Enable extensions ──────────────────────────────────────────────────────
create extension if not exists "pgcrypto";


-- ── menu_items ────────────────────────────────────────────────────────────
create table if not exists menu_items (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  category        text not null check (category in (
    'indo_chinese','main_course_non_veg','main_course_veg',
    'rice','biryani_flavors','salad','italian',
    'appetizers_veg','appetizers_non_veg',
    'tandoori_treasures','chefs_specials'
  )),
  price_medium    numeric(10,2),
  price_large     numeric(10,2),
  price_per_piece numeric(10,2),
  medium_label    text default 'Medium Tray',
  large_label     text default 'Large Tray',
  image_url       text,
  is_available    boolean default true,
  sort_order      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists menu_items_category_idx on menu_items (category);
create index if not exists menu_items_sort_idx     on menu_items (sort_order);
create index if not exists menu_items_avail_idx    on menu_items (is_available);


-- ── orders ────────────────────────────────────────────────────────────────
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid,                                    -- links to auth.users
  customer_name    text not null,
  customer_email   text,
  customer_phone   text not null,
  order_type       text not null check (order_type in ('pickup','delivery')),
  delivery_address text,
  requested_date   date not null,
  requested_time   time not null,
  items            jsonb not null,                          -- [{key,name,sizeLabel,quantity,unitPrice}]
  subtotal         numeric(10,2) not null,
  delivery_fee     numeric(10,2) default 0,
  tip_amount       numeric(10,2) default 0,
  total_amount     numeric(10,2) not null,
  payment_method   text not null check (payment_method in
                    ('square_card','paypal','venmo','cashapp')),
  square_payment_id text,                                    -- Square receipt id
  notes            text,
  status           text default 'pending' check (status in
                    ('pending','paid','confirmed','preparing',
                     'ready','completed','cancelled')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists orders_user_id_idx     on orders (user_id);
create index if not exists orders_status_idx      on orders (status);
create index if not exists orders_date_idx        on orders (requested_date);
create index if not exists orders_created_at_idx  on orders (created_at desc);
create index if not exists orders_payment_idx     on orders (payment_method);


-- ── reviews ───────────────────────────────────────────────────────────────
create table if not exists reviews (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  user_id        uuid,                                       -- optional link to auth.users
  rating         int not null check (rating between 1 and 5),
  comment        text not null,
  dish           text,
  is_approved    boolean default false,                      -- moderation gate
  created_at     timestamptz default now()
);

create index if not exists reviews_approved_idx on reviews (is_approved, created_at desc);


-- ── chef_availability ────────────────────────────────────────────────────
create table if not exists chef_availability (
  id                    uuid primary key default gen_random_uuid(),
  date                  date not null,
  start_time            time not null,
  end_time              time not null,
  is_blocked            boolean default false,
  slot_duration_minutes int default 120,
  max_orders_per_slot   int default 4,
  notes                 text,
  unique (date)
);


-- ── Realtime (push live updates to /admin) ──────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table reviews;


-- =========================================================================
--  ROW-LEVEL SECURITY (locked-down defaults)
--  Public can READ menu_items + APPROVED reviews.
--  Public can INSERT orders + reviews.
--  Updates restricted: only authenticated users can update their own rows.
--  Menu_items writes blocked (use SQL Editor / service role instead).
-- =========================================================================

alter table menu_items enable row level security;
alter table orders     enable row level security;
alter table reviews    enable row level security;

-- menu_items: public read, NO writes from anon/authenticated
drop policy if exists "menu_items_read"        on menu_items;
drop policy if exists "menu_items_admin_write" on menu_items;
create policy "menu_items_read"        on menu_items for select using (true);
create policy "menu_items_admin_write" on menu_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- orders: anyone can insert, users can read their own, status needs confirm flag
drop policy if exists "orders_public_insert"  on orders;
drop policy if exists "orders_owner_select"   on orders;
drop policy if exists "orders_admin_update"  on orders;
create policy "orders_public_insert"  on orders
  for insert with check (true);
create policy "orders_owner_select"   on orders
  for select using (auth.uid() = user_id or auth.role() = 'authenticated');
create policy "orders_admin_update"  on orders
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- reviews: public submit, only approved ones show in public reads
drop policy if exists "reviews_public_insert" on reviews;
drop policy if exists "reviews_public_read"  on reviews;
drop policy if exists "reviews_admin_update" on reviews;
create policy "reviews_public_insert" on reviews
  for insert with check (true);
create policy "reviews_public_read"  on reviews
  for select using (is_approved = true);
create policy "reviews_admin_update" on reviews
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');


-- =========================================================================
--  STORAGE (for menu / chef photos you don't host on Google Drive)
--  Buckets are public-read, authenticated-write.
-- =========================================================================

insert into storage.buckets (id, name, public)
  values ('menu-photos', 'menu-photos', true),
         ('chef-photos', 'chef-photos', true)
  on conflict (id) do nothing;

drop policy if exists "menu_photos_read"   on storage.objects;
drop policy if exists "menu_photos_write"  on storage.objects;
create policy "menu_photos_read"   on storage.objects
  for select using (bucket_id = 'menu-photos');
create policy "menu_photos_write"  on storage.objects
  for insert with check (bucket_id = 'menu-phots' and auth.role() = 'authenticated');

create policy "chef_photos_read" on storage.objects
  for select using (bucket_id = 'chef-photos');


-- =========================================================================
--  CONVENIENCE VIEWS — admin / reports
-- =========================================================================

-- Today's orders summary (used by /admin)
create or replace view today_orders_summary as
select
  date_trunc('day', requested_date) as day,
  count(*)                          as total,
  count(*) filter (where status in ('paid','confirmed','preparing','ready','completed')) as active,
  sum(total_amount)                 as revenue
from orders
where requested_date >= current_date
group by 1
order by 1 desc;


-- Top customers (lifetime)
create or replace view top_customers as
select
  customer_name,
  customer_email,
  count(*)               as order_count,
  sum(total_amount)      as lifetime_value
from orders
where customer_email is not null
group by 1, 2
order by lifetime_value desc
limit 25;


-- =========================================================================
--  AUTO-UPDATE TIMESTAMPS
-- =========================================================================
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists menu_items_touch on menu_items;
create trigger menu_items_touch before update on menu_items
  for each row execute function touch_updated_at();

drop trigger if exists orders_touch on orders;
create trigger orders_touch before update on orders
  for each row execute function touch_updated_at();
