// Simple verification script to check if authentication is properly configured
const fs = require("fs");
const path = require("path");

console.log("🔍 Verifying Authentication Setup...\n");

// Check if required files exist
const requiredFiles = [
  "auth.ts",
  "components/LoginOptions.tsx",
  "app/api/auth/[...nextauth]/route.ts",
  ".env.local",
];

let allFilesExist = true;

requiredFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - EXISTS`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check environment variables
console.log("\n🔐 Checking Environment Variables...");
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");

  const requiredEnvVars = [
    "AUTH_SECRET",
    "AUTH_GITHUB_ID",
    "AUTH_GITHUB_SECRET",
    "AUTH_GOOGLE_ID",
    "AUTH_GOOGLE_SECRET",
  ];

  requiredEnvVars.forEach((envVar) => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} - CONFIGURED`);
    } else {
      console.log(`❌ ${envVar} - MISSING`);
      allFilesExist = false;
    }
  });
}

// Check package.json for required dependencies
console.log("\n📦 Checking Dependencies...");
const packagePath = path.join(process.cwd(), "package.json");
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  const dependencies = {
    ...packageContent.dependencies,
    ...packageContent.devDependencies,
  };

  const requiredDeps = ["next-auth", "next", "react"];

  requiredDeps.forEach((dep) => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep} - v${dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
}

console.log("\n" + "=".repeat(50));
if (allFilesExist) {
  console.log("🎉 All authentication components are properly configured!");
  console.log("\n📋 Next Steps:");
  console.log(
    "1. Visit http://localhost:3000/test-auth to test authentication"
  );
  console.log("2. Try both GitHub and Google login options");
  console.log("3. Check your Sanity Studio for new user records");
} else {
  console.log(
    "⚠️  Some components are missing. Please check the errors above."
  );
}
console.log("=".repeat(50));
