import { auth } from "@/lib/auth";
import { prisma } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { providerId } = await params;

  await prisma.encryptedApiKey.deleteMany({
    where: {
      userId: session.user.id,
      providerId,
    },
  });

  return Response.json({ ok: true });
}
