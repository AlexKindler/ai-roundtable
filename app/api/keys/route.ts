import { auth } from "@/lib/auth";
import { prisma } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.encryptedApiKey.findMany({
    where: { userId: session.user.id },
    select: {
      providerId: true,
      encryptedKey: true,
      iv: true,
      selectedModel: true,
    },
  });

  return Response.json({ keys });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { keys } = (await req.json()) as {
    keys: Array<{
      providerId: string;
      encryptedKey: string;
      iv: string;
      selectedModel?: string;
    }>;
  };

  if (!Array.isArray(keys)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.$transaction(
    keys.map((key) =>
      prisma.encryptedApiKey.upsert({
        where: {
          userId_providerId: {
            userId: session.user!.id!,
            providerId: key.providerId,
          },
        },
        update: {
          encryptedKey: key.encryptedKey,
          iv: key.iv,
          selectedModel: key.selectedModel ?? null,
        },
        create: {
          userId: session.user!.id!,
          providerId: key.providerId,
          encryptedKey: key.encryptedKey,
          iv: key.iv,
          selectedModel: key.selectedModel ?? null,
        },
      })
    )
  );

  return Response.json({ ok: true });
}
