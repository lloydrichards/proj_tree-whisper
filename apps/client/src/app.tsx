import { ApiResponse, Species } from "@repo/domain";
import { Schema } from "effect";
import { useEffect, useState } from "react";

import bun from "./assets/bun.svg";
import effect from "./assets/effect.svg";
import react from "./assets/react.svg";
import vite from "./assets/vite.svg";
import { SpeciesTable } from "./components/species-table";
import { Button } from "./components/ui/button";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:9000";

function App() {
  const [data, setData] = useState<typeof ApiResponse.Type | undefined>();
  const [species, setSpecies] = useState<Species[]>([]);

  async function sendRequest() {
    try {
      const req = await fetch(`${SERVER_URL}/hello`);
      const res = Schema.decodeUnknownSync(ApiResponse)(await req.json());
      setData(res);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function fetchSpecies() {
      try {
        const req = await fetch(`${SERVER_URL}/species`);
        const res = Schema.decodeUnknownSync(Species.Array)(await req.json());
        setSpecies(res as Species[]);
      } catch (error) {
        console.error(error);
      }
    }
    fetchSpecies();
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-6">
        <img alt="Bun logo" className="h-16 w-16" src={bun} />
        <img alt="Effect logo" className="h-16 w-16" src={effect} />
        <img alt="Vite logo" className="h-16 w-16" src={vite} />
        <img alt="React logo" className="h-16 w-16" src={react} />
      </div>

      <h1 className="font-black text-5xl">bEvr</h1>
      <h2 className="font-bold text-2xl">Bun + Effect + Vite + React</h2>
      <p>A typesafe fullstack monorepo</p>
      <div className="flex items-center gap-4">
        <Button onClick={sendRequest}>Call API</Button>
      </div>
      {data && (
        <pre className="rounded-md bg-gray-100 p-4">
          <code>
            Message: {data.message} <br />
            Success: {data.success.toString()}
          </code>
        </pre>
      )}
      <div className="w-full">
        <SpeciesTable data={species} />
      </div>
    </div>
  );
}

export default App;
