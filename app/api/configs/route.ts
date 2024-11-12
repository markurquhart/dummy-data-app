import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import type { Config, ConfigData } from "@/types/config";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const data = await req.json();
    
    const config = await prisma.dataConfig.create({
      data: {
        name: data.name,
        userId: user.id,
        config: {
          description: data.description,
          fields: data.fields,
          destination: data.destination,
          status: "active"
        } as ConfigData,
      },
    }) as Config;

    return NextResponse.json(config);
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create configuration" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const configs = await prisma.dataConfig.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }) as Config[];

    return NextResponse.json(configs);
    
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch configurations" },
      { status: 500 }
    );
  }
}