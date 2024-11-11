import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { name, description, fields, destination } = data;

    const config = await prisma.dataConfig.create({
      data: {
        name,
        config: {
          description,
          fields,
          destination,
          status: "active"
        },
        userId: session.user.id,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error creating configuration:", error);
    return NextResponse.json(
      { error: "Failed to create configuration" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const configs = await prisma.dataConfig.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { dataRuns: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching configurations:", error);
    return NextResponse.json(
      { error: "Failed to fetch configurations" },
      { status: 500 }
    );
  }
}