import { Http } from "./Http";
import { AnalyzeResponse } from "../Types";

const Api = {
  analyzeGame: (pgn: string, depth: number = 15): Promise<AnalyzeResponse> => {
    return Http("/analyze", {
      method: "POST",
      body: JSON.stringify({ pgn, depth }),
    });
  },
};

export default Api;
