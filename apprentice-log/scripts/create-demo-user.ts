/**
 * Create Demo User for Google Play Store Testing
 *
 * This script creates a demo account with sample logbook entries
 * for Play Store reviewers to test the app.
 *
 * Run with: npx tsx scripts/create-demo-user.ts
 */

import { createClient } from "@supabase/supabase-js";

const DEMO_EMAIL = "demo@apprenticelog.nz";
const DEMO_PASSWORD = "Sixtieth1-Dubiously8-Unspoken0-Glitch1-Imaginary9";

async function createDemoUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing environment variables:");
    console.error("- NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "set" : "MISSING");
    console.error("- SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "set" : "MISSING");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("Creating demo user for Play Store testing...\n");

  // Check if demo user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingDemo = existingUsers?.users?.find(u => u.email === DEMO_EMAIL);

  let userId: string;

  if (existingDemo) {
    console.log("Demo user already exists. Updating password...");
    userId = existingDemo.id;

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: DEMO_PASSWORD,
      email_confirm: true,
    });

    if (updateError) {
      console.error("Failed to update demo user:", updateError);
      process.exit(1);
    }
    console.log("Password updated successfully.");
  } else {
    // Create new demo user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true, // Skip email verification
      user_metadata: {
        is_demo_account: true,
        name: "Demo User",
      },
    });

    if (createError) {
      console.error("Failed to create demo user:", createError);
      process.exit(1);
    }

    userId = newUser.user.id;
    console.log("Demo user created successfully.");
  }

  // Clear existing entries for demo user
  const { error: deleteError } = await supabase
    .from("apprentice_entries")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    console.error("Warning: Could not clear existing entries:", deleteError.message);
  }

  // Create sample logbook entries
  const today = new Date();
  const sampleEntries = [
    {
      user_id: userId,
      date: formatDate(daysAgo(today, 0)),
      hours: 8.5,
      raw_transcript: "Today I worked on installing weatherboards on the south wall. Used a nail gun and level. My supervisor Dave showed me how to check for proper overlap. Also helped with some framing work in the afternoon.",
      formatted_entry: "**Tasks Completed:**\n- Installed weatherboards on south wall using nail gun\n- Checked proper overlap alignment with supervisor guidance\n- Assisted with internal framing work\n\n**Skills Practiced:**\n- Weatherboard installation techniques\n- Use of pneumatic nail gun\n- Level and alignment checking\n- Basic framing skills\n\n**Tools Used:**\n- Pneumatic nail gun\n- Spirit level\n- Tape measure\n- Hammer\n\n**Health & Safety:**\n- Wore safety glasses and ear protection when using nail gun\n- Maintained clear work area",
      site_name: "Henderson Residential Build",
      supervisor: "Dave Thompson",
    },
    {
      user_id: userId,
      date: formatDate(daysAgo(today, 1)),
      hours: 8.0,
      raw_transcript: "Spent the morning doing concrete work for the garage floor. Helped set up formwork and then we poured and levelled the concrete. In the afternoon did some cleanup and prep for tomorrow.",
      formatted_entry: "**Tasks Completed:**\n- Set up formwork for garage floor pour\n- Assisted with concrete pouring\n- Levelled and finished concrete surface\n- Site cleanup and preparation\n\n**Skills Practiced:**\n- Formwork setup and alignment\n- Concrete pouring techniques\n- Surface levelling and finishing\n- Site organisation\n\n**Tools Used:**\n- Formwork boards\n- Spirit level\n- Concrete screed\n- Bull float\n- Rake\n\n**Health & Safety:**\n- Wore gumboots and gloves for concrete work\n- Stayed hydrated in warm conditions",
      site_name: "Henderson Residential Build",
      supervisor: "Dave Thompson",
    },
    {
      user_id: userId,
      date: formatDate(daysAgo(today, 2)),
      hours: 7.5,
      raw_transcript: "Worked on roof framing today. Cut rafters to template and helped install them. Learning about roof pitches and how to calculate cuts. Pretty challenging but getting the hang of it.",
      formatted_entry: "**Tasks Completed:**\n- Cut rafters to template specifications\n- Assisted with rafter installation\n- Learned roof pitch calculations\n\n**Skills Practiced:**\n- Rafter cutting techniques\n- Roof framing principles\n- Angle and pitch calculations\n- Working at heights safely\n\n**Tools Used:**\n- Circular saw\n- Speed square\n- Tape measure\n- Nail gun\n- Scaffolding\n\n**Health & Safety:**\n- Used fall protection on scaffolding\n- Double-checked all cuts before installation\n- Maintained three points of contact when climbing",
      site_name: "Henderson Residential Build",
      supervisor: "Dave Thompson",
    },
    {
      user_id: userId,
      date: formatDate(daysAgo(today, 5)),
      hours: 8.0,
      raw_transcript: "Started a new job today at a renovation in Mt Eden. Stripped out old gib and insulation from the bathroom and bedroom. Careful work because of possible asbestos in the old house.",
      formatted_entry: "**Tasks Completed:**\n- Careful removal of existing GIB board\n- Stripped old insulation from walls\n- Sorted materials for disposal\n- Set up containment area\n\n**Skills Practiced:**\n- Demolition techniques\n- Asbestos awareness procedures\n- Waste sorting and disposal\n- Site containment setup\n\n**Tools Used:**\n- Pry bar\n- Hammer\n- Utility knife\n- Dust masks (P2)\n- Plastic sheeting\n\n**Health & Safety:**\n- Followed asbestos awareness protocols\n- Wore P2 mask and disposable coveralls\n- Wet down materials before removal\n- Proper disposal of suspect materials",
      site_name: "Mt Eden Villa Renovation",
      supervisor: "Sarah Chen",
    },
    {
      user_id: userId,
      date: formatDate(daysAgo(today, 6)),
      hours: 8.5,
      raw_transcript: "Continued with the renovation. Installed new wall framing where we removed the old stuff. Also ran some noggins between studs. Sarah showed me how to check everything is plumb and level.",
      formatted_entry: "**Tasks Completed:**\n- Installed new wall framing sections\n- Cut and fitted noggins between studs\n- Checked all framing for plumb and level\n- Made adjustments as needed\n\n**Skills Practiced:**\n- Wall framing in renovation context\n- Noggin installation at correct heights\n- Use of plumb bob and level\n- Problem-solving with existing structures\n\n**Tools Used:**\n- Framing nail gun\n- Spirit level\n- Plumb bob\n- Tape measure\n- Circular saw\n\n**Health & Safety:**\n- Secured all loose materials\n- Kept work area tidy\n- Used proper PPE throughout",
      site_name: "Mt Eden Villa Renovation",
      supervisor: "Sarah Chen",
    },
  ];

  // Insert sample entries
  const { error: insertError } = await supabase
    .from("apprentice_entries")
    .insert(sampleEntries);

  if (insertError) {
    console.error("Failed to create sample entries:", insertError);
    process.exit(1);
  }

  console.log(`\nCreated ${sampleEntries.length} sample logbook entries.`);

  console.log("\n" + "=".repeat(50));
  console.log("DEMO ACCOUNT CREDENTIALS FOR PLAY STORE");
  console.log("=".repeat(50));
  console.log(`Email:    ${DEMO_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log("=".repeat(50));
  console.log("\nAdd these credentials to Google Play Console under:");
  console.log("App Content → App access → Manage → Add new instructions");
  console.log("\nDelete Account URL: https://apprenticelog.nz/delete-account");
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function daysAgo(from: Date, days: number): Date {
  const result = new Date(from);
  result.setDate(result.getDate() - days);
  return result;
}

createDemoUser()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
