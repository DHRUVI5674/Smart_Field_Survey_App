import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const addSurvey = (survey) => {
    const newSurvey = {
      ...survey,
      id: `SUR-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    setSurveys((previousSurveys) => [
      newSurvey,
      ...previousSurveys,
    ]);
  };

  const updateSurvey = (updatedSurvey) => {
    setSurveys((previousSurveys) =>
      previousSurveys.map((survey) =>
        survey.id === updatedSurvey.id ? updatedSurvey : survey
      )
    );
  };

  const deleteSurvey = (id) => {
    setSurveys((previousSurveys) =>
      previousSurveys.filter(
        (survey) => survey.id !== id
      )
    );
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