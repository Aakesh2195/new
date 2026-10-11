import User from "../models/userModel.js";
import Course from "../models/courseModel.js";

const demoCourses = [
  { title: "Java Programming", description: "Learn Java fundamentals, OOP, collections, exception handling and problem solving." },
  { title: "Python Programming", description: "Learn Python syntax, functions, OOP, file handling and practical problem solving." },
  { title: "Data Structures", description: "Study arrays, linked lists, stacks, queues, trees, heaps, graphs and algorithms." },
  { title: "Database Management Systems", description: "Learn SQL, normalization, transactions, indexing and core DBMS concepts." },
  { title: "Computer Networks", description: "Understand OSI/TCP-IP models, addressing, routing, transport and application protocols." },
  { title: "Web Development", description: "Build modern web applications with HTML, CSS, JavaScript, REST APIs and React." },
];

const seedDefaultData = async () => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log("ADMIN_EMAIL/ADMIN_PASSWORD not fully configured; admin seeding skipped.");
  } else {
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Assign the role and save the plain password through the model hook,
      // so bcrypt hashes it exactly once.
      existingAdmin.role = "admin";
      const passwordMatches = await existingAdmin.comparePassword(adminPassword);
      if (!passwordMatches || process.env.RESET_ADMIN_PASSWORD === "true") {
        existingAdmin.password = adminPassword;
      }
      await existingAdmin.save();
      console.log(`Admin account ready: ${adminEmail}`);
    } else {
      await User.create({
        name: process.env.ADMIN_NAME?.trim() || "ScholarStack Admin",
        age: Number(process.env.ADMIN_AGE) || 30,
        city: process.env.ADMIN_CITY?.trim() || "Administration",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });
      console.log(`Default admin created: ${adminEmail}`);
    }
  }

  // Course seeding is independent of admin creation, so it also works
  // when the admin already exists.
  if (process.env.SEED_DEMO_COURSES !== "false") {
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      await Course.insertMany(demoCourses);
      console.log(`${demoCourses.length} demo courses created.`);
    }
  }
};

export default seedDefaultData;
