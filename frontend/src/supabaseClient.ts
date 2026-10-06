import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bmyjjulfwlgsotunusdu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJteWpqdWxmd2xnc290dW51c2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDQzNzAsImV4cCI6MjEwNjMyMDM3MH0.19StQiZhD_TemsSMRQPnZWJSyskrkT1oSyU_lQFgK-k';

export const supabase = createClient(supabaseUrl, supabaseKey);
