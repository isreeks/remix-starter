import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, boolean, uuid, json, date, real } from "drizzle-orm/pg-core";


export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').notNull(),
    image: text('image'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull()
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId').notNull().references(() => user.id)
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId').notNull().references(() => user.id),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt')
});


// Habits table
export const habits = pgTable("habits", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    frequency: text("frequency").notNull(), // daily, weekly, monthly
    reminderSettings: json("reminder_settings").$type<{
        times: string[];
        days?: number[];
        enabled: boolean;
    }>(),
    currentStreak: integer("current_streak").default(0),
    longestStreak: integer("longest_streak").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Goals table
export const goals = pgTable("goals", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull(),
    targetDate: date("target_date"),
    metrics: json("metrics").$type<{
        target: number;
        current: number;
        unit: string;
    }>(),
    completed: boolean("completed").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category"),
    dueDate: timestamp("due_date"),
    completed: boolean("completed").default(false),
    completedAt: timestamp("completed_at"),
});

// Activities table (for social feed and tracking)
export const activities = pgTable("activities", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    referenceId: uuid("reference_id"), // ID of related habit/goal/task
    type: text("type").notNull(), // habit_completion, goal_achieved, etc.
    data: json("data").$type<{
        title: string;
        description?: string;
        metrics?: Record<string, any>;
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Relations table (for following/followers)
export const userRelations = pgTable("user_relations", {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: text("follower_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    followingId: text("following_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pomodoro Sessions table
export const pomodoroSessions = pgTable("pomodoro_sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    duration: integer("duration").notNull(), // in minutes
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    status: text("status").notNull(), // active, completed, interrupted
});

// Fitness Logs table
export const fitnessLogs = pgTable("fitness_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    activityType: text("activity_type").notNull(), // weight, cardio, etc.
    value: real("value").notNull(),
    metadata: json("metadata").$type<{
        distance?: number;
        duration?: number;
        calories?: number;
    }>(),
    loggedAt: timestamp("logged_at").defaultNow().notNull(),
});

// Define relationships
export const usersRelations = relations(user, ({ many }) => ({
    habits: many(habits),
    goals: many(goals),
    tasks: many(tasks),
    activities: many(activities),
    following: many(userRelations, { foreignKey: "followerId" }),
    followers: many(userRelations, { foreignKey: "followingId" }),
    pomodoroSessions: many(pomodoroSessions),
    fitnessLogs: many(fitnessLogs),
}));

export const habitsRelations = relations(habits, ({ one }) => ({
    user: one(user, {
        fields: [habits.userId],
        references: [user.id],
    }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
    user: one(user, {
        fields: [goals.userId],
        references: [user.id],
    }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
    user: one(user, {
        fields: [tasks.userId],
        references: [user.id],
    }),
}));

// Types for TypeScript support
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
