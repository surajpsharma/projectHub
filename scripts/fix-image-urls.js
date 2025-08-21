const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

async function fixImageUrls() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const projectsCollection = db.collection("projects");
    const authorsCollection = db.collection("authors");

    // Find projects with problematic image URLs
    const problematicProjects = await projectsCollection
      .find({
        image: { $regex: /chanty\.com|timeout|unreachable/ },
      })
      .toArray();

    console.log(
      `Found ${problematicProjects.length} projects with problematic images`
    );

    // Update problematic project images to null (will use fallback)
    if (problematicProjects.length > 0) {
      const result = await projectsCollection.updateMany(
        { image: { $regex: /chanty\.com|timeout|unreachable/ } },
        { $unset: { image: "" } }
      );
      console.log(`Updated ${result.modifiedCount} project images`);
    }

    // Find authors with problematic image URLs
    const problematicAuthors = await authorsCollection
      .find({
        image: { $regex: /chanty\.com|timeout|unreachable/ },
      })
      .toArray();

    console.log(
      `Found ${problematicAuthors.length} authors with problematic images`
    );

    // Update problematic author images to null (will use fallback)
    if (problematicAuthors.length > 0) {
      const result = await authorsCollection.updateMany(
        { image: { $regex: /chanty\.com|timeout|unreachable/ } },
        { $unset: { image: "" } }
      );
      console.log(`Updated ${result.modifiedCount} author images`);
    }

    // List all external image URLs for review
    const allProjects = await projectsCollection
      .find({
        image: { $exists: true, $ne: null, $regex: /^https?:\/\// },
      })
      .toArray();

    const allAuthors = await authorsCollection
      .find({
        image: { $exists: true, $ne: null, $regex: /^https?:\/\// },
      })
      .toArray();

    console.log("\nExternal image URLs found:");
    console.log("Projects:");
    allProjects.forEach((project) => {
      console.log(`- ${project.title}: ${project.image}`);
    });

    console.log("\nAuthors:");
    allAuthors.forEach((author) => {
      console.log(`- ${author.name}: ${author.image}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

fixImageUrls();
