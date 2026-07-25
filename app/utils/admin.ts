export function checkIsAdmin(email?: string | null): boolean {
  console.log("--- ADMIN CHECK DEBUG ---");
  console.log("User email passed to checker:", email);

  if (!email) {
    console.log("Result: FALSE (No email provided/logged in)");
    return false;
  }

  // Directly list your admin emails here to bypass client-side env variable limits
  const adminEmails = [
    "babalolajoshua11@gmail.com",
    "iboyibright1@gmail.com",
  ];

  const normalizedEmail = email.toLowerCase().trim();
  const isMatch = adminEmails.includes(normalizedEmail);

  console.log("Normalized email:", normalizedEmail);
  console.log("Result:", isMatch ? "TRUE (Admin granted)" : "FALSE (Not in admin list)");

  return isMatch;
}