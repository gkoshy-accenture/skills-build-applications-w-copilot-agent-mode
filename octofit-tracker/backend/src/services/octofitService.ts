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

export async function createTeam(_input: unknown) {
  throw Object.assign(new Error('Team validation is not implemented yet'), { status: 501 });
}

export async function getLeaderboard() {
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
