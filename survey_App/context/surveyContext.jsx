import { createContext, useContext, useState } from "react";

const SurveyContext = createContext();

export function SurveyProvider({ children }) {
  const [surveys, setSurveys] = useState([]);
  
  // Active states for linking modules to a new survey
  const [activePhoto, setActivePhoto] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [activeContact, setActiveContact] = useState(null);

  const addSurvey = (survey) => {
    const newSurvey = {
      ...survey,
      id: `SUR-${Date.now()}`,
      createdAt: new Date().toISOString(),
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
    setActivePhoto(null);
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
        activePhoto,
        setActivePhoto,
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