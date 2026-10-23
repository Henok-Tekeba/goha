import type { ApiRequestContext } from "@/shared/lib/api-client";

import type { Profile } from "../types/profile.type";
import type { UpdateProfileInput } from "../validations/profile.schema";

/* goha.et: read-only directory — user profiles are not part of the product. */
export function getUser(
  _userId: string,
  _context: ApiRequestContext = {}
): Promise<Profile> {
  return Promise.reject(new Error("Profiles are not available on goha.et"));
}

export function updateProfile(
  _userId: string,
  _input: UpdateProfileInput
): Promise<Profile> {
  return Promise.reject(new Error("goha.et is a read-only directory"));
}

export function uploadProfileAvatar(
  _userId: string,
  _file: File
): Promise<Pick<Profile, "image">> {
  return Promise.reject(new Error("goha.et is a read-only directory"));
}

export function uploadProfileBanner(
  _userId: string,
  _file: File
): Promise<Pick<Profile, "banner">> {
  return Promise.reject(new Error("goha.et is a read-only directory"));
}
