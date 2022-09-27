import { useState, useCallback } from "react";

import { BACKEND_BASE_URL } from "./config";

import SpeechInput from "./components/SpeechInput/SpeechInput";

const App = () => {
  const [firstValue, setFirstValue] = useState<string>("");
  const [secondValue, setSecondValue] = useState<string>("");

  const onChangeFirstValue = useCallback(
    (value: string) => setFirstValue(value),
    []
  );

  const onChangeSecondValue = useCallback(
    (value: string) => setSecondValue(value),
    []
  );

  const onClickSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/v1/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstValue, secondValue }),
      });

      if (response.status === 200) {
        clearForm();
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const clearForm = () => {
    setFirstValue("");
    setSecondValue("");
  };

  return (
    <>
      <SpeechInput value={firstValue} onChange={onChangeFirstValue} />
      <SpeechInput
        placeholder="Custom placeholder"
        value={secondValue}
        onChange={onChangeSecondValue}
      />
      <button onClick={onClickSubmit}>Submit</button>
    </>
  );
};

export default App;
