-- Perbarui trigger agar menerima semua data dari metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, role, instagram_username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(new.raw_user_meta_data->>'phone_number', new.id::text),
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    COALESCE(new.raw_user_meta_data->>'instagram_username', 'tidak_ada')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
