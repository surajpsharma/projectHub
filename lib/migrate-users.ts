import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";

/**
 * Migration script to update existing GitHub users to the new schema
 * This adds providerId and provider fields to existing users
 */
export async function migrateExistingUsers() {
  try {
    console.log("Starting user migration...");

    // Find all existing users without providerId (legacy GitHub users)
    const existingUsers = await client.fetch(`
      *[_type == "author" && !defined(providerId) && defined(id)]{
        _id,
        id,
        name,
        username,
        email,
        image,
        bio
      }
    `);

    console.log(`Found ${existingUsers.length} users to migrate`);

    // Update each user with the new fields
    for (const user of existingUsers) {
      await writeClient
        .patch(user._id)
        .set({
          providerId: String(user.id),
          provider: "github",
        })
        .commit();

      console.log(`Migrated user: ${user.name} (${user.username})`);
    }

    console.log("Migration completed successfully!");
    return { success: true, migratedCount: existingUsers.length };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, error };
  }
}
