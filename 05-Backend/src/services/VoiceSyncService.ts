/**
 * @file src/services/VoiceSyncService.ts
 * @description Synchronizes AI provider voice catalogs with the local Voice database.
 * Fetches voices from the active provider and upserts them into the Voices table,
 * keeping providerVoiceId, name, gender, accent, and previewUrl in sync.
 *
 * This service can be triggered:
 *  - Manually via POST /api/voices/sync (admin-protected route)
 *  - Programmatically on server startup
 *  - Via a scheduled cron job
 */

import prisma from "../config/db";
import logger from "../utils/logger";
import { AIProviderFactory } from "../providers/AIProviderFactory";
import { ProviderError } from "../providers/errors/ProviderError";
import type { ProviderVoice } from "../providers/interfaces/types";

// ─── Sync Result ──────────────────────────────────────────────────────────────

export interface VoiceSyncResult {
  provider: string;
  totalFetched: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  durationMs: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class VoiceSyncService {
  /**
   * Fetches all voices from the active AI provider and upserts them into the DB.
   * Existing voices are matched by providerVoiceId.
   * New voices are created; existing ones have their metadata updated.
   *
   * @returns VoiceSyncResult with counts and any per-voice errors
   */
  static async syncVoices(): Promise<VoiceSyncResult> {
    const startTime = Date.now();
    const provider = AIProviderFactory.getProvider();
    const providerName = provider.getProviderName();

    logger.info(`[VoiceSyncService] Starting voice sync from provider: ${providerName}`);

    const result: VoiceSyncResult = {
      provider: providerName,
      totalFetched: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      durationMs: 0,
    };

    // ── Fetch from provider ────────────────────────────────────────────────────
    let providerVoices: ProviderVoice[];

    try {
      providerVoices = await provider.getVoices();
      result.totalFetched = providerVoices.length;
      logger.info(`[VoiceSyncService] Fetched ${providerVoices.length} voices from ${providerName}`);
    } catch (error) {
      const err = error as Error;
      const message = error instanceof ProviderError
        ? error.toClientMessage()
        : err.message;

      logger.error(`[VoiceSyncService] Failed to fetch voices from ${providerName}: ${err.message}`);
      result.errors.push(`Failed to fetch from provider: ${message}`);
      result.durationMs = Date.now() - startTime;
      return result;
    }

    // ── Upsert each voice ─────────────────────────────────────────────────────
    for (const pVoice of providerVoices) {
      try {
        const existing = await prisma.voice.findFirst({
          where: { providerVoiceId: pVoice.providerVoiceId },
          select: { id: true, name: true },
        });

        if (existing) {
          // Update existing voice metadata
          await prisma.voice.update({
            where: { id: existing.id },
            data: {
              name: pVoice.name,
              gender: pVoice.gender,
              age: pVoice.age,
              accent: pVoice.accent,
              category: pVoice.category,
              description: pVoice.description ?? null,
              previewUrl: pVoice.previewUrl ?? null,
              providerName,
            },
          });
          result.updated++;
          logger.debug(
            `[VoiceSyncService] Updated voice: ${pVoice.name} (${pVoice.providerVoiceId})`
          );
        } else {
          // Create new voice
          await prisma.voice.create({
            data: {
              name: pVoice.name,
              gender: pVoice.gender,
              age: pVoice.age,
              accent: pVoice.accent,
              category: pVoice.category,
              description: pVoice.description ?? null,
              previewUrl: pVoice.previewUrl ?? null,
              providerVoiceId: pVoice.providerVoiceId,
              providerName,
              featured: false,
            },
          });
          result.created++;
          logger.debug(
            `[VoiceSyncService] Created voice: ${pVoice.name} (${pVoice.providerVoiceId})`
          );
        }
      } catch (voiceError) {
        const err = voiceError as Error;
        const errorMsg = `Failed to upsert voice ${pVoice.name} (${pVoice.providerVoiceId}): ${err.message}`;
        logger.error(`[VoiceSyncService] ${errorMsg}`);
        result.errors.push(errorMsg);
        result.skipped++;
      }
    }

    result.durationMs = Date.now() - startTime;

    logger.info(
      `[VoiceSyncService] Sync complete in ${result.durationMs}ms — ` +
      `created: ${result.created}, updated: ${result.updated}, ` +
      `skipped: ${result.skipped}, errors: ${result.errors.length}`
    );

    return result;
  }

  /**
   * Returns a list of all voices that are linked to the active provider.
   * Useful for validating that local voice IDs have corresponding provider IDs.
   */
  static async getUnlinkedVoices(): Promise<{ id: string; name: string }[]> {
    const unlinked = await prisma.voice.findMany({
      where: {
        providerVoiceId: null,
        deletedAt: null,
      },
      select: { id: true, name: true },
    });

    if (unlinked.length > 0) {
      logger.warn(
        `[VoiceSyncService] ${unlinked.length} voices are not linked to a provider: ` +
        unlinked.map((v) => v.name).join(", ")
      );
    }

    return unlinked;
  }
}
