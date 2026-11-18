import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://suyatyofzvoxvsfravud.supabase.co";
const supabaseAnonKey = "sb_publishable_dlxCrwSZv1EzcQ9p_OOHmA_eRB7jEh4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
