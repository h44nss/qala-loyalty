-- Drop old trigger if needed or just replace the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User ' || substr(new.id::text, 1, 6)),
    -- Gunakan UUID sebagai default phone_number sementara agar tidak bentrok (karena kolom ini UNIQUE)
    COALESCE(new.phone, new.id::text),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
