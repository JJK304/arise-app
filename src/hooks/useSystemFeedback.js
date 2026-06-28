// ============================================================
// useSystemFeedback — aus App.jsx ausgelagert (Entlastung).
// Besitzt die transienten System-Overlays (Notification, Cleared-
// Card, Level-Up-Vollbild, Achievement-/Titel-Popups) + ihre Timer.
// Reine UI-Orchestrierung — KEINE XP-/State-Mutation. Verhalten 1:1
// zur bisherigen Inline-Logik (gleiche Timeouts, clearTimeout-vor-Set).
// ============================================================
import { useState, useRef } from "react";

export function useSystemFeedback() {
  const [notification, setNotification]       = useState(null);
  const [levelUpAnim, setLevelUpAnim]         = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [newTitles, setNewTitles]             = useState([]);
  const [clearedCard, setClearedCard]         = useState(null);
  const clearedRef  = useRef();
  const notifRef    = useRef(null);
  const achievRef   = useRef(null);
  const feedbackRef = useRef(null);

  // Aggregierte Reward-Karte (auto-aus nach ms)
  const showClearedCard = (card, ms = 3600) => {
    setClearedCard(card);
    clearTimeout(clearedRef.current);
    clearedRef.current = setTimeout(() => setClearedCard(null), ms);
  };
  // System-Notification-Zeile (auto-aus nach 3.5s)
  const showNotif = (msg, color = "#00ffff") => {
    setNotification({ msg, color });
    clearTimeout(notifRef.current);
    notifRef.current = setTimeout(() => setNotification(null), 3500);
  };
  // Level-Up-/Rank-Up-Vollbild (auto-aus nach 2.8s)
  const showLevelUp = (payload) => {
    setLevelUpAnim(payload);
    setTimeout(() => setLevelUpAnim(null), 2800);
  };
  // Titel-Freischaltungs-Popups (auto-aus nach 4.5s)
  const showTitles = (titles) => {
    setNewTitles(titles);
    clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => setNewTitles([]), 4500);
  };

  return {
    // State fürs Rendern der Overlays
    notification, levelUpAnim, newAchievements, newTitles, clearedCard,
    // Helfer
    showNotif, showClearedCard, showLevelUp, showTitles,
    // Achievement-Display (von checkAchievements in App.jsx genutzt)
    setNewAchievements, achievRef,
  };
}
