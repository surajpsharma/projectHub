import { migrateExistingUsers } from "@/lib/migrate-users";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await migrateExistingUsers();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully migrated ${result.migratedCount} users`,
        migratedCount: result.migratedCount,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Migration failed",
      },
      { status: 500 }
    );
  }
}
