-- Создание функции для автоматического создания профиля после регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, currency)
  values (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', 'Владелец'), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'owner'),
    'TJS'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Удаляем триггер, если он вдруг уже есть
drop trigger if exists on_auth_user_created on auth.users;

-- Привязываем функцию к событию добавления нового пользователя
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
