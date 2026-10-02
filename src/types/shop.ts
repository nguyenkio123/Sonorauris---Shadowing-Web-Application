export type CosmeticType = 'AVATAR' | 'FRAME' | 'TITLE'

export interface ShopItem {
  id: string
  type: CosmeticType
  name: string
  description: string
  price: number
  assetValue: string
  previewColor?: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
}

export interface UserInventory {
  ownedItemIds: string[]
  equippedAvatarId: string
  equippedFrameId: string
  equippedTitleId: string
}
