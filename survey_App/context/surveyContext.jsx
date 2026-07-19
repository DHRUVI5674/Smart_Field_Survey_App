import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  scheduleReminderNotification,
  cancelReminderNotification,
} from "../utils/notifications";

const SurveyContext = createContext();

export function SurveyProvider({ children }) {
  const [surveys, setSurveys] = useState([]);

  // Load persisted surveys on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@surveys');
        if (stored) setSurveys(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to load surveys', e);
      }
    })();
  }, []);

  // Persist surveys whenever they change
  useEffect(() => {
    AsyncStorage.setItem('@surveys', JSON.stringify(surveys)).catch(e => console.warn('Failed to save surveys', e));
  }, [surveys]);
  
  // Active states for linking modules to a new survey
  const [activePhotos, setActivePhotos] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);
  const [activeContact, setActiveContact] = useState(null);

  const addActivePhoto = (uri) => setActivePhotos(prev => [...prev, uri]);
  const removeActivePhoto = (uri) => setActivePhotos(prev => prev.filter(p => p !== uri));

  const addSurvey = async (survey) => {
    const newSurvey = {
      ...survey,
      id: `SUR-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'draft',
      notificationId: null, // will be filled below if reminders are enabled
    };

    // Schedule a reminder notification if the user has enabled them
    try {
      const remindersEnabled = await AsyncStorage.getItem('@survey_reminders_enabled');
      // Default to enabled (null means never set → treat as true)
      const shouldRemind = remindersEnabled === null || remindersEnabled === 'true';

      if (shouldRemind) {
        const notifId = await scheduleReminderNotification(newSurvey.id, newSurvey.siteName);
        if (notifId) {
          newSurvey.notificationId = notifId;
        }
      }
    } catch (e) {
      console.warn('[SurveyContext] Failed to schedule notification:', e);
    }

    setSurveys((previousSurveys) => [newSurvey, ...previousSurveys]);
  };

  const updateSurvey = async (updatedSurvey) => {
    // Cancel the reminder if the survey is being marked as submitted
    if (updatedSurvey.status === 'submitted') {
      // Find the current (pre-update) survey to get its notificationId
      setSurveys((previousSurveys) => {
        const existing = previousSurveys.find((s) => s.id === updatedSurvey.id);
        if (existing?.notificationId) {
          cancelReminderNotification(existing.notificationId);
        }
        return previousSurveys.map((survey) =>
          survey.id === updatedSurvey.id
            ? { ...updatedSurvey, notificationId: null } // clear id after cancellation
            : survey
        );
      });
      return;
    }

    setSurveys((previousSurveys) =>
      previousSurveys.map((survey) =>
        survey.id === updatedSurvey.id ? updatedSurvey : survey
      )
    );
  };

  const deleteSurvey = (id) => {
    // Also cancel any pending notification for this survey before deleting
    setSurveys((previousSurveys) => {
      const existing = previousSurveys.find((s) => s.id === id);
      if (existing?.notificationId) {
        cancelReminderNotification(existing.notificationId);
      }
      return previousSurveys.filter((survey) => survey.id !== id);
    });
  };

  const resetActiveMedia = () => {
    setActivePhotos([]);
    setActiveLocation(null);
    setActiveContact(null);
  };

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        addSurvey,
        updateSurvey,
        deleteSurvey,
        activePhotos,
        addActivePhoto,
        removeActivePhoto,
        activeLocation,
        setActiveLocation,
        activeContact,
        setActiveContact,
        resetActiveMedia,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurveys() {
  return useContext(SurveyContext);
}