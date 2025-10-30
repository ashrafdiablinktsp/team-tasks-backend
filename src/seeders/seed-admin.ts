import { connectDB } from "../config/database";
import { userDAL } from "../modules/users/user.model";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  try {
    console.log("Starting admin seeder...");

    // Connect to database
    await connectDB();
    console.log("Database connected");

    // Check if admin already exists
    const existingAdmin = await userDAL.findByEmail("ashraf.diab22.ad@gmail.com");
    
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash("P@ssw0rd", 10);

    // Create admin user
    const admin = await userDAL.create(
      "Ashraf Diab",
      "ashraf.diab22.ad@gmail.com",
      passwordHash,
      "admin",
      "Developer",
      "Full-stack developer with expertise in TypeScript, Node.js, and modern web technologies. Responsible for developing and maintaining backend services, APIs, and database architecture."
    );

    console.log("✅ Admin user created successfully!");
    console.log("-----------------------------------");
    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Position:", admin.position);
    console.log("Created At:", admin.createdAt);
    console.log("-----------------------------------");
    console.log("You can now login with:");
    console.log("Email: ashraf.diab22.ad@gmail.com");
    console.log("Password: P@ssw0rd");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed admin user:", error);
    process.exit(1);
  }
}

seedAdmin();
