type HandwrittenLetterProps = {
  kind: "journal" | "letter";
};

/** Live text keeps the handwritten sample readable, selectable, and accessible. */
export function HandwrittenLetter({ kind }: HandwrittenLetterProps) {
  const journal = kind === "journal";
  return (
    <figure className="handwritten-letter w-full max-w-[340px] rounded-sm border p-6 md:p-8" aria-label={journal ? "Sample handwritten journal entry" : "Sample handwritten farewell letter"}>
      <figcaption className="mb-5 text-xs font-semibold">
        {journal ? "From a quiet Tuesday" : "A letter, with love"} · Sample
      </figcaption>
      <div className="font-hand text-[25px] leading-[1.45]">
        <p className="mb-4">My sweet friend,</p>
        <p>{journal ? "I still hear your collar in the hallway. Today I found your favourite toy, and for a moment you felt close again." : "There are things I didn’t get to say. Thank you for every ordinary day you made beautiful, and for always being glad I came home."}</p>
        <p className="mt-4">{journal ? "I miss the little things most. I’m keeping them here, so I never forget." : "I hope you knew how loved you were. You still are. You always will be."}</p>
        <p className="mt-5">All my love,<br />Your person</p>
      </div>
    </figure>
  );
}