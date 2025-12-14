-- Automatically grant admin role to the first registered user

create or replace function public.grant_admin_to_first_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- If there is no admin yet, make this new user an admin
  if not exists (
    select 1 from public.user_roles
    where role = 'admin'
  ) then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$$;

-- Trigger: run after every new auth user is created
create trigger on_auth_user_created_grant_admin
  after insert on auth.users
  for each row execute procedure public.grant_admin_to_first_user();
