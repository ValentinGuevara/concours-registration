"use client";

import { useState } from "react";
import Image from "next/image";
import Form from "next/form";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(searchParams.get("code"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sendParticipant = async (participant) => {
    try {
      const response = await fetch(
        "https://.execute-api.eu-central-1.amazonaws.com/concours/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: participant.code,
            "x-api-key": "",
          },
          body: JSON.stringify({
            number: participant.number,
            name: participant.name,
            email: participant.email,
          }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        if (error.message && error.message === "Unauthorized") {
          return setError("Code invalide");
        }
        return setError(
          error.reason === "GAME_PLAY_ONCE"
            ? "Tu as déjà participé"
            : error.reason
        );
      }
      setError("");
    } catch (error) {
      console.error(error);
      setError(error);
    }
  };
  const emitChange = async () => {
    if (number.length !== 9) {
      setError("Le numéro doit contenir 9 chiffres");
      return;
    }
    if (name.length === 0) {
      setError("Le nom est obligatoire");
      return;
    }
    if (email.length === 0 || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("L'email est obligatoire et bien formatté");
      return;
    }
    if (code.length === 0) {
      setError("Le code est obligatoire");
      return;
    }
    setError("");
    setLoading(true);
    const participant = {
      number: `33${number}`,
      name,
      email,
      code,
    };
    await sendParticipant(participant);
    setLoading(false);
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Form
          className="w-full max-w-lg"
          action="/search"
          onSubmit={(event) => {
            event.preventDefault();
            emitChange(event);
          }}
        >
          {/* On submission, the input value will be appended to 
          the URL, e.g. /search?query=abc */}
          <div className="flex flex-row justify-between items-center">
            <span className="mr-4 font-semibold">Numéro</span>
            <span className="mr-1">+33</span>
            <input
              className="text-neutral-900 p-1"
              type="phone"
              name="number"
              value={number}
              onChange={(event) => {
                setNumber(event.target.value);
              }}
            />
          </div>
          <div className="flex flex-row justify-between mt-6 items-center">
            <span className="font-semibold">Nom</span>
            <input
              className="text-neutral-900 p-1"
              name="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
          </div>
          <div className="flex flex-row justify-between mt-6 items-center">
            <span className="font-semibold">Email</span>
            <input
              className="text-neutral-900 p-1"
              type="email"
              name="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
          </div>
          <div className="flex flex-row justify-between mt-6 items-center">
            <span className="font-semibold">Code Studio</span>
            <input
              className="text-neutral-900 p-1"
              type="number"
              name="code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
              }}
            />
          </div>
          <button
            className="mt-8 w-full p-1 bg-neutral-800 font-semibold text-white rounded-lg"
            type="submit"
            disabled={loading}
          >
            {loading ? "Chargement..." : "Envoyer"}
          </button>
          {error && (
            <p className="mt-4 text-center text-red-600 text-sm font-semibold">
              {error}
            </p>
          )}
        </Form>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Mon concours
        </a>
      </footer>
    </div>
  );
}
