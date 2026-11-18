import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "CANCEL"
  | "ADJUST"
  | "LOGIN"
  | "LOGOUT"
  | "DUE_COLLECTION"
  | string;

export interface LogAuditParams {
  userId?: bigint | number | null;
  action: AuditAction;
  entityType: string; // e.g. "Products", "POS / Sales", "Customers", "Auth & Sessions"
  entityId?: string | number | bigint | null;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Immutable Server-Side Audit Logging
 */
export async function logAudit(
  params: LogAuditParams,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;
  try {
    return await client.audit_logs.create({
      data: {
        user_id: params.userId ? BigInt(params.userId) : null,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId ? String(params.entityId) : null,
        old_values: params.oldValues
          ? typeof params.oldValues === "string"
            ? params.oldValues
            : JSON.stringify(params.oldValues)
          : null,
        new_values: params.newValues
          ? typeof params.newValues === "string"
            ? params.newValues
            : JSON.stringify(params.newValues)
          : null,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}

export interface RecordActivityOptions {
  req?: NextRequest;
  userId?: bigint | number | null;
  action: AuditAction;
  module: string; // e.g. "Auth & Sessions", "Products", "POS / Sales", "Customers", "Users & Roles", "Purchases", "Expenses", "Medications"
  entityId?: string | number | bigint | null;
  description: string;
  details?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
  tx?: Prisma.TransactionClient;
}

/**
 * Convenient activity recorder with request context extraction
 */
export async function recordActivity(options: RecordActivityOptions) {
  try {
    let ip = options.ipAddress || null;
    let agent = options.userAgent || null;

    if (options.req) {
      const forwarded = options.req.headers.get("x-forwarded-for");
      const realIp = options.req.headers.get("x-real-ip");
      ip = ip || (forwarded ? forwarded.split(",")[0].trim() : realIp || "127.0.0.1");
      agent = agent || options.req.headers.get("user-agent") || null;
    }

    const payload = {
      description: options.description,
      ...(options.details || {}),
    };

    return await logAudit(
      {
        userId: options.userId,
        action: options.action,
        entityType: options.module,
        entityId: options.entityId,
        newValues: payload,
        ipAddress: ip,
        userAgent: agent,
      },
      options.tx
    );
  } catch (error) {
    console.error("Failed to record activity log:", error);
    return null;
  }
}
