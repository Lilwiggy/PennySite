import { BASE_URL, PartialGuild, User } from './constants';
import fetch from 'node-fetch';
import { config } from '../config';

// Replace this shit with Vue please
export function replaceItems(
  oldValues: string[],
  newValues: string[],
  input: string
): string {
  for (let i = 0; i < oldValues.length; i++)
    input = input.replace(oldValues[i], newValues[i]);
  return input;
}

export async function getGuilds(bearer: string): Promise<PartialGuild[]> {
  return await fetch(BASE_URL + '/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
  }).then((d) => d.json());
}

export async function getCurrentUser(bearer: string): Promise<User> {
  return await fetch(BASE_URL + '/users/@me', {
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
  }).then((d) => d.json());
}

export async function getUser(user_id: string): Promise<User> {
  return await fetch(BASE_URL + `/users/${user_id}`, {
    headers: {
      Authorization: `Bot ${config.bot_token}`,
    },
  }).then((d) => d.json());
}

export async function getToken(data: string): Promise<string> {
  let json = await fetch(BASE_URL + `/oauth2/token`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: data,
  }).then((resp) => resp.json());
  return json.access_token;
}
