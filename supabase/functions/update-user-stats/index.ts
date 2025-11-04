import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BADGE_THRESHOLDS = {
  first_thought: 1,
  curious_mind: 10,
  deep_thinker: 50,
  wisdom_seeker: 100,
  enlightened: 500,
  streak_starter: 3,
  consistent_thinker: 7,
  dedicated: 30,
  unstoppable: 100,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { moduleType } = await req.json();

    // Get current stats
    const { data: currentStats, error: fetchError } = await supabaseClient
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching stats:", fetchError);
      throw fetchError;
    }

    const today = new Date().toISOString().split("T")[0];
    const lastThoughtDate = currentStats?.last_thought_date;
    
    // Calculate streak
    let currentStreak = currentStats?.current_streak || 0;
    let longestStreak = currentStats?.longest_streak || 0;
    
    if (!lastThoughtDate) {
      currentStreak = 1;
    } else if (lastThoughtDate === today) {
      // Same day, no streak change
    } else {
      const lastDate = new Date(lastThoughtDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    const newTotalThoughts = (currentStats?.total_thoughts || 0) + 1;

    // Calculate badges
    const existingBadges = currentStats?.badges || [];
    const badgeSet = new Set(Array.isArray(existingBadges) ? existingBadges : []);

    if (newTotalThoughts >= BADGE_THRESHOLDS.first_thought) badgeSet.add("first_thought");
    if (newTotalThoughts >= BADGE_THRESHOLDS.curious_mind) badgeSet.add("curious_mind");
    if (newTotalThoughts >= BADGE_THRESHOLDS.deep_thinker) badgeSet.add("deep_thinker");
    if (newTotalThoughts >= BADGE_THRESHOLDS.wisdom_seeker) badgeSet.add("wisdom_seeker");
    if (newTotalThoughts >= BADGE_THRESHOLDS.enlightened) badgeSet.add("enlightened");
    
    if (currentStreak >= BADGE_THRESHOLDS.streak_starter) badgeSet.add("streak_starter");
    if (currentStreak >= BADGE_THRESHOLDS.consistent_thinker) badgeSet.add("consistent_thinker");
    if (longestStreak >= BADGE_THRESHOLDS.dedicated) badgeSet.add("dedicated");
    if (longestStreak >= BADGE_THRESHOLDS.unstoppable) badgeSet.add("unstoppable");

    const newBadges = Array.from(badgeSet);

    // Update stats
    const { error: updateError } = await supabaseClient
      .from("user_stats")
      .upsert({
        user_id: user.id,
        total_thoughts: newTotalThoughts,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_thought_date: today,
        badges: newBadges,
      });

    if (updateError) {
      console.error("Error updating stats:", updateError);
      throw updateError;
    }

    // Check for new badges
    const previousBadgeCount = existingBadges.length;
    const newBadgeCount = newBadges.length;
    const earnedNewBadge = newBadgeCount > previousBadgeCount;

    console.log(`Stats updated for user ${user.id}: thoughts=${newTotalThoughts}, streak=${currentStreak}, badges=${newBadges.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          total_thoughts: newTotalThoughts,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          badges: newBadges,
          earned_new_badge: earnedNewBadge,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in update-user-stats:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
