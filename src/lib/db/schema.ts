import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  decimal,
  integer,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const agentStatusEnum = pgEnum('agent_status', [
  'inactive',
  'active',
  'paused',
  'error',
]);

export const agents = pgTable(
  'agents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    character: jsonb('character').notNull(),
    status: agentStatusEnum('status').default('inactive').notNull(),
    settings: jsonb('settings'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index('agents_user_id_idx').on(table.userId),
    };
  }
);

export const tradeStatusEnum = pgEnum('trade_status', [
  'pending',
  'executed',
  'cancelled',
  'failed',
]);

export const tradeSideEnum = pgEnum('trade_side', ['buy', 'sell']);

export const trades = pgTable(
  'trades',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    symbol: varchar('symbol', { length: 50 }).notNull(),
    side: tradeSideEnum('side').notNull(),
    amount: decimal('amount', { precision: 20, scale: 8 }).notNull(),
    price: decimal('price', { precision: 20, scale: 8 }).notNull(),
    status: tradeStatusEnum('status').default('pending').notNull(),
    executedAt: timestamp('executed_at'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      agentIdIdx: index('trades_agent_id_idx').on(table.agentId),
      symbolIdx: index('trades_symbol_idx').on(table.symbol),
      createdAtIdx: index('trades_created_at_idx').on(table.createdAt),
    };
  }
);

export const opportunities = pgTable(
  'opportunities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    symbol: varchar('symbol', { length: 50 }).notNull(),
    score: decimal('score', { precision: 5, scale: 2 }).notNull(),
    criteria: jsonb('criteria').notNull(),
    description: text('description'),
    detectedAt: timestamp('detected_at').defaultNow().notNull(),
    metadata: jsonb('metadata'),
  },
  (table) => {
    return {
      agentIdIdx: index('opportunities_agent_id_idx').on(table.agentId),
      symbolIdx: index('opportunities_symbol_idx').on(table.symbol),
      detectedAtIdx: index('opportunities_detected_at_idx').on(
        table.detectedAt
      ),
    };
  }
);

export const marketData = pgTable(
  'market_data',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    symbol: varchar('symbol', { length: 50 }).notNull(),
    price: decimal('price', { precision: 20, scale: 8 }).notNull(),
    volume: decimal('volume', { precision: 20, scale: 8 }),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    metadata: jsonb('metadata'),
  },
  (table) => {
    return {
      symbolIdx: index('market_data_symbol_idx').on(table.symbol),
      timestampIdx: index('market_data_timestamp_idx').on(table.timestamp),
    };
  }
);

export const agentMemories = pgTable(
  'agent_memories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    memoryId: uuid('memory_id').notNull(),
    content: jsonb('content').notNull(),
    embedding: jsonb('embedding'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      agentIdIdx: index('agent_memories_agent_id_idx').on(table.agentId),
      memoryIdIdx: index('agent_memories_memory_id_idx').on(table.memoryId),
    };
  }
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  trades: many(trades),
  opportunities: many(opportunities),
  memories: many(agentMemories),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  agent: one(agents, {
    fields: [trades.agentId],
    references: [agents.id],
  }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  agent: one(agents, {
    fields: [opportunities.agentId],
    references: [agents.id],
  }),
}));

export const agentMemoriesRelations = relations(agentMemories, ({ one }) => ({
  agent: one(agents, {
    fields: [agentMemories.agentId],
    references: [agents.id],
  }),
}));

