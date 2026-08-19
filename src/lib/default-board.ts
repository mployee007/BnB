import type { BoardData } from "@/lib/types";

export const defaultBoard: BoardData = {
  business: {
    name: "BnB Management & Consulting",
    tagline: "Pipeline, onboarding, operations, and wins in one board",
  },
  columns: [
    {
      id: "new-leads",
      title: "New Leads",
      description: "Fresh inbound or outbound opportunities",
    },
    {
      id: "proposal",
      title: "Proposal Sent",
      description: "Leads reviewing scope, pricing, or follow-up",
    },
    {
      id: "onboarding",
      title: "Onboarding",
      description: "Signed clients gathering assets and setup details",
    },
    {
      id: "active-clients",
      title: "Active Clients",
      description: "Current management or consulting work",
    },
    {
      id: "follow-up",
      title: "Follow-Up",
      description: "Renewals, nurture, and stalled deals",
    },
    {
      id: "closed-won",
      title: "Closed Won",
      description: "Completed or retained client wins",
    },
  ],
  cards: [
    {
      id: "card-243cbba5-55ca-4d27-a535-63b3a64ad6e1",
      title: "Owner discovery call",
      company: "Blue Harbor Homes",
      contact: "founder@blueharborhomes.com",
      value: "$1,800/mo",
      priority: "high",
      notes:
        "Discovery call to scope guest messaging support, dynamic pricing, and channel management needs.",
      columnId: "proposal",
      createdAt: "2026-08-17T17:49:31.687Z",
      updatedAt: "2026-08-17T17:49:52.219Z",
    },
    {
      id: "card-seed-1",
      columnId: "proposal",
      title: "Boutique host portfolio in Austin",
      company: "Lakeview Stays",
      contact: "owner@lakeviewstays.com",
      value: "$3,500/mo",
      priority: "high",
      notes:
        "Sent intro email for co-hosting + guest ops support. Ask for current occupancy and review pain points.",
      createdAt: "2026-08-17T00:00:00.000Z",
      updatedAt: "2026-08-17T17:48:23.294Z",
    },
    {
      id: "card-776d9229-23ab-4d7b-a3f6-d3bdfea6120d",
      title: "Launch pricing audit package",
      company: "Skyline Suites",
      contact: "hello@skylinesuites.com",
      value: "$2,400/mo",
      priority: "medium",
      notes:
        "Prepare ADR, pricing benchmarks, and operating recommendations for a 30-day revenue tune-up.",
      columnId: "active-clients",
      createdAt: "2026-08-17T17:45:32.223Z",
      updatedAt: "2026-08-17T17:57:58.047Z",
    },
    {
      id: "card-seed-2",
      columnId: "active-clients",
      title: "Guest messaging SOP refresh",
      company: "Northwind Retreats",
      contact: "ops@northwindretreats.com",
      value: "$1,200 project",
      priority: "medium",
      notes:
        "Need turnaround matrix, check-in automation review, and cleaner escalation flow.",
      createdAt: "2026-08-17T00:00:00.000Z",
      updatedAt: "2026-08-17T00:00:00.000Z",
    },
  ],
};
