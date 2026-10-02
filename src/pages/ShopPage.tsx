import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Coins,
  Crown,
  Flame,
  RotateCcw,
  Shield,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'
import {
  attemptStreakRestore,
  checkStreakRestoreEligibility,
  equipItem,
  getInventory,
  getMe,
  getShopCatalog,
  purchaseItem,
} from '../api'
import type { CosmeticType, ShopItem, UserInventory } from '../types/shop'
import type { UserProfile } from '../types/user'

export function ShopPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [catalog, setCatalog] = useState<ShopItem[]>([])
  const [inventory, setInventory] = useState<UserInventory | null>(null)
  const [activeTab, setActiveTab] = useState<'ALL' | CosmeticType>('ALL')
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const [streakRestoreInfo, setStreakRestoreInfo] = useState<{
    canRestore: boolean
    reason?: string
  }>({ canRestore: false })

  const loadData = async () => {
    try {
      const [userData, catalogData, invData, streakCheck] = await Promise.all([
        getMe(),
        getShopCatalog(),
        getInventory(),
        checkStreakRestoreEligibility(),
      ])
      setUser(userData)
      setCatalog(catalogData)
      setInventory(invData)
      setStreakRestoreInfo(streakCheck)
    } catch (err) {
      console.error('Failed to load shop data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handlePurchase = async (item: ShopItem) => {
    setProcessingId(item.id)
    setActionMessage(null)
    setActionError(null)

    try {
      const res = await purchaseItem(item.id)
      if (res.success) {
        setActionMessage(res.message)
        // Automatically equip newly purchased item for great UX
        await equipItem(item.type, item.id)
        await loadData()
      } else {
        setActionError(res.message)
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Purchase failed')
    } finally {
      setProcessingId(null)
    }
  }

  const handleEquip = async (item: ShopItem) => {
    setProcessingId(item.id)
    setActionMessage(null)
    setActionError(null)

    try {
      const success = await equipItem(item.type, item.id)
      if (success) {
        setActionMessage(`Equipped ${item.name}!`)
        await loadData()
      } else {
        setActionError('Failed to equip item.')
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Equip failed')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRestoreStreak = async () => {
    setProcessingId('streak-restore')
    setActionMessage(null)
    setActionError(null)

    try {
      const res = await attemptStreakRestore()
      if (res.success) {
        setActionMessage(res.message)
        await loadData()
      } else {
        setActionError(res.message)
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Streak restore failed')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredItems = catalog.filter((item) => {
    if (activeTab === 'ALL') return true
    return item.type === activeTab
  })

  // Determine current preview appearance
  const equippedAvatarItem = catalog.find((i) => i.id === inventory?.equippedAvatarId)
  const equippedFrameItem = catalog.find((i) => i.id === inventory?.equippedFrameId)
  const equippedTitleItem = catalog.find((i) => i.id === inventory?.equippedTitleId)

  // If user clicks a preview, preview it temporarily
  const previewAvatarUrl =
    previewItem?.type === 'AVATAR'
      ? previewItem.assetValue
      : equippedAvatarItem?.assetValue || user?.avatarUrl || ''

  const previewFrameClass =
    previewItem?.type === 'FRAME'
      ? previewItem.assetValue
      : equippedFrameItem?.assetValue || 'border border-[#ebebeb]'

  const previewTitleText =
    previewItem?.type === 'TITLE'
      ? previewItem.assetValue
      : equippedTitleItem?.assetValue || user?.equippedTitle || 'Shadowing Learner'

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#6a6a6a] text-sm">
        <span className="h-8 w-8 rounded-full border-2 border-[#ff385c]/20 border-t-[#ff385c] animate-spin mb-3" />
        Opening Cosmetics Shop...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans pb-16">
      {/* Top Breadcrumb & Status Header */}
      <section className="border-b border-[#ebebeb] py-6 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6a6a6a] hover:text-[#222222] transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to practice catalog</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#222222]">
                Cosmetics &amp; Outfits
              </h1>
              <span className="new-tag">P0 SHOP</span>
            </div>
            <p className="text-xs text-[#6a6a6a] mt-1">
              Customize your avatar, ring glow, and championship title with earned coins.
            </p>
          </div>

          {/* User Balances */}
          {user && (
            <div className="flex items-center gap-2 bg-[#f7f7f7] border border-[#ebebeb] rounded-full p-1.5 px-4">
              <div className="flex items-center gap-1.5 pr-3 border-r border-[#ebebeb]">
                <Coins className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-mono font-bold text-sm text-[#222222]">
                  {user.coins}
                </span>
                <span className="text-[11px] text-[#6a6a6a]">Coins</span>
              </div>
              <div className="flex items-center gap-1.5 pl-2">
                <Zap className="h-4 w-4 fill-[#460479] text-[#460479]" />
                <span className="font-mono font-bold text-sm text-[#222222]">{user.xp}</span>
                <span className="text-[11px] text-[#6a6a6a]">XP</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Notifications */}
      {actionMessage && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800 animate-in fade-in">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        </div>
      )}

      {actionError && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-800 animate-in fade-in">
            <span>{actionError}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Dressing Room / Profile Preview (4 cols) */}
          <div className="lg:col-span-4 sticky top-[100px] flex flex-col gap-6">
            <div className="rounded-[16px] border border-[#dddddd] bg-[#f7f7f7] p-6 text-center airbnb-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6a6a6a]">
                  Profile Preview
                </span>
                {previewItem && (
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="flex items-center gap-1 text-[11px] text-[#ff385c] hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset preview</span>
                  </button>
                )}
              </div>

              {/* Avatar Showcase */}
              <div className="relative inline-block mx-auto mb-4">
                <div
                  className={`h-24 w-24 rounded-full p-1 bg-white transition-all duration-300 ${previewFrameClass}`}
                >
                  <img
                    src={previewAvatarUrl}
                    alt="Preview Avatar"
                    className="h-full w-full rounded-full object-cover bg-[#f2f2f2]"
                  />
                </div>
              </div>

              {/* Display Name & Title */}
              <h3 className="text-lg font-semibold text-[#222222]">
                {user?.displayName || 'Demo Player'}
              </h3>
              <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full bg-white border border-[#ebebeb] text-xs font-semibold text-[#ff385c] shadow-xs">
                <Crown className="h-3 w-3" />
                <span>{previewTitleText}</span>
              </div>

              <div className="mt-6 pt-5 border-t border-[#ebebeb] grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[11px] text-[#6a6a6a]">Streak</div>
                  <div className="font-mono font-bold text-sm text-[#222222] mt-0.5">
                    {user?.streak || 0}d
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#6a6a6a]">Coins</div>
                  <div className="font-mono font-bold text-sm text-amber-600 mt-0.5">
                    {user?.coins || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#6a6a6a]">Rank</div>
                  <div className="font-mono font-bold text-sm text-[#460479] mt-0.5">
                    Tier 1
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Restore Section (FR-PROG-04) */}
            <div className="rounded-[16px] border border-[#dddddd] bg-white p-5 airbnb-shadow">
              <div className="flex items-center gap-2 mb-2 text-[#222222] font-semibold text-sm">
                <Flame className="h-4 w-4 fill-[#ff385c] text-[#ff385c]" />
                <span>Streak Insurance</span>
                <span className="text-[10px] uppercase font-bold text-[#ff385c] bg-rose-50 px-2 py-0.5 rounded-full">
                  P0 RULE
                </span>
              </div>
              <p className="text-xs text-[#6a6a6a] leading-relaxed mb-4">
                Forgot to practice yesterday? Spend <strong>30 Coins</strong> to recover your streak.
                (Cooldown: Max 1 restore per 7 days).
              </p>

              <button
                disabled={!streakRestoreInfo.canRestore || processingId === 'streak-restore'}
                onClick={handleRestoreStreak}
                className={`w-full text-xs font-semibold h-[40px] rounded-lg transition-all flex items-center justify-center gap-2 ${
                  streakRestoreInfo.canRestore
                    ? 'btn-primary'
                    : 'bg-[#f7f7f7] text-[#6a6a6a] border border-[#ebebeb] cursor-not-allowed opacity-90 select-none'
                }`}
              >
                {streakRestoreInfo.canRestore ? (
                  <Flame className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                )}
                <span>
                  {streakRestoreInfo.canRestore
                    ? 'Restore Streak for 30 🪙'
                    : streakRestoreInfo.reason || 'Restore Unavailable'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Catalog Grid (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#ebebeb]">
              {(
                [
                  { id: 'ALL', label: 'All Items', icon: Sparkles },
                  { id: 'AVATAR', label: 'Avatars', icon: User },
                  { id: 'FRAME', label: 'Frames', icon: Shield },
                  { id: 'TITLE', label: 'Titles', icon: Crown },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#222222] text-white shadow-xs'
                        : 'bg-[#f7f7f7] text-[#6a6a6a] hover:bg-[#ebebeb] hover:text-[#222222]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const isOwned = inventory?.ownedItemIds.includes(item.id) ?? false
                const isEquipped =
                  (item.type === 'AVATAR' && inventory?.equippedAvatarId === item.id) ||
                  (item.type === 'FRAME' && inventory?.equippedFrameId === item.id) ||
                  (item.type === 'TITLE' && inventory?.equippedTitleId === item.id)

                const canAfford = (user?.coins || 0) >= item.price
                const isProcessing = processingId === item.id

                return (
                  <div
                    key={item.id}
                    onClick={() => setPreviewItem(item)}
                    className={`group relative rounded-[14px] border p-4 bg-white transition-all cursor-pointer ${
                      previewItem?.id === item.id
                        ? 'border-[#ff385c] shadow-md'
                        : 'border-[#ebebeb] hover:border-[#c1c1c1] hover:shadow-xs'
                    }`}
                  >
                    {/* Item Type & Rarity Pill */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6a6a6a]">
                        {item.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.rarity === 'Legendary'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : item.rarity === 'Epic'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : item.rarity === 'Rare'
                            ? 'bg-sky-100 text-sky-700 border border-sky-200'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {item.rarity}
                      </span>
                    </div>

                    {/* Visual Asset Presentation */}
                    <div className="flex items-center gap-3 mb-3">
                      {item.type === 'AVATAR' ? (
                        <img
                          src={item.assetValue}
                          alt={item.name}
                          className="h-14 w-14 rounded-full bg-[#f7f7f7] border border-[#ebebeb] p-1 object-cover"
                        />
                      ) : item.type === 'FRAME' ? (
                        <div
                          className={`h-14 w-14 rounded-full p-1 bg-white flex items-center justify-center ${item.assetValue}`}
                        >
                          <div className="h-full w-full rounded-full bg-[#f2f2f2] flex items-center justify-center text-[10px] font-bold text-[#6a6a6a]">
                            FRAME
                          </div>
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                          <Crown className="h-6 w-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#222222] truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#6a6a6a] line-clamp-2 mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Price and CTA Stack */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#ebebeb] mt-2">
                      <div className="flex items-center gap-1.5">
                        {item.price > 0 ? (
                          <>
                            <Coins className="h-4 w-4 fill-amber-500 text-amber-500" />
                            <span className="font-mono font-bold text-sm text-[#222222]">
                              {item.price}
                            </span>
                            <span className="text-[11px] text-[#6a6a6a]">Coins</span>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600">Default Free</span>
                        )}
                      </div>

                      {/* Action Button */}
                      <div>
                        {isEquipped ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                            <Check className="h-3.5 w-3.5" />
                            <span>Equipped</span>
                          </span>
                        ) : isOwned ? (
                          <button
                            disabled={isProcessing}
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleEquip(item)
                            }}
                            className="btn-secondary text-xs font-semibold h-[32px] px-3.5 rounded-lg"
                          >
                            <span>{isProcessing ? 'Equipping...' : 'Equip'}</span>
                          </button>
                        ) : (
                          <button
                            disabled={!canAfford || isProcessing}
                            onClick={(e) => {
                              e.stopPropagation()
                              void handlePurchase(item)
                            }}
                            className={`text-xs font-semibold h-[32px] px-3.5 rounded-lg transition-all ${
                              canAfford
                                ? 'btn-primary'
                                : 'bg-[#f2f2f2] text-[#929292] cursor-not-allowed'
                            }`}
                          >
                            <span>
                              {isProcessing
                                ? 'Buying...'
                                : canAfford
                                ? 'Purchase'
                                : 'Need Coins'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
