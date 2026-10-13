const readline = require("readline");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function ask(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function askHidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const stdin = process.stdin;
    process.stdout.write(query);

    if (stdin.isTTY) {
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding("utf8");

      let input = "";
      const onData = (char) => {
        char = char.toString("utf8");
        switch (char) {
          case "\n":
          case "\r":
          case "\u0004":
            stdin.setRawMode(false);
            stdin.pause();
            stdin.removeListener("data", onData);
            process.stdout.write("\n");
            rl.close();
            resolve(input.trim());
            break;
          case "\u0003": // Ctrl+C
            stdin.setRawMode(false);
            process.exit(1);
            break;
          case "\u0008":
          case "\x7f":
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write("\b \b");
            }
            break;
          default:
            input += char;
            process.stdout.write("*");
            break;
        }
      };
      stdin.on("data", onData);
    } else {
      rl.question("", (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    }
  });
}

async function main() {
  const isForce = process.argv.includes("--force");

  console.log("=== Budhram Tour & Travels - Create First Admin ===");

  const email = await ask("Admin Email: ");
  if (!email || !email.includes("@")) {
    console.error("Error: A valid email address is required.");
    process.exit(1);
  }

  const name = await ask("Full Name: ");
  if (!name) {
    console.error("Error: Full name is required.");
    process.exit(1);
  }

  const password = await askHidden("Password (min 12 characters): ");
  if (!password || password.length < 12) {
    console.error("Error: Password must be at least 12 characters long.");
    process.exit(1);
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim() },
          { email: email.trim().toLowerCase() },
          { role: "ADMIN" },
        ],
      },
    });

    if (existing && !isForce) {
      console.log("Admin already exists. Use --force to reset password.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    if (existing && isForce) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          email: email.trim().toLowerCase(),
          name: name.trim(),
          password: hashedPassword,
          role: "ADMIN",
        },
      });
      console.log(`Admin [${email.trim().toLowerCase()}] password reset. You can now log in at /login.`);
    } else {
      await prisma.user.create({
        data: {
          email: email.trim().toLowerCase(),
          name: name.trim(),
          password: hashedPassword,
          role: "ADMIN",
        },
      });
      console.log(`Admin [${email.trim().toLowerCase()}] created. You can now log in at /login.`);
    }
  } catch (error) {
    console.error("Database error creating admin:", error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
