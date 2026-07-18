import { createContext, useContext, useState } from "react";

const SurveyContext = createContext();

export function SurveyProvider({ children }) {
  const [surveys, setSurveys] = useState([]);

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

  const deleteSurvey = (id) => {
    setSurveys((previousSurveys) =>
      previousSurveys.filter(
        (survey) => survey.id !== id
      )
    );
  };

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        addSurvey,
        deleteSurvey,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurveys() {
  return useContext(SurveyContext);
}