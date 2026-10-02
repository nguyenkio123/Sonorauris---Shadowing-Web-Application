import { Navigate, Route, Routes } from 'react-router-dom'
import { BattleLobbyPage } from '../pages/BattleLobbyPage'
import { BattleResultPage } from '../pages/BattleResultPage'
import { BattleRoomPage } from '../pages/BattleRoomPage'
import { HomeCatalogPage } from '../pages/HomeCatalogPage'
import { PracticePage } from '../pages/PracticePage'
import { ResultPage } from '../pages/ResultPage'
import { ShopPage } from '../pages/ShopPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeCatalogPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/practice/:clipId" element={<PracticePage />} />
      <Route path="/result/:attemptId" element={<ResultPage />} />
      <Route path="/battle/lobby" element={<BattleLobbyPage />} />
      <Route path="/battle/room/:roomCode" element={<BattleRoomPage />} />
      <Route path="/battle/result/:roomCode" element={<BattleResultPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
