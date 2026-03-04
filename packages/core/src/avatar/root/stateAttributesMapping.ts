import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { AvatarRootState } from './AvatarRoot.vue'

export const avatarStateAttributesMapping: StateAttributesMapping<AvatarRootState>
  = {
    imageLoadingStatus: () => null,
  }
