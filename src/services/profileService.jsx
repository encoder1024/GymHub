import { supabase } from "../supabaseClient";

export const fetchUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role, full_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching profile service:", error.message);
    return null;
  }
};
