export const BASE_URL = 'https://discord.com/api/v8';

export interface Guild {
  id: string;
  name: string;
  icon: string | null;
  splash: string | null;
  discover_splash: string | null;
  owner?: boolean;
  owner_id: string;
  permissions: number;
  permissions_new?: string;
  roles: Array<string>; // Change to Role interface later,
  emojis: Array<string>; // Change interface later
  appliation_id: string | null;
  joined_at: Date;
  large?: boolean;
  unavailable?: boolean;
  member_count?: number;
  channels: Array<string>; // Change interface later
}

export interface PartialGuild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  permissions_new: number;
}

export interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  verified?: boolean;
}
