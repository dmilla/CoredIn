import { userService } from "@/dependencies";
import { UpdateProfileDTO } from "@coredin/shared";
import { BaseServerStateKeys } from "../constants";

export const USER_MUTATIONS = {
  updateProfile: () => ({
    mutationKey: [BaseServerStateKeys.UPDATE_PROFILE],
    mutationFn: ({ profile }: { profile: UpdateProfileDTO }) =>
      userService.updateProfile(profile)
  }),
  deleteCredential: (id: string) => ({
    mutationKey: [BaseServerStateKeys.DELETE_CREDENTIAL, id],
    mutationFn: ({ permanent }: { permanent: boolean }) =>
      userService.deleteCredential(id, permanent)
  }),
  updateTipsSeen: () => ({
    mutationKey: [BaseServerStateKeys.UPDATE_TIPS_SEEN],
    mutationFn: ({ tipIds }: { tipIds: number[] }) =>
      userService.updateTipsSeen(tipIds)
  })
};
