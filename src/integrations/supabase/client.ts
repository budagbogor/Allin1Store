import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mmljfyluqekexwarhrup.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tbGpmeWx1cWVrZXh3YXJocnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMzIxODcsImV4cCI6MjA4NDcwODE4N30.hU1uZHp3Uo6yrZjCqKlOMsLpGi4O2g0TAxGFcxrWsFw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
