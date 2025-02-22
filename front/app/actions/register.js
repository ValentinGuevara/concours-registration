"use server";

export async function registerParticipant(participant) {
  console.log(participant);
  console.log(process.env["URL_API"]);
  console.log(process.env["API_KEY"]);
  try {
    const response = await fetch(
      `${process.env["URL_API"]}/concours/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: participant.code,
          "x-api-key": process.env["API_KEY"],
        },
        body: JSON.stringify({
          number: participant.number,
          name: participant.name,
          email: participant.email,
        }),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      if (result.message && result.message === "Unauthorized") {
        return { error: "Code invalide" };
      }
      if (result.reason === "GAME_PLAY_ONCE") {
        return { error: "Tu as déjà participé" };
      } else {
        return { error: result };
      }
    }
    return result;
  } catch (err) {
    return { error: err };
  }
}

export async function sendValidateCode(participant) {
  console.log(participant);
  try {
    const response = await fetch(
      `${process.env["URL_API"]}/concours/validate?` +
        new URLSearchParams({
          number: participant.number,
          code: participant.codeSMS,
        }).toString(),
      {
        method: "PUT",
        headers: {
          Authorization: participant.code,
          "x-api-key": process.env["API_KEY"],
        },
      }
    );
    const result = await response.json();
    if (!response.ok) {
      if (result.message && result.message === "Unauthorized") {
        return { error: "Code studio invalide" };
      }
      if (result === "ALREADY_VALIDATED_OR_WRONG_CODE") {
        return { error: "Déjà validé ou code SMS invalide" };
      } else {
        return { error: result };
      }
    }
    return result;
  } catch (err) {
    return { error: err };
  }
}
