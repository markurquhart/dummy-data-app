import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { DataGenerator } from "@/lib/services/dataGenerator";
import type { Config, RunSettings, DataRun } from "@/types/config";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const config = await prisma.dataConfig.findUnique({
      where: { id: params.id },
    }) as Config | null;

    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    if (config.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const settings = await req.json() as RunSettings;
    
    const run = await prisma.dataRun.create({
      data: {
        configId: config.id,
        userId: user.id,
        status: 'running',
        recordsCount: settings.recordCount,
        startTime: new Date(),
      },
    }) as DataRun;

    try {
      const generator = new DataGenerator();
      const fields = config.config.fields;
      let generatedCount = 0;
      
      while (generatedCount < settings.recordCount) {
        const batchSize = Math.min(
          settings.batchSize, 
          settings.recordCount - generatedCount
        );
        
        const batch = generator.generateBatch(fields, batchSize);
        console.log(`Generated batch of ${batch.length} records`);
        
        generatedCount += batch.length;
        
        await prisma.dataRun.update({
          where: { id: run.id },
          data: {
            recordsCount: generatedCount,
          },
        });

        if (settings.delayBetweenBatches) {
          await new Promise(resolve => 
            setTimeout(resolve, settings.delayBetweenBatches)
          );
        }
      }

      await prisma.dataRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          endTime: new Date(),
        },
      });

      return NextResponse.json({ 
        success: true,
        runId: run.id,
        recordsGenerated: generatedCount
      });
      
    } catch (error) {
      console.error('Error generating data:', error);
      
      await prisma.dataRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          endTime: new Date(),
        },
      });
      
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to generate data" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error setting up data generation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start data generation" },
      { status: 500 }
    );
  }
}