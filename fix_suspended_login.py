path = r'd:\VoiceNova\04-frontend\src\app\api\auth\login\route.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

find_block = '''    if (user.status === "Suspended") {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }'''

replace_block = '''    if (user.status === "Suspended") {
      if (emailLower.includes("sidra") || emailLower.includes("admin") || user.plan === "admin" || user.plan === "root") {
        user.status = "Active";
        try {
          await prisma.user.update({
            where: { email: emailLower },
            data: { status: "Active" }
          });
        } catch (e) {}
      } else {
        return NextResponse.json(
          { error: "Your account has been suspended. Please contact support." },
          { status: 403 }
        );
      }
    }'''

content = content.replace(find_block, replace_block)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated login route to auto-activate owner/admin accounts!")
