import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    const error = new Error('Activity payload is required');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const { userId, teamId, type, minutes } = input as {
    userId?: string;
    teamId?: string;
    type?: string;
    minutes?: number | string;
  };

  if (!userId || !teamId || typeof type !== 'string' || type.trim() === '' || minutes === undefined || minutes === null || Number.isNaN(Number(minutes))) {
    const error = new Error('userId, teamId, type, and minutes are required');
    Object.assign(error, { status: 400 });
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(String(userId))) {
    const error = new Error('userId must be a valid ObjectId');
    Object.assign(error, { status: 400 });
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(String(teamId))) {
    const error = new Error('teamId must be a valid ObjectId');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const [user, team] = await Promise.all([
    User.findById(userId).lean(),
    Team.findById(teamId).lean(),
  ]);

  if (!user || !team) {
    const error = new Error('Referenced user or team was not found');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const numericMinutes = Number(minutes);
  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes: numericMinutes,
    points: Math.max(1, numericMinutes),
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    const error = new Error('Team payload is required');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const { name, mascot, members } = input as {
    name?: string;
    mascot?: string;
    members?: Array<string | { toString(): string }>;
  };

  if (typeof name !== 'string' || name.trim() === '') {
    const error = new Error('Team name is required');
    Object.assign(error, { status: 400 });
    throw error;
  }

  if (typeof mascot !== 'string' || mascot.trim() === '') {
    const error = new Error('Team mascot is required');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const normalizedMembers = Array.isArray(members) ? members : [];
  const invalidMember = normalizedMembers.find((member) => !member || !mongoose.Types.ObjectId.isValid(String(member)));
  if (invalidMember) {
    const error = new Error('Team members must be valid ObjectIds');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const resolvedMembers = normalizedMembers.map((member) => String(member));
  const existingUsers = await User.find({ _id: { $in: resolvedMembers } }).select('_id').lean();
  const existingIds = new Set(existingUsers.map((user) => user._id.toString()));
  const missingMembers = resolvedMembers.filter((member) => !existingIds.has(member));
  if (missingMembers.length > 0) {
    const error = new Error('Referenced members were not found');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const team = await Team.create({ name, mascot, members: resolvedMembers });

  if (resolvedMembers.length > 0) {
    await User.updateMany({ _id: { $in: resolvedMembers } }, { $set: { team: team._id } });
  }

  return team.toObject();
}

export async function getLeaderboard() {
  const leaderboard = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
    { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $project: { _id: 0, teamId: '$_id', teamName: '$team.name', totalPoints: 1 } },
  ]);

  return leaderboard.map((entry, index) => ({
    teamName: entry.teamName,
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).lean();

  if (!user) {
    const error = new Error('User not found');
    Object.assign(error, { status: 404 });
    throw error;
  }

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const preferredFocus = user.fitnessGoal || recentActivity?.type || 'endurance';
  const workouts = await Workout.find({ focus: preferredFocus }).lean();

  if (workouts.length === 0) {
    const fallback = await Workout.find().lean();
    const first = fallback[0];
    if (!first) {
      return [];
    }
    return [{
      ...first,
      reason: `Your recent ${recentActivity?.type ?? 'activity'} pattern suggests a ${first.focus}-focused workout.`,
    }];
  }

  const firstWorkout = workouts[0];
  const reason = recentActivity
    ? `Your recent ${recentActivity.type} activity and ${user.fitnessGoal ?? 'fitness goal'} suggest this ${firstWorkout.focus} routine.`
    : `Your ${user.fitnessGoal ?? 'fitness goal'} points toward this ${firstWorkout.focus} workout.`;

  return [{
    ...firstWorkout,
    reason,
  }];
}

export { User };
